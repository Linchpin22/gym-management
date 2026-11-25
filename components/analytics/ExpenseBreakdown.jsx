import { ReceiptText } from "lucide-react";

const fmt = (v) =>
  `₹${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function groupByCategory(expenses) {
  const map = {};

  expenses.forEach((e) => {
    const key = (e.category || "").trim() || "Uncategorised";

    if (!map[key]) map[key] = { name: key, amount: 0, count: 0 };

    map[key].amount += Number(e.amount || 0);
    map[key].count += 1;
  });

  return Object.values(map).sort((a, b) => b.amount - a.amount);
}

export default function ExpenseBreakdown({ expenses, periodLabel }) {
  const total = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const rows = groupByCategory(expenses);
  const top = rows[0];

  return (
    <section className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <ReceiptText size={18} />
          </div>
          <div>
            <h3 className="font-bold text-[#17211A]">Where the money went</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Expenses by category · {periodLabel}
            </p>
          </div>
        </div>

        {total > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-lg font-bold text-red-600">{fmt(total)}</p>
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm font-semibold text-gray-600">
            No expenses recorded
          </p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
            Add rent, salaries and bills below to see your real profit.
          </p>
        </div>
      ) : (
        <>
          {rows.length > 1 && top && (
            <p className="text-xs text-gray-500 mt-5">
              Biggest cost:{" "}
              <span className="font-semibold text-[#17211A]">{top.name}</span>{" "}
              ({total > 0 ? ((top.amount / total) * 100).toFixed(0) : 0}% of
              spending)
            </p>
          )}

          <div className="space-y-4 mt-5">
            {rows.map((row) => {
              const pct = total > 0 ? (row.amount / total) * 100 : 0;

              return (
                <div key={row.name}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="font-medium text-[#17211A] truncate">
                      {row.name}
                      <span className="text-xs text-gray-400 font-normal ml-1.5">
                        ({row.count})
                      </span>
                    </span>
                    <span className="text-gray-500 whitespace-nowrap">
                      {fmt(row.amount)} · {pct.toFixed(0)}%
                    </span>
                  </div>

                  <div className="h-2 bg-gray-100 rounded-full mt-1.5">
                    <div
                      className="h-2 rounded-full bg-red-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}