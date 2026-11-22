"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

import { today, addDays, daysLeft, getStatus } from "@/utils/memberUtils";
import MembersHeader from "@/components/members/MembersHeader";
import MembersBanner from "@/components/members/MembersBanner";
import MembersStats from "@/components/members/MembersStats";
import MembersTable from "@/components/members/MembersTable";

import MembersSkeleton from "@/components/members/MembersSkeleton";
import MemberModals from "@/components/members/MemberModal";
import Footer from "@/components/shared/Footer";

export default function MembersPage() {
  const router = useRouter();

  // Gym data
  const [gym, setGym] = useState(null);
  const [plans, setPlans] = useState([]);
  const [members, setMembers] = useState([]);

  // Loading and errors
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [renewError, setRenewError] = useState("");

  // Search and filters
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // Modal states
  const [showAdd, setShowAdd] = useState(false);
  const [renewMember, setRenewMember] = useState(null);
  const [showImport, setShowImport] = useState(false);

  // Add member form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [planId, setPlanId] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("cash");

  // Renew form
  const [rPlanId, setRPlanId] = useState("");
  const [rAmount, setRAmount] = useState("");
  const [rMode, setRMode] = useState("cash");

  // Fetch members and payments
  async function loadMembers(gymId = gym?.id) {
    if (!gymId) return;

    const { data, error: memberError } = await supabase
      .from("members")
      .select("*, plans(name)")
      .eq("gym_id", gymId)
      .order("expiry_date", { ascending: true });

    if (memberError) {
      setError(memberError.message);
      return;
    }

    const { data: payments, error: paymentError } = await supabase
      .from("payments")
      .select("member_id, amount, mode, paid_on")
      .eq("gym_id", gymId)
      .order("paid_on", { ascending: false });

    if (paymentError) {
      setError(paymentError.message);
    }

    const latestPayments = {};

    (payments || []).forEach((payment) => {
      if (!latestPayments[payment.member_id]) {
        latestPayments[payment.member_id] = payment;
      }
    });

    const membersWithPayments = (data || []).map((member) => ({
      ...member,
      lastPayment: latestPayments[member.id] || null,
    }));

    setMembers(membersWithPayments);
  }

  // Initialize page
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (!session) {
          router.replace("/");
          return;
        }

        const { data: g, error: gErr } = await supabase
          .from("gyms")
          .select("*")
          .limit(1)
          .single();

        if (!mounted) return;

        if (gErr) {
          setError(gErr.message);
          return;
        }

        setGym(g);

        const { data: p, error: pErr } = await supabase
          .from("plans")
          .select("*")
          .eq("is_active", true)
          .order("duration_days");

        if (!mounted) return;

        if (pErr) {
          setError(pErr.message);
        }

        setPlans(p || []);

        await loadMembers(g.id);
      } catch (err) {
        if (mounted) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const result = {
      total: members.length,
      active: 0,
      expiring: 0,
      expired: 0,
    };

    members.forEach((member) => {
      const status = getStatus(member.expiry_date);

      if (status === "Active") result.active++;
      if (status === "Expiring") result.expiring++;
      if (status === "Expired") result.expired++;
    });

    return result;
  }, [members]);

  // Search and filters
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        (member.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (member.phone || "").includes(search);

      const status = getStatus(member.expiry_date);

      const matchesFilter =
        filter === "All" ||
        (filter === "Active" && status === "Active") ||
        (filter === "Expiring" && status === "Expiring") ||
        (filter === "Expired" && status === "Expired");

      return matchesSearch && matchesFilter;
    });
  }, [members, search, filter]);

  const activeRate = stats.total
    ? Math.round((stats.active / stats.total) * 100)
    : 0;

  // Reset add form
  function resetAddForm() {
    setName("");
    setPhone("");
    setPlanId("");
    setAmount("");
    setMode("cash");
    setError("");
  }

  // Add member plan selection
  function onPlanChange(id) {
    setPlanId(id);

    const plan = plans.find((p) => String(p.id) === String(id));

    if (plan) {
      setAmount(String(plan.price));
    }
  }

  // Add member
  async function addMember(e) {
    e.preventDefault();
    setError("");

    if (!gym?.id) {
      setError("Gym information is unavailable.");
      return;
    }

    const plan = plans.find((p) => String(p.id) === String(planId));

    if (!plan) {
      setError("Please select a valid membership plan.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter member name.");
      return;
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (
      !Number.isFinite(Number(amount)) ||
      Number(amount) < 0 ||
      amount === ""
    ) {
      setError("Please enter a valid payment amount.");
      return;
    }

    setSaving(true);

    try {
      const joinDate = today();
      const expiry = addDays(joinDate, plan.duration_days);

      const { data: member, error: mErr } = await supabase
        .from("members")
        .insert({
          gym_id: gym.id,
          name: name.trim(),
          phone: phone.trim(),
          join_date: joinDate,
          plan_id: plan.id,
          expiry_date: expiry,
        })
        .select()
        .single();

      if (mErr) {
        setError(mErr.message);
        return;
      }

      const { error: pErr } = await supabase.from("payments").insert({
        gym_id: gym.id,
        member_id: member.id,
        plan_id: plan.id,
        amount: Number(amount),
        paid_on: joinDate,
        mode,
      });

      if (pErr) {
        setError("Member saved, but payment failed: " + pErr.message);

        await loadMembers(gym.id);
        return;
      }

      resetAddForm();
      setShowAdd(false);

      await loadMembers(gym.id);
    } catch (err) {
      setError(err.message || "Unable to add member.");
    } finally {
      setSaving(false);
    }
  }

  // Open renewal modal
  function openRenew(member) {
    setRenewError("");
    setRenewMember(member);

    const plan =
      plans.find((p) => String(p.id) === String(member.plan_id)) || plans[0];

    setRPlanId(plan ? String(plan.id) : "");
    setRAmount(plan ? String(plan.price) : "");
    setRMode("cash");
  }

  // Renew plan selection
  function onRenewPlanChange(id) {
    setRPlanId(id);

    const plan = plans.find((p) => String(p.id) === String(id));

    if (plan) {
      setRAmount(String(plan.price));
    }
  }

  // Renew membership
  async function renew(e) {
    e.preventDefault();
    setRenewError("");

    if (!renewMember || !gym?.id) return;

    const plan = plans.find((p) => String(p.id) === String(rPlanId));

    if (!plan) {
      setRenewError("Please select a valid plan.");
      return;
    }

    if (
      rAmount === "" ||
      !Number.isFinite(Number(rAmount)) ||
      Number(rAmount) < 0
    ) {
      setRenewError("Please enter a valid payment amount.");
      return;
    }

    setSaving(true);

    try {
      const left = daysLeft(renewMember.expiry_date);

      const base =
        left !== null && left >= 0 ? renewMember.expiry_date : today();

      const newExpiry = addDays(base, plan.duration_days);

      // Save payment first
      const { error: pErr } = await supabase.from("payments").insert({
        gym_id: gym.id,
        member_id: renewMember.id,
        plan_id: plan.id,
        amount: Number(rAmount),
        paid_on: today(),
        mode: rMode,
      });

      if (pErr) {
        setRenewError(pErr.message);
        return;
      }

      // Update membership
      const { error: uErr } = await supabase
        .from("members")
        .update({
          expiry_date: newExpiry,
          plan_id: plan.id,
        })
        .eq("id", renewMember.id)
        .eq("gym_id", gym.id);

      if (uErr) {
        setRenewError(
          "Payment saved, but membership update failed: " + uErr.message,
        );

        await loadMembers(gym.id);
        return;
      }

      setRenewMember(null);

      await loadMembers(gym.id);
    } catch (err) {
      setRenewError(err.message || "Unable to renew membership.");
    } finally {
      setSaving(false);
    }
  }

  async function importMembers(rows) {
    if (!gym?.id || !rows.length) return;

    setSaving(true);

    const successful = [];
    const failed = [];

    try {
      for (const row of rows) {
        const expiryDate = addDays(row.joinDate, row.durationDays);

        // Create member
        const { data: member, error: memberError } = await supabase
          .from("members")
          .insert({
            gym_id: gym.id,
            name: row.name,
            phone: row.phone,
            join_date: row.joinDate,
            plan_id: row.planId,
            expiry_date: expiryDate,
          })
          .select()
          .single();

        if (memberError) {
          failed.push({
            row: row.rowNumber,
            reason: memberError.message,
          });
          continue;
        }

        // Create corresponding payment
        const { error: paymentError } = await supabase.from("payments").insert({
          gym_id: gym.id,
          member_id: member.id,
          plan_id: row.planId,
          amount: row.amount,
          paid_on: row.joinDate,
          mode: row.mode,
        });

        if (paymentError) {
          // Compensate by deleting the member if payment creation fails.
          const { error: rollbackError } = await supabase
            .from("members")
            .delete()
            .eq("id", member.id)
            .eq("gym_id", gym.id);

          failed.push({
            row: row.rowNumber,
            reason: rollbackError
              ? `Payment failed: ${paymentError.message}. Member cleanup also failed: ${rollbackError.message}`
              : `Payment failed: ${paymentError.message}. Member record was rolled back.`,
          });

          continue;
        }

        successful.push(member.id);
      }

      await loadMembers(gym.id);

      setShowImport(false);

      const summary = [
        `Import completed!`,
        ``,
        `Successfully imported: ${successful.length}`,
        `Failed: ${failed.length}`,
        ...failed.map((item) => `Row ${item.row}: ${item.reason}`),
      ].join("\n");

      window.alert(summary);
    } catch (err) {
      window.alert(err.message || "Something went wrong during import.");
    } finally {
      setSaving(false);
    }
  }

  // Loading
  if (loading) {
    return <MembersSkeleton />;
  }

  return (
    <div className="min-h-screen mt-16 md:mt-0 bg-[#F5F7F6]">
      <MembersHeader
        gym={gym}
        onAddMember={() => {
          resetAddForm();
          setShowAdd(true);
        }}
        onImportMembers={() => setShowImport(true)}
      />

      <main className="p-4 sm:p-6 lg:p-10 max-w-[1500px] mx-auto space-y-7">
        <MembersBanner stats={stats} />

        {error && !showAdd && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        <MembersStats stats={stats} activeRate={activeRate} />

        <MembersTable
          members={members}
          filteredMembers={filteredMembers}
          stats={stats}
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          onRenew={openRenew}
          onAddMember={() => {
            resetAddForm();
            setShowAdd(true);
          }}
        />

        <Footer />
      </main>

     <MemberModals
  showAdd={showAdd}
  setShowAdd={setShowAdd}
  showImport={showImport}
  setShowImport={setShowImport}
  existingMembers={members}
  onImportMembers={importMembers}
  renewMember={renewMember}
  setRenewMember={setRenewMember}
  plans={plans}
  saving={saving}
  error={error}
  renewError={renewError}
  form={{
    name,
    setName,
    phone,
    setPhone,
    planId,
    amount,
    setAmount,
    mode,
    setMode,
    rPlanId,
    rAmount,
    setRAmount,
    rMode,
    setRMode,
  }}
  handlers={{
    addMember,
    renew,
    resetAddForm,
    onPlanChange,
    onRenewPlanChange,
  }}
/>
    </div>
  );
}
