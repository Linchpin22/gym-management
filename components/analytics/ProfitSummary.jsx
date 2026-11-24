import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";

const fmt = (v) =>
  `₹${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function ProfitSummary({ income, expense, label }) {
  const net = income - expense;
  const positive = net >= 0;

  const cards = [
    { title: "Total Incoming", value: fmt(income), icon: ArrowDownLeft, tone: "bg-[#EEF4E8] text-[#52772D]" },
    { title: "Total Outgoing", value: fmt(expense), icon: ArrowUpRight, tone: "bg-red-50 text-red-600" },
    {
      title: "Final Earning",
      value: `${positive ? "" : "-"}${fmt(Math.abs(net))}`,
      icon: Wallet,
      tone: positive ? "bg-[#17211A] text-white" : "bg-red-600 text-white",
    },
  ];

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#17211A]">Profit Summary</h2>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ title, value, icon: Icon, tone }) => (
          <div key={title} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone}`}>
                <Icon size={19} />
              </div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
            </div>
            <h3 className="text-2xl font-bold text-[#17211A] mt-4">{value}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}