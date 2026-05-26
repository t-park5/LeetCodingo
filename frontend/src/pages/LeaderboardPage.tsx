export function LeaderboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground mb-1">Leaderboard</h1>
      <p className="text-muted-foreground mb-8">Global rankings (Easy=1pt, Medium=3pt, Hard=5pt)</p>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <p className="text-sm font-medium text-foreground">All Users</p>
        </div>
        <div className="p-6">
          <p className="text-sm text-muted-foreground">Leaderboard coming soon...</p>
        </div>
      </div>
    </div>
  );
}
