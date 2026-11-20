"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Plus,
  Users,
  UserCheck,
  UserX,
  Clock,
  MessageCircle,
  RefreshCw,
  X,
  Dumbbell,
  CalendarDays,
  Wallet,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  Activity,
  CreditCard,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// Date helpers
const pad = (n) => String(n).padStart(2, "0");

const fmt = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const today = () => fmt(new Date());

function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return fmt(new Date(y, m - 1, d + days));
}

function daysLeft(expiry) {
  if (!expiry) return null;

  const [y, m, d] = expiry.split("-").map(Number);
  const t = new Date();
  const start = new Date(t.getFullYear(), t.getMonth(), t.getDate());

  return Math.round((new Date(y, m - 1, d) - start) / 86400000);
}

function formatDate(date) {
  if (!date) return "-";

  const [y, m, d] = date.split("-").map(Number);

  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function waLink(phone, name, expiry) {
  const digits = (phone || "").replace(/\D/g, "");
  const full = digits.length === 10 ? "91" + digits : digits;

  const text = `Hi ${name}, your gym membership expires on ${expiry}. Please renew to continue. Thank you!`;

  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

function getStatus(expiry) {
  const left = daysLeft(expiry);

  if (left === null) return "No Plan";
  if (left < 0) return "Expired";
  if (left <= 7) return "Expiring";
  return "Active";
}

// Status badge
function StatusBadge({ expiry }) {
  const status = getStatus(expiry);

  const styles = {
    Active: "bg-[#EEF6E7] text-[#56852E] border-[#DDECCF]",
    Expiring: "bg-orange-50 text-orange-700 border-orange-100",
    Expired: "bg-red-50 text-red-700 border-red-100",
    "No Plan": "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap ${styles[status]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

// Reusable modal
function Modal({ title, subtitle, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-[#101810]/55 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-6 bg-gradient-to-r from-[#F1F7E9] to-white border-b border-gray-100">
          <div>
            <div className="w-9 h-9 rounded-xl bg-[#E5F0D9] text-[#52772D] flex items-center justify-center mb-3">
              <Dumbbell size={18} />
            </div>

            <h2 className="text-lg font-bold text-[#17211A]">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white text-gray-500 transition"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2 min-w-0">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/15 transition placeholder:text-gray-400 bg-[#FAFBFA] focus:bg-white";

// Stat card
function StatCard({ title, value, icon: Icon, color, bg, accent, subtitle }) {
  return (
    <div className="group relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className={`absolute top-0 left-0 w-full h-1 ${accent}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>

          <h3 className="text-3xl font-bold tracking-tight text-[#17211A] mt-3">
            {value}
          </h3>
        </div>

        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${bg} group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon size={22} className={color} />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-5">
        <span className={`w-1.5 h-1.5 rounded-full ${accent}`} />
        <p className="text-xs text-gray-500">
          {subtitle || "Membership overview"}
        </p>
      </div>
    </div>
  );
}

// Skeleton
function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
  );
}

function MembersSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5F7F6]">
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </header>

      <div className="p-4 sm:p-6 lg:p-10 max-w-[1500px] mx-auto space-y-7">
        <div className="rounded-3xl bg-[#17211A] p-6 sm:p-8 space-y-4">
          <Skeleton className="h-5 w-36 bg-white/10" />
          <Skeleton className="h-9 w-64 max-w-full bg-white/10" />
          <Skeleton className="h-4 w-80 max-w-full bg-white/10" />

          <div className="flex flex-wrap gap-3 pt-2">
            {[1, 2, 3].map((item) => (
              <Skeleton
                key={item}
                className="h-16 w-32 rounded-xl bg-white/10"
              />
            ))}
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-white border border-gray-100 rounded-2xl p-5"
            >
              <div className="flex justify-between">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-9 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-2xl" />
              </div>
              <Skeleton className="h-3 w-36 mt-5" />
            </div>
          ))}
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-11 w-full md:w-80 rounded-xl" />
            </div>

            <div className="flex gap-2 mt-6 overflow-hidden">
              {[1, 2, 3, 4].map((item) => (
                <Skeleton
                  key={item}
                  className="h-10 w-24 rounded-xl shrink-0"
                />
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="bg-[#F7F9F7] px-6 py-4 flex gap-8">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Skeleton key={item} className="h-3 flex-1" />
              ))}
            </div>

            <div className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="px-6 py-5 flex items-center gap-8">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>

                  {[1, 2, 3].map((col) => (
                    <Skeleton key={col} className="h-4 flex-1" />
                  ))}

                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          <div className="md:hidden divide-y divide-gray-100">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-12 rounded-lg" />
                  <Skeleton className="h-12 rounded-lg" />
                </div>

                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1 rounded-xl" />
                  <Skeleton className="h-10 w-28 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function MembersPage() {
  const router = useRouter();

  const [gym, setGym] = useState(null);
  const [plans, setPlans] = useState([]);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Search and filters
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // Modal states
  const [showAdd, setShowAdd] = useState(false);
  const [renewMember, setRenewMember] = useState(null);

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
  const [renewError, setRenewError] = useState("");

  async function loadMembers() {
    const { data, error } = await supabase
      .from("members")
      .select("*, plans(name)")
      .order("expiry_date", { ascending: true });

    if (error) {
      setError(error.message);
      return;
    }

    setMembers(data || []);
  }

  useEffect(() => {
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/");
        return;
      }

      const { data: g, error: gErr } = await supabase
        .from("gyms")
        .select("*")
        .limit(1)
        .single();

      if (gErr) setError(gErr.message);
      setGym(g);

      const { data: p, error: pErr } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("duration_days");

      if (pErr) setError(pErr.message);
      setPlans(p || []);

      await loadMembers();
      setLoading(false);
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function resetAddForm() {
    setName("");
    setPhone("");
    setPlanId("");
    setAmount("");
    setMode("cash");
    setError("");
  }

  function onPlanChange(id) {
    setPlanId(id);

    const plan = plans.find((p) => String(p.id) === String(id));

    if (plan) setAmount(String(plan.price));
  }

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

    if (!/^\d{10}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setSaving(true);

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
      setSaving(false);
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

    setSaving(false);

    if (pErr) {
      setError("Member saved, but payment failed: " + pErr.message);
      await loadMembers();
      return;
    }

    resetAddForm();
    setShowAdd(false);
    await loadMembers();
  }

  function openRenew(member) {
    setRenewError("");
    setRenewMember(member);

    const plan =
      plans.find((p) => String(p.id) === String(member.plan_id)) || plans[0];

    setRPlanId(plan ? String(plan.id) : "");
    setRAmount(plan ? String(plan.price) : "");
    setRMode("cash");
  }

  function onRenewPlanChange(id) {
    setRPlanId(id);

    const plan = plans.find((p) => String(p.id) === String(id));

    if (plan) setRAmount(String(plan.price));
  }

  async function renew(e) {
    e.preventDefault();
    setRenewError("");

    if (!renewMember || !gym?.id) return;

    const plan = plans.find((p) => String(p.id) === String(rPlanId));

    if (!plan) {
      setRenewError("Please select a valid plan.");
      return;
    }

    setSaving(true);

    const left = daysLeft(renewMember.expiry_date);

    // Extend active memberships from existing expiry.
    // Expired memberships start from today.
    const base = left !== null && left >= 0 ? renewMember.expiry_date : today();

    const newExpiry = addDays(base, plan.duration_days);

    const { error: pErr } = await supabase.from("payments").insert({
      gym_id: gym.id,
      member_id: renewMember.id,
      plan_id: plan.id,
      amount: Number(rAmount),
      paid_on: today(),
      mode: rMode,
    });

    if (pErr) {
      setSaving(false);
      setRenewError(pErr.message);
      return;
    }

    const { error: uErr } = await supabase
      .from("members")
      .update({
        expiry_date: newExpiry,
        plan_id: plan.id,
      })
      .eq("id", renewMember.id);

    setSaving(false);

    if (uErr) {
      setRenewError(
        "Payment saved, but membership update failed: " + uErr.message,
      );
      await loadMembers();
      return;
    }

    setRenewMember(null);
    await loadMembers();
  }

  if (loading) {
    return <MembersSkeleton />;
  }

  const activeRate = stats.total
    ? Math.round((stats.active / stats.total) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#F5F7F6]">
      {/* Top header */}
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#EEF4E8] text-[#52772D] flex items-center justify-center shrink-0">
            <Dumbbell size={20} />
          </div>

          <div className="min-w-0">
            <p className="font-bold text-[#17211A] text-sm sm:text-base truncate">
              {gym?.name || "Gym Dashboard"}
            </p>
            <p className="text-[11px] text-gray-400">Gym Pilot Management</p>
          </div>
        </div>

        <button
          onClick={() => {
            resetAddForm();
            setShowAdd(true);
          }}
          className="inline-flex items-center gap-2 bg-[#8BC34A] hover:bg-[#9BD45A] text-[#17211A] px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm shrink-0"
        >
          <Plus size={17} />
          Add member
        </button>
      </header>

      <div className="p-4 sm:p-6 lg:p-10 max-w-[1500px] mx-auto space-y-7">
        {/* Welcome banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#17211A] via-[#203326] to-[#304B32] p-6 sm:p-8 lg:p-9 text-white shadow-lg shadow-[#17211A]/10">
          <div className="absolute -right-12 -top-20 w-64 h-64 rounded-full border-[32px] border-white/[0.04]" />
          <div className="absolute right-20 -bottom-32 w-64 h-64 rounded-full border-[32px] border-[#8BC34A]/10" />

          <div className="absolute right-10 top-8 text-[#A4D66B]/15 hidden md:block">
            <Users size={125} strokeWidth={1} />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-1.5 text-xs text-[#C8E6A0] font-medium mb-4">
              <Sparkles size={14} />
              Member management
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Your gym community
            </h1>

            <p className="text-sm text-white/65 mt-3 max-w-xl leading-relaxed">
              Manage your members, keep track of membership status and make
              renewals easier.
            </p>

            <div className="flex flex-wrap gap-3 mt-7">
              <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 min-w-[120px]">
                <p className="text-xs text-white/55">Total members</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 min-w-[120px]">
                <p className="text-xs text-white/55">Active members</p>
                <p className="text-2xl font-bold text-[#A4D66B] mt-1">
                  {stats.active}
                </p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 min-w-[120px]">
                <p className="text-xs text-white/55">Need attention</p>
                <p className="text-2xl font-bold text-orange-300 mt-1">
                  {stats.expiring + stats.expired}
                </p>
              </div>
            </div>
          </div>
        </section>

        {error && !showAdd && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#17211A]">
                Member overview
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                A quick look at your gym community
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-[#EEF4E8] text-[#668B3D] px-3 py-2 rounded-full text-xs font-semibold">
              <Activity size={14} />
              {activeRate}% active
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Total Members"
              value={stats.total}
              icon={Users}
              color="text-blue-600"
              bg="bg-blue-50"
              accent="bg-blue-500"
              subtitle="All registered members"
            />

            <StatCard
              title="Active Members"
              value={stats.active}
              icon={UserCheck}
              color="text-[#5B9131]"
              bg="bg-[#EEF6E7]"
              accent="bg-[#8BC34A]"
              subtitle="Membership currently valid"
            />

            <StatCard
              title="Expiring Soon"
              value={stats.expiring}
              icon={Clock}
              color="text-orange-600"
              bg="bg-orange-50"
              accent="bg-orange-500"
              subtitle="Expiring within 7 days"
            />

            <StatCard
              title="Expired Members"
              value={stats.expired}
              icon={UserX}
              color="text-red-600"
              bg="bg-red-50"
              accent="bg-red-500"
              subtitle="Renewal required"
            />
          </div>
        </section>

        {/* Members table */}
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {/* Table heading and filters */}
          <div className="p-5 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#EEF4E8] text-[#52772D] flex items-center justify-center">
                    <Users size={18} />
                  </div>
                  <h2 className="font-bold text-[#17211A] text-lg">
                    All members
                  </h2>
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  Showing {filteredMembers.length} of {members.length} members
                </p>
              </div>

              <div className="relative w-full lg:w-80">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or phone..."
                  className="w-full pl-11 pr-4 py-3 bg-[#F7F9F7] border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/15 transition"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mt-6 overflow-x-auto pb-1">
              {["All", "Active", "Expiring", "Expired"].map((item) => {
                const count =
                  item === "All"
                    ? stats.total
                    : item === "Active"
                      ? stats.active
                      : item === "Expiring"
                        ? stats.expiring
                        : stats.expired;

                return (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                      filter === item
                        ? "bg-[#17211A] text-white shadow-sm"
                        : "bg-[#F5F7F6] text-gray-600 hover:bg-[#EEF4E8] hover:text-[#52772D]"
                    }`}
                  >
                    {item}
                    <span className="ml-2 opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F7F9F7]">
                <tr className="text-[11px] uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-bold">Member</th>
                  <th className="px-6 py-4 font-bold">Membership</th>
                  <th className="px-6 py-4 font-bold">Join date</th>
                  <th className="px-6 py-4 font-bold">Expiry date</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredMembers.map((member) => {
                  const left = daysLeft(member.expiry_date);

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-[#F8FBF5] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#EEF4E8] text-[#52772D] flex items-center justify-center font-bold text-sm shrink-0">
                            {member.name?.charAt(0)?.toUpperCase() || "M"}
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900">
                              {member.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {member.phone}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <CreditCard size={15} />
                          </div>
                          <p className="text-sm font-medium text-gray-800">
                            {member.plans?.name || "No plan"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(member.join_date)}
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">
                          {formatDate(member.expiry_date)}
                        </p>

                        {left !== null && (
                          <p className="text-xs text-gray-400 mt-1">
                            {left < 0
                              ? `${Math.abs(left)} days overdue`
                              : left === 0
                                ? "Expires today"
                                : `${left} days remaining`}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge expiry={member.expiry_date} />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openRenew(member)}
                            className="flex items-center gap-1.5 bg-[#17211A] text-white hover:bg-[#304B32] px-3 py-2 rounded-lg text-xs font-semibold transition"
                          >
                            <RefreshCw size={14} />
                            Renew
                          </button>

                          <a
                            href={waLink(
                              member.phone,
                              member.name,
                              member.expiry_date,
                            )}
                            target="_blank"
                            rel="noreferrer"
                            title="WhatsApp reminder"
                            className="p-2.5 rounded-lg border border-gray-200 text-green-600 hover:bg-green-50 hover:border-green-200 transition"
                          >
                            <MessageCircle size={17} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile member cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredMembers.map((member) => {
              const left = daysLeft(member.expiry_date);

              return (
                <div
                  key={member.id}
                  className="p-4 sm:p-5 space-y-4 hover:bg-[#FAFCF9] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#EEF4E8] text-[#52772D] flex items-center justify-center font-bold shrink-0">
                      {member.name?.charAt(0)?.toUpperCase() || "M"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {member.phone}
                      </p>
                    </div>

                    <StatusBadge expiry={member.expiry_date} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-[#F8FAF7] rounded-xl p-3">
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium">
                        Membership
                      </p>
                      <p className="font-semibold text-sm text-gray-800 mt-1">
                        {member.plans?.name || "No plan"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-gray-400 font-medium">
                        Expiry date
                      </p>
                      <p className="font-semibold text-sm text-gray-800 mt-1">
                        {formatDate(member.expiry_date)}
                      </p>
                    </div>
                  </div>

                  {left !== null && (
                    <p
                      className={`text-xs font-medium ${
                        left < 0
                          ? "text-red-600"
                          : left <= 7
                            ? "text-orange-600"
                            : "text-gray-500"
                      }`}
                    >
                      {left < 0
                        ? `${Math.abs(left)} days overdue`
                        : left === 0
                          ? "Expires today"
                          : `${left} days remaining`}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => openRenew(member)}
                      className="flex-1 flex justify-center items-center gap-2 bg-[#17211A] hover:bg-[#304B32] text-white py-2.5 rounded-xl text-sm font-semibold transition"
                    >
                      <RefreshCw size={15} />
                      Renew
                    </button>

                    <a
                      href={waLink(
                        member.phone,
                        member.name,
                        member.expiry_date,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 px-4 border border-gray-200 rounded-xl text-green-600 hover:bg-green-50 transition text-sm font-medium"
                    >
                      <MessageCircle size={17} />
                      WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {filteredMembers.length === 0 && (
            <div className="py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#EEF4E8] text-[#719A43] flex items-center justify-center mx-auto mb-4">
                <Users size={28} />
              </div>

              <h3 className="font-bold text-[#17211A]">
                {search || filter !== "All"
                  ? "No matching members"
                  : "No members yet"}
              </h3>

              <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                {search || filter !== "All"
                  ? "Try changing your search or filters to find members."
                  : "Add your first member and start managing your gym community."}
              </p>

              {!search && filter === "All" && (
                <button
                  onClick={() => {
                    resetAddForm();
                    setShowAdd(true);
                  }}
                  className="inline-flex items-center gap-2 mt-5 bg-[#17211A] hover:bg-[#304B32] text-white px-5 py-3 rounded-xl text-sm font-semibold transition"
                >
                  <Plus size={17} />
                  Add first member
                </button>
              )}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400 pt-1 pb-4">
          <p>Gym Pilot · Gym Management</p>
          <p className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8BC34A]" />
            Built to keep your gym moving
          </p>
        </footer>
      </div>

      {/* ADD MEMBER MODAL */}
      {showAdd && (
        <Modal
          title="Add new member"
          subtitle="Register a member and record their first payment."
          onClose={() => {
            setShowAdd(false);
            resetAddForm();
          }}
        >
          <form onSubmit={addMember} className="space-y-5">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-[#719A43] mb-4">
                01 · Member information
              </p>

              <div className="space-y-4">
                <Field label="Full name">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter member name"
                    className={inputClass}
                    required
                  />
                </Field>

                <Field label="Phone number">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className={inputClass}
                    required
                  />
                </Field>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <p className="text-[11px] uppercase tracking-wider font-bold text-[#719A43] mb-4">
                02 · Membership details
              </p>

              <Field label="Select membership plan">
                <select
                  value={planId}
                  onChange={(e) => onPlanChange(e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">Choose a plan</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} · {plan.duration_days} days · ₹{plan.price}
                    </option>
                  ))}
                </select>
              </Field>

              {planId && (
                <div className="mt-3 p-4 bg-[#F3F8ED] border border-[#E4EED9] rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Membership expiry</p>
                    <p className="text-sm font-bold text-[#17211A] mt-1">
                      {formatDate(
                        addDays(
                          today(),
                          plans.find(
                            (plan) => String(plan.id) === String(planId),
                          )?.duration_days || 0,
                        ),
                      )}
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-white text-[#719A43] flex items-center justify-center">
                    <CalendarDays size={20} />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-5">
              <p className="text-[11px] uppercase tracking-wider font-bold text-[#719A43] mb-4">
                03 · First payment
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Amount (₹)">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount"
                    className={inputClass}
                    required
                  />
                </Field>

                <Field label="Payment method">
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className={inputClass}
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
              </div>
            </div>

            {error && (
              <p className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm">
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  resetAddForm();
                }}
                className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                disabled={saving || !plans.length}
                className="flex-1 inline-flex justify-center items-center gap-2 bg-[#17211A] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#304B32] disabled:opacity-50 transition"
              >
                <Plus size={16} />
                {saving ? "Saving..." : "Add member"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* RENEW MEMBERSHIP MODAL */}
      {renewMember && (
        <Modal
          title="Renew membership"
          subtitle={`Update the membership for ${renewMember.name}.`}
          onClose={() => setRenewMember(null)}
        >
          <form onSubmit={renew} className="space-y-5">
            <div className="bg-[#F7F9F7] border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#EEF4E8] text-[#52772D] flex items-center justify-center font-bold">
                  {renewMember.name?.charAt(0)?.toUpperCase() || "M"}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 truncate">
                    {renewMember.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {renewMember.phone}
                  </p>
                </div>

                <StatusBadge expiry={renewMember.expiry_date} />
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Current expiry</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {formatDate(renewMember.expiry_date)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">Current plan</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {renewMember.plans?.name || "No plan"}
                  </p>
                </div>
              </div>
            </div>

            <Field label="New membership plan">
              <select
                value={rPlanId}
                onChange={(e) => onRenewPlanChange(e.target.value)}
                className={inputClass}
                required
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} · {plan.duration_days} days · ₹{plan.price}
                  </option>
                ))}
              </select>
            </Field>

            {rPlanId && (
              <div className="bg-[#F3F8ED] border border-[#E4EED9] rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">New expiry date</p>
                  <p className="text-sm font-bold text-[#17211A] mt-1">
                    {formatDate(
                      addDays(
                        (() => {
                          const left = daysLeft(renewMember.expiry_date);
                          return left !== null && left >= 0
                            ? renewMember.expiry_date
                            : today();
                        })(),
                        plans.find(
                          (plan) => String(plan.id) === String(rPlanId),
                        )?.duration_days || 0,
                      ),
                    )}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-white text-[#719A43] flex items-center justify-center">
                  <CalendarDays size={20} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Amount (₹)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={rAmount}
                  onChange={(e) => setRAmount(e.target.value)}
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Payment method">
                <select
                  value={rMode}
                  onChange={(e) => setRMode(e.target.value)}
                  className={inputClass}
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="other">Other</option>
                </select>
              </Field>
            </div>

            {renewError && (
              <p className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm">
                {renewError}
              </p>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRenewMember(null)}
                className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                disabled={saving || !plans.length}
                className="flex-1 inline-flex justify-center items-center gap-2 bg-[#17211A] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#304B32] disabled:opacity-50 transition"
              >
                <RefreshCw size={16} />
                {saving ? "Processing..." : "Confirm renewal"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
