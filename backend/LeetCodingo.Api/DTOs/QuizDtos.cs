namespace LeetCodingo.Api.DTOs;

public class QuizChapterResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Order { get; set; }
    public string? UnitTitle { get; set; }
    public int QuestionCount { get; set; }

    // Populated when userId is provided
    public bool IsCompleted { get; set; }
    public bool IsUnlocked { get; set; }
    public int? BestScore { get; set; }
}

public class QuizQuestionResponse
{
    public int Id { get; set; }
    public string QuestionType { get; set; } = string.Empty;
    public string Prompt { get; set; } = string.Empty;
    public string? CodeSnippet { get; set; }
    public List<string> Options { get; set; } = [];
    public string CorrectAnswer { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    public int Order { get; set; }
}

public class SubmitLessonRequest
{
    public int UserId { get; set; }
    public int ChapterId { get; set; }
    public int Score { get; set; }
    public int TotalQuestions { get; set; }
    public List<int> WrongQuestionIds { get; set; } = [];
}

public class SubmitLessonResponse
{
    public bool IsCompleted { get; set; }
    public int Score { get; set; }
    public int TotalQuestions { get; set; }
    public int LessonsCompletedThisWeek { get; set; }
    public int WeeklyGoal { get; set; }
}

public class WrongAnswerResponse
{
    public int WrongAnswerId { get; set; }
    public QuizQuestionResponse Question { get; set; } = null!;
    public DateTime LastAttemptedAt { get; set; }
}
