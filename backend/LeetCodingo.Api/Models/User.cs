namespace LeetCodingo.Api.Models;

public class User
{
    public int Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string PasswordHash { get; set; } = string.Empty;

    // LeetCode profile ID for stats sync
    public string? LeetCodeUsername { get; set; }

    // Daily streak tracking
    public int CurrentStreak { get; set; } = 0;
    public DateTime? LastActiveDate { get; set; }

    // Weekly goal (number of lessons per week: 3, 5, or 10)
    public int WeeklyGoalLessons { get; set; } = 5;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Submission> Submissions { get; set; } = [];
    public ICollection<UserLessonProgress> LessonProgress { get; set; } = [];
    public ICollection<UserWrongAnswer> WrongAnswers { get; set; } = [];
}
