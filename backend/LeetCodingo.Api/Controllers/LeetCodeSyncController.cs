using System.Text;
using System.Text.Json;
using LeetCodingo.Api.Data;
using LeetCodingo.Api.DTOs;
using LeetCodingo.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeetCodingo.Api.Controllers;

[ApiController]
[Route("api/leetcode")]
public class LeetCodeSyncController(AppDbContext db, IHttpClientFactory httpClientFactory) : ControllerBase
{
    private const string LeetCodeGraphQL = "https://leetcode.com/graphql";

    // POST /api/leetcode/sync/{userId}
    // Fetches the user's recent accepted submissions from LeetCode and stores them.
    [HttpPost("sync/{userId}")]
    public async Task<ActionResult<SyncResultResponse>> Sync(int userId)
    {
        var user = await db.Users.FindAsync(userId);
        if (user is null) return NotFound("User not found.");
        if (string.IsNullOrWhiteSpace(user.LeetCodeUsername))
            return BadRequest("User has no LeetCode username set.");

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Add("User-Agent", "LeetCodingo/1.0");
        client.DefaultRequestHeaders.Add("Referer", "https://leetcode.com");

        // Fetch recent accepted submissions
        var query = new
        {
            query = @"
                query recentAcSubmissions($username: String!, $limit: Int!) {
                    recentAcSubmissionList(username: $username, limit: $limit) {
                        id
                        title
                        titleSlug
                        timestamp
                    }
                }",
            variables = new { username = user.LeetCodeUsername, limit = 50 }
        };

        HttpResponseMessage response;
        try
        {
            var content = new StringContent(JsonSerializer.Serialize(query), Encoding.UTF8, "application/json");
            response = await client.PostAsync(LeetCodeGraphQL, content);
        }
        catch (Exception ex)
        {
            return StatusCode(502, $"Failed to reach LeetCode API: {ex.Message}");
        }

        if (!response.IsSuccessStatusCode)
            return StatusCode(502, "LeetCode API returned an error.");

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);

        JsonElement submissions;
        try
        {
            submissions = doc.RootElement
                .GetProperty("data")
                .GetProperty("recentAcSubmissionList");
        }
        catch
        {
            return StatusCode(502, "Unexpected response format from LeetCode API.");
        }

        int newProblems = 0;
        int syncedSubmissions = 0;

        foreach (var item in submissions.EnumerateArray())
        {
            var titleSlug = item.GetProperty("titleSlug").GetString() ?? "";
            var title = item.GetProperty("title").GetString() ?? "";

            // Look up or create the problem (number unknown from this API, use 0 as placeholder)
            var problem = await db.Problems.FirstOrDefaultAsync(p => p.TitleSlug == titleSlug);
            if (problem is null)
            {
                // Fetch problem details (difficulty, tags) from LeetCode
                var (difficulty, tags, lcNumber) = await FetchProblemDetails(client, titleSlug);

                problem = new Problem
                {
                    LeetCodeNumber = lcNumber,
                    Title = title,
                    TitleSlug = titleSlug,
                    Difficulty = difficulty
                };

                // Avoid duplicate LeetCodeNumber conflicts — skip if number already exists
                if (lcNumber > 0 && await db.Problems.AnyAsync(p => p.LeetCodeNumber == lcNumber))
                {
                    problem = await db.Problems.FirstAsync(p => p.LeetCodeNumber == lcNumber);
                }
                else
                {
                    db.Problems.Add(problem);
                    await db.SaveChangesAsync();
                    newProblems++;

                    // Attach tags
                    foreach (var tagName in tags)
                    {
                        var tag = await db.Tags.FirstOrDefaultAsync(t => t.Name == tagName)
                                  ?? new Tag { Name = tagName };
                        if (tag.Id == 0)
                        {
                            db.Tags.Add(tag);
                            await db.SaveChangesAsync();
                        }
                        if (!await db.ProblemTags.AnyAsync(pt => pt.ProblemId == problem.Id && pt.TagId == tag.Id))
                        {
                            db.ProblemTags.Add(new ProblemTag { ProblemId = problem.Id, TagId = tag.Id });
                        }
                    }
                    await db.SaveChangesAsync();
                }
            }

            // Only add submission if it doesn't already exist for this user + problem
            var alreadyExists = await db.Submissions.AnyAsync(
                s => s.UserId == userId && s.ProblemId == problem.Id);

            if (!alreadyExists)
            {
                var timestampStr = item.GetProperty("timestamp").GetString() ?? "0";
                long.TryParse(timestampStr, out var timestamp);
                var solvedDate = DateTimeOffset.FromUnixTimeSeconds(timestamp).UtcDateTime;

                db.Submissions.Add(new Submission
                {
                    UserId = userId,
                    ProblemId = problem.Id,
                    SolvedDate = solvedDate
                });
                syncedSubmissions++;
            }
        }

        await db.SaveChangesAsync();

        return Ok(new SyncResultResponse
        {
            NewProblemsAdded = newProblems,
            SubmissionsSynced = syncedSubmissions,
            Message = $"Sync complete. {syncedSubmissions} new submissions added."
        });
    }

    // GET /api/leetcode/tags/{userId}
    // Returns solved tag statistics for a user.
    [HttpGet("tags/{userId}")]
    public async Task<ActionResult<IEnumerable<TagStatResponse>>> GetTagStats(int userId)
    {
        var stats = await db.Submissions
            .Where(s => s.UserId == userId)
            .SelectMany(s => s.Problem.ProblemTags)
            .GroupBy(pt => pt.Tag.Name)
            .Select(g => new TagStatResponse
            {
                TagName = g.Key,
                Count = g.Count()
            })
            .OrderByDescending(t => t.Count)
            .ToListAsync();

        return Ok(stats);
    }

    private async Task<(string difficulty, List<string> tags, int lcNumber)> FetchProblemDetails(
        HttpClient client, string titleSlug)
    {
        var query = new
        {
            query = @"
                query problemDetails($titleSlug: String!) {
                    question(titleSlug: $titleSlug) {
                        questionFrontendId
                        difficulty
                        topicTags { name }
                    }
                }",
            variables = new { titleSlug }
        };

        try
        {
            var content = new StringContent(JsonSerializer.Serialize(query), Encoding.UTF8, "application/json");
            var response = await client.PostAsync(LeetCodeGraphQL, content);
            if (!response.IsSuccessStatusCode) return ("Medium", [], 0);

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var question = doc.RootElement.GetProperty("data").GetProperty("question");

            var difficulty = question.GetProperty("difficulty").GetString() ?? "Medium";
            var tags = question.GetProperty("topicTags")
                .EnumerateArray()
                .Select(t => t.GetProperty("name").GetString() ?? "")
                .Where(n => n.Length > 0)
                .ToList();

            var frontendIdStr = question.GetProperty("questionFrontendId").GetString() ?? "0";
            int.TryParse(frontendIdStr, out var lcNumber);

            return (difficulty, tags, lcNumber);
        }
        catch
        {
            return ("Medium", [], 0);
        }
    }
}
