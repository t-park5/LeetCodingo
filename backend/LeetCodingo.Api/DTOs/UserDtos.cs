namespace LeetCodingo.Api.DTOs;

public class CreateUserRequest
{
    public string UserName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? LeetCodeUsername { get; set; }
}

public class UserResponse
{
    public int Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? LeetCodeUsername { get; set; }
    public int CurrentStreak { get; set; }
    public int WeeklyGoalLessons { get; set; }
    public DateTime CreatedAt { get; set; }
}
