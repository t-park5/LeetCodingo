namespace LeetCodingo.Api.Models;

public class UserWrongAnswer
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int QuestionId { get; set; }
    public QuizQuestion Question { get; set; } = null!;

    // When the user last answered this question incorrectly
    public DateTime LastAttemptedAt { get; set; } = DateTime.UtcNow;

    // Set when user answers correctly during a review session
    public DateTime? ReviewedAt { get; set; }
}
