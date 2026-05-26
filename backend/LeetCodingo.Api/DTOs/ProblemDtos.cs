namespace LeetCodingo.Api.DTOs;

public class CreateProblemRequest
{
    public int LeetCodeNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;
}

public class ProblemResponse
{
    public int Id { get; set; }
    public int LeetCodeNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;
}
