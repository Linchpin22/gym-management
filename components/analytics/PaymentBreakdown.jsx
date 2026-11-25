"use client";

import { Wallet } from "lucide-react";

const paymentModes = [
  { key: "cash", label: "Cash", color: "bg-[#8BC34A]" },
  { key: "upi", label: "UPI", color: "bg-blue-500" },
  { key: "card", label: "Card", color: "bg-purple-500" },
  { key: "other", label: "Other", color: "bg-orange-400" },
];

const KNOWN = ["cash", "upi", "card"];

// Anything that isn't cash / upi / card (e.g. "Bank Transfer") counts as "other".
function normalizeMode(mode) {
  const key = (mode || "").toLowerCase().trim();
  return KNOWN.includes(key) ? key : "other";
}

const sum = (rows) => rows.reduce((s, r) => s + Number(r.amount || 0), 0);

const fmt = (v) => {
  const n = Number(v || 0);
  return `${n < 0 ? "-" : ""}₹${Math.abs(n).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
};

function HoldingTile({ label, value, detail }) {
  return (
    <div className="rounded-xl bg-[#F8FAF7] p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`text-xl font-bold mt-1.5 ${
          value < 0 ? "text-red-600" : "text-[#17211A]"
        }`}
      >
        {fmt(value)}
      </p>
      <p className="text-[11px] text-gray-400 mt-1">{detail}</p>
    </div>
  );
}

export default function PaymentBreakdown({
  payments,
  expenses = [],
  periodLabel,
}) {
  const total = sum(payments);

  const breakdown = paymentModes.map((mode) => {
    const matching = payments.filter((p) => normalizeMode(p.mode) === mode.key);
    const amount = sum(matching);

    return {
      ...mode,
      amount,
      count: matching.length,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    };
  });

  const visible = breakdown.filter((item) => item.count > 0);

  const cashIn = sum(
    payments.filter((p) => normalizeMode(p.mode) === "cash"),
  );
  const cashOut = sum(
    expenses.filter((e) => (e.mode || "").toLowerCase().trim() === "cash"),
  );
  const digitalIn = total - cashIn;
  const digitalOut = sum(expenses) - cashOut;

  return (
    <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
          <Wallet size={18} />
        </div>
        <h2 className="font-bold text-[#17211A]">Cash &amp; Payment Methods</h2>
      </div>

      <p className="text-xs text-gray-400 mt-2">
        Collections by payment method · {periodLabel}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
        <HoldingTile
          label="Cash in hand"
          value={cashIn - cashOut}
          detail={`${fmt(cashIn)} collected − ${fmt(cashOut)} spent in cash`}
        />
        <HoldingTile
          label="In bank / digital"
          value={digitalIn - digitalOut}
          detail={`${fmt(digitalIn)} received − ${fmt(digitalOut)} spent digitally`}
        />
      </div>

      <p className="text-[11px] text-gray-400 mt-2">
        Covers this period only. Opening balance is not included.
      </p>

      {total === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-gray-400">
            No payments recorded in this period.
          </p>
        </div>
      ) : (
        <>
          <div className="flex h-3 overflow-hidden rounded-full mt-6 bg-gray-100">
            {visible.map((item) => (
              <div
                key={item.key}
                className={`${item.color} transition-all`}
                style={{ width: `${item.percentage}%` }}
                title={`${item.label}: ${item.percentage.toFixed(1)}%`}
              />
            ))}
          </div>

          <div className="space-y-5 mt-6">
            {visible.map((item) => (
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
                      {fmt(item.amount)}
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