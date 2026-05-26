export function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground mb-1">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Welcome to LeetCodingo</p>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Total Solved</p>
          <p className="text-3xl font-bold text-foreground mt-1">—</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">This Week</p>
          <p className="text-3xl font-bold text-foreground mt-1">—</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Total Score</p>
          <p className="text-3xl font-bold text-[#ff6b00] mt-1">—</p>
        </div>
      </div>
    </div>
  );
}
