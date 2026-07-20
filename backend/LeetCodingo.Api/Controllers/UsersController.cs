using LeetCodingo.Api.Data;
using LeetCodingo.Api.DTOs;
using LeetCodingo.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeetCodingo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(AppDbContext db) : ControllerBase
{
    // GET /api/users
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponse>>> GetAll()
    {
        var users = await db.Users.ToListAsync();
        return Ok(users.Select(ToResponse));
    }

    // GET /api/users/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponse>> GetById(int id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();
        return Ok(ToResponse(user));
    }

    // POST /api/users
    [HttpPost]
    public async Task<ActionResult<UserResponse>> Create(CreateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UserName))
            return BadRequest("UserName is required.");

        var exists = await db.Users.AnyAsync(u => u.UserName == request.UserName);
        if (exists)
            return Conflict($"Username '{request.UserName}' is already taken.");

        var user = new User
        {
            UserName = request.UserName.Trim(),
            Email = request.Email?.Trim(),
            LeetCodeUsername = request.LeetCodeUsername?.Trim()
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, ToResponse(user));
    }

    // POST /api/users/{id}/checkin
    // Call on login or page load to update daily streak.
    [HttpPost("{id}/checkin")]
    public async Task<ActionResult<CheckInResponse>> CheckIn(int id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();

        var today = DateTime.UtcNow.Date;
        bool isNewDay = false;

        if (user.LastActiveDate is null)
        {
            user.CurrentStreak = 1;
            user.LastActiveDate = today;
            isNewDay = true;
        }
        else if (user.LastActiveDate.Value.Date == today)
        {
            // Already checked in today — no change
        }
        else if (user.LastActiveDate.Value.Date == today.AddDays(-1))
        {
            // Consecutive day — extend streak
            user.CurrentStreak++;
            user.LastActiveDate = today;
            isNewDay = true;
        }
        else
        {
            // Missed one or more days — reset streak
            user.CurrentStreak = 1;
            user.LastActiveDate = today;
            isNewDay = true;
        }

        await db.SaveChangesAsync();

        return Ok(new CheckInResponse
        {
            CurrentStreak = user.CurrentStreak,
            IsNewDay = isNewDay,
            Message = user.CurrentStreak > 1
                ? $"{user.CurrentStreak} day streak!"
                : "Welcome back!"
        });
    }

    // PUT /api/users/{id}/goal
    [HttpPut("{id}/goal")]
    public async Task<ActionResult<WeeklyGoalResponse>> UpdateGoal(int id, UpdateGoalRequest request)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();

        if (request.WeeklyGoalLessons is not (3 or 5 or 10))
            return BadRequest("Goal must be 3, 5, or 10.");

        user.WeeklyGoalLessons = request.WeeklyGoalLessons;
        await db.SaveChangesAsync();

        var weekStart = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek);
        var completedThisWeek = await db.UserLessonProgress
            .CountAsync(p => p.UserId == id && p.IsCompleted && p.CompletedAt >= weekStart);

        return Ok(new WeeklyGoalResponse
        {
            GoalLessons = user.WeeklyGoalLessons,
            CompletedThisWeek = completedThisWeek
        });
    }

    private static UserResponse ToResponse(User u) => new()
    {
        Id = u.Id,
        UserName = u.UserName,
        Email = u.Email,
        LeetCodeUsername = u.LeetCodeUsername,
        CurrentStreak = u.CurrentStreak,
        WeeklyGoalLessons = u.WeeklyGoalLessons,
        CreatedAt = u.CreatedAt
    };
}
