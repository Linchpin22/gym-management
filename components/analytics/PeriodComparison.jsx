"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, GitCompareArrows } from "lucide-react";

function sumPeriod(payments, start, end) {
  if (!start || !end || start > end) return 0;

  return payments.reduce((total, payment) => {
    const date = payment.paid_on;

    if (date >= start && date <= end) {
      return total + Number(payment.amount || 0);
    }

    return total;
  }, 0);
}

function formatCurrency(value) {
  return `₹${Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function PeriodInput({ label, start, end, setStart, setEnd }) {
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
            value={start}
            max={end || undefined}
            onChange={(e) => setStart(e.target.value)}
            className="w-full min-w-0 bg-white border border-gray-200 rounded-lg px-2 py-2.5 text-xs text-gray-700 outline-none focus:border-[#8BC34A]"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">End date</label>
          <input
            type="date"
            value={end}
            min={start || undefined}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full min-w-0 bg-white border border-gray-200 rounded-lg px-2 py-2.5 text-xs text-gray-700 outline-none focus:border-[#8BC34A]"
          />
        </div>
      </div>
    </div>
  );
}

export default function PeriodComparison({ payments }) {
  const [today, setToday] = useState(null);
  const [startA, setStartA] = useState("");
  const [endA, setEndA] = useState("");
  const [startB, setStartB] = useState("");
  const [endB, setEndB] = useState("");

  useEffect(() => {
    const currentDate = new Date();
    const currentMonthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const previousMonthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );
    const previousMonthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0,
    );
    const toISO = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setToday(currentDate);
    setStartA(toISO(previousMonthStart));
    setEndA(toISO(previousMonthEnd));
    setStartB(toISO(currentMonthStart));
    setEndB(toISO(currentDate));
  }, []);

  const amountA = useMemo(
    () => sumPeriod(payments, startA, endA),
    [payments, startA, endA],
  );

  const amountB = useMemo(
    () => sumPeriod(payments, startB, endB),
    [payments, startB, endB],
  );

  const difference = amountB - amountA;
  const percentage = amountA > 0 ? (difference / amountA) * 100 : null;

  const valid =
    startA && endA && startB && endB && startA <= endA && startB <= endB;

  if (!today) {
    return <div>Loading...</div>;
  }

  return (
    <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
          <GitCompareArrows size={18} />
        </div>
        <h2 className="font-bold text-[#17211A]">Compare Periods</h2>
      </div>

      <p className="text-xs text-gray-400 mb-5">
        Compare collections across any two date ranges.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <PeriodInput
          label="Period A"
          start={startA}
          end={endA}
          setStart={setStartA}
          setEnd={setEndA}
        />

        <PeriodInput
          label="Period B"
          start={startB}
          end={endB}
          setStart={setStartB}
          setEnd={setEndB}
        />
      </div>

      {!valid ? (
        <p className="text-sm text-red-600 mt-4">
          Please select valid start and end dates for both periods.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="border border-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-400">Period A collection</p>
              <p className="text-xl font-bold text-[#17211A] mt-2">
                {formatCurrency(amountA)}
              </p>
            </div>

            <div className="border border-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-400">Period B collection</p>
              <p className="text-xl font-bold text-[#17211A] mt-2">
                {formatCurrency(amountB)}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-[#F7F9F7] p-4">
            <p className="text-xs text-gray-500">Revenue difference</p>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <p
                className={`text-2xl font-bold ${
                  difference >= 0 ? "text-[#56852E]" : "text-red-600"
                }`}
              >
                {difference > 0 ? "+" : difference < 0 ? "-" : ""}
                {formatCurrency(Math.abs(difference))}
              </p>

              {percentage !== null && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    difference >= 0
                      ? "bg-[#EEF6E7] text-[#56852E]"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {difference >= 0 ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                  {Math.abs(percentage).toFixed(1)}%
                </span>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-2">
              {amountA === 0
                ? "Percentage change is unavailable because Period A has no collection."
                : difference > 0
                  ? "Collections increased in Period B."
                  : difference < 0
                    ? "Collections decreased in Period B."
                    : "Collections remained the same."}
            </p>
          </div>
        </>
      )}
    </section>
  );
}
