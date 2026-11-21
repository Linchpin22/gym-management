"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Activity,
  UserCheck,
  UserX,
  Users,
  Wallet,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { fmt, daysLeft } from "@/utils/dashboard";

import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatCard from "@/components/dashboard/StatCard";
import UpcomingRenewals from "@/components/dashboard/UpcomingRenewals";
import QuickActions from "@/components/dashboard/QuickActions";
import MembershipHealth from "@/components/dashboard/MembershipHealth";
import Footer from "@/components/shared/Footer";

export default function DashboardPage() {
  const router = useRouter();

  const [gym, setGym] = useState(null);
  const [members, setMembers] = useState([]);
  const [collection, setCollection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
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

        // Fetch gym
        const { data: gymData, error: gymError } = await supabase
          .from("gyms")
          .select("*")
          .limit(1)
          .single();

        if (gymError) throw gymError;

        setGym(gymData);

        // Fetch members
        const { data: memberData, error: memberError } = await supabase
          .from("members")
          .select("id, name, phone, expiry_date")
          .order("expiry_date");

        if (memberError) throw memberError;

        setMembers(memberData || []);

        // Fetch current month's payments
        const now = new Date();
        const monthStart = fmt(
          new Date(now.getFullYear(), now.getMonth(), 1),
        );

        const { data: paymentData, error: paymentError } = await supabase
          .from("payments")
          .select("amount")
          .gte("paid_on", monthStart);

        if (paymentError) throw paymentError;

        const totalCollection = (paymentData || []).reduce(
          (sum, payment) => sum + Number(payment.amount || 0),
          0,
        );

        setCollection(totalCollection);
      } catch (err) {
        console.error("Dashboard loading error:", err);
        setError(err.message || "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  // Process membership data
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
      (member) =>
        member.left !== null &&
        member.left >= 0 &&
        member.left <= 7,
    )
    .sort((a, b) => a.left - b.left);

  const activeRate = members.length
    ? Math.round((active.length / members.length) * 100)
    : 0;

  return (
    <div className="min-h-screen mt-16 md:mt-0 bg-[#F5F7F6]">
      {/* <DashboardHeader gymName={gym?.name} /> */}

      <main className="p-4 sm:p-6 lg:p-10 max-w-[1500px] mx-auto space-y-7">
        <WelcomeBanner gymName={gym?.name} />

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-[#17211A]">
                Gym Overview
              </h2>

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
          <UpcomingRenewals members={expiringSoon} />

          <div className="space-y-6">
            <QuickActions />

            <MembershipHealth
              activeRate={activeRate}
              activeCount={active.length}
              totalMembers={members.length}
              expiredCount={expired.length}
            />
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}