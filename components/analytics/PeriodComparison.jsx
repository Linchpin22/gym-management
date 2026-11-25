"use client";

import { useMemo, useState } from "react";
import { GitCompareArrows, TrendingDown, TrendingUp } from "lucide-react";

const pad = (n) => String(n).padStart(2, "0");

const toISO = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const daysIn = (year, month) => new Date(year, month, 0).getDate();

// A date in (year, month) with the day clamped to the month's length.
const clamped = (year, month, day) =>
  new Date(year, month - 1, Math.min(day, daysIn(year, month)));

function buildPresets(today) {
  const y = Number(today.slice(0, 4));
  const m = Number(today.slice(5, 7));
  const d = Number(today.slice(8, 10));

  const prev = new Date(y, m - 2, 1);
  const prevYear = prev.getFullYear();
  const prevMonth = prev.getMonth() + 1;

  const beforePrev = new Date(y, m - 3, 1);
  const bpYear = beforePrev.getFullYear();
  const bpMonth = beforePrev.getMonth() + 1;

  return [
    {
      id: "mtd",
      label: "This vs last month",
      a: {
        start: toISO(new Date(prevYear, prevMonth - 1, 1)),
        end: toISO(clamped(prevYear, prevMonth, d)),
      },
      b: { start: toISO(new Date(y, m - 1, 1)), end: today },
    },
    {
      id: "months",
      label: "Last month vs the one before",
      a: {
        start: toISO(new Date(bpYear, bpMonth - 1, 1)),
        end: toISO(new Date(bpYear, bpMonth, 0)),
      },
      b: {
        start: toISO(new Date(prevYear, prevMonth - 1, 1)),
        end: toISO(new Date(prevYear, prevMonth, 0)),
      },
    },
    {
      id: "ytd",
      label: "This vs last year",
      a: { start: `${y - 1}-01-01`, end: toISO(clamped(y - 1, m, d)) },
      b: { start: `${y}-01-01`, end: today },
    },
  ];
}

function sumPeriod(rows, start, end) {
  if (!start || !end || start > end) return 0;

  return rows.reduce((total, row) => {
    const date = row.paid_on;

    if (date >= start && date <= end) {
      return total + Number(row.amount || 0);
    }

    return total;
  }, 0);
}

const fmt = (v) => {
  const n = Number(v || 0);
  return `${n < 0 ? "-" : ""}₹${Math.abs(n).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
};

function PeriodInput({ label, value, onChange }) {
  return (
    <div className="bg-[#F8FAF7] rounded-xl p-4 space-y-3">
      <p className="text-sm font-bold text-[#17211A]">{label}</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">
            Start date
          </label>
          <input
            type="date"
            value={value.start}
            max={value.end || undefined}
            onChange={(e) => onChange({ ...value, start: e.target.value })}
            className="w-full min-w-0 bg-white border border-gray-200 rounded-lg px-2 py-2.5 text-xs text-gray-700 outline-none focus:border-[#8BC34A]"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">End date</label>
          <input
            type="date"
            value={value.end}
            min={value.start || undefined}
            onChange={(e) => onChange({ ...value, end: e.target.value })}
            className="w-full min-w-0 bg-white border border-gray-200 rounded-lg px-2 py-2.5 text-xs text-gray-700 outline-none focus:border-[#8BC34A]"
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, a, b, goodWhenUp }) {
  const diff = b - a;
  const pct = a !== 0 ? (Math.abs(diff) / Math.abs(a)) * 100 : null;
  const up = diff > 0;
  const good = up === goodWhenUp;
  const Icon = up ? TrendingUp : TrendingDown;

  const badge =
    diff === 0
      ? "bg-gray-100 text-gray-500"
      : good
        ? "bg-[#EEF6E7] text-[#56852E]"
        : "bg-red-50 text-red-600";

  return (
    <div className="border border-gray-100 rounded-xl p-4">
      <p className="text-sm font-semibold text-[#17211A]">{label}</p>

      <div className="mt-3 space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Period A</span>
          <span className="font-semibold text-[#17211A]">{fmt(a)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Period B</span>
          <span className="font-semibold text-[#17211A]">{fmt(b)}</span>
        </div>
      </div>

      <div className="border-t border-gray-100 mt-3 pt-3">
        {diff === 0 ? (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badge}`}
          >
            No change
          </span>
        ) : (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${badge}`}
          >
            <Icon size={13} />
            {up ? "+" : "-"}
            {fmt(Math.abs(diff))}
            {pct !== null ? ` (${pct.toFixed(1)}%)` : ""}
          </span>
        )}
      </div>
    </div>
  );
}

export default function PeriodComparison({ payments, expenses = [], today }) {
  const presets = useMemo(() => buildPresets(today), [today]);

  const [active, setActive] = useState(presets[0].id);
  const [periodA, setPeriodA] = useState(presets[0].a);
  const [periodB, setPeriodB] = useState(presets[0].b);

  const applyPreset = (preset) => {
    setActive(preset.id);
    setPeriodA(preset.a);
    setPeriodB(preset.b);
  };

  const editA = (value) => {
    setActive("custom");
    setPeriodA(value);
  };

  const editB = (value) => {
    setActive("custom");
    setPeriodB(value);
  };

  const valid =
    periodA.start &&
    periodA.end &&
    periodB.start &&
    periodB.end &&
    periodA.start <= periodA.end &&
    periodB.start <= periodB.end;

  const totals = useMemo(() => {
    const incomeA = sumPeriod(payments, periodA.start, periodA.end);
    const incomeB = sumPeriod(payments, periodB.start, periodB.end);
    const expenseA = sumPeriod(expenses, periodA.start, periodA.end);
    const expenseB = sumPeriod(expenses, periodB.start, periodB.end);

    return {
      incomeA,
      incomeB,
      expenseA,
      expenseB,
      netA: incomeA - expenseA,
      netB: incomeB - expenseB,
    };
  }, [payments, expenses, periodA, periodB]);

  const netDiff = totals.netB - totals.netA;

  return (
    <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
          <GitCompareArrows size={18} />
        </div>
        <h2 className="font-bold text-[#17211A]">Compare Periods</h2>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        Compare income, expenses and profit across any two date ranges.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyPreset(preset)}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold border transition ${
              active === preset.id
                ? "bg-[#17211A] text-white border-[#17211A]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#52772D] hover:text-[#52772D]"
            }`}
          >
            {preset.label}
          </button>
        ))}

        {active === "custom" && (
          <span className="rounded-full px-3.5 py-1.5 text-xs font-semibold bg-[#EEF4E8] text-[#52772D]">
            Custom range
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PeriodInput label="Period A" value={periodA} onChange={editA} />
        <PeriodInput label="Period B" value={periodB} onChange={editB} />
      </div>

      {!valid ? (
        <p className="text-sm text-red-600 mt-4">
          Please select valid start and end dates for both periods.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <MetricCard
              label="Income"
              a={totals.incomeA}
              b={totals.incomeB}
              goodWhenUp
            />
            <MetricCard
              label="Expenses"
              a={totals.expenseA}
              b={totals.expenseB}
              goodWhenUp={false}
            />
            <MetricCard
              label="Net profit"
              a={totals.netA}
              b={totals.netB}
              goodWhenUp
            />
          </div>

          <p className="text-xs text-gray-500 mt-4">
            {netDiff === 0
              ? "Net profit is the same in both periods."
              : netDiff > 0
                ? `Period B made ${fmt(netDiff)} more profit than Period A.`
                : `Period B made ${fmt(Math.abs(netDiff))} less profit than Period A.`}
          </p>
        </>
      )}
    </section>
  );
}