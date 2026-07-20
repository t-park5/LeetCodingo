/**
 * GitHub-style contribution heatmap showing LeetCode solve activity.
 * Displays the last 52 weeks (364 days) as a grid of colored cells.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CELL = 14; // px per cell
const GAP = 3;   // px gap between cells

function getCellColor(count: number): string {
  if (count === 0) return "bg-gray-100 dark:bg-gray-800";
  if (count === 1) return "bg-green-200";
  if (count === 2) return "bg-green-400";
  if (count >= 3) return "bg-green-600";
  return "bg-gray-100";
}

interface Props {
  activity: Record<string, number>; // "yyyy-MM-dd" -> count
}

export function ActivityCalendar({ activity }: Props) {
  // Build an array of the last 364 days, arranged into weeks (columns of 7 days)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the Sunday that starts the 52-week window
  const startDay = new Date(today);
  startDay.setDate(today.getDate() - 363 - today.getDay());

  const weeks: Date[][] = [];
  const cursor = new Date(startDay);

  while (cursor <= today) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    if (cursor > today) break;
  }

  // Month label positions: when a week starts in a new month, record its column index
  const monthLabels: { month: number; col: number }[] = [];
  weeks.forEach((week, col) => {
    const firstOfWeek = week[0];
    if (firstOfWeek.getDate() <= 7) {
      // First week of the month — but only add if we haven't added this month already
      const m = firstOfWeek.getMonth();
      if (!monthLabels.find((x) => x.month === m)) {
        monthLabels.push({ month: m, col });
      }
    }
  });

  const totalSolved = Object.values(activity).reduce((sum, c) => sum + c, 0);
  const activeDays = Object.values(activity).filter((c) => c > 0).length;

  return (
    <div className="w-full">
      {/* Summary line */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-foreground">
          {totalSolved} submissions across {activeDays} active days
        </p>
        {/* Legend */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Less</span>
          {[0, 1, 2, 3].map((level) => (
            <div
              key={level}
              className={`rounded-sm ${getCellColor(level)}`}
              style={{ width: CELL, height: CELL }}
            />
          ))}
          <span className="text-xs text-muted-foreground">More</span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

          {/* Month labels row */}
          <div style={{ display: "flex", marginLeft: 28, marginBottom: 4 }}>
            {weeks.map((week, col) => {
              const label = monthLabels.find((m) => m.col === col);
              return (
                <div
                  key={col}
                  style={{ width: CELL + GAP, flexShrink: 0, fontSize: 10, color: "#9ca3af" }}
                >
                  {label ? MONTHS[label.month] : ""}
                </div>
              );
            })}
          </div>

          {/* Grid: day-of-week labels + week columns */}
          <div style={{ display: "flex", gap: 0 }}>
            {/* Day labels */}
            <div style={{ display: "flex", flexDirection: "column", gap: GAP, marginRight: 4 }}>
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <div
                  key={d}
                  style={{
                    width: 22,
                    height: CELL,
                    fontSize: 9,
                    color: "#9ca3af",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  {d % 2 === 1 ? DAYS[d] : ""}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, col) => (
              <div
                key={col}
                style={{ display: "flex", flexDirection: "column", gap: GAP, marginRight: GAP }}
              >
                {week.map((day) => {
                  const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
                  const count = activity[key] ?? 0;
                  const isFuture = day > today;
                  const isToday =
                    day.getFullYear() === today.getFullYear() &&
                    day.getMonth() === today.getMonth() &&
                    day.getDate() === today.getDate();

                  return (
                    <div
                      key={key}
                      title={`${key}: ${count} submission${count !== 1 ? "s" : ""}`}
                      className={`rounded-sm transition-colors ${
                        isFuture
                          ? "bg-transparent"
                          : getCellColor(count)
                      } ${isToday ? "ring-1 ring-[#ff6b00] ring-offset-1" : ""}`}
                      style={{ width: CELL, height: CELL, flexShrink: 0 }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
