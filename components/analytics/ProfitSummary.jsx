import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

const fmt = (v) => {
  const n = Number(v || 0);
  return `${n < 0 ? "-" : ""}₹${Math.abs(n).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
};

function Delta({ current, previous, goodWhenUp, label, dark }) {
  if (previous === null || previous === undefined) return null;

  const diff = current - previous;

  if (diff === 0 && current === 0) return null;

  const muted = dark ? "text-white/60" : "text-gray-400";

  if (diff === 0) {
    return <p className={`text-xs mt-3 ${muted}`}>Unchanged {label}</p>;
  }

  const up = diff > 0;
  const good = up === goodWhenUp;
  const pct =
    previous !== 0 ? (Math.abs(diff) / Math.abs(previous)) * 100 : null;
  const Icon = up ? TrendingUp : TrendingDown;

  const badge = dark
    ? "bg-white/15 text-white"
    : good
      ? "bg-[#EEF6E7] text-[#56852E]"
      : "bg-red-50 text-red-600";

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${badge}`}
      >
        <Icon size={13} />
        {fmt(Math.abs(diff))}
        {pct !== null ? ` (${pct.toFixed(0)}%)` : ""}
      </span>
      <span className={`text-xs ${muted}`}>{label}</span>
    </div>
  );
}

export default function ProfitSummary({
  income,
  expense,
  prevIncome = null,
  prevExpense = null,
  label,
  comparisonLabel,
}) {
  const net = income - expense;
  const positive = net >= 0;
  const hasPrev = prevIncome !== null && prevExpense !== null;
  const prevNet = hasPrev ? prevIncome - prevExpense : null;

  const margin = income > 0 ? (net / income) * 100 : null;

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#17211A]">Profit Summary</h2>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#EEF4E8] text-[#52772D]">
              <ArrowDownLeft size={19} />
            </div>
            <p className="text-sm font-medium text-gray-500">Income</p>
          </div>
          <h3 className="text-2xl font-bold text-[#17211A] mt-4">
            {fmt(income)}
          </h3>
          <Delta
            current={income}
            previous={hasPrev ? prevIncome : null}
            goodWhenUp
            label={comparisonLabel}
          />
        </div>

        {/* Expenses */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 text-red-600">
              <ArrowUpRight size={19} />
            </div>
            <p className="text-sm font-medium text-gray-500">Expenses</p>
          </div>
          <h3 className="text-2xl font-bold text-[#17211A] mt-4">
            {fmt(expense)}
          </h3>
          <Delta
            current={expense}
            previous={hasPrev ? prevExpense : null}
            goodWhenUp={false}
            label={comparisonLabel}
          />
        </div>

        {/* Net profit */}
        <div
          className={`rounded-2xl p-5 shadow-sm text-white ${
            positive ? "bg-[#17211A]" : "bg-red-600"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/15 text-white">
              <Wallet size={19} />
            </div>
            <p className="text-sm font-medium text-white/70">
              {positive ? "Net Profit" : "Net Loss"}
            </p>
          </div>
          <h3 className="text-3xl font-bold mt-4">{fmt(net)}</h3>
          <p className="text-xs text-white/70 mt-1">
            {margin !== null
              ? `Profit margin ${margin.toFixed(1)}% of income`
              : expense > 0
                ? "No income recorded in this period"
                : "Nothing recorded in this period"}
          </p>
          <Delta
            current={net}
            previous={prevNet}
            goodWhenUp
            label={comparisonLabel}
            dark
          />
        </div>
      </div>
    </section>
  );
}