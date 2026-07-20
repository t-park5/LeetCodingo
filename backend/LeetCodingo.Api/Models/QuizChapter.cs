namespace LeetCodingo.Api.Models;

public class QuizChapter
{
    public int Id { get; set; }

    // e.g. "Array", "Tree", "Dynamic Programming"
    public string Title { get; set; } = string.Empty;

    // Short description shown on the chapter selection screen
    public string Description { get; set; } = string.Empty;

    // Display order (global ordering across all units)
    public int Order { get; set; }

    // Unit grouping label, e.g. "Unit 1 — Array Foundations"
    public string? UnitTitle { get; set; }

    public ICollection<QuizQuestion> Questions { get; set; } = [];
    public ICollection<UserLessonProgress> UserProgress { get; set; } = [];
}
