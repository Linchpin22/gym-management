import { Activity, TrendingUp } from "lucide-react";

export default function MembershipHealth({
  activeRate,
  activeCount,
  totalMembers,
  expiredCount,
}) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#17211A] to-[#304B32] rounded-2xl p-6 text-white shadow-lg shadow-[#17211A]/10">
      <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full border-[22px] border-white/[0.05]" />

      <div className="absolute right-6 bottom-5 text-white/[0.06]">
        <TrendingUp size={85} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 text-[#B9DE8C]">
          <Activity size={17} />
          <p className="text-sm font-semibold">Membership Health</p>
        </div>

        <div className="flex items-end gap-2 mt-5">
          <p className="text-4xl font-bold tracking-tight">{activeRate}%</p>
          <p className="text-xs text-white/55 mb-1.5">active rate</p>
        </div>

        <p className="text-xs text-white/60 mt-2">
          {activeCount} active out of {totalMembers} total members
        </p>

        <div className="w-full h-2.5 bg-white/15 rounded-full mt-5 overflow-hidden">
          <div
            className="h-full bg-[#9BD45A] rounded-full transition-all duration-700"
            style={{ width: `${activeRate}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-3 text-[11px] text-white/50">
          <span>Active members</span>
          <span>{expiredCount} expired</span>
        </div>
      </div>
    </div>
  );
}