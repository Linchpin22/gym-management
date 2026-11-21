
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Activity,
} from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bg,
  accent,
  subtitle,
}) {
  return (
    <div className="group relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className={`absolute top-0 left-0 w-full h-1 ${accent}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h3 className="text-3xl font-bold tracking-tight text-[#17211A] mt-3">
            {value}
          </h3>
        </div>

        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${bg} group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon size={22} className={color} />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-5">
        <span className={`w-1.5 h-1.5 rounded-full ${accent}`} />

        <p className="text-xs text-gray-500">
          {subtitle || "Membership overview"}
        </p>
      </div>
    </div>
  );
}

export default function MembersStats({ stats, activeRate }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#17211A]">
            Member Overview
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            A quick look at your gym community
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-[#EEF4E8] text-[#668B3D] px-3 py-2 rounded-full text-xs font-semibold">
          <Activity size={14} />
          {activeRate}% active
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Members"
          value={stats.total}
          icon={Users}
          color="text-blue-600"
          bg="bg-blue-50"
          accent="bg-blue-500"
          subtitle="All registered members"
        />

        <StatCard
          title="Active Members"
          value={stats.active}
          icon={UserCheck}
          color="text-[#5B9131]"
          bg="bg-[#EEF6E7]"
          accent="bg-[#8BC34A]"
          subtitle="Membership currently valid"
        />

        <StatCard
          title="Expiring Soon"
          value={stats.expiring}
          icon={Clock}
          color="text-orange-600"
          bg="bg-orange-50"
          accent="bg-orange-500"
          subtitle="Expiring within 7 days"
        />

        <StatCard
          title="Expired Members"
          value={stats.expired}
          icon={UserX}
          color="text-red-600"
          bg="bg-red-50"
          accent="bg-red-500"
          subtitle="Renewal required"
        />
      </div>
    </section>
  );
}
