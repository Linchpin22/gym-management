import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Dumbbell,
  Plus,
  Sparkles,
} from "lucide-react";

export default function WelcomeBanner({ gymName }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#17211A] via-[#203326] to-[#304B32] p-6 sm:p-8 lg:p-10 text-white shadow-lg shadow-[#17211A]/10">
      <div className="absolute -right-16 -top-24 w-72 h-72 rounded-full border-[35px] border-white/[0.04]" />
      <div className="absolute right-12 -bottom-32 w-72 h-72 rounded-full border-[35px] border-[#8BC34A]/10" />

      <div className="absolute right-10 top-8 text-[#A4D66B]/20 hidden sm:block">
        <Dumbbell size={115} strokeWidth={1} />
      </div>

      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-1.5 text-xs text-[#C8E6A0] font-medium mb-5">
          <Sparkles size={14} />
          Your fitness business at a glance
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
          Welcome,  {gymName || ""}!
          <span className="text-[#A4D66B]"> 👋</span>
        </h1>

        <p className="text-sm sm:text-base text-white/65 mt-3 max-w-lg leading-relaxed">
          Here's what's happening at{" "}
          <span className="text-white font-semibold">
            {gymName || "your gym"}
          </span>
          . Keep your members engaged and your gym moving forward.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-7">
          <Link
            href="/members"
            className="inline-flex items-center gap-2 bg-[#8BC34A] hover:bg-[#9BD45A] text-[#17211A] px-5 py-3 rounded-xl text-sm font-bold transition shadow-lg shadow-black/10"
          >
            <Plus size={18} />
            Add new member
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/plans"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white px-5 py-3 rounded-xl text-sm font-medium transition"
          >
            Manage plans
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
