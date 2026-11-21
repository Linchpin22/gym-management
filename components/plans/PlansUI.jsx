import { CalendarDays, Users } from "lucide-react";

export const formatPrice = (price) =>
  Number(price || 0).toLocaleString("en-IN");

export function StatCard({ icon: Icon, label, value, description, accent }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#E7ECE8] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className={`absolute right-0 top-0 h-24 w-24 rounded-bl-full opacity-60 ${accent}`} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#829087]">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#17211A]">
            {value}
          </p>
          <p className="mt-1.5 text-xs text-[#829087]">{description}</p>
        </div>

        <div className="rounded-xl bg-[#F0F5EC] p-3 text-[#668D43] transition group-hover:scale-110">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2.5 text-[#829087]">
        <Icon size={17} className="shrink-0" />
        <span>{label}</span>
      </div>
      <span className="font-semibold text-[#26352A]">{value}</span>
    </div>
  );
}

export function ErrorMessage({ children }) {
  if (!children) return null;

  return (
    <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <span className="mt-0.5 shrink-0">!</span>
      {children}
    </div>
  );
}