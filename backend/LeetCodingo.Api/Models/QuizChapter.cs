namespace LeetCodingo.Api.Models;

public class QuizChapter
{
    public int Id { get; set; }

    // e.g. "Array", "Tree", "Dynamic Programming"
    public string Title { get; set; } = string.Empty;

    // Short description shown on the chapter selection screen
    public string Description { get; set; } = string.Empty;

    // Display order
    public int Order { get; set; }

    public ICollection<QuizQuestion> Questions { get; set; } = [];
}
