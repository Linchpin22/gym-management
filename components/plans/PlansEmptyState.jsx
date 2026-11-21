import { Dumbbell, Plus, Sparkles } from "lucide-react";

export default function PlansEmptyState({ onCreate }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-[#C9D6CB] bg-white px-6 py-16 text-center shadow-sm">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#F0F5EC]" />
      <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-[#F5F8F2]" />

      <div className="relative">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF3E3] text-[#668D43] shadow-sm">
          <Dumbbell size={29} />
        </div>

        <div className="mb-2 flex items-center justify-center gap-2">
          <Sparkles size={17} className="text-[#8BC34A]" />
          <h3 className="text-xl font-bold">No active plans yet</h3>
        </div>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#829087]">
          Start by creating your first membership plan. Set the duration and
          price to give your members flexible options.
        </p>

        <button
          type="button"
          onClick={onCreate}
          className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#8BC34A] px-5 py-3 text-sm font-bold text-[#17211A] shadow-sm transition hover:bg-[#7FB53E]"
        >
          <Plus size={18} />
          Create First Plan
        </button>
      </div>
    </div>
  );
}