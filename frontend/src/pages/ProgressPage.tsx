export function ProgressPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground mb-1">My Progress</h1>
      <p className="text-muted-foreground mb-8">Your personal stats</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Easy</p>
          <p className="text-3xl font-bold text-green-500 mt-1">—</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Medium</p>
          <p className="text-3xl font-bold text-yellow-500 mt-1">—</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Hard</p>
          <p className="text-3xl font-bold text-red-500 mt-1">—</p>
        </div>
      </div>
    </div>
  );
}
