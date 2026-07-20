using LeetCodingo.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LeetCodingo.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Problem> Problems => Set<Problem>();
    public DbSet<Submission> Submissions => Set<Submission>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<ProblemTag> ProblemTags => Set<ProblemTag>();
    public DbSet<QuizChapter> QuizChapters => Set<QuizChapter>();
    public DbSet<QuizQuestion> QuizQuestions => Set<QuizQuestion>();
    public DbSet<UserLessonProgress> UserLessonProgress => Set<UserLessonProgress>();
    public DbSet<UserWrongAnswer> UserWrongAnswers => Set<UserWrongAnswer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.UserName)
            .IsUnique();

        modelBuilder.Entity<Problem>()
            .HasIndex(p => p.LeetCodeNumber)
            .IsUnique();

        modelBuilder.Entity<Submission>()
            .HasOne(s => s.User)
            .WithMany(u => u.Submissions)
            .HasForeignKey(s => s.UserId);

        modelBuilder.Entity<Submission>()
            .HasOne(s => s.Problem)
            .WithMany(p => p.Submissions)
            .HasForeignKey(s => s.ProblemId);

        modelBuilder.Entity<Tag>()
            .HasIndex(t => t.Name)
            .IsUnique();

        modelBuilder.Entity<ProblemTag>()
            .HasKey(pt => new { pt.ProblemId, pt.TagId });

        modelBuilder.Entity<ProblemTag>()
            .HasOne(pt => pt.Problem)
            .WithMany(p => p.ProblemTags)
            .HasForeignKey(pt => pt.ProblemId);

        modelBuilder.Entity<ProblemTag>()
            .HasOne(pt => pt.Tag)
            .WithMany(t => t.ProblemTags)
            .HasForeignKey(pt => pt.TagId);

        modelBuilder.Entity<UserLessonProgress>()
            .HasOne(p => p.User)
            .WithMany(u => u.LessonProgress)
            .HasForeignKey(p => p.UserId);

        modelBuilder.Entity<UserLessonProgress>()
            .HasOne(p => p.Chapter)
            .WithMany(c => c.UserProgress)
            .HasForeignKey(p => p.ChapterId);

        modelBuilder.Entity<UserWrongAnswer>()
            .HasOne(w => w.User)
            .WithMany(u => u.WrongAnswers)
            .HasForeignKey(w => w.UserId);

        modelBuilder.Entity<UserWrongAnswer>()
            .HasOne(w => w.Question)
            .WithMany(q => q.WrongAnswers)
            .HasForeignKey(w => w.QuestionId);
    }
}
