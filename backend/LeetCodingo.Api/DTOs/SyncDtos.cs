namespace LeetCodingo.Api.DTOs;

public class TagResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class TagStatResponse
{
    public string TagName { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class SyncResultResponse
{
    public int NewProblemsAdded { get; set; }
    public int SubmissionsSynced { get; set; }
    public string Message { get; set; } = string.Empty;
}
