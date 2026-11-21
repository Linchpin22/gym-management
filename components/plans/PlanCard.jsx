import {
  CalendarDays,
  Users,
  Dumbbell,
  Pencil,
  Trash2,
} from "lucide-react";
import { DetailRow, formatPrice } from "./PlansUI";

export default function PlanCard({
  plan,
  index,
  memberCount,
  onEdit,
  onDeactivate,
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#E6ECE7] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#C9DDBB] hover:shadow-lg">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-[#F3F8EF] transition duration-300 group-hover:bg-[#EAF3E3]" />

      <div className="relative">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF3E3] text-[#668D43] transition duration-300 group-hover:scale-110">
            <Dumbbell size={23} />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDF7E8] px-3 py-1.5 text-xs font-bold text-[#548333]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#78B84B]" />
            Active
          </span>
        </div>

        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#9AA69D]">
          Membership {String(index + 1).padStart(2, "0")}
        </div>

        <h3 className="break-words text-xl font-bold text-[#17211A]">
          {plan.name}
        </h3>

        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-3xl font-extrabold tracking-tight text-[#17211A]">
            ₹{formatPrice(plan.price)}
          </span>
          <span className="text-sm font-medium text-[#829087]">/ plan</span>
        </div>

        <div className="my-6 space-y-4 border-y border-[#EEF1EF] py-5">
          <DetailRow
            icon={CalendarDays}
            label="Duration"
            value={`${plan.duration_days} days`}
          />

          <DetailRow
            icon={Users}
            label="Members"
            value={memberCount}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onEdit(plan)}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#DCE4DE] py-3 text-sm font-bold text-[#435047] transition hover:border-[#B8D2A8] hover:bg-[#F3F8EF] hover:text-[#527C35]"
          >
            <Pencil size={15} />
            Edit Plan
          </button>

          <button
            type="button"
            onClick={() => onDeactivate(plan)}
            className="flex h-11 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-red-100 text-red-500 transition hover:border-red-200 hover:bg-red-50"
            title="Deactivate plan"
            aria-label={`Deactivate ${plan.name}`}
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}