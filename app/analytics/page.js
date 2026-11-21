
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import RevenueStats from "@/components/analytics/RevenueStats";
import RevenueChart from "@/components/analytics/RevenueChart";
import PeriodComparison from "@/components/analytics/PeriodComparison";
import PaymentBreakdown from "@/components/analytics/PaymentBreakdown";

import {
  IndianRupee,
  ReceiptText,
  Calculator,
  Trophy,
  RefreshCw,
} from "lucide-react";

function getLocalDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthKey(date) {
  return (date || "").slice(0, 7);
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function getMonthName(date) {
  return new Date(`${date}-01T00:00:00`).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function getPaymentTotal(payments) {
  return payments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0,
  );
}

function getChartData(payments, range, today, selectedMonth, selectedYear) {
  if (!today) return [];

  const currentYear = Number(today.slice(0, 4));
  const currentMonth = Number(today.slice(5, 7));
  const currentDay = Number(today.slice(8, 10));

  if (range === "month") {
    const year = Number(selectedYear);
    const month = Number(selectedMonth);

    const monthKey = `${year}-${String(month).padStart(2, "0")}`;

    const daysInMonth = new Date(year, month, 0).getDate();

    const isCurrentMonth = monthKey === today.slice(0, 7);

    const totalDays = isCurrentMonth
      ? currentDay
      : daysInMonth;

    return Array.from({ length: totalDays }, (_, index) => {
      const day = index + 1;

      const date = `${monthKey}-${String(day).padStart(2, "0")}`;

      const value = payments
        .filter((payment) => payment.paid_on === date)
        .reduce(
          (sum, payment) => sum + Number(payment.amount || 0),
          0,
        );

      return {
        label: String(day),
        value,
      };
    });
  }

  if (range === "year") {
    const year = Number(selectedYear);

    const totalMonths = year === currentYear
      ? currentMonth
      : 12;

    return Array.from({ length: totalMonths }, (_, index) => {
      const month = String(index + 1).padStart(2, "0");
      const key = `${year}-${month}`;

      const value = payments
        .filter((payment) => getMonthKey(payment.paid_on) === key)
        .reduce(
          (sum, payment) => sum + Number(payment.amount || 0),
          0,
        );

      return {
        label: new Date(`${key}-01T00:00:00`).toLocaleDateString(
          "en-IN",
          { month: "short" },
        ),
        value,
      };
    });
  }

  const years = payments
    .map((payment) => Number((payment.paid_on || "").slice(0, 4)))
    .filter((year) => Number.isFinite(year) && year > 0);

  const firstYear = years.length
    ? Math.min(...years)
    : currentYear;

  return Array.from(
    { length: currentYear - firstYear + 1 },
    (_, index) => {
      const year = firstYear + index;

      const value = payments
        .filter((payment) => payment.paid_on?.startsWith(String(year)))
        .reduce(
          (sum, payment) => sum + Number(payment.amount || 0),
          0,
        );

      return {
        label: String(year),
        value,
      };
    },
  );
}

function InsightCard({ icon: Icon, label, value, description }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#EEF4E8] text-[#52772D] flex items-center justify-center">
          <Icon size={19} />
        </div>

        <p className="text-sm font-medium text-gray-500">{label}</p>
      </div>

      <h3 className="text-xl font-bold text-[#17211A] mt-4">
        {value}
      </h3>

      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
  );
}

