using LeetCodingo.Api.Models;
using System.Text.Json;

namespace LeetCodingo.Api.Data;

/// <summary>
/// Seeds quiz chapters and questions into the database on startup.
/// Adds only chapters whose Title does not yet exist — safe to re-run.
/// To add new chapters, append them to GetChapters() and restart the server.
/// </summary>
public static class QuizSeedData
{
    public static async Task SeedAsync(AppDbContext db)
    {
        var chapters = GetChapters();
        foreach (var (chapter, questions) in chapters)
        {
            var existing = db.QuizChapters.FirstOrDefault(c => c.Title == chapter.Title);

            if (existing is null)
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
            else if (existing.UnitTitle != chapter.UnitTitle)
            {
                // Backfill UnitTitle for chapters added before this field existed
                existing.UnitTitle = chapter.UnitTitle;
                await db.SaveChangesAsync();
            }
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
                    Order = 1,
                    UnitTitle = "Unit 1 — Array Foundations"
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
                        Explanation = "Arrays are zero-indexed. Using Length as the right index causes an IndexOutOfRangeException.",
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
                    Order = 2,
                    UnitTitle = "Unit 1 — Array Foundations"
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
                        Explanation = "This is a classic duplicate detection pattern: check if seen, then add. It is correct.",
                        Order = 3
                    },
                    new QuizQuestion
                    {
                        QuestionType = "FillBlank",
                        Prompt = "Fill in the blank to safely get a value or default.",
                        CodeSnippet = "int val = map.___(key, 0);",
                        OptionsJson = JsonSerializer.Serialize(new[] { "GetValueOrDefault", "Get", "TryGet", "ContainsKey" }),
                        CorrectAnswer = "GetValueOrDefault",
                        Explanation = "GetValueOrDefault(key, defaultValue) returns the value if the key exists, otherwise the default.",
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
                    Order = 3,
                    UnitTitle = "Unit 1 — Array Foundations"
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
                        QuestionType = "FillBlank",
                        Prompt = "Complete the condition to move the left pointer when the sum is too small.",
                        CodeSnippet = "if (sum < target) ___;\nelse if (sum > target) right--;",
                        OptionsJson = JsonSerializer.Serialize(new[] { "left++", "right++", "left--", "right--" }),
                        CorrectAnswer = "left++",
                        Explanation = "If sum is too small, we need a larger value. Move left++ to pick a bigger left element.",
                        Order = 3
                    },
                    new QuizQuestion
                    {
                        QuestionType = "FindBug",
                        Prompt = "This isPalindrome check has a bug. Find it.",
                        CodeSnippet = "int left = 0, right = s.Length - 1;\nwhile (left < right)\n{\n    if (s[left] != s[right]) return false;\n    left++;\n}\nreturn true;",
                        OptionsJson = JsonSerializer.Serialize(new[] {
                            "right-- is missing inside the loop",
                            "The condition should be left <= right",
                            "s[left] and s[right] should use ==",
                            "No bug — this is correct"
                        }),
                        CorrectAnswer = "right-- is missing inside the loop",
                        Explanation = "Both pointers need to move inward each iteration. Without right--, right stays at the end and the loop never terminates correctly.",
                        Order = 4
                    },
                    new QuizQuestion
                    {
                        QuestionType = "PredictOutput",
                        Prompt = "What is the final value of result?",
                        CodeSnippet = "int[] nums = {1, 3, 5, 7};\nint left = 0, right = 3, result = 0;\nwhile (left < right)\n{\n    result += nums[left] + nums[right];\n    left++; right--;\n}",
                        OptionsJson = JsonSerializer.Serialize(new[] { "16", "8", "10", "12" }),
                        CorrectAnswer = "16",
                        Explanation = "Iteration 1: 1+7=8. Iteration 2: 3+5=8. Total = 16.",
                        Order = 5
                    },
                ]
            ),

            // ──────────────────────────────────────────
            // Chapter 4: Stack
            // ──────────────────────────────────────────
            (
                new QuizChapter
                {
                    Title = "Stack",
                    Description = "LIFO data structure — matching brackets, undo operations, and more",
                    Order = 4,
                    UnitTitle = "Unit 2 — Search & Structure"
                },
                [
                    new QuizQuestion
                    {
                        QuestionType = "PredictOutput",
                        Prompt = "What does this code print?",
                        CodeSnippet = "var stack = new Stack<int>();\nstack.Push(1);\nstack.Push(2);\nstack.Push(3);\nConsole.WriteLine(stack.Pop());\nConsole.WriteLine(stack.Peek());",
                        OptionsJson = JsonSerializer.Serialize(new[] { "3\n2", "1\n2", "3\n3", "2\n1" }),
                        CorrectAnswer = "3\n2",
                        Explanation = "Pop() removes and returns the top (3). Peek() then returns the new top (2) without removing it.",
                        Order = 1
                    },
                    new QuizQuestion
                    {
                        QuestionType = "FillBlank",
                        Prompt = "Fill in the blank to check if a stack is empty before popping.",
                        CodeSnippet = "if (stack.___ > 0)\n    int top = stack.Pop();",
                        OptionsJson = JsonSerializer.Serialize(new[] { "Count", "Length", "Size", "Capacity" }),
                        CorrectAnswer = "Count",
                        Explanation = "Stack<T>.Count gives the number of elements. Always check before Pop() to avoid InvalidOperationException.",
                        Order = 2
                    },
                    new QuizQuestion
                    {
                        QuestionType = "FindBug",
                        Prompt = "This code checks for balanced parentheses. Find the bug.",
                        CodeSnippet = "var stack = new Stack<char>();\nforeach (char c in s)\n{\n    if (c == '(') stack.Push(c);\n    else if (c == ')') stack.Pop();\n}\nreturn stack.Count == 0;",
                        OptionsJson = JsonSerializer.Serialize(new[] {
                            "stack.Pop() should check if stack is empty first",
                            "Push should use ')' not '('",
                            "The return value is wrong",
                            "No bug — this is correct"
                        }),
                        CorrectAnswer = "stack.Pop() should check if stack is empty first",
                        Explanation = "If ')' appears before any '(', stack.Pop() throws an exception. Check stack.Count > 0 before popping.",
                        Order = 3
                    },
                    new QuizQuestion
                    {
                        QuestionType = "PredictOutput",
                        Prompt = "What order are items printed?",
                        CodeSnippet = "var stack = new Stack<string>();\nstack.Push(\"A\");\nstack.Push(\"B\");\nstack.Push(\"C\");\nwhile (stack.Count > 0)\n    Console.Write(stack.Pop() + \" \");",
                        OptionsJson = JsonSerializer.Serialize(new[] { "C B A ", "A B C ", "B A C ", "C A B " }),
                        CorrectAnswer = "C B A ",
                        Explanation = "Stack is LIFO (Last In, First Out). C was pushed last so it pops first.",
                        Order = 4
                    },
                    new QuizQuestion
                    {
                        QuestionType = "FillBlank",
                        Prompt = "Complete the code to implement a basic undo feature using a stack.",
                        CodeSnippet = "var history = new Stack<string>();\nhistory.Push(currentState);\n// ... user makes changes ...\nif (history.Count > 0)\n    currentState = history.___;",
                        OptionsJson = JsonSerializer.Serialize(new[] { "Pop()", "Peek()", "Push(currentState)", "Dequeue()" }),
                        CorrectAnswer = "Pop()",
                        Explanation = "Pop() removes and returns the last saved state, effectively undoing the last action.",
                        Order = 5
                    },
                ]
            ),

            // ──────────────────────────────────────────
            // Chapter 5: Binary Search
            // ──────────────────────────────────────────
            (
                new QuizChapter
                {
                    Title = "Binary Search",
                    Description = "Efficiently find elements in sorted arrays — O(log n)",
                    Order = 5,
                    UnitTitle = "Unit 2 — Search & Structure"
                },
                [
                    new QuizQuestion
                    {
                        QuestionType = "FillBlank",
                        Prompt = "Fill in the blank to calculate the middle index without overflow.",
                        CodeSnippet = "int left = 0, right = nums.Length - 1;\nwhile (left <= right)\n{\n    int mid = left + ___;\n}",
                        OptionsJson = JsonSerializer.Serialize(new[] { "(right - left) / 2", "(right + left) / 2", "right / 2", "(right - left)" }),
                        CorrectAnswer = "(right - left) / 2",
                        Explanation = "left + (right - left) / 2 avoids integer overflow that can occur with (left + right) / 2 for large values.",
                        Order = 1
                    },
                    new QuizQuestion
                    {
                        QuestionType = "FindBug",
                        Prompt = "This binary search has a subtle bug. Find it.",
                        CodeSnippet = "int left = 0, right = nums.Length - 1;\nwhile (left < right)\n{\n    int mid = left + (right - left) / 2;\n    if (nums[mid] == target) return mid;\n    if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n}\nreturn -1;",
                        OptionsJson = JsonSerializer.Serialize(new[] {
                            "while condition should be left <= right",
                            "mid calculation is wrong",
                            "left = mid + 1 should be left = mid",
                            "No bug — this is correct"
                        }),
                        CorrectAnswer = "while condition should be left <= right",
                        Explanation = "With left < right, the last remaining element (when left == right) is never checked. Use left <= right.",
                        Order = 2
                    },
                    new QuizQuestion
                    {
                        QuestionType = "PredictOutput",
                        Prompt = "How many iterations does binary search take on a sorted array of 8 elements?",
                        CodeSnippet = "// nums = {1, 3, 5, 7, 9, 11, 13, 15}, target = 13\n// Trace: left=0 right=7 → mid=3 (7) → too small\n//        left=4 right=7 → mid=5 (11) → too small\n//        left=6 right=7 → mid=6 (13) → found!",
                        OptionsJson = JsonSerializer.Serialize(new[] { "3", "4", "8", "2" }),
                        CorrectAnswer = "3",
                        Explanation = "Binary search halves the search space each step. 8 → 4 → 2 → 1, taking at most log₂(8) = 3 iterations.",
                        Order = 3
                    },
                    new QuizQuestion
                    {
                        QuestionType = "FillBlank",
                        Prompt = "Binary search on a sorted array. Fill in the correct update when target is smaller than mid.",
                        CodeSnippet = "if (nums[mid] > target)\n    right = ___;",
                        OptionsJson = JsonSerializer.Serialize(new[] { "mid - 1", "mid", "mid + 1", "left" }),
                        CorrectAnswer = "mid - 1",
                        Explanation = "If target < nums[mid], the answer is in the left half. Exclude mid by setting right = mid - 1.",
                        Order = 4
                    },
                    new QuizQuestion
                    {
                        QuestionType = "PredictOutput",
                        Prompt = "What is returned?",
                        CodeSnippet = "int[] nums = {2, 4, 6, 8, 10};\nint left = 0, right = 4, target = 7;\nwhile (left <= right)\n{\n    int mid = left + (right - left) / 2;\n    if (nums[mid] == target) return mid;\n    if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n}\nreturn -1;",
                        OptionsJson = JsonSerializer.Serialize(new[] { "-1", "3", "4", "2" }),
                        CorrectAnswer = "-1",
                        Explanation = "7 is not in the array {2,4,6,8,10}, so the search exhausts without finding it and returns -1.",
                        Order = 5
                    },
                ]
            ),

            // ──────────────────────────────────────────
            // Chapter 6: Tree
            // ──────────────────────────────────────────
            (
                new QuizChapter
                {
                    Title = "Tree",
                    Description = "Binary trees, BST, traversals, and recursive thinking",
                    Order = 6,
                    UnitTitle = "Unit 3 — Trees & Dynamic Programming"
                },
                [
                    new QuizQuestion
                    {
                        QuestionType = "FillBlank",
                        Prompt = "Fill in the blank to complete a basic binary tree node class.",
                        CodeSnippet = "public class TreeNode\n{\n    public int Val;\n    public TreeNode Left;\n    public TreeNode ___;\n}",
                        OptionsJson = JsonSerializer.Serialize(new[] { "Right", "Child", "Next", "Parent" }),
                        CorrectAnswer = "Right",
                        Explanation = "A binary tree node has at most two children: Left and Right.",
                        Order = 1
                    },
                    new QuizQuestion
                    {
                        QuestionType = "PredictOutput",
                        Prompt = "What order are values printed with this traversal?",
                        CodeSnippet = "//     4\n//    / \\\n//   2   6\n//  / \\ / \\\n// 1  3 5  7\n\nvoid InOrder(TreeNode node)\n{\n    if (node == null) return;\n    InOrder(node.Left);\n    Console.Write(node.Val + \" \");\n    InOrder(node.Right);\n}",
                        OptionsJson = JsonSerializer.Serialize(new[] { "1 2 3 4 5 6 7 ", "4 2 6 1 3 5 7 ", "1 3 2 5 7 6 4 ", "4 2 1 3 6 5 7 " }),
                        CorrectAnswer = "1 2 3 4 5 6 7 ",
                        Explanation = "In-order traversal (Left → Root → Right) on a BST always produces values in sorted ascending order.",
                        Order = 2
                    },
                    new QuizQuestion
                    {
                        QuestionType = "FindBug",
                        Prompt = "This code finds the max depth of a binary tree. Find the bug.",
                        CodeSnippet = "int MaxDepth(TreeNode node)\n{\n    if (node == null) return 0;\n    int left = MaxDepth(node.Left);\n    int right = MaxDepth(node.Right);\n    return Math.Min(left, right) + 1;\n}",
                        OptionsJson = JsonSerializer.Serialize(new[] {
                            "Math.Min should be Math.Max",
                            "The base case should return 1",
                            "left and right are swapped",
                            "No bug — this is correct"
                        }),
                        CorrectAnswer = "Math.Min should be Math.Max",
                        Explanation = "To find the maximum depth, we take the deeper subtree. Math.Min would give minimum depth instead.",
                        Order = 3
                    },
                    new QuizQuestion
                    {
                        QuestionType = "FillBlank",
                        Prompt = "Complete the base case for a recursive tree function.",
                        CodeSnippet = "int CountNodes(TreeNode node)\n{\n    if (node == ___) return 0;\n    return 1 + CountNodes(node.Left) + CountNodes(node.Right);\n}",
                        OptionsJson = JsonSerializer.Serialize(new[] { "null", "0", "false", "empty" }),
                        CorrectAnswer = "null",
                        Explanation = "In C#, an empty node is represented as null. Returning 0 when node is null correctly counts no nodes.",
                        Order = 4
                    },
                    new QuizQuestion
                    {
                        QuestionType = "PredictOutput",
                        Prompt = "Which traversal visits nodes in this order: Root → Left → Right?",
                        CodeSnippet = "// Options:\n// A) Pre-order\n// B) In-order\n// C) Post-order\n// D) Level-order",
                        OptionsJson = JsonSerializer.Serialize(new[] { "Pre-order", "In-order", "Post-order", "Level-order" }),
                        CorrectAnswer = "Pre-order",
                        Explanation = "Pre-order: Root first, then Left subtree, then Right subtree. In-order: Left → Root → Right. Post-order: Left → Right → Root.",
                        Order = 5
                    },
                ]
            ),

            // ──────────────────────────────────────────
            // Chapter 7: Dynamic Programming
            // ──────────────────────────────────────────
            (
                new QuizChapter
                {
                    Title = "Dynamic Programming",
                    Description = "Break problems into overlapping subproblems and cache results",
                    Order = 7,
                    UnitTitle = "Unit 3 — Trees & Dynamic Programming"
                },
                [
                    new QuizQuestion
                    {
                        QuestionType = "FillBlank",
                        Prompt = "Fill in the blank to complete the Fibonacci function with memoization.",
                        CodeSnippet = "var memo = new Dictionary<int, long>();\nlong Fib(int n)\n{\n    if (n <= 1) return n;\n    if (memo.ContainsKey(n)) return ___;\n    memo[n] = Fib(n-1) + Fib(n-2);\n    return memo[n];\n}",
                        OptionsJson = JsonSerializer.Serialize(new[] { "memo[n]", "n", "Fib(n-1)", "0" }),
                        CorrectAnswer = "memo[n]",
                        Explanation = "If the result is already cached, return it immediately to avoid recomputation.",
                        Order = 1
                    },
                    new QuizQuestion
                    {
                        QuestionType = "PredictOutput",
                        Prompt = "What is dp[4] after running this classic 1D DP (climbing stairs)?",
                        CodeSnippet = "int[] dp = new int[6];\ndp[0] = 1; dp[1] = 1;\nfor (int i = 2; i <= 5; i++)\n    dp[i] = dp[i-1] + dp[i-2];\n// dp = ?",
                        OptionsJson = JsonSerializer.Serialize(new[] { "5", "3", "8", "4" }),
                        CorrectAnswer = "5",
                        Explanation = "dp[0]=1, dp[1]=1, dp[2]=2, dp[3]=3, dp[4]=5. This is the Fibonacci sequence (climbing stairs problem).",
                        Order = 2
                    },
                    new QuizQuestion
                    {
                        QuestionType = "FindBug",
                        Prompt = "This coin change DP has a bug. Find it.",
                        CodeSnippet = "int[] dp = new int[amount + 1];\nArray.Fill(dp, int.MaxValue);\ndp[0] = 0;\nfor (int i = 1; i <= amount; i++)\n    foreach (int coin in coins)\n        if (coin <= i && dp[i - coin] != int.MaxValue)\n            dp[i] = Math.Min(dp[i], dp[i - coin]);\nreturn dp[amount];",
                        OptionsJson = JsonSerializer.Serialize(new[] {
                            "No bug — this is correct",
                            "dp[i - coin] should be dp[i - coin] + 1",
                            "Array.Fill should use 0 not int.MaxValue",
                            "The loop should start at i = 0"
                        }),
                        CorrectAnswer = "dp[i - coin] should be dp[i - coin] + 1",
                        Explanation = "Each coin used adds 1 to the count. Without the +1, dp[i] never increases from 0.",
                        Order = 3
                    },
                    new QuizQuestion
                    {
                        QuestionType = "FillBlank",
                        Prompt = "Complete the House Robber recurrence relation.",
                        CodeSnippet = "// dp[i] = max money robbing up to house i\nfor (int i = 2; i < n; i++)\n    dp[i] = Math.Max(___, dp[i-1]);",
                        OptionsJson = JsonSerializer.Serialize(new[] { "dp[i-2] + nums[i]", "dp[i-1] + nums[i]", "dp[i-2]", "nums[i]" }),
                        CorrectAnswer = "dp[i-2] + nums[i]",
                        Explanation = "At house i, you either rob it (dp[i-2] + nums[i]) or skip it (dp[i-1]). Choose the max.",
                        Order = 4
                    },
                    new QuizQuestion
                    {
                        QuestionType = "PredictOutput",
                        Prompt = "What key property makes a problem suitable for Dynamic Programming?",
                        CodeSnippet = "// Which of the following describes a DP-suitable problem?",
                        OptionsJson = JsonSerializer.Serialize(new[] {
                            "Overlapping subproblems + optimal substructure",
                            "All elements are sorted",
                            "The input is always a tree",
                            "No recursion is needed"
                        }),
                        CorrectAnswer = "Overlapping subproblems + optimal substructure",
                        Explanation = "DP works when subproblems overlap (same subproblem solved multiple times) and have optimal substructure (optimal solution built from optimal subproblem solutions).",
                        Order = 5
                    },
                ]
            ),
        ];
    }
}
