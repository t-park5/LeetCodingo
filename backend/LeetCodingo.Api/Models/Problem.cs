namespace LeetCodingo.Api.Models;

public class Problem
{
    public int Id { get; set; }
    public int LeetCodeNumber { get; set; }
    public string Title { get; set; } = string.Empty;

    // "Easy", "Medium", "Hard"
    public string Difficulty { get; set; } = string.Empty;

    // LeetCode slug used for GraphQL queries (e.g. "two-sum")
    public string? TitleSlug { get; set; }

    public ICollection<Submission> Submissions { get; set; } = [];
    public ICollection<ProblemTag> ProblemTags { get; set; } = [];
}
