"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import ProfitSummary from "@/components/analytics/ProfitSummary";
import RevenueChart from "@/components/analytics/RevenueChart";
import PaymentBreakdown from "@/components/analytics/PaymentBreakdown";
import ExpenseBreakdown from "@/components/analytics/ExpenseBreakdown";
import ExpenseManager from "@/components/analytics/ExpenseManager";
import PeriodComparison from "@/components/analytics/PeriodComparison";
import {
  Calculator,
  ReceiptText,
  RefreshCw,
  TrendingDown,
  Trophy,
} from "lucide-react";

const pad = (n) => String(n).padStart(2, "0");

function getLocalDate() {
  const now = new Date();

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function getMonthKey(date) {
  return (date || "").slice(0, 7);
}

function formatCurrency(value) {
  const n = Number(value || 0);

  return `${n < 0 ? "-" : ""}₹${Math.abs(n).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function getMonthName(key) {
  return new Date(`${key}-01T00:00:00`).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function sumAmounts(rows) {
  return rows.reduce((total, row) => total + Number(row.amount || 0), 0);
}

function totalsByKey(rows, length) {
  const map = {};

  rows.forEach((row) => {
    const key = (row.paid_on || "").slice(0, length);

    if (!key) return;

    map[key] = (map[key] || 0) + Number(row.amount || 0);
  });

  return map;
}

// Income and expense per day (month view), month (year view) or year (lifetime).
function buildChartData(
  payments,
  expenses,
  range,
  today,
  selectedMonth,
  selectedYear,
) {
  if (!today) return [];

  const currentYear = Number(today.slice(0, 4));
  const currentMonth = Number(today.slice(5, 7));
  const currentDay = Number(today.slice(8, 10));

  if (range === "month") {
    const year = Number(selectedYear);
    const month = Number(selectedMonth);
    const monthKey = `${year}-${pad(month)}`;

    const daysInMonth = new Date(year, month, 0).getDate();
    const totalDays = monthKey === today.slice(0, 7) ? currentDay : daysInMonth;

    const income = totalsByKey(payments, 10);
    const spent = totalsByKey(expenses, 10);
    const monthShort = new Date(year, month - 1, 1).toLocaleDateString(
      "en-IN",
      { month: "short" },
    );

    return Array.from({ length: totalDays }, (_, index) => {
      const day = index + 1;
      const date = `${monthKey}-${pad(day)}`;

      return {
        label: String(day),
        fullLabel: `${day} ${monthShort} ${year}`,
        income: income[date] || 0,
        expense: spent[date] || 0,
      };
    });
  }

  if (range === "year") {
    const year = Number(selectedYear);
    const totalMonths = year === currentYear ? currentMonth : 12;

    const income = totalsByKey(payments, 7);
    const spent = totalsByKey(expenses, 7);

    return Array.from({ length: totalMonths }, (_, index) => {
      const key = `${year}-${pad(index + 1)}`;
      const date = new Date(`${key}-01T00:00:00`);

      return {
        label: date.toLocaleDateString("en-IN", { month: "short" }),
        fullLabel: date.toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        }),
        income: income[key] || 0,
        expense: spent[key] || 0,
      };
    });
  }

  const years = [...payments, ...expenses]
    .map((row) => Number((row.paid_on || "").slice(0, 4)))
    .filter((year) => Number.isFinite(year) && year > 0);

  const firstYear = years.length ? Math.min(...years) : currentYear;
  const income = totalsByKey(payments, 4);
  const spent = totalsByKey(expenses, 4);

  return Array.from({ length: currentYear - firstYear + 1 }, (_, index) => {
    const year = String(firstYear + index);

    return {
      label: year,
      fullLabel: year,
      income: income[year] || 0,
      expense: spent[year] || 0,
    };
  });
}

async function fetchAllRows(table, columns, gymId) {
  const pageSize = 1000;
  let rows = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .eq("gym_id", gymId)
      .order("paid_on", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw error;

    rows = [...rows, ...(data || [])];
    if (!data || data.length < pageSize) break;
    from += pageSize;
  }

  return rows;
}

function filterByRange(rows, range, selectedMonth, selectedYear) {
  if (range === "month") {
    const key = `${selectedYear}-${selectedMonth}`;
    return rows.filter((r) => r.paid_on?.startsWith(key));
  }
  if (range === "year") {
    return rows.filter((r) => r.paid_on?.startsWith(String(selectedYear)));
  }
  return rows;
}

// Rows for the period before the selected one. When the selected period is
// still running, only the same elapsed days are compared so the numbers are fair.
// Returns null for lifetime, which has nothing to compare against.
function getPreviousRows(rows, range, selectedMonth, selectedYear, today) {
  if (!today) return null;

  const year = Number(selectedYear);

  if (range === "month") {
    const month = Number(selectedMonth);
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prefix = `${prevYear}-${pad(prevMonth)}`;

    const isCurrent = `${year}-${pad(month)}` === today.slice(0, 7);
    const dayCap = today.slice(8, 10);

    return rows.filter(
      (r) =>
        r.paid_on?.startsWith(prefix) &&
        (!isCurrent || r.paid_on.slice(8, 10) <= dayCap),
    );
  }

  if (range === "year") {
    const prefix = String(year - 1);
    const isCurrent = year === Number(today.slice(0, 4));
    const cap = today.slice(5);

    return rows.filter(
      (r) =>
        r.paid_on?.startsWith(prefix) &&
        (!isCurrent || r.paid_on.slice(5) <= cap),
    );
  }

  return null;
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

      <h3 className="text-xl font-bold text-[#17211A] mt-4">{value}</h3>

      <p className="text-xs text-gray-400 mt-1 truncate">{description}</p>
    </div>
  );
}

function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-xl w-64" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
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
  const [expenses, setExpenses] = useState([]);
  const [gymId, setGymId] = useState(null);

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
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error("Please log in to view analytics.");
      }

      const { data: gymData, error: gymError } = await supabase
        .from("gyms")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1)
        .maybeSingle();

      if (gymError) throw gymError;

      if (!gymData?.id) {
        throw new Error("Gym not found.");
      }

      setGymId(gymData.id);

      const [allPayments, allExpenses] = await Promise.all([
        fetchAllRows(
          "payments",
          "id, gym_id, amount, paid_on, mode, member_id, plan_id",
          gymData.id,
        ),
        fetchAllRows(
          "expenses",
          "id, gym_id, amount, paid_on, category, paid_to, mode, note",
          gymData.id,
        ),
      ]);

      setPayments(allPayments);
      setExpenses(allExpenses);
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

  // Expense changes update local state, so there is no full re-fetch.
  const handleExpenseAdded = (row) => setExpenses((prev) => [...prev, row]);

  const handleExpenseUpdated = (row) =>
    setExpenses((prev) => prev.map((e) => (e.id === row.id ? row : e)));

  const handleExpenseDeleted = (id) =>
    setExpenses((prev) => prev.filter((e) => e.id !== id));

  // Years that have any payment or expense, plus the current year.
  const availableYears = useMemo(() => {
    if (!today) return [];

    const currentYear = Number(today.slice(0, 4));

    const years = [...payments, ...expenses]
      .map((record) => Number((record.paid_on || "").slice(0, 4)))
      .filter(
        (year) => Number.isFinite(year) && year > 0 && year <= currentYear,
      );

    return [...new Set([...years, currentYear])].sort((a, b) => b - a);
  }, [payments, expenses, today]);

  const selectedPayments = useMemo(
    () => filterByRange(payments, range, selectedMonth, selectedYear),
    [payments, range, selectedMonth, selectedYear],
  );

  const selectedExpenses = useMemo(
    () => filterByRange(expenses, range, selectedMonth, selectedYear),
    [expenses, range, selectedMonth, selectedYear],
  );

  const periodLabel = useMemo(() => {
    if (range === "month")
      return getMonthName(`${selectedYear}-${selectedMonth}`);
    if (range === "year") return String(selectedYear);
    return "Lifetime";
  }, [range, selectedMonth, selectedYear]);

  // Totals for the selected period and the one before it, computed once.
  const summary = useMemo(() => {
    const income = sumAmounts(selectedPayments);
    const expense = sumAmounts(selectedExpenses);

    const prevPayments = getPreviousRows(
      payments,
      range,
      selectedMonth,
      selectedYear,
      today,
    );
    const prevExpenses = getPreviousRows(
      expenses,
      range,
      selectedMonth,
      selectedYear,
      today,
    );

    const hasPrev = prevPayments !== null && prevExpenses !== null;

    let comparisonLabel = null;

    if (hasPrev && range === "month") {
      comparisonLabel =
        `${selectedYear}-${pad(Number(selectedMonth))}` === today.slice(0, 7)
          ? "vs same days last month"
          : "vs previous month";
    } else if (hasPrev && range === "year") {
      comparisonLabel =
        Number(selectedYear) === Number(today.slice(0, 4))
          ? "vs same period last year"
          : "vs previous year";
    }

    return {
      income,
      expense,
      net: income - expense,
      prevIncome: hasPrev ? sumAmounts(prevPayments) : null,
      prevExpense: hasPrev ? sumAmounts(prevExpenses) : null,
      comparisonLabel,
    };
  }, [
    selectedPayments,
    selectedExpenses,
    payments,
    expenses,
    range,
    selectedMonth,
    selectedYear,
    today,
  ]);

  const chartData = useMemo(
    () =>
      buildChartData(
        selectedPayments,
        selectedExpenses,
        range,
        today,
        selectedMonth,
        selectedYear,
      ),
    [selectedPayments, selectedExpenses, range, today, selectedMonth, selectedYear],
  );

  const insights = useMemo(() => {
    const count = selectedPayments.length;
    const average = count > 0 ? summary.income / count : 0;

    const biggestExpense = selectedExpenses.reduce(
      (max, e) =>
        Number(e.amount || 0) > Number(max?.amount || 0) ? e : max,
      null,
    );

    // Best profit month across all recorded history.
    const monthlyNet = {};

    payments.forEach((p) => {
      const key = getMonthKey(p.paid_on);
      if (!key) return;
      monthlyNet[key] = (monthlyNet[key] || 0) + Number(p.amount || 0);
    });

    expenses.forEach((e) => {
      const key = getMonthKey(e.paid_on);
      if (!key) return;
      monthlyNet[key] = (monthlyNet[key] || 0) - Number(e.amount || 0);
    });

    const best = Object.entries(monthlyNet).sort((a, b) => b[1] - a[1])[0];

    return {
      count,
      average,
      biggestExpense,
      bestMonth: best ? { label: getMonthName(best[0]), amount: best[1] } : null,
    };
  }, [payments, expenses, selectedPayments, selectedExpenses, summary.income]);

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
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
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

        <ProfitSummary
          income={summary.income}
          expense={summary.expense}
          prevIncome={summary.prevIncome}
          prevExpense={summary.prevExpense}
          comparisonLabel={summary.comparisonLabel}
          label={`Income vs expenses · ${periodLabel}`}
        />

       



        <ExpenseManager
          gymId={gymId}
          expenses={selectedExpenses}
          today={today}
          periodLabel={periodLabel}
          onAdded={handleExpenseAdded}
          onUpdated={handleExpenseUpdated}
          onDeleted={handleExpenseDeleted}
        />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <PaymentBreakdown
            payments={selectedPayments}
            expenses={selectedExpenses}
            periodLabel={periodLabel}
          />
          <ExpenseBreakdown
            expenses={selectedExpenses}
            periodLabel={periodLabel}
          />
        </div>
         <RevenueChart data={chartData} range={range} />

        <PeriodComparison
          payments={payments}
          expenses={expenses}
          today={today}
        />

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#17211A]">Quick Insights</h2>

            <p className="text-sm text-gray-500 mt-1">
              Insights for {periodLabel.toLowerCase() === "lifetime"
                ? "all recorded history"
                : periodLabel}
              .
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <InsightCard
              icon={Calculator}
              label="Average Payment"
              value={formatCurrency(insights.average)}
              description="Average collection per payment"
            />

            <InsightCard
              icon={ReceiptText}
              label="Total Transactions"
              value={insights.count.toLocaleString("en-IN")}
              description="Payments in selected period"
            />

            <InsightCard
              icon={TrendingDown}
              label="Biggest Expense"
              value={
                insights.biggestExpense
                  ? formatCurrency(insights.biggestExpense.amount)
                  : "—"
              }
              description={
                insights.biggestExpense
                  ? `${insights.biggestExpense.category || "Expense"}${
                      insights.biggestExpense.paid_to
                        ? ` → ${insights.biggestExpense.paid_to}`
                        : ""
                    }`
                  : "No expenses in selected period"
              }
            />

            <InsightCard
              icon={Trophy}
              label="Best Profit Month"
              value={
                insights.bestMonth
                  ? formatCurrency(insights.bestMonth.amount)
                  : "—"
              }
              description={
                insights.bestMonth
                  ? insights.bestMonth.label
                  : "No history yet"
              }
            />
          </div>
        </section>

        <p className="text-xs text-gray-400 text-center pb-4">
          Net profit is recorded payments minus recorded expenses. Unpaid
          membership fees are not included.
        </p>
      </div>
    </main>
  );
}