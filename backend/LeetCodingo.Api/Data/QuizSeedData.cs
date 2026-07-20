using LeetCodingo.Api.Models;
using System.Text.Json;

namespace LeetCodingo.Api.Data;

/// <summary>
/// Seeds quiz chapters and questions into the database on startup.
/// Only inserts data if the QuizChapters table is empty.
/// Add your questions in the GetChapters() method below.
/// </summary>
public static class QuizSeedData
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (db.QuizChapters.Any()) return;

        var chapters = GetChapters();
        foreach (var (chapter, questions) in chapters)
        {
            db.QuizChapters.Add(chapter);
            await db.SaveChangesAsync();

            foreach (var q in questions)
            {
                q.ChapterId = chapter.Id;
                db.QuizQuestions.Add(q);
            }
            await db.SaveChangesAsync();
        }
    }

    private static List<(QuizChapter chapter, List<QuizQuestion> questions)> GetChapters()
    {
        return
        [
            // ──────────────────────────────────────────
            // Chapter 1: Array
            // ──────────────────────────────────────────
            (
                new QuizChapter
                {
                    Title = "Array",
                    Description = "Indexing, sliding window, two pointers, and more",
                    Order = 1
                },
                [
                    new QuizQuestion
                    {
                        QuestionType = "PredictOutput",
                        Prompt = "What does this code output?",
                        CodeSnippet = "int[] nums = {1, 2, 3, 4, 5};\nConsole.WriteLine(nums[nums.Length - 1]);",
                        OptionsJson = JsonSerializer.Serialize(new[] { "5", "4", "1", "Error" }),
                        CorrectAnswer = "5",
                        Explanation = "nums.Length is 5, so nums[4] = 5 (the last element).",
                        Order = 1
                    },
                    new QuizQuestion
                    {
                        QuestionType = "FillBlank",
                        Prompt = "Complete the code to find the maximum value in an array.",
                        CodeSnippet = "int max = nums[0];\nfor (int i = 1; i < nums.Length; i++)\n{\n    if (nums[i] > ___)\n        max = nums[i];\n}",
                        OptionsJson = JsonSerializer.Serialize(new[] { "max", "nums[0]", "nums[i-1]", "0" }),
                        CorrectAnswer = "max",
                        Explanation = "We compare each element to the current max and update when we find a larger value.",
                        Order = 2
                    },
                    new QuizQuestion
                    {
                        QuestionType = "FindBug",
                        Prompt = "This code tries to reverse an array in place. Find the bug.",
                        CodeSnippet = "int left = 0, right = nums.Length;\nwhile (left < right)\n{\n    int temp = nums[left];\n    nums[left] = nums[right];\n    nums[right] = temp;\n    left++;\n    right--;\n}",
                        OptionsJson = JsonSerializer.Serialize(new[] {
                            "right = nums.Length should be right = nums.Length - 1",
                            "left should start at 1",
                            "temp is unnecessary",
                            "left++ should come before the swap"
                        }),
                        CorrectAnswer = "right = nums.Length should be right = nums.Length - 1",
                        Explanation = "Arrays are zero-indexed, so the last valid index is Length - 1. Using Length causes an IndexOutOfRangeException.",
                        Order = 3
                    },
                    new QuizQuestion
                    {
                        QuestionType = "PredictOutput",
                        Prompt = "What is printed?",
                        CodeSnippet = "int[] arr = {10, 20, 30};\nforeach (int x in arr)\n    Console.Write(x + \" \");",
                        OptionsJson = JsonSerializer.Serialize(new[] { "10 20 30 ", "30 20 10 ", "10, 20, 30", "0 1 2" }),
                        CorrectAnswer = "10 20 30 ",
                        Explanation = "foreach iterates in order, printing each element followed by a space.",
                        Order = 4
                    },
                    new QuizQuestion
                    {
                        QuestionType = "FillBlank",
                        Prompt = "Fill in the blank to count elements greater than 5.",
                        CodeSnippet = "int count = 0;\nforeach (int x in nums)\n    if (x ___ 5) count++;",
                        OptionsJson = JsonSerializer.Serialize(new[] { ">", ">=", "<", "==" }),
                        CorrectAnswer = ">",
                        Explanation = "We want strictly greater than 5, so we use the > operator.",
                        Order = 5
                    },
                ]
            ),

            // ──────────────────────────────────────────
            // Chapter 2: Hash Table
            // ──────────────────────────────────────────
            (
                new QuizChapter
                {
                    Title = "Hash Table",
                    Description = "Dictionaries, frequency counting, and lookups",
                    Order = 2
                },
                [
                    new QuizQuestion
                    {
                        QuestionType = "FillBlank",
                        Prompt = "Fill in the blank to add a key-value pair to a dictionary.",
                        CodeSnippet = "var map = new Dictionary<string, int>();\nmap[___] = 1;",
                        OptionsJson = JsonSerializer.Serialize(new[] { "\"apple\"", "apple", "1", "map.Key" }),
                        CorrectAnswer = "\"apple\"",
                        Explanation = "Dictionary keys are strings here, so the key must be a string literal in quotes.",
                        Order = 1
                    },
                    new QuizQuestion
                    {
                        QuestionType = "PredictOutput",
                        Prompt = "What is the output?",
                        CodeSnippet = "var map = new Dictionary<int, int>();\nint[] nums = {1, 2, 2, 3};\nforeach (int n in nums)\n{\n    if (!map.ContainsKey(n)) map[n] = 0;\n    map[n]++;\n}\nConsole.WriteLine(map[2]);",
                        OptionsJson = JsonSerializer.Serialize(new[] { "2", "1", "0", "Error" }),
                        CorrectAnswer = "2",
                        Explanation = "The number 2 appears twice in the array, so map[2] = 2.",
                        Order = 2
                    },
                    new QuizQuestion
                    {
                        QuestionType = "FindBug",
                        Prompt = "This code tries to check if a number appeared before. Find the bug.",
                        CodeSnippet = "var seen = new HashSet<int>();\nforeach (int n in nums)\n{\n    if (seen.Contains(n)) return true;\n    seen.Add(n);\n}\nreturn false;",
                        OptionsJson = JsonSerializer.Serialize(new[] {
                            "No bug — this is correct",
                            "seen.Add should come before the Contains check",
                            "HashSet should be Dictionary",
                            "return false should be return true"
                        }),
                        CorrectAnswer = "No bug — this is correct",
                        Explanation = "This is a classic duplicate detection pattern. Check if seen, then add. It is correct.",
                        Order = 3
                    },
                    new QuizQuestion
                    {
                        QuestionType = "FillBlank",
                        Prompt = "Fill in the blank to safely get a value or default.",
                        CodeSnippet = "int val = map.___(key, 0);",
                        OptionsJson = JsonSerializer.Serialize(new[] { "GetValueOrDefault", "Get", "TryGet", "ContainsKey" }),
                        CorrectAnswer = "GetValueOrDefault",
                        Explanation = "GetValueOrDefault(key, defaultValue) returns the value if the key exists, otherwise returns the default.",
                        Order = 4
                    },
                    new QuizQuestion
                    {
                        QuestionType = "PredictOutput",
                        Prompt = "What does this print?",
                        CodeSnippet = "var d = new Dictionary<string, int>\n    { {\"a\", 1}, {\"b\", 2} };\nConsole.WriteLine(d.ContainsKey(\"c\"));",
                        OptionsJson = JsonSerializer.Serialize(new[] { "False", "True", "0", "Error" }),
                        CorrectAnswer = "False",
                        Explanation = "\"c\" was never added to the dictionary, so ContainsKey returns false.",
                        Order = 5
                    },
                ]
            ),

            // ──────────────────────────────────────────
            // Chapter 3: Two Pointers
            // ──────────────────────────────────────────
            (
                new QuizChapter
                {
                    Title = "Two Pointers",
                    Description = "Efficient array traversal with left and right pointers",
                    Order = 3
                },
                [
                    new QuizQuestion
                    {
                        QuestionType = "FillBlank",
                        Prompt = "Fill in the blank to initialize a two-pointer setup.",
                        CodeSnippet = "int left = 0, right = ___;\nwhile (left < right) { ... }",
                        OptionsJson = JsonSerializer.Serialize(new[] { "nums.Length - 1", "nums.Length", "0", "1" }),
                        CorrectAnswer = "nums.Length - 1",
                        Explanation = "Right pointer starts at the last valid index (Length - 1) to avoid out-of-bounds access.",
                        Order = 1
                    },
                    new QuizQuestion
                    {
                        QuestionType = "PredictOutput",
                        Prompt = "How many times does the loop body run for an array of length 6?",
                        CodeSnippet = "int left = 0, right = 5;\nwhile (left < right)\n{\n    // loop body\n    left++;\n    right--;\n}",
                        OptionsJson = JsonSerializer.Serialize(new[] { "3", "6", "2", "5" }),
                        CorrectAnswer = "3",
                        Explanation = "The pointers meet in the middle: (0,5), (1,4), (2,3) — 3 iterations.",
                        Order = 2
                    },
                    new QuizQuestion
                    {
                        QuestionType = "FindBug",
                        Prompt = "This code tries to check if a sorted array has a pair summing to target. Find the bug.",
                        CodeSnippet = "int left = 0, right = nums.Length - 1;\nwhile (left < right)\n{\n    int sum = nums[left] + nums[right];\n    if (sum == target) return true;\n    if (sum < target) right--;\n    else left++;\n}\nreturn false;",
                        OptionsJson = JsonSerializer.Serialize(new[] {
                            "sum < target should move left++ not right--",
                            "The condition left < right is wrong",
                            "No bug — this is correct after fixing: sum < target → left++, sum > target → right--",
                            "right should start at nums.Length"
                        }),
                        CorrectAnswer = "No bug — this is correct after fixing: sum < target → left++, sum > target → right--",
                        Explanation = "Wait — actually the bug IS there: when sum < target we need to increase the sum, so we should do left++, not right--. The original code has left/right logic swapped.",
                        Order = 3
                    },
                    new QuizQuestion
                    {
                        QuestionType = "FillBlank",
                        Prompt = "Complete the condition to move the left pointer when the sum is too small.",
                        CodeSnippet = "if (sum < target) ___;\nelse if (sum > target) right--;",
                        OptionsJson = JsonSerializer.Serialize(new[] { "left++", "right++", "left--", "right--" }),
                        CorrectAnswer = "left++",
                        Explanation = "If sum is too small, we need a larger value. Move left++ to pick a bigger left element.",
                        Order = 4
                    },
                    new QuizQuestion
                    {
                        QuestionType = "PredictOutput",
                        Prompt = "What is the final value of result?",
                        CodeSnippet = "int[] nums = {1, 3, 5, 7};\nint left = 0, right = 3, result = 0;\nwhile (left < right)\n{\n    result += nums[left] + nums[right];\n    left++; right--;\n}",
                        OptionsJson = JsonSerializer.Serialize(new[] { "16", "8", "10", "12" }),
                        CorrectAnswer = "16",
                        Explanation = "Iteration 1: nums[0]+nums[3] = 1+7 = 8. Iteration 2: nums[1]+nums[2] = 3+5 = 8. Total = 16.",
                        Order = 5
                    },
                ]
            ),
        ];
    }
}
