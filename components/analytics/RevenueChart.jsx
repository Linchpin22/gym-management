"use client";

import { BarChart3 } from "lucide-react";

function formatCompact(value) {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)}k`;

  return `${sign}₹${Math.round(abs)}`;
}

const fmt = (v) => {
  const n = Number(v || 0);
  return `${n < 0 ? "-" : ""}₹${Math.abs(n).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
};

function Stat({ label, value, tone }) {
  return (
    <div className="sm:text-right">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-lg font-bold ${tone}`}>{value}</p>
    </div>
  );
}

function LegendDot({ className, label, line }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
      {line ? (
        <span className={`inline-block w-4 h-0.5 ${className}`} />
      ) : (
        <span className={`inline-block w-2.5 h-2.5 rounded-sm ${className}`} />
      )}
      {label}
    </span>
  );
}

export default function RevenueChart({ data, range }) {
  const points = data.map((item) => ({
    ...item,
    net: item.income - item.expense,
  }));

  const totalIncome = points.reduce((s, p) => s + p.income, 0);
  const totalExpense = points.reduce((s, p) => s + p.expense, 0);
  const totalNet = totalIncome - totalExpense;

  const title =
    range === "month"
      ? "Daily Income vs Expenses"
      : range === "year"
        ? "Monthly Income vs Expenses"
        : "Yearly Income vs Expenses";

  const maxBar = Math.max(...points.flatMap((p) => [p.income, p.expense, p.net]), 1);
  const minVal = Math.min(0, ...points.map((p) => p.net));
  const span = maxBar - minVal;

  // Where the zero line sits, measured from the bottom of the chart (%).
  const zeroPct = (-minVal / span) * 100;
  const positivePct = (maxBar / span) * 100;

  const n = points.length;
  const netLine =
    n > 1
      ? points
          .map((p, i) => {
            const x = ((i + 0.5) / n) * 100;
            const y = 100 - ((p.net - minVal) / span) * 100;
            return `${x},${y}`;
          })
          .join(" ")
      : null;

  const isEmpty = totalIncome === 0 && totalExpense === 0;

  return (
    <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#EEF4E8] text-[#52772D] flex items-center justify-center">
              <BarChart3 size={18} />
            </div>
            <h2 className="font-bold text-[#17211A]">{title}</h2>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Money in, money out and what was left over
          </p>
        </div>

        <div className="flex gap-6 sm:gap-8">
          <Stat
            label="Income"
            value={fmt(totalIncome)}
            tone="text-[#56852E]"
          />
          <Stat
            label="Expenses"
            value={fmt(totalExpense)}
            tone="text-red-600"
          />
          <Stat
            label="Net"
            value={fmt(totalNet)}
            tone={totalNet >= 0 ? "text-[#17211A]" : "text-red-600"}
          />
        </div>
      </div>

      {isEmpty ? (
        <div className="h-64 flex flex-col items-center justify-center text-center">
          <BarChart3 size={30} className="text-gray-300 mb-3" />

          <p className="text-sm font-semibold text-gray-600">
            No income or expenses recorded
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Payments and expenses will appear here once recorded.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <LegendDot className="bg-[#8BC34A]" label="Income" />
            <LegendDot className="bg-red-400" label="Expenses" />
            <LegendDot className="bg-[#17211A]" label="Net" line />
          </div>

          <div className="overflow-x-auto pb-2">
            <div
              style={{
                minWidth: n > 15 ? `${n * 30}px` : "100%",
              }}
            >
              {/* Plot area */}
              <div className="relative h-56 flex gap-2 sm:gap-3">
                {minVal < 0 && (
                  <div
                    className="absolute left-0 right-0 border-t border-dashed border-gray-300 pointer-events-none"
                    style={{ bottom: `${zeroPct}%` }}
                  />
                )}

                {points.map((p, index) => (
                  <div
                    key={`${p.label}-${index}`}
                    className="relative flex-1 min-w-0 h-full group"
                    title={`${p.fullLabel || p.label}\nIncome: ${fmt(p.income)}\nExpenses: ${fmt(p.expense)}\nNet: ${fmt(p.net)}`}
                  >
                    <div
                      className="absolute inset-x-0 flex items-end justify-center gap-0.5"
                      style={{
                        bottom: `${zeroPct}%`,
                        height: `${positivePct}%`,
                      }}
                    >
                      <div
                        className="flex-1 max-w-5 rounded-t-sm bg-[#8BC34A] group-hover:bg-[#52772D] transition-colors"
                        style={{
                          height: `${p.income > 0 ? Math.max((p.income / maxBar) * 100, 2) : 0}%`,
                        }}
                      />
                      <div
                        className="flex-1 max-w-5 rounded-t-sm bg-red-400 group-hover:bg-red-600 transition-colors"
                        style={{
                          height: `${p.expense > 0 ? Math.max((p.expense / maxBar) * 100, 2) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}

                {netLine && (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <polyline
                      points={netLine}
                      fill="none"
                      stroke="#17211A"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                )}
              </div>

              {/* Labels */}
              <div className="flex gap-2 sm:gap-3 mt-2">
                {points.map((p, index) => (
                  <span
                    key={`label-${p.label}-${index}`}
                    className="flex-1 min-w-0 text-center text-[10px] sm:text-xs text-gray-400 truncate"
                  >
                    {p.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 mt-3" />

          <div className="flex justify-between mt-3 text-xs text-gray-400">
            <span>{minVal < 0 ? `${formatCompact(minVal)} lowest net` : "₹0"}</span>
            <span>{formatCompact(maxBar)} peak</span>
          </div>
        </div>
      )}
    </section>
  );
}