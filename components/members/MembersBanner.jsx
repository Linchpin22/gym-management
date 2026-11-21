
import {
  Users,
  Sparkles,
} from "lucide-react";

export default function MembersBanner({ stats }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#17211A] via-[#203326] to-[#304B32] p-6 sm:p-8 lg:p-9 text-white shadow-lg shadow-[#17211A]/10">
      <div className="absolute -right-12 -top-20 w-64 h-64 rounded-full border-[32px] border-white/[0.04]" />

      <div className="absolute right-20 -bottom-32 w-64 h-64 rounded-full border-[32px] border-[#8BC34A]/10" />

      <div className="absolute right-10 top-8 text-[#A4D66B]/15 hidden md:block">
        <Users size={125} strokeWidth={1} />
      </div>

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-1.5 text-xs text-[#C8E6A0] font-medium mb-4">
          <Sparkles size={14} />
          Member Management
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          Your Gym Community
        </h1>

        <p className="text-sm text-white/65 mt-3 max-w-xl leading-relaxed">
          Manage your members, keep track of membership status and make
          renewals easier.
        </p>

        <div className="flex flex-wrap gap-3 mt-7">
          <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 min-w-[120px]">
            <p className="text-xs text-white/55">Total members</p>
            <p className="text-2xl font-bold mt-1">
              {stats.total}
            </p>
          </div>

          <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 min-w-[120px]">
            <p className="text-xs text-white/55">Active members</p>
            <p className="text-2xl font-bold text-[#A4D66B] mt-1">
              {stats.active}
            </p>
          </div>

          <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 min-w-[120px]">
            <p className="text-xs text-white/55">Need attention</p>
            <p className="text-2xl font-bold text-orange-300 mt-1">
              {stats.expiring + stats.expired}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