function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-xl w-64" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 bg-gray-100 rounded-2xl" />
        ))}
      </div>

      <div className="h-80 bg-gray-100 rounded-2xl" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="h-72 bg-gray-100 rounded-2xl" />
        <div className="h-72 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [payments, setPayments] = useState([]);

  const [range, setRange] = useState("month");

  const [today, setToday] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("01");
  const [selectedYear, setSelectedYear] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Initialize current date after mounting.
  useEffect(() => {
    const currentDate = getLocalDate();

    setToday(currentDate);
    setSelectedMonth(currentDate.slice(5, 7));
    setSelectedYear(Number(currentDate.slice(0, 4)));
  }, []);

  async function loadAnalytics(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        throw new Error("Please log in to view analytics.");
      }

      const { data: gymData, error: gymError } = await supabase
        .from("gyms")
        .select("*")
        .limit(1)
        .single();

      if (gymError) throw gymError;

      // Fetch all payment rows in batches.
      const pageSize = 1000;

      let allPayments = [];
      let from = 0;

      while (true) {
        const { data, error: paymentError } = await supabase
          .from("payments")
          .select("id, gym_id, amount, paid_on, mode, member_id, plan_id")
          .eq("gym_id", gymData.id)
          .order("paid_on", { ascending: true })
          .order("id", { ascending: true })
          .range(from, from + pageSize - 1);

        if (paymentError) throw paymentError;

        allPayments = [...allPayments, ...(data || [])];

        if (!data || data.length < pageSize) break;

        from += pageSize;
      }

      setPayments(allPayments);
    } catch (err) {
      console.error("Analytics error:", err);
      setError(err.message || "Unable to load analytics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  // Available years from recorded payment history + current year.
  const availableYears = useMemo(() => {
    if (!today) return [];

    const currentYear = Number(today.slice(0, 4));

    const years = payments
      .map((payment) => Number((payment.paid_on || "").slice(0, 4)))
      .filter(
        (year) =>
          Number.isFinite(year) &&
          year > 0 &&
          year <= currentYear,
      );

    return [...new Set([...years, currentYear])].sort(
      (a, b) => b - a,
    );
  }, [payments, today]);

  // Fixed overview cards.
  const stats = useMemo(() => {
    if (!today) {
      return {
        today: 0,
        month: 0,
        year: 0,
        lifetime: getPaymentTotal(payments),
      };
    }

    const currentMonth = today.slice(0, 7);
    const currentYear = today.slice(0, 4);

    return {
      today: getPaymentTotal(
        payments.filter((payment) => payment.paid_on === today),
      ),

      month: getPaymentTotal(
        payments.filter((payment) =>
          payment.paid_on?.startsWith(currentMonth),
        ),
      ),

      year: getPaymentTotal(
        payments.filter((payment) =>
          payment.paid_on?.startsWith(currentYear),
        ),
      ),

      lifetime: getPaymentTotal(payments),
    };
  }, [payments, today]);

  // Payments for the selected month, year or lifetime.
  const selectedPayments = useMemo(() => {
    if (range === "month") {
      const monthKey = `${selectedYear}-${selectedMonth}`;

      return payments.filter((payment) =>
        payment.paid_on?.startsWith(monthKey),
      );
    }

    if (range === "year") {
      return payments.filter((payment) =>
        payment.paid_on?.startsWith(String(selectedYear)),
      );
    }

    return payments;
  }, [payments, range, selectedMonth, selectedYear]);

  // Chart changes according to selected period.
  const chartData = useMemo(
    () =>
      getChartData(
        selectedPayments,
        range,
        today,
        selectedMonth,
        selectedYear,
      ),
    [selectedPayments, range, today, selectedMonth, selectedYear],
  );

  // Insights update according to selected period.
  const insights = useMemo(() => {
    const total = getPaymentTotal(selectedPayments);
    const count = selectedPayments.length;
    const average = count > 0 ? total / count : 0;

    // Best earning month across all recorded history.
    const monthlyTotals = {};

    payments.forEach((payment) => {
      const key = getMonthKey(payment.paid_on);

      if (!key) return;

      monthlyTotals[key] =
        (monthlyTotals[key] || 0) + Number(payment.amount || 0);
    });

    const bestMonth = Object.entries(monthlyTotals).sort(
      (a, b) => b[1] - a[1],
    )[0];

    return {
      count,
      average,
      bestMonth: bestMonth
        ? {
            label: getMonthName(bestMonth[0]),
            amount: bestMonth[1],
          }
        : null,
    };
  }, [payments, selectedPayments]);

  if (loading || !today) {
    return (
      <main className="min-h-screen bg-[#F5F7F6] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <AnalyticsLoading />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#F5F7F6] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto bg-white border border-red-100 rounded-2xl p-8 text-center">
          <p className="font-semibold text-red-600">{error}</p>

          <button
            onClick={() => loadAnalytics()}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 bg-[#17211A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen mt-16 md:mt-0 bg-[#F5F7F6] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-end">
          <button
            onClick={() => loadAnalytics(true)}
            disabled={refreshing}
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#52772D] disabled:opacity-50 transition"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh data
          </button>
        </div>

        <AnalyticsHeader
          range={range}
          setRange={setRange}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          availableYears={availableYears}
        />

        <RevenueStats stats={stats} />

        <RevenueChart data={chartData} range={range} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <PeriodComparison payments={payments} />

          <PaymentBreakdown payments={selectedPayments} />
        </div>

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#17211A]">
              Collection Insights
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Insights for the selected period.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <InsightCard
              icon={ReceiptText}
              label="Total Transactions"
              value={insights.count.toLocaleString("en-IN")}
              description="Payments in selected period"
            />

            <InsightCard
              icon={Calculator}
              label="Average Payment"
              value={formatCurrency(insights.average)}
              description="Average collection per payment"
            />

            <InsightCard
              icon={IndianRupee}
              label="Selected Revenue"
              value={formatCurrency(getPaymentTotal(selectedPayments))}
              description="Total collection in selected period"
            />

            <InsightCard
              icon={Trophy}
              label="Best Earning Month"
              value={
                insights.bestMonth
                  ? formatCurrency(insights.bestMonth.amount)
                  : "—"
              }
              description={
                insights.bestMonth
                  ? insights.bestMonth.label
                  : "No payment history yet"
              }
            />
          </div>
        </section>

        <p className="text-xs text-gray-400 text-center pb-4">
          Revenue is calculated from recorded payments. It does not include
          unpaid membership fees or operating expenses.
        </p>
      </div>
    </main>
  );
}
