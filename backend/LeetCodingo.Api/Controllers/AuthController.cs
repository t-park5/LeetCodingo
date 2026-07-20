using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LeetCodingo.Api.Data;
using LeetCodingo.Api.DTOs;
using LeetCodingo.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace LeetCodingo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext db, IConfiguration config) : ControllerBase
{
    // POST /api/auth/register
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UserName))
            return BadRequest("Username is required.");

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            return BadRequest("Password must be at least 6 characters.");

        var exists = await db.Users.AnyAsync(u => u.UserName == request.UserName);
        if (exists)
            return Conflict($"Username '{request.UserName}' is already taken.");

        var user = new User
        {
            UserName = request.UserName.Trim(),
            Email = request.Email?.Trim(),
            LeetCodeUsername = request.LeetCodeUsername?.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return Ok(BuildAuthResponse(user));
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest("Username and password are required.");

        var user = await db.Users.FirstOrDefaultAsync(u => u.UserName == request.UserName);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized("Invalid username or password.");

        return Ok(BuildAuthResponse(user));
    }

    private AuthResponse BuildAuthResponse(User user)
    {
        var token = GenerateJwtToken(user);
        return new AuthResponse
        {
            Token = token,
            UserId = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            LeetCodeUsername = user.LeetCodeUsername
        };
    }

    private string GenerateJwtToken(User user)
    {
        var jwtKey = config["Jwt:Key"] ?? "leetcodingo-default-secret-key-change-in-production";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.UserName)
        };

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"] ?? "leetcodingo",
            audience: config["Jwt:Audience"] ?? "leetcodingo",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
