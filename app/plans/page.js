"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

import PlansHeader from "@/components/plans/PlansHeader";
import PlansStats from "@/components/plans/PlansStats";
import PlanCard from "@/components/plans/PlanCard";
import PlansEmptyState from "@/components/plans/PlansEmptyState";
import InactivePlans from "@/components/plans/InactivePlans";
import PlanModal from "@/components/plans/PlanModal";
import PlansSkeleton from "@/components/plans/PlansSkeleton";
import Footer from "@/components/shared/Footer";

const INITIAL_FORM = {
  name: "",
  duration_days: "30",
  price: "",
};

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

  // Initialize page
  async function initializePage() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

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
        throw gymError || new Error("Unable to load your gym details.");
      }

      setGym(gymData);

      await fetchPlans(gymData.id);
    } catch (err) {
      console.error("Initialize plans page:", err);
      setError(err.message || "Unable to load your gym details.");
    } finally {
      setLoading(false);
    }
  }

  // Fetch plans and associated member counts
  async function fetchPlans(gymId) {
    if (!gymId) return;

    const [
      { data: planData, error: planError },
      { data: memberData, error: memberError },
    ] = await Promise.all([
      supabase
        .from("plans")
        .select("*")
        .eq("gym_id", gymId)
        .order("created_at", { ascending: false }),

      supabase
        .from("members")
        .select("plan_id")
        .eq("gym_id", gymId),
    ]);

    if (planError) {
      throw planError;
    }

    if (memberError) {
      throw memberError;
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

  // Open create modal
  function openCreateModal() {
    setEditingPlan(null);
    setForm({ ...INITIAL_FORM });
    setError("");
    setModalOpen(true);
  }

  // Open edit modal
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

  // Close modal
  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingPlan(null);
    setForm({ ...INITIAL_FORM });
    setError("");
  }

  // Update form field
  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  // Create or update plan
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

    if (!gym?.id) {
      setError("Gym details are not available.");
      return;
    }

    setSaving(true);

    try {
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
        throw result.error;
      }

      await fetchPlans(gym.id);

      setModalOpen(false);
      setEditingPlan(null);
      setForm({ ...INITIAL_FORM });
      setError("");
    } catch (err) {
      console.error("Save plan:", err);
      setError(err.message || "Unable to save plan.");
    } finally {
      setSaving(false);
    }
  }

  // Deactivate plan
  async function deactivatePlan(plan) {
    if (!gym?.id) return;

    const memberCount = memberCounts[plan.id] || 0;

    const confirmed = window.confirm(
      memberCount > 0
        ? `${memberCount} member(s) are currently associated with this plan. Deactivate it? Existing memberships will remain unchanged.`
        : `Deactivate "${plan.name}"?`,
    );

    if (!confirmed) return;

    try {
      const { error: updateError } = await supabase
        .from("plans")
        .update({ is_active: false })
        .eq("id", plan.id)
        .eq("gym_id", gym.id);

      if (updateError) throw updateError;

      await fetchPlans(gym.id);
    } catch (err) {
      console.error("Deactivate plan:", err);
      window.alert(err.message || "Unable to deactivate plan.");
    }
  }

  // Reactivate plan
  async function reactivatePlan(plan) {
    if (!gym?.id) return;

    try {
      const { error: updateError } = await supabase
        .from("plans")
        .update({ is_active: true })
        .eq("id", plan.id)
        .eq("gym_id", gym.id);

      if (updateError) throw updateError;

      await fetchPlans(gym.id);
    } catch (err) {
      console.error("Reactivate plan:", err);
      window.alert(err.message || "Unable to reactivate plan.");
    }
  }

  // Derived data
  const activePlans = plans.filter(
    (plan) => plan.is_active !== false,
  );

  const inactivePlans = plans.filter(
    (plan) => plan.is_active === false,
  );

  const totalMembers = Object.values(memberCounts).reduce(
    (sum, count) => sum + count,
    0,
  );

  if (loading) {
    return <PlansSkeleton />;
  }

  return (
    <div className="mt-16 min-h-screen bg-[#F5F7F6] text-[#17211A] md:mt-0">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-9">

        {/* Header */}
        <PlansHeader
          gymName={gym?.name}
          onCreate={openCreateModal}
        />

        {/* Statistics */}
        <PlansStats
          totalPlans={plans.length}
          activePlans={activePlans.length}
          totalMembers={totalMembers}
        />

        {/* Page Error */}
        {error && !modalOpen && (
          <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Plans Section Header */}
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">
                Your Plans
              </h2>

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

        {/* Active Plans */}
        {activePlans.length === 0 ? (
          <PlansEmptyState onCreate={openCreateModal} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {activePlans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                index={index}
                memberCount={memberCounts[plan.id] || 0}
                onEdit={openEditModal}
                onDeactivate={deactivatePlan}
              />
            ))}
          </div>
        )}

        {/* Inactive Plans */}
        <InactivePlans
          plans={inactivePlans}
          memberCounts={memberCounts}
          onReactivate={reactivatePlan}
        />

        {/* Footer Note */}
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
          <Footer />
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