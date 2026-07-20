namespace LeetCodingo.Api.DTOs;

public class CheckInResponse
{
    public int CurrentStreak { get; set; }
    public bool IsNewDay { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class UpdateGoalRequest
{
    public int WeeklyGoalLessons { get; set; }
}

public class WeeklyGoalResponse
{
    public int GoalLessons { get; set; }
    public int CompletedThisWeek { get; set; }
}
