"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  IndianRupee,
  Users,
  CreditCard,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  Power,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const INITIAL_FORM = {
  name: "",
  duration_days: "30",
  price: "",
};

const formatPrice = (price) => Number(price || 0).toLocaleString("en-IN");

function PlansSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-[#F5F7F6]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="space-y-3">
            <div className="h-4 w-36 rounded bg-gray-200" />
            <div className="h-8 w-64 rounded-lg bg-gray-200" />
            <div className="h-4 w-80 max-w-full rounded bg-gray-100" />
          </div>
          <div className="h-12 w-44 rounded-xl bg-gray-200" />
        </div>

        <div className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-[#E8EDE9] bg-white p-5"
            >
              <div className="mb-5 flex justify-between">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-10 w-10 rounded-xl bg-[#F0F5EC]" />
              </div>
              <div className="h-8 w-16 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-36 rounded bg-gray-100" />
            </div>
          ))}
        </div>

        <div className="mb-5 space-y-2">
          <div className="h-6 w-28 rounded bg-gray-200" />
          <div className="h-4 w-48 rounded bg-gray-100" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-[#E8EDE9] bg-white p-6"
            >
              <div className="mb-5 flex justify-between">
                <div className="h-12 w-12 rounded-xl bg-[#F0F5EC]" />
                <div className="h-6 w-16 rounded-full bg-gray-100" />
              </div>
              <div className="h-6 w-36 rounded bg-gray-200" />
              <div className="mt-4 h-9 w-32 rounded bg-gray-200" />
              <div className="my-6 space-y-4 border-y border-[#EEF1EF] py-5">
                <div className="h-4 w-full rounded bg-gray-100" />
                <div className="h-4 w-full rounded bg-gray-100" />
              </div>
              <div className="h-10 rounded-xl bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, description, accent }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#E7ECE8] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
      <div
        className={`absolute right-0 top-0 h-24 w-24 rounded-bl-full opacity-60 ${accent}`}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#829087]">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#17211A]">
            {value}
          </p>
          <p className="mt-1.5 text-xs text-[#829087]">{description}</p>
        </div>

        <div className="rounded-xl bg-[#F0F5EC] p-3 text-[#668D43] transition group-hover:scale-110">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2.5 text-[#829087]">
        <Icon size={17} className="shrink-0" />
        <span>{label}</span>
      </div>
      <span className="font-semibold text-[#26352A]">{value}</span>
    </div>
  );
}

