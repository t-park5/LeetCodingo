using LeetCodingo.Api.Data;
using LeetCodingo.Api.DTOs;
using LeetCodingo.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeetCodingo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProblemsController(AppDbContext db) : ControllerBase
{
    // GET /api/problems
    // Optional: ?difficulty=Easy|Medium|Hard
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProblemResponse>>> GetAll(
        [FromQuery] string? difficulty)
    {
        var query = db.Problems.AsQueryable();

        if (!string.IsNullOrEmpty(difficulty))
            query = query.Where(p => p.Difficulty == difficulty);

        var problems = await query.OrderBy(p => p.LeetCodeNumber).ToListAsync();
        return Ok(problems.Select(ToResponse));
    }

    // GET /api/problems/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<ProblemResponse>> GetById(int id)
    {
        var problem = await db.Problems.FindAsync(id);
        if (problem is null) return NotFound();
        return Ok(ToResponse(problem));
    }

    // POST /api/problems
    [HttpPost]
    public async Task<ActionResult<ProblemResponse>> Create(CreateProblemRequest request)
    {
        var validDifficulties = new[] { "Easy", "Medium", "Hard" };
        if (!validDifficulties.Contains(request.Difficulty))
            return BadRequest("Difficulty must be Easy, Medium, or Hard.");

        var exists = await db.Problems.AnyAsync(p => p.LeetCodeNumber == request.LeetCodeNumber);
        if (exists)
            return Conflict($"Problem #{request.LeetCodeNumber} already exists.");

        var problem = new Problem
        {
            LeetCodeNumber = request.LeetCodeNumber,
            Title = request.Title.Trim(),
            Difficulty = request.Difficulty
        };

        db.Problems.Add(problem);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = problem.Id }, ToResponse(problem));
    }

    private static ProblemResponse ToResponse(Problem p) => new()
    {
        Id = p.Id,
        LeetCodeNumber = p.LeetCodeNumber,
        Title = p.Title,
        Difficulty = p.Difficulty
    };
}
