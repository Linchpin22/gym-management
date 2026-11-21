
"use client";

import { ChartNoAxesCombined, CalendarDays } from "lucide-react";

const ranges = [
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
  { label: "Lifetime", value: "lifetime" },
];

const months = [
  { label: "January", value: "01" },
  { label: "February", value: "02" },
  { label: "March", value: "03" },
  { label: "April", value: "04" },
  { label: "May", value: "05" },
  { label: "June", value: "06" },
  { label: "July", value: "07" },
  { label: "August", value: "08" },
  { label: "September", value: "09" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

export default function AnalyticsHeader({
  range,
  setRange,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  availableYears,
}) {
  const selectClass =
    "w-full sm:w-auto bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#17211A] outline-none focus:border-[#8BC34A]";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#EEF4E8] text-[#52772D] flex items-center justify-center shrink-0">
            <ChartNoAxesCombined size={22} />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#17211A]">
              Revenue Analytics
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Understand your gym's financial performance.
            </p>
          </div>
        </div>

        <div className="flex bg-[#F1F4F1] p-1 rounded-xl w-full sm:w-auto">
          {ranges.map((item) => (
            <button
              key={item.value}
              onClick={() => setRange(item.value)}
              className={`flex-1 sm:flex-none px-4 cursor-pointer py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                range === item.value
                  ? "bg-white text-[#17211A] shadow-sm"
                  : "text-gray-500 hover:text-[#17211A]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {range !== "lifetime" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-100 rounded-xl p-3 sm:px-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#17211A]">
            <CalendarDays size={17} className="text-[#52772D]" />
            <span>
              {range === "month" ? "Select month" : "Select year"}
            </span>
          </div>

          <div className="flex gap-2">
            {range === "month" && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className={selectClass}
                aria-label="Select month"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            )}

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className={selectClass}
              aria-label="Select year"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
