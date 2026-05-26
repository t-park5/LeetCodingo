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

    private static UserResponse ToResponse(User u) => new()
    {
        Id = u.Id,
        UserName = u.UserName,
        Email = u.Email,
        LeetCodeUsername = u.LeetCodeUsername,
        CreatedAt = u.CreatedAt
    };
}
