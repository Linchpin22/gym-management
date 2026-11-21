
"use client";

import { BarChart3 } from "lucide-react";

function formatCompact(value) {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }

  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}k`;
  }

  return `₹${Math.round(value)}`;
}

export default function RevenueChart({ data, range }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const title =
    range === "month"
      ? "Daily Revenue"
      : range === "year"
        ? "Monthly Revenue"
        : "Yearly Revenue";

  return (
    <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#EEF4E8] text-[#52772D] flex items-center justify-center">
              <BarChart3 size={18} />
            </div>

            <h2 className="font-bold text-[#17211A]">{title}</h2>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Revenue collected during the selected period
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-xs text-gray-400">Total collection</p>
          <p className="text-xl font-bold text-[#17211A]">
            ₹{total.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
      </div>

      {total === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center">
          <BarChart3 size={30} className="text-gray-300 mb-3" />

          <p className="text-sm font-semibold text-gray-600">
            No revenue data available
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Payments will appear here once recorded.
          </p>
        </div>
      ) : (
        <div className="mt-8">
          <div className="overflow-x-auto pb-2">
            <div
              className="flex items-end gap-2 sm:gap-3 h-56"
              style={{
                minWidth: data.length > 15
                  ? `${data.length * 28}px`
                  : "100%",
              }}
            >
              {data.map((item, index) => {
                const height =
                  item.value > 0
                    ? Math.max((item.value / maxValue) * 100, 3)
                    : 0;

                return (
                  <div
                    key={`${item.label}-${index}`}
                    className="flex-1 min-w-0 h-full flex flex-col justify-end items-center gap-2 group"
                    title={`${item.label}: ₹${item.value.toLocaleString("en-IN")}`}
                  >
                    <div className="w-full h-full flex items-end justify-center">
                      <div
                        className="w-full max-w-12 rounded-t-md bg-[#8BC34A] group-hover:bg-[#52772D] transition-colors"
                        style={{ height: `${height}%` }}
                      />
                    </div>

                    <span className="text-[10px] sm:text-xs text-gray-400 truncate max-w-full">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 mt-3" />

          <div className="flex justify-between mt-3 text-xs text-gray-400">
            <span>₹0</span>
            <span>{formatCompact(maxValue)} peak</span>
          </div>
        </div>
      )}
    </section>
  );
}
