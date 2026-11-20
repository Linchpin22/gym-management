"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserX,
  Wallet,
  ArrowUpRight,
  Plus,
  Clock,
  MessageCircle,
  ChevronRight,
  CalendarDays,
  Activity,
  Dumbbell,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const pad = (n) => String(n).padStart(2, "0");

const fmt = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function daysLeft(expiry) {
  if (!expiry) return null;

  const [y, m, d] = expiry.split("-").map(Number);
  const today = new Date();
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return Math.round((new Date(y, m - 1, d) - start) / 86400000);
}

function waLink(phone, name, expiry) {
  const digits = (phone || "").replace(/\D/g, "");
  const full = digits.length === 10 ? "91" + digits : digits;

  const text = `Hi ${name}, your gym membership expires on ${expiry}. Please renew to continue. Thank you!`;

  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5F7F6]">
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-10">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </header>

      <div className="p-4 sm:p-6 lg:p-10 max-w-[1500px] mx-auto space-y-7">
        <div className="rounded-3xl bg-[#17211A] p-6 md:p-9 space-y-5">
          <Skeleton className="h-4 w-24 bg-white/10" />
          <Skeleton className="h-10 w-72 max-w-full bg-white/10" />
          <Skeleton className="h-4 w-80 max-w-full bg-white/10" />
          <Skeleton className="h-11 w-36 bg-white/10 rounded-xl" />
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
                  <Skeleton className="h-9 w-20" />
                </div>
                <Skeleton className="h-12 w-12 rounded-2xl" />
              </div>
              <Skeleton className="h-3 w-36 mt-5" />
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-60 mt-3" />
            </div>

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="p-5 flex items-center justify-between gap-4 border-b border-gray-100"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="w-11 h-11 rounded-full shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-9 w-24 rounded-lg" />
              </div>
            ))}
          </div>

          <div className="space-y-5">
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-48 mt-3" />
              <div className="space-y-3 mt-6">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            </div>

            <div className="bg-[#17211A] rounded-2xl p-6">
              <Skeleton className="h-4 w-36 bg-white/10" />
              <Skeleton className="h-10 w-24 mt-5 bg-white/10" />
              <Skeleton className="h-3 w-32 mt-2 bg-white/10" />
              <Skeleton className="h-2 w-full mt-6 bg-white/10 rounded-full" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color, bg, accent }) {
  return (
    <div className="group relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className={`absolute top-0 left-0 w-full h-1 ${accent}`} />

      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 font-medium">{title}</p>

          <h3 className="text-3xl font-bold tracking-tight text-[#17211A] mt-3">
            {value}
          </h3>
        </div>

        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${bg} group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon size={22} className={color} strokeWidth={2.1} />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-5">
        <span className={`w-1.5 h-1.5 rounded-full ${accent}`} />
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [gym, setGym] = useState(null);
  const [members, setMembers] = useState([]);
  const [collection, setCollection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
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

      const { data: m, error: mErr } = await supabase
        .from("members")
        .select("id, name, phone, expiry_date")
        .order("expiry_date");

      if (mErr) setError(mErr.message);
      setMembers(m || []);

      const now = new Date();
      const monthStart = fmt(new Date(now.getFullYear(), now.getMonth(), 1));

      const { data: pay, error: payErr } = await supabase
        .from("payments")
        .select("amount")
        .gte("paid_on", monthStart);

      if (payErr) setError(payErr.message);

      setCollection(
        (pay || []).reduce(
          (sum, payment) => sum + Number(payment.amount || 0),
          0,
        ),
      );

      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const processed = members.map((member) => ({
    ...member,
    left: daysLeft(member.expiry_date),
  }));

  const active = processed.filter(
    (member) => member.left !== null && member.left >= 0,
  );

  const expired = processed.filter(
    (member) => member.left !== null && member.left < 0,
  );

  const expiringSoon = processed
    .filter(
      (member) => member.left !== null && member.left >= 0 && member.left <= 7,
    )
    .sort((a, b) => a.left - b.left);

  const activeRate = members.length
    ? Math.round((active.length / members.length) * 100)
    : 0;

  const firstName = gym?.name || "your gym";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#F5F7F6]">
      {/* Top header */}
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#EEF4E8] text-[#52772D] flex items-center justify-center shrink-0">
            <Dumbbell size={19} />
          </div>

          <div className="min-w-0">
            <p className="font-bold text-[#17211A] text-sm sm:text-base truncate">
              {gym?.name || "Gym Dashboard"}
            </p>
            <p className="text-[11px] text-gray-400">Gym Pilot Management</p>
          </div>
        </div>

        <Link
          href="/members"
          className="inline-flex items-center gap-2 bg-[#17211A] hover:bg-[#2A3A2D] text-white px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm"
        >
          <Plus size={17} />
          <span>Add member</span>
        </Link>
      </header>

      <div className="p-4 sm:p-6 lg:p-10 max-w-[1500px] mx-auto space-y-7">
        {/* Welcome banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#17211A] via-[#203326] to-[#304B32] p-6 sm:p-8 lg:p-10 text-white shadow-lg shadow-[#17211A]/10">
          {/* Decorative elements */}
          <div className="absolute -right-16 -top-24 w-72 h-72 rounded-full border-[35px] border-white/[0.04]" />
          <div className="absolute right-12 -bottom-32 w-72 h-72 rounded-full border-[35px] border-[#8BC34A]/10" />
          <div className="absolute right-10 top-8 text-[#A4D66B]/20 hidden sm:block">
            <Dumbbell size={115} strokeWidth={1} />
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-1.5 text-xs text-[#C8E6A0] font-medium mb-5">
              <Sparkles size={14} />
              Your fitness business at a glance
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
              Welcome back
              <span className="text-[#A4D66B]"> 👋</span>
            </h1>

            <p className="text-sm sm:text-base text-white/65 mt-3 max-w-lg leading-relaxed">
              Here's what's happening at{" "}
              <span className="text-white font-semibold">{firstName}</span>.
              Keep your members engaged and your gym moving forward.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-7">
              <Link
                href="/members"
                className="inline-flex items-center gap-2 bg-[#8BC34A] hover:bg-[#9BD45A] text-[#17211A] px-5 py-3 rounded-xl text-sm font-bold transition shadow-lg shadow-black/10"
              >
                <Plus size={18} />
                Add new member
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/plans"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white px-5 py-3 rounded-xl text-sm font-medium transition"
              >
                Manage plans
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          <div className="relative z-10 mt-8 sm:mt-0 sm:absolute sm:bottom-8 sm:right-8 flex items-center gap-2 text-xs text-white/60">
            <CalendarDays size={15} className="text-[#A4D66B]" />
            {today}
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#17211A]">Gym overview</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Your membership and revenue snapshot
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-[#668B3D] bg-[#EEF4E8] rounded-full px-3 py-2 font-medium">
              <Activity size={14} />
              Live overview
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Total Members"
              value={members.length}
              subtitle="All registered members"
              icon={Users}
              color="text-blue-600"
              bg="bg-blue-50"
              accent="bg-blue-500"
            />

            <StatCard
              title="Active Members"
              value={active.length}
              subtitle="Membership currently valid"
              icon={UserCheck}
              color="text-[#5B9131]"
              bg="bg-[#EEF6E7]"
              accent="bg-[#8BC34A]"
            />

            <StatCard
              title="Expired Members"
              value={expired.length}
              subtitle="Membership renewal required"
              icon={UserX}
              color="text-red-600"
              bg="bg-red-50"
              accent="bg-red-500"
            />

            <StatCard
              title="Monthly Collection"
              value={`₹${collection.toLocaleString("en-IN")}`}
              subtitle="Payments received this month"
              icon={Wallet}
              color="text-violet-600"
              bg="bg-violet-50"
              accent="bg-violet-500"
            />
          </div>
        </section>

        {/* Main dashboard content */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Upcoming renewals */}
          <div className="xl:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[#FFF5E5] text-[#C48727] flex items-center justify-center">
                      <Clock size={18} />
                    </div>

                    <h2 className="font-bold text-[#17211A]">
                      Upcoming renewals
                    </h2>
                  </div>

                  <p className="text-sm text-gray-500 mt-2">
                    Members whose memberships expire within 7 days
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-[#FFF7E9] text-[#A66C1E] rounded-full px-3 py-1.5 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E7A83E]" />
                  {expiringSoon.length} pending
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {expiringSoon.length === 0 ? (
                <div className="py-16 px-5 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#EEF6E7] text-[#66963B] flex items-center justify-center mx-auto mb-4">
                    <UserCheck size={28} />
                  </div>

                  <p className="font-semibold text-[#17211A]">
                    All memberships are looking good!
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    No upcoming renewals in the next 7 days.
                  </p>
                </div>
              ) : (
                expiringSoon.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 sm:px-6 flex items-center justify-between gap-3 hover:bg-[#FAFCF9] transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-[#EEF4E8] flex items-center justify-center text-[#52772D] font-bold text-sm shrink-0">
                        {member.name?.charAt(0)?.toUpperCase() || "M"}
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {member.name}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {member.left === 0
                            ? "Expires today"
                            : `Expires in ${member.left} ${
                                member.left === 1 ? "day" : "days"
                              }`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`hidden sm:inline-flex px-2.5 py-1.5 rounded-lg text-[11px] font-semibold ${
                          member.left <= 2
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {member.left === 0 ? "Today" : `${member.left}d left`}
                      </span>

                      <a
                        href={waLink(
                          member.phone,
                          member.name,
                          member.expiry_date,
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-[#EAF7EC] text-[#258044] hover:bg-[#DDF1E1] px-3 py-2.5 rounded-xl text-xs font-semibold transition"
                      >
                        <MessageCircle size={15} />
                        <span>Remind</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-5 sm:px-6 py-4 bg-[#FAFBFA] border-t border-gray-100">
              <Link
                href="/members"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#52772D] hover:text-[#17211A] transition"
              >
                View all members
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Quick actions */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-[#17211A]">Quick actions</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Get things done faster
                  </p>
                </div>

                <div className="w-9 h-9 rounded-xl bg-[#EEF4E8] text-[#52772D] flex items-center justify-center">
                  <Sparkles size={17} />
                </div>
              </div>

              <div className="space-y-3 mt-5">
                <Link
                  href="/members"
                  className="flex items-center justify-between border border-gray-100 rounded-xl p-3.5 hover:border-[#B5D995] hover:bg-[#F8FBF5] transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-[#EEF4E8] text-[#587E2F] rounded-xl p-2.5 shrink-0">
                      <Users size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        Manage members
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Add or renew memberships
                      </p>
                    </div>
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="text-gray-400 group-hover:text-[#52772D] transition"
                  />
                </Link>

                <Link
                  href="/plans"
                  className="flex items-center justify-between border border-gray-100 rounded-xl p-3.5 hover:border-[#B5D995] hover:bg-[#F8FBF5] transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-blue-50 text-blue-600 rounded-xl p-2.5 shrink-0">
                      <Wallet size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        Membership plans
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Create and manage plans
                      </p>
                    </div>
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="text-gray-400 group-hover:text-[#52772D] transition"
                  />
                </Link>
              </div>
            </div>

            {/* Membership health */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#17211A] to-[#304B32] rounded-2xl p-6 text-white shadow-lg shadow-[#17211A]/10">
              <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full border-[22px] border-white/[0.05]" />
              <div className="absolute right-6 bottom-5 text-white/[0.06]">
                <TrendingUp size={85} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 text-[#B9DE8C]">
                  <Activity size={17} />
                  <p className="text-sm font-semibold">Membership health</p>
                </div>

                <div className="flex items-end gap-2 mt-5">
                  <p className="text-4xl font-bold tracking-tight">
                    {activeRate}%
                  </p>
                  <p className="text-xs text-white/55 mb-1.5">active rate</p>
                </div>

                <p className="text-xs text-white/60 mt-2">
                  {active.length} active out of {members.length} total members
                </p>

                <div className="w-full h-2.5 bg-white/15 rounded-full mt-5 overflow-hidden">
                  <div
                    className="h-full bg-[#9BD45A] rounded-full transition-all duration-700"
                    style={{ width: `${activeRate}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-3 text-[11px] text-white/50">
                  <span>Active members</span>
                  <span>{expired.length} expired</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400 pt-2 pb-4">
          <p>Gym Pilot · Gym Management</p>
          <p className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8BC34A]" />
            Built to keep your gym moving
          </p>
        </footer>
      </div>
    </div>
  );
}
