import { Dumbbell, Plus, Sparkles } from "lucide-react";

export default function PlansHeader({ gymName, onCreate }) {
  return (
    <div className="relative mb-9 overflow-hidden rounded-3xl bg-[#17211A] px-6 py-7 text-white shadow-lg sm:px-8 sm:py-8">
      <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-[#8BC34A]/10 blur-2xl" />
      <div className="absolute bottom-0 right-36 h-32 w-32 rounded-full bg-[#8BC34A]/10 blur-2xl" />

      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-1.5 text-xs text-[#C8E6A0] font-medium mb-4">
            <Sparkles size={14} />
            Plan Management
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Membership Plans
          </h1>

          <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/60">
            Build flexible membership options and keep your gym subscriptions
            organized.
          </p>

          {gymName && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80">
              <span className="h-2 w-2 rounded-full bg-[#8BC34A]" />
              {gymName}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#8BC34A] px-5 py-3.5 text-sm font-bold text-[#17211A] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#9BD35B]"
        >
          <Plus size={19} />
          Create New Plan
        </button>
      </div>
    </div>
  );
}
