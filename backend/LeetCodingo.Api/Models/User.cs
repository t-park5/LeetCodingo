namespace LeetCodingo.Api.Models;

public class User
{
    public int Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? Email { get; set; }

    // LeetCode profile ID for future stats sync
    public string? LeetCodeUsername { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Submission> Submissions { get; set; } = [];
}
