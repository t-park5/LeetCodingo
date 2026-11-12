using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using LeetCodingo.Api.Data;
using LeetCodingo.Api.DTOs;
using LeetCodingo.Api.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace LeetCodingo.Api.Tests;

public sealed class TestApplication : WebApplicationFactory<Program>
{
    private readonly string database = Path.Combine(Path.GetTempPath(), $"leetcodingo-test-{Guid.NewGuid():N}.db");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, configuration) => configuration.AddInMemoryCollection(
            new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "integration-tests-only-signing-key-at-least-32-bytes",
                ["ConnectionStrings:DefaultConnection"] = $"Data Source={database};Pooling=False"
            }));
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing)
            foreach (var suffix in new[] { "", "-shm", "-wal" })
                File.Delete(database + suffix);
    }
}

public class AuthorizationTests : IClassFixture<TestApplication>
{
    private readonly TestApplication application;
    public AuthorizationTests(TestApplication application) => this.application = application;

    private async Task<(HttpClient client, int userId)> Register()
    {
        var client = application.CreateClient();
        var result = await client.PostAsJsonAsync("/api/auth/register", new
        {
            userName = $"test-{Guid.NewGuid():N}", password = "test-password", email = "private@example.test"
        });
        result.EnsureSuccessStatusCode();
        var auth = (await result.Content.ReadFromJsonAsync<AuthResponse>())!;
        // Exercise the real JWT issued by the app rather than a fake auth handler.
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.Token);
        return (client, auth.UserId);
    }

    [Theory]
    [InlineData("POST", "/api/users/1/checkin", "{}")]
    [InlineData("PUT", "/api/users/1/goal", "{\"weeklyGoalLessons\":5}")]
    [InlineData("POST", "/api/leetcode/sync/1", "{}")]
    [InlineData("POST", "/api/submissions", "{\"userId\":1,\"problemId\":1}")]
    [InlineData("POST", "/api/quiz/submit", "{\"userId\":1,\"chapterId\":1}")]
    [InlineData("POST", "/api/quiz/chapters/1/skip?userId=1", "{}")]
    [InlineData("PUT", "/api/quiz/review/1/resolve", "{}")]
    [InlineData("POST", "/api/problems", "{}")]
    public async Task WritesRequireAuthentication(string method, string path, string body)
    {
        using var client = application.CreateClient();
        using var response = await client.SendAsync(new HttpRequestMessage(new HttpMethod(method), path)
        {
            Content = new StringContent(body, System.Text.Encoding.UTF8, "application/json")
        });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData("POST", "/api/users/{0}/checkin", "{{}}")]
    [InlineData("PUT", "/api/users/{0}/goal", "{{\"weeklyGoalLessons\":5}}")]
    [InlineData("POST", "/api/leetcode/sync/{0}", "{{}}")]
    [InlineData("POST", "/api/submissions", "{{\"userId\":{0},\"problemId\":1}}")]
    [InlineData("POST", "/api/quiz/submit", "{{\"userId\":{0},\"chapterId\":1}}")]
    [InlineData("POST", "/api/quiz/chapters/1/skip?userId={0}", "{{}}")]
    [InlineData("GET", "/api/users/{0}", "{{}}")]
    [InlineData("GET", "/api/quiz/chapters?userId={0}", "{{}}")]
    [InlineData("GET", "/api/quiz/review/{0}", "{{}}")]
    [InlineData("GET", "/api/submissions/user/{0}", "{{}}")]
    [InlineData("GET", "/api/submissions/user/{0}/stats", "{{}}")]
    [InlineData("GET", "/api/submissions/activity/{0}", "{{}}")]
    [InlineData("GET", "/api/leetcode/tags/{0}", "{{}}")]
    public async Task CannotAccessAnotherUsersData(string method, string path, string body)
    {
        var (client, _) = await Register();
        var (otherClient, otherId) = await Register();
        using (client)
        using (otherClient)
        using (var response = await client.SendAsync(new HttpRequestMessage(new HttpMethod(method), string.Format(path, otherId))
        {
            Content = new StringContent(string.Format(body, otherId), System.Text.Encoding.UTF8, "application/json")
        }))
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task WrongAnswerOwnershipComesFromDatabase()
    {
        var (client, _) = await Register();
        var (otherClient, otherId) = await Register();
        using var scope = application.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var wrong = new UserWrongAnswer { UserId = otherId, QuestionId = db.QuizQuestions.First().Id };
        db.UserWrongAnswers.Add(wrong);
        await db.SaveChangesAsync();
        using (client)
        using (otherClient)
        {
            var response = await client.PutAsJsonAsync($"/api/quiz/review/{wrong.Id}/resolve", new { });
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            await db.Entry(wrong).ReloadAsync();
            Assert.Null(wrong.ReviewedAt);
        }
    }

    [Fact]
    public async Task OwnerCanWriteAndOtherEmailsAreHidden()
    {
        var (client, userId) = await Register();
        var (otherClient, otherId) = await Register();
        using (client)
        using (otherClient)
        {
            Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync($"/api/users/{userId}/checkin", new { })).StatusCode);
            Assert.Equal(HttpStatusCode.OK, (await client.PutAsJsonAsync($"/api/users/{userId}/goal", new { weeklyGoalLessons = 3 })).StatusCode);
            var users = (await client.GetFromJsonAsync<List<UserResponse>>("/api/users"))!;
            Assert.Null(users.Single(u => u.Id == otherId).Email);
            Assert.Equal("private@example.test", users.Single(u => u.Id == userId).Email);
        }
    }

    [Fact]
    public async Task PublicReadsStayOpenAndPasswordlessCreationIsRemoved()
    {
        using var client = application.CreateClient();
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/leaderboard")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/problems")).StatusCode);
        Assert.Equal(HttpStatusCode.MethodNotAllowed, (await client.PostAsJsonAsync("/api/users", new { userName = "no-password" })).StatusCode);
    }
}