function PlanModal({
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
              className="rounded-xl p-2 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
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
              className="flex-1 rounded-xl border border-[#DCE4DE] py-3 text-sm font-semibold text-[#435047] transition hover:bg-[#F5F7F6] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#8BC34A] py-3 text-sm font-bold text-[#17211A] shadow-sm transition hover:bg-[#7FB53E] disabled:cursor-not-allowed disabled:opacity-60"
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

export default function PlansPage() {
  const router = useRouter();

  const [gym, setGym] = useState(null);
  const [plans, setPlans] = useState([]);
  const [memberCounts, setMemberCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    initializePage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function initializePage() {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/");
      return;
    }

    const { data: gymData, error: gymError } = await supabase
      .from("gyms")
      .select("*")
      .eq("owner_id", session.user.id)
      .single();

    if (gymError || !gymData) {
      setError("Unable to load your gym details.");
      setLoading(false);
      return;
    }

    setGym(gymData);
    await fetchPlans(gymData.id);
    setLoading(false);
  }

  async function fetchPlans(gymId) {
    const [{ data: planData, error: planError }, { data: memberData }] =
      await Promise.all([
        supabase
          .from("plans")
          .select("*")
          .eq("gym_id", gymId)
          .order("created_at", { ascending: false }),
        supabase.from("members").select("plan_id").eq("gym_id", gymId),
      ]);

    if (planError) {
      setError("Unable to load membership plans.");
      return;
    }

    const counts = {};

    (memberData || []).forEach((member) => {
      if (member.plan_id) {
        counts[member.plan_id] = (counts[member.plan_id] || 0) + 1;
      }
    });

    setPlans(planData || []);
    setMemberCounts(counts);
  }

  function openCreateModal() {
    setEditingPlan(null);
    setForm(INITIAL_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(plan) {
    setEditingPlan(plan);
    setForm({
      name: plan.name || "",
      duration_days: String(plan.duration_days || 30),
      price: String(plan.price ?? ""),
    });
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditingPlan(null);
    setForm(INITIAL_FORM);
    setError("");
  }

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const name = form.name.trim();
    const duration = Number(form.duration_days);
    const price = Number(form.price);

    if (!name) {
      setError("Please enter a plan name.");
      return;
    }

    if (!Number.isInteger(duration) || duration <= 0) {
      setError("Duration must be a valid number of days.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Please enter a valid price.");
      return;
    }

    setSaving(true);

    const payload = {
      name,
      duration_days: duration,
      price,
    };

    const result = editingPlan
      ? await supabase
          .from("plans")
          .update(payload)
          .eq("id", editingPlan.id)
          .eq("gym_id", gym.id)
      : await supabase.from("plans").insert({
          ...payload,
          gym_id: gym.id,
        });

    if (result.error) {
      setError(result.error.message || "Unable to save plan.");
      setSaving(false);
      return;
    }

    await fetchPlans(gym.id);
    setSaving(false);
    closeModal();
  }

  async function deactivatePlan(plan) {
    const memberCount = memberCounts[plan.id] || 0;

    const confirmed = window.confirm(
      memberCount > 0
        ? `${memberCount} member(s) are currently associated with this plan. Deactivate it? Existing memberships will remain unchanged.`
        : `Deactivate "${plan.name}"?`,
    );

    if (!confirmed) return;

    const { error: updateError } = await supabase
      .from("plans")
      .update({ is_active: false })
      .eq("id", plan.id)
      .eq("gym_id", gym.id);

    if (updateError) {
      alert(updateError.message || "Unable to deactivate plan.");
      return;
    }

    await fetchPlans(gym.id);
  }

  async function reactivatePlan(plan) {
    const { error: updateError } = await supabase
      .from("plans")
      .update({ is_active: true })
      .eq("id", plan.id)
      .eq("gym_id", gym.id);

    if (updateError) {
      alert(updateError.message || "Unable to reactivate plan.");
      return;
    }

    await fetchPlans(gym.id);
  }

  const activePlans = plans.filter((plan) => plan.is_active !== false);

  const inactivePlans = plans.filter((plan) => plan.is_active === false);

  const totalMembers = Object.values(memberCounts).reduce(
    (sum, count) => sum + count,
    0,
  );

  if (loading) return <PlansSkeleton />;

  return (
    <div className="min-h-screen bg-[#F5F7F6] text-[#17211A]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
        {/* Header */}
        <div className="relative mb-9 overflow-hidden rounded-3xl bg-[#17211A] px-6 py-7 text-white shadow-lg sm:px-8 sm:py-8">
          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-[#8BC34A]/10 blur-2xl" />
          <div className="absolute bottom-0 right-36 h-32 w-32 rounded-full bg-[#8BC34A]/10 blur-2xl" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#B5C6B8]">
                <Dumbbell size={16} className="text-[#8BC34A]" />
                <span>Gym Management</span>
                <span className="text-white/30">/</span>
                <span>Membership Plans</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Membership Plans
              </h1>

              <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/60">
                Build flexible membership options and keep your gym
                subscriptions organized.
              </p>

              {gym?.name && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80">
                  <span className="h-2 w-2 rounded-full bg-[#8BC34A]" />
                  {gym.name}
                </div>
              )}
            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#8BC34A] px-5 py-3.5 text-sm font-bold text-[#17211A] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#9BD35B]"
            >
              <Plus size={19} />
              Create New Plan
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={CreditCard}
            label="Total Plans"
            value={plans.length}
            description="All created membership plans"
            accent="bg-[#F0F5EC]"
          />

          <StatCard
            icon={CheckCircle2}
            label="Active Plans"
            value={activePlans.length}
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

        {/* Error */}
        {error && !modalOpen && (
          <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Plans section */}
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Your Plans</h2>
              <span className="rounded-full bg-[#EAF2E4] px-2.5 py-1 text-xs font-bold text-[#5B853A]">
                {activePlans.length}
              </span>
            </div>
            <p className="mt-1 text-sm text-[#829087]">
              Manage pricing, duration and membership availability.
            </p>
          </div>

          <p className="text-xs font-medium text-[#829087]">
            {activePlans.length} active membership options
          </p>
        </div>

        {activePlans.length === 0 ? (
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
                Start by creating your first membership plan. Set the duration
                and price to give your members flexible options.
              </p>

              <button
                onClick={openCreateModal}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#8BC34A] px-5 py-3 text-sm font-bold text-[#17211A] shadow-sm transition hover:bg-[#7FB53E]"
              >
                <Plus size={18} />
                Create First Plan
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {activePlans.map((plan, index) => (
              <div
                key={plan.id}
                className="group relative overflow-hidden rounded-2xl border border-[#E6ECE7] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#C9DDBB] hover:shadow-lg"
              >
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
                    <span className="text-sm font-medium text-[#829087]">
                      / plan
                    </span>
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
                      value={memberCounts[plan.id] || 0}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => openEditModal(plan)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#DCE4DE] py-3 text-sm font-bold text-[#435047] transition hover:border-[#B8D2A8] hover:bg-[#F3F8EF] hover:text-[#527C35]"
                    >
                      <Pencil size={15} />
                      Edit Plan
                    </button>

                    <button
                      onClick={() => deactivatePlan(plan)}
                      className="flex h-11 w-12 shrink-0 items-center justify-center rounded-xl border border-red-100 text-red-500 transition hover:border-red-200 hover:bg-red-50"
                      title="Deactivate plan"
                      aria-label={`Deactivate ${plan.name}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inactive plans */}
        {inactivePlans.length > 0 && (
          <section className="mt-12">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight">
                    Inactive Plans
                  </h2>
                  <span className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-bold text-gray-600">
                    {inactivePlans.length}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#829087]">
                  Plans currently unavailable for new memberships.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#E6ECE7] bg-white shadow-sm">
              {inactivePlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex flex-col gap-4 border-b border-[#EEF1EF] p-5 last:border-b-0 transition hover:bg-[#FAFBFA] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                      <Dumbbell size={20} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-[#435047]">
                          {plan.name}
                        </h3>
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-500">
                          Inactive
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-[#829087]">
                        ₹{formatPrice(plan.price)}{" "}
                        <span className="mx-1 text-gray-300">·</span>
                        {plan.duration_days} days
                        <span className="mx-1 text-gray-300">·</span>
                        {memberCounts[plan.id] || 0} members
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => reactivatePlan(plan)}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#DCE8D5] px-4 py-2.5 text-sm font-bold text-[#548333] transition hover:bg-[#F0F5EC]"
                  >
                    <Power size={15} />
                    Reactivate
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer note */}
        <div className="mt-10 flex items-start gap-3 rounded-2xl border border-[#E6ECE7] bg-white p-4">
          <div className="rounded-xl bg-[#F0F5EC] p-2 text-[#668D43]">
            <AlertCircle size={17} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#435047]">
              Managing your plans
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#829087]">
              Deactivating a plan will not change existing memberships. You can
              reactivate an inactive plan whenever you need it.
            </p>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <PlanModal
          editingPlan={editingPlan}
          form={form}
          error={error}
          saving={saving}
          onClose={closeModal}
          onSubmit={handleSubmit}
          onChange={updateField}
        />
      )}
    </div>
  );
}
