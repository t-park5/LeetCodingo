using System.Text.Json;
using LeetCodingo.Api.Data;
using LeetCodingo.Api.DTOs;
using LeetCodingo.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeetCodingo.Api.Controllers;

[ApiController]
[Route("api/quiz")]
public class QuizController(AppDbContext db) : ControllerBase
{
    // GET /api/quiz/chapters?userId=1
    // Returns chapters with user progress (locked/unlocked/completed) when userId is provided.
    [HttpGet("chapters")]
    public async Task<ActionResult<IEnumerable<QuizChapterResponse>>> GetChapters([FromQuery] int? userId)
    {
        var chapters = await db.QuizChapters
            .OrderBy(c => c.Order)
            .Select(c => new { c.Id, c.Title, c.Description, c.Order, c.UnitTitle, Count = c.Questions.Count })
            .ToListAsync();

        List<UserLessonProgress> userProgress = [];
        if (userId.HasValue)
        {
            userProgress = await db.UserLessonProgress
                .Where(p => p.UserId == userId.Value)
                .ToListAsync();
        }

        var completedIds = userProgress.Where(p => p.IsCompleted).Select(p => p.ChapterId).ToHashSet();

        var result = chapters.Select((c, i) =>
        {
            var progress = userProgress.FirstOrDefault(p => p.ChapterId == c.Id);
            bool isUnlocked = i == 0 || completedIds.Contains(chapters[i - 1].Id);

            return new QuizChapterResponse
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Order = c.Order,
                UnitTitle = c.UnitTitle,
                QuestionCount = c.Count,
                IsCompleted = progress?.IsCompleted ?? false,
                IsUnlocked = userId.HasValue ? isUnlocked : true,
                BestScore = progress?.Score
            };
        });

        return Ok(result);
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

        return Ok(questions.Select(MapQuestion));
    }

    // GET /api/quiz/bytype/{questionType}?limit=10
    // Returns random questions of a given type across all chapters.
    [HttpGet("bytype/{questionType}")]
    public async Task<ActionResult<IEnumerable<QuizQuestionResponse>>> GetByType(string questionType, [FromQuery] int limit = 10)
    {
        // Fetch all matching questions first, then shuffle in memory.
        // OrderBy(Guid.NewGuid()) cannot be translated to SQL by EF Core.
        var questions = await db.QuizQuestions
            .Where(q => q.QuestionType == questionType)
            .ToListAsync();

        var shuffled = questions
            .OrderBy(_ => Random.Shared.Next())
            .Take(limit)
            .ToList();

        return Ok(shuffled.Select(MapQuestion));
    }

    // POST /api/quiz/submit
    // Records lesson completion and wrong answers for a user.
    [HttpPost("submit")]
    public async Task<ActionResult<SubmitLessonResponse>> SubmitLesson(SubmitLessonRequest request)
    {
        var user = await db.Users.FindAsync(request.UserId);
        if (user is null) return NotFound("User not found.");

        var chapter = await db.QuizChapters.FindAsync(request.ChapterId);
        if (chapter is null) return NotFound("Chapter not found.");

        bool isCompleted = request.TotalQuestions > 0 &&
            (double)request.Score / request.TotalQuestions >= 0.8;

        // Save or update lesson progress
        var existing = await db.UserLessonProgress
            .FirstOrDefaultAsync(p => p.UserId == request.UserId && p.ChapterId == request.ChapterId);

        if (existing is null)
        {
            db.UserLessonProgress.Add(new UserLessonProgress
            {
                UserId = request.UserId,
                ChapterId = request.ChapterId,
                Score = request.Score,
                TotalQuestions = request.TotalQuestions,
                IsCompleted = isCompleted,
                CompletedAt = DateTime.UtcNow
            });
        }
        else
        {
            // Keep the best score
            if (request.Score > existing.Score)
            {
                existing.Score = request.Score;
                existing.TotalQuestions = request.TotalQuestions;
            }
            existing.IsCompleted = existing.IsCompleted || isCompleted;
            existing.CompletedAt = DateTime.UtcNow;
        }

        // Save wrong answers (upsert by userId + questionId)
        foreach (var questionId in request.WrongQuestionIds)
        {
            var wrong = await db.UserWrongAnswers
                .FirstOrDefaultAsync(w => w.UserId == request.UserId && w.QuestionId == questionId);

            if (wrong is null)
            {
                db.UserWrongAnswers.Add(new UserWrongAnswer
                {
                    UserId = request.UserId,
                    QuestionId = questionId,
                    LastAttemptedAt = DateTime.UtcNow,
                    ReviewedAt = null
                });
            }
            else
            {
                wrong.LastAttemptedAt = DateTime.UtcNow;
                wrong.ReviewedAt = null;
            }
        }

        await db.SaveChangesAsync();

        var weekStart = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek);
        var lessonsThisWeek = await db.UserLessonProgress
            .CountAsync(p => p.UserId == request.UserId && p.IsCompleted && p.CompletedAt >= weekStart);

        return Ok(new SubmitLessonResponse
        {
            IsCompleted = isCompleted,
            Score = request.Score,
            TotalQuestions = request.TotalQuestions,
            LessonsCompletedThisWeek = lessonsThisWeek,
            WeeklyGoal = user.WeeklyGoalLessons
        });
    }

    // GET /api/quiz/review/{userId}
    // Returns wrong answers not yet reviewed.
    [HttpGet("review/{userId}")]
    public async Task<ActionResult<IEnumerable<WrongAnswerResponse>>> GetWrongAnswers(int userId)
    {
        var wrongs = await db.UserWrongAnswers
            .Include(w => w.Question)
            .Where(w => w.UserId == userId && w.ReviewedAt == null)
            .OrderByDescending(w => w.LastAttemptedAt)
            .ToListAsync();

        var result = wrongs.Select(w => new WrongAnswerResponse
        {
            WrongAnswerId = w.Id,
            Question = MapQuestion(w.Question),
            LastAttemptedAt = w.LastAttemptedAt
        });

        return Ok(result);
    }

    // POST /api/quiz/chapters/{chapterId}/skip?userId=X
    // Marks a chapter as completed (IsCompleted=true, score=0) to unlock the next chapter.
    [HttpPost("chapters/{chapterId}/skip")]
    public async Task<IActionResult> SkipChapter(int chapterId, [FromQuery] int userId)
    {
        var chapter = await db.QuizChapters.FindAsync(chapterId);
        if (chapter is null) return NotFound("Chapter not found.");

        var existing = await db.UserLessonProgress
            .FirstOrDefaultAsync(p => p.UserId == userId && p.ChapterId == chapterId);

        if (existing is null)
        {
            db.UserLessonProgress.Add(new UserLessonProgress
            {
                UserId = userId,
                ChapterId = chapterId,
                Score = 0,
                TotalQuestions = 0,
                IsCompleted = true,
                CompletedAt = DateTime.UtcNow
            });
        }
        else
        {
            existing.IsCompleted = true;
        }

        await db.SaveChangesAsync();
        return NoContent();
    }

    // PUT /api/quiz/review/{wrongAnswerId}/resolve
    // Marks a wrong answer as reviewed (user answered correctly during review).
    [HttpPut("review/{wrongAnswerId}/resolve")]
    public async Task<IActionResult> ResolveWrongAnswer(int wrongAnswerId)
    {
        var wrong = await db.UserWrongAnswers.FindAsync(wrongAnswerId);
        if (wrong is null) return NotFound();

        wrong.ReviewedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return NoContent();
    }

    private static QuizQuestionResponse MapQuestion(QuizQuestion q) => new()
    {
        Id = q.Id,
        QuestionType = q.QuestionType,
        Prompt = q.Prompt,
        CodeSnippet = q.CodeSnippet,
        Options = JsonSerializer.Deserialize<List<string>>(q.OptionsJson) ?? [],
        CorrectAnswer = q.CorrectAnswer,
        Explanation = q.Explanation,
        Order = q.Order
    };
}
