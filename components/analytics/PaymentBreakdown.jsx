
"use client";

import { Wallet } from "lucide-react";

const paymentModes = [
  { key: "cash", label: "Cash", color: "bg-[#8BC34A]" },
  { key: "upi", label: "UPI", color: "bg-blue-500" },
  { key: "card", label: "Card", color: "bg-purple-500" },
  { key: "other", label: "Other", color: "bg-orange-400" },
];

export default function PaymentBreakdown({ payments }) {
  const total = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  );

  const breakdown = paymentModes.map((mode) => {
    const matching = payments.filter(
      (payment) => (payment.mode || "other").toLowerCase() === mode.key,
    );

    const amount = matching.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0,
    );

    return {
      ...mode,
      amount,
      count: matching.length,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    };
  });

  return (
    <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
          <Wallet size={18} />
        </div>
        <h2 className="font-bold text-[#17211A]">Payment Breakdown</h2>
      </div>

      <p className="text-xs text-gray-400 mt-2">
        Collections by payment method · All recorded payments
      </p>

      {total === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-400">No payment data available.</p>
        </div>
      ) : (
        <>
          <div className="flex h-3 overflow-hidden rounded-full mt-6 bg-gray-100">
            {breakdown.map((item) =>
              item.amount > 0 ? (
                <div
                  key={item.key}
                  className={`${item.color} transition-all`}
                  style={{ width: `${item.percentage}%` }}
                  title={`${item.label}: ${item.percentage.toFixed(1)}%`}
                />
              ) : null,
            )}
          </div>

          <div className="space-y-5 mt-6">
            {breakdown.map((item) => (
              <div key={item.key}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${item.color}`}
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      {item.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({item.count})
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-[#17211A]">
                      ₹{item.amount.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
