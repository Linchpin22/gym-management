import { Dumbbell, Power } from "lucide-react";
import { formatPrice } from "./PlansUI";

export default function InactivePlans({
  plans,
  memberCounts,
  onReactivate,
}) {
  if (!plans.length) return null;

  return (
    <section className="mt-12">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">
              Inactive Plans
            </h2>
            <span className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-bold text-gray-600">
              {plans.length}
            </span>
          </div>

          <p className="mt-1 text-sm text-[#829087]">
            Plans currently unavailable for new memberships.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E6ECE7] bg-white shadow-sm">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col gap-4 border-b border-[#EEF1EF] p-5 transition last:border-b-0 hover:bg-[#FAFBFA] sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                <Dumbbell size={20} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-[#435047]">{plan.name}</h3>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-500">
                    Inactive
                  </span>
                </div>

                <p className="mt-1 text-sm text-[#829087]">
                  ₹{formatPrice(plan.price)}
                  <span className="mx-1 text-gray-300">·</span>
                  {plan.duration_days} days
                  <span className="mx-1 text-gray-300">·</span>
                  {memberCounts[plan.id] || 0} members
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onReactivate(plan)}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#DCE8D5] px-4 py-2.5 text-sm font-bold text-[#548333] transition hover:bg-[#F0F5EC]"
            >
              <Power size={15} />
              Reactivate
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}