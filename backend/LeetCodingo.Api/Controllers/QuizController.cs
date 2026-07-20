using System.Text.Json;
using LeetCodingo.Api.Data;
using LeetCodingo.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeetCodingo.Api.Controllers;

[ApiController]
[Route("api/quiz")]
public class QuizController(AppDbContext db) : ControllerBase
{
    // GET /api/quiz/chapters
    [HttpGet("chapters")]
    public async Task<ActionResult<IEnumerable<QuizChapterResponse>>> GetChapters()
    {
        var chapters = await db.QuizChapters
            .OrderBy(c => c.Order)
            .Select(c => new QuizChapterResponse
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Order = c.Order,
                QuestionCount = c.Questions.Count
            })
            .ToListAsync();

        return Ok(chapters);
    }

    // GET /api/quiz/chapters/{chapterId}/questions
    [HttpGet("chapters/{chapterId}/questions")]
    public async Task<ActionResult<IEnumerable<QuizQuestionResponse>>> GetQuestions(int chapterId)
    {
        var chapter = await db.QuizChapters.FindAsync(chapterId);
        if (chapter is null) return NotFound("Chapter not found.");

        var questions = await db.QuizQuestions
            .Where(q => q.ChapterId == chapterId)
            .OrderBy(q => q.Order)
            .ToListAsync();

        var result = questions.Select(q => new QuizQuestionResponse
        {
            Id = q.Id,
            QuestionType = q.QuestionType,
            Prompt = q.Prompt,
            CodeSnippet = q.CodeSnippet,
            Options = JsonSerializer.Deserialize<List<string>>(q.OptionsJson) ?? [],
            CorrectAnswer = q.CorrectAnswer,
            Explanation = q.Explanation,
            Order = q.Order
        });

        return Ok(result);
    }
}
