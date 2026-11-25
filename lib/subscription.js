// lib/subscription.js
"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// YOUR WhatsApp number for plan requests: country code first, digits only
export const UPGRADE_WHATSAPP = "918881970855";

export const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export function prettyDate(dateStr) {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Whole days from today to a YYYY-MM-DD date (local time, negative if past)
export function daysUntil(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const t = new Date();
  const start = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round((new Date(y, m - 1, d) - start) / 86400000);
}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

// key: active | ending (7 days or less) | expired | suspended
export function subscriptionState(gym) {
  if (!gym) return null;
  if (gym.is_suspended) return { key: "suspended", left: 0, text: "Suspended" };
  const left = daysUntil(gym.sub_ends_on);
  if (left < 0) return { key: "expired", left, text: "Plan ended" };
  if (left === 0) return { key: "ending", left, text: "Ends today" };
  if (left <= 7)
    return { key: "ending", left, text: `${plural(left, "day")} left` };
  return { key: "active", left, text: `${plural(left, "day")} left` };
}

export function upgradeLink(gymName, planText) {
  const text = planText
    ? `Hi, I would like to switch ${gymName} to the ${planText} plan on GymHisab.`
    : `Hi, I need help with my GymHisab plan for ${gymName}.`;
  return `https://wa.me/${UPGRADE_WHATSAPP}?text=${encodeURIComponent(text)}`;
}

// Loads the owner's gym (with its current plan) and the plans you sell.
export function useSubscription() {
  const [data, setData] = useState({
    loading: true,
    gym: null,
    plans: [],
    error: "",
  });

  const refresh = useCallback(async () => {
    const [g, p] = await Promise.all([
      supabase
        .from("gyms")
        .select(
          "id, name, sub_plan, sub_started_on, sub_ends_on, is_suspended, saas_plans(name, label, duration_days)",
        )
        .limit(1)
        .maybeSingle(),
      supabase
        .from("saas_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
    ]);
    setData({
      loading: false,
      gym: g.data ?? null,
      plans: p.data ?? [],
      error: g.error?.message || p.error?.message || "",
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...data, refresh };
}
