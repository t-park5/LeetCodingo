using LeetCodingo.Api.Data;
using LeetCodingo.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeetCodingo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController(AppDbContext db) : ControllerBase
{
    // GET /api/leaderboard
    // Optional: ?range=week  (defaults to all-time)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LeaderboardEntryResponse>>> Get(
        [FromQuery] string? range)
    {
        var submissionsQuery = db.Submissions
            .Include(s => s.User)
            .Include(s => s.Problem)
            .AsQueryable();

        if (range == "week")
        {
            var weekStart = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek);
            submissionsQuery = submissionsQuery.Where(s => s.SolvedDate >= weekStart);
        }

        var submissions = await submissionsQuery.ToListAsync();

        var leaderboard = submissions
            .GroupBy(s => s.User)
            .Select(g =>
            {
                var easy = g.Count(s => s.Problem.Difficulty == "Easy");
                var medium = g.Count(s => s.Problem.Difficulty == "Medium");
                var hard = g.Count(s => s.Problem.Difficulty == "Hard");

                return new LeaderboardEntryResponse
                {
                    UserId = g.Key.Id,
                    UserName = g.Key.UserName,
                    TotalSolved = g.Count(),
                    EasySolved = easy,
                    MediumSolved = medium,
                    HardSolved = hard,
                    Score = (easy * 1) + (medium * 3) + (hard * 5)
                };
            })
            .OrderByDescending(e => e.Score)
            .ThenByDescending(e => e.TotalSolved)
            .Select((e, index) =>
            {
                e.Rank = index + 1;
                return e;
            })
            .ToList();

        return Ok(leaderboard);
    }
}
