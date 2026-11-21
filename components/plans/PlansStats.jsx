import { CreditCard, CheckCircle2, Users } from "lucide-react";
import { StatCard } from "./PlansUI";

export default function PlansStats({
  totalPlans,
  activePlans,
  totalMembers,
}) {
  return (
    <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        icon={CreditCard}
        label="Total Plans"
        value={totalPlans}
        description="All created membership plans"
        accent="bg-[#F0F5EC]"
      />

      <StatCard
        icon={CheckCircle2}
        label="Active Plans"
        value={activePlans}
        description="Available for new memberships"
        accent="bg-[#EDF7E8]"
      />

      <StatCard
        icon={Users}
        label="Total Members"
        value={totalMembers}
        description="Across all membership plans"
        accent="bg-[#EEF3F8]"
      />
    </div>
  );
}