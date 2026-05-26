namespace LeetCodingo.Api.DTOs;

public class LeaderboardEntryResponse
{
    public int Rank { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int TotalSolved { get; set; }
    public int EasySolved { get; set; }
    public int MediumSolved { get; set; }
    public int HardSolved { get; set; }
    public int Score { get; set; }
}
