namespace LeetCodingo.Api.Models;

public class Problem
{
    public int Id { get; set; }
    public int LeetCodeNumber { get; set; }
    public string Title { get; set; } = string.Empty;

    // "Easy", "Medium", "Hard"
    public string Difficulty { get; set; } = string.Empty;

    public ICollection<Submission> Submissions { get; set; } = [];
}
