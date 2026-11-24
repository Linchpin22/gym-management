const fmt = (v) =>
  `₹${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function groupBy(expenses, keyFn) {
  const map = {};
  expenses.forEach((e) => {
    const key = (keyFn(e) || "Unspecified").trim() || "Unspecified";
    map[key] = (map[key] || 0) + Number(e.amount || 0);
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

function Bars({ title, rows, total, limit }) {
  const shown = limit ? rows.slice(0, limit) : rows;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">{title}</p>

      {shown.length === 0 ? (
        <p className="text-sm text-gray-400">No data</p>
      ) : (
        <div className="space-y-3">
          {shown.map(([name, amount]) => {
            const pct = total > 0 ? (amount / total) * 100 : 0;
            return (
              <div key={name}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-[#17211A] capitalize">{name}</span>
                  <span className="text-gray-500">
                    {fmt(amount)} · {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full mt-1.5">
                  <div className="h-2 rounded-full bg-red-400" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ExpenseBreakdown({ expenses }) {
  const total = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-6">
      <div>
        <h3 className="font-bold text-[#17211A]">Where the money went</h3>
        <p className="text-xs text-gray-400 mt-1">Outgoing expenses in selected period</p>
      </div>

      <Bars title="By category" rows={groupBy(expenses, (e) => e.category)} total={total} />
      <Bars title="To (top payees)" rows={groupBy(expenses, (e) => e.paid_to)} total={total} limit={5} />
      <Bars title="Paid via" rows={groupBy(expenses, (e) => e.mode)} total={total} />
    </div>
  );
}