import {
  X,
  Dumbbell,
  CalendarDays,
  IndianRupee,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";

export default function PlanModal({
  editingPlan,
  form,
  error,
  saving,
  onClose,
  onSubmit,
  onChange,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#111B14]/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div className="my-auto w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="relative overflow-hidden bg-[#17211A] px-6 py-6 text-white sm:px-7">
          <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full bg-[#8BC34A]/15" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#8BC34A] text-[#17211A]">
                <Dumbbell size={22} />
              </div>

              <h2 className="text-xl font-bold">
                {editingPlan ? "Edit Membership Plan" : "Create New Plan"}
              </h2>

              <p className="mt-1 text-sm text-white/60">
                {editingPlan
                  ? "Update your membership details."
                  : "Add a new membership option to Gym Pilot."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="cursor-pointer rounded-xl p-2 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-6 sm:p-7">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#26352A]">
              Plan Name
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="e.g. Monthly Membership"
              required
              className="w-full rounded-xl border border-[#DCE4DE] bg-[#FAFBFA] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#8BC34A] focus:bg-white focus:ring-4 focus:ring-[#8BC34A]/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#26352A]">
              Duration
            </label>

            <div className="relative">
              <CalendarDays
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#829087]"
              />

              <input
                type="number"
                min="1"
                step="1"
                value={form.duration_days}
                onChange={(e) => onChange("duration_days", e.target.value)}
                required
                className="w-full rounded-xl border border-[#DCE4DE] bg-[#FAFBFA] py-3 pl-11 pr-16 text-sm outline-none transition focus:border-[#8BC34A] focus:bg-white focus:ring-4 focus:ring-[#8BC34A]/10"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#829087]">
                Days
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#26352A]">
              Plan Price
            </label>

            <div className="relative">
              <IndianRupee
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#829087]"
              />

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => onChange("price", e.target.value)}
                placeholder="e.g. 1500"
                required
                className="w-full rounded-xl border border-[#DCE4DE] bg-[#FAFBFA] py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#8BC34A] focus:bg-white focus:ring-4 focus:ring-[#8BC34A]/10"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 cursor-pointer rounded-xl border border-[#DCE4DE] py-3 text-sm font-semibold text-[#435047] transition hover:bg-[#F5F7F6] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#8BC34A] py-3 text-sm font-bold text-[#17211A] shadow-sm transition hover:bg-[#7FB53E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {editingPlan ? "Save Changes" : "Create Plan"}
                  <ArrowUpRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}