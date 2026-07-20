namespace LeetCodingo.Api.Models;

public class UserLessonProgress
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int ChapterId { get; set; }
    public QuizChapter Chapter { get; set; } = null!;

    // Number of correct answers
    public int Score { get; set; }

    // Total questions attempted
    public int TotalQuestions { get; set; }

    // True when score >= passing threshold (80%)
    public bool IsCompleted { get; set; }

    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
}
