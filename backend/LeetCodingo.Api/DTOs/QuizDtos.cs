namespace LeetCodingo.Api.DTOs;

public class QuizChapterResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Order { get; set; }
    public int QuestionCount { get; set; }
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
