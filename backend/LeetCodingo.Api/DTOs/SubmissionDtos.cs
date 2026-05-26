namespace LeetCodingo.Api.DTOs;

public class CreateSubmissionRequest
{
    public int UserId { get; set; }
    public int ProblemId { get; set; }
    public DateTime SolvedDate { get; set; } = DateTime.UtcNow;
}

public class SubmissionResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int LeetCodeNumber { get; set; }
    public string ProblemTitle { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;
    public DateTime SolvedDate { get; set; }
}

public class UserStatsResponse
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int TotalSolved { get; set; }
    public int EasySolved { get; set; }
    public int MediumSolved { get; set; }
    public int HardSolved { get; set; }

    // Easy=1, Medium=3, Hard=5
    public int TotalScore { get; set; }

    public int WeeklySolved { get; set; }
}
