namespace LeetCodingo.Api.Models;

public class QuizQuestion
{
    public int Id { get; set; }
    public int ChapterId { get; set; }
    public QuizChapter Chapter { get; set; } = null!;

    // "FillBlank" | "FindBug" | "PredictOutput"
    public string QuestionType { get; set; } = string.Empty;

    // The question prompt shown to the user
    public string Prompt { get; set; } = string.Empty;

    // Code snippet shown (can be null for non-code questions)
    public string? CodeSnippet { get; set; }

    // JSON array of answer options e.g. ["[1,2]", "[2,1]", "null", "[]"]
    public string OptionsJson { get; set; } = "[]";

    // The correct answer (must match one of the options exactly)
    public string CorrectAnswer { get; set; } = string.Empty;

    // Brief explanation shown after the user answers
    public string? Explanation { get; set; }

    // Display order within the chapter
    public int Order { get; set; }

    public ICollection<UserWrongAnswer> WrongAnswers { get; set; } = [];
}
