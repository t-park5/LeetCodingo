using LeetCodingo.Api.Data;
using LeetCodingo.Api.DTOs;
using LeetCodingo.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeetCodingo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubmissionsController(AppDbContext db) : ControllerBase
{
    // POST /api/submissions
    [HttpPost]
    public async Task<ActionResult<SubmissionResponse>> Create(CreateSubmissionRequest request)
    {
        var user = await db.Users.FindAsync(request.UserId);
        if (user is null) return NotFound($"User {request.UserId} not found.");

        var problem = await db.Problems.FindAsync(request.ProblemId);
        if (problem is null) return NotFound($"Problem {request.ProblemId} not found.");

        var submission = new Submission
        {
            UserId = request.UserId,
            ProblemId = request.ProblemId,
            SolvedDate = request.SolvedDate
        };

        db.Submissions.Add(submission);
        await db.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetByUser),
            new { userId = submission.UserId },
            ToResponse(submission, user, problem));
    }

    // GET /api/submissions/user/{userId}
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<SubmissionResponse>>> GetByUser(int userId)
    {
        var userExists = await db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists) return NotFound($"User {userId} not found.");

        var submissions = await db.Submissions
            .Include(s => s.User)
            .Include(s => s.Problem)
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.SolvedDate)
            .ToListAsync();

        return Ok(submissions.Select(s => ToResponse(s, s.User, s.Problem)));
    }

    // GET /api/submissions/user/{userId}/stats
    [HttpGet("user/{userId}/stats")]
    public async Task<ActionResult<UserStatsResponse>> GetStats(int userId)
    {
        var user = await db.Users.FindAsync(userId);
        if (user is null) return NotFound($"User {userId} not found.");

        var submissions = await db.Submissions
            .Include(s => s.Problem)
            .Where(s => s.UserId == userId)
            .ToListAsync();

        var weekStart = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek);
        var easySolved = submissions.Count(s => s.Problem.Difficulty == "Easy");
        var mediumSolved = submissions.Count(s => s.Problem.Difficulty == "Medium");
        var hardSolved = submissions.Count(s => s.Problem.Difficulty == "Hard");

        return Ok(new UserStatsResponse
        {
            UserId = userId,
            UserName = user.UserName,
            TotalSolved = submissions.Count,
            EasySolved = easySolved,
            MediumSolved = mediumSolved,
            HardSolved = hardSolved,
            TotalScore = (easySolved * 1) + (mediumSolved * 3) + (hardSolved * 5),
            WeeklySolved = submissions.Count(s => s.SolvedDate.Date >= weekStart)
        });
    }

    // GET /api/submissions/activity/{userId}
    // Returns a map of "yyyy-MM-dd" -> count for the activity heatmap.
    [HttpGet("activity/{userId}")]
    public async Task<ActionResult<Dictionary<string, int>>> GetActivity(int userId)
    {
        var dates = await db.Submissions
            .Where(s => s.UserId == userId)
            .Select(s => s.SolvedDate)
            .ToListAsync();

        var activity = dates
            .GroupBy(d => d.ToString("yyyy-MM-dd"))
            .ToDictionary(g => g.Key, g => g.Count());

        return Ok(activity);
    }

    private static SubmissionResponse ToResponse(Submission s, User u, Problem p) => new()
    {
        Id = s.Id,
        UserId = u.Id,
        UserName = u.UserName,
        LeetCodeNumber = p.LeetCodeNumber,
        ProblemTitle = p.Title,
        Difficulty = p.Difficulty,
        SolvedDate = s.SolvedDate
    };
}
