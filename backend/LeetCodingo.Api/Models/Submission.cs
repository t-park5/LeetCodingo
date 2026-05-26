namespace LeetCodingo.Api.Models;

public class Submission
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ProblemId { get; set; }
    public DateTime SolvedDate { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Problem Problem { get; set; } = null!;
}
