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
import MemberHistoryModal from "@/components/members/MemberHistoryModal";
import { exportMembersToExcel } from "@/utils/exportMembers";
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
  const [historyMember, setHistoryMember] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [adjustingMember, setAdjustingMember] = useState(null);

  // Edit member form
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editJoinDate, setEditJoinDate] = useState("");
  const [editError, setEditError] = useState("");

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

  // Adjust membership form
  const [adjustPlanId, setAdjustPlanId] = useState("");
  const [adjustExpiryDate, setAdjustExpiryDate] = useState("");
  const [adjustError, setAdjustError] = useState("");

  // Fetch members and payments
  async function loadMembers(gymId = gym?.id) {
    if (!gymId) return;

    const { data, error: memberError } = await supabase
      .from("members")
     .select("*, plans:plans!members_same_gym_plan_fkey(name)")
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

  function openAdjustMembership(member) {
    setAdjustError("");

    setAdjustPlanId(member.plan_id ? String(member.plan_id) : "");

    setAdjustExpiryDate(member.expiry_date || "");

    setAdjustingMember(member);
  }

  async function adjustMembership(e) {
    e.preventDefault();

    if (saving) return;

    setAdjustError("");

    if (!adjustingMember || !gym?.id) {
      setAdjustError("Member information is unavailable.");
      return;
    }

    const plan = plans.find((p) => String(p.id) === String(adjustPlanId));

    if (!plan) {
      setAdjustError("Please select a valid membership plan.");
      return;
    }

    if (!adjustExpiryDate) {
      setAdjustError("Please select an expiry date.");
      return;
    }

    if (
      adjustingMember.join_date &&
      adjustExpiryDate < adjustingMember.join_date
    ) {
      setAdjustError("Expiry date cannot be before the joining date.");
      return;
    }

    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from("members")
        .update({
          plan_id: plan.id,
          expiry_date: adjustExpiryDate,
        })
        .eq("id", adjustingMember.id)
        .eq("gym_id", gym.id)
        .select("id")
        .single();

      if (updateError) {
        setAdjustError(updateError.message);
        return;
      }

      setAdjustingMember(null);
      setAdjustPlanId("");
      setAdjustExpiryDate("");
      setAdjustError("");

      await loadMembers(gym.id);
    } catch (err) {
      setAdjustError(err.message || "Unable to adjust membership.");
    } finally {
      setSaving(false);
    }
  }

  function openEditMember(member) {
    setEditError("");

    setEditName(member.name || "");
    setEditPhone(member.phone || "");
    setEditJoinDate(member.join_date || "");

    setEditingMember(member);
  }

  // Update existing member
  async function updateMember(e) {
    e.preventDefault();

    if (saving) return;

    setEditError("");

    if (!editingMember || !gym?.id) {
      setEditError("Member information is unavailable.");
      return;
    }

    if (!editName.trim()) {
      setEditError("Please enter member name.");
      return;
    }

    if (!/^\d{10}$/.test(editPhone.trim())) {
      setEditError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!editJoinDate || editJoinDate > today()) {
      setEditError("Please enter a valid joining date.");
      return;
    }

    if (editingMember.expiry_date && editJoinDate > editingMember.expiry_date) {
      setEditError("Joining date cannot be after the membership expiry date.");
      return;
    }

    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from("members")
        .update({
          name: editName.trim(),
          phone: editPhone.trim(),
          join_date: editJoinDate,
        })
        .eq("id", editingMember.id)
        .eq("gym_id", gym.id)
        .select("id")
        .single();

      if (updateError) {
        setEditError(updateError.message);
        return;
      }

      // Close edit modal
      setEditingMember(null);

      // Reset edit form
      setEditName("");
      setEditPhone("");
      setEditJoinDate("");
      setEditError("");

      // Refresh members
      await loadMembers(gym.id);
    } catch (err) {
      setEditError(err.message || "Unable to update member details.");
    } finally {
      setSaving(false);
    }
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

  // Download all members and all their payments as an Excel file
  async function handleExport() {
    if (!gym?.id || exporting) return;
    setExporting(true);

    try {
      await exportMembersToExcel({ gym, members, plans });
    } catch (err) {
      window.alert(err.message || "Could not create the Excel file.");
    } finally {
      setExporting(false);
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
          onViewHistory={setHistoryMember}
          onEdit={openEditMember}
          onAdjustMembership={openAdjustMembership}
          onExport={handleExport}
          exporting={exporting}
          onAddMember={() => {
            resetAddForm();
            setShowAdd(true);
          }}
        />

        <Footer />
      </main>

      {historyMember && (
        <MemberHistoryModal
          member={historyMember}
          plans={plans}
          gymName={gym?.name}
          onClose={() => setHistoryMember(null)}
          onRenew={(m) => {
            setHistoryMember(null);
            openRenew(m);
          }}
        />
      )}

      <MemberModals
        showAdd={showAdd}
        setShowAdd={setShowAdd}
        showImport={showImport}
        setShowImport={setShowImport}
        existingMembers={members}
        onImportMembers={importMembers}
        renewMember={renewMember}
        setRenewMember={setRenewMember}
        editingMember={editingMember}
        setEditingMember={setEditingMember}
        plans={plans}
        saving={saving}
        error={error}
        renewError={renewError}
        editError={editError}
        adjustingMember={adjustingMember}
        setAdjustingMember={setAdjustingMember}
        adjustError={adjustError}
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

          // Renewal form
          rPlanId,
          rAmount,
          setRAmount,
          rMode,
          setRMode,

          // Edit member form
          editName,
          setEditName,
          editPhone,
          setEditPhone,
          editJoinDate,
          setEditJoinDate,

          adjustPlanId,
          setAdjustPlanId,
          adjustExpiryDate,
          setAdjustExpiryDate,
        }}
        handlers={{
          addMember,
          renew,
          resetAddForm,
          onPlanChange,
          onRenewPlanChange,
          updateMember,
          adjustMembership,
        }}
      />
    </div>
  );
}
