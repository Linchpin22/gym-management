
"use client";

import {
  IndianRupee,
  CalendarDays,
  TrendingUp,
  Wallet,
} from "lucide-react";

const cards = [
  {
    key: "today",
    label: "Today's Collection",
    icon: CalendarDays,
    color: "bg-blue-50 text-blue-600",
  },
  {
    key: "month",
    label: "This Month",
    icon: IndianRupee,
    color: "bg-[#EEF4E8] text-[#52772D]",
  },
  {
    key: "year",
    label: "This Year",
    icon: TrendingUp,
    color: "bg-purple-50 text-purple-600",
  },
  {
    key: "lifetime",
    label: "Lifetime Collection",
    icon: Wallet,
    color: "bg-orange-50 text-orange-600",
  },
];

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

export default function RevenueStats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.key}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                {card.label}
              </p>

              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}
              >
                <Icon size={19} />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-[#17211A] mt-4 tracking-tight">
              {formatCurrency(stats[card.key])}
            </h3>

            <p className="text-xs text-gray-400 mt-2">
              Based on recorded payments
            </p>
          </div>
        );
      })}
    </div>
  );
}
