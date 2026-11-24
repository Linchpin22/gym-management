"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const CATEGORIES = ["Rent", "Salaries", "Electricity", "Equipment", "Maintenance", "Marketing", "Supplies", "Other"];
const MODES = ["Cash", "UPI", "Card", "Bank Transfer"];

const fmt = (v) =>
  `₹${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function ExpenseManager({ gymId, expenses, today, onChanged }) {
  const [form, setForm] = useState({
    amount: "",
    paid_on: today,
    category: "Rent",
    paid_to: "",
    mode: "Cash",
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

async function handleSubmit(e) {
  e.preventDefault();

  if (saving) return;

  setError("");

  const amount = Number(form.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    setError("Enter a valid amount.");
    return;
  }

  if (!gymId) {
    setError("Gym information is unavailable.");
    return;
  }

  setSaving(true);

  try {
    // Verify authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Session expired. Please log in again.");
    }

    // Verify gym ownership
    const { data: gymData, error: gymError } = await supabase
      .from("gyms")
      .select("id, owner_id")
      .eq("id", gymId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (gymError) {
      throw new Error(gymError.message);
    }

    if (!gymData) {
      throw new Error("You do not have access to this gym.");
    }

    // Check the existing RLS ownership function
    const { data: ownsGym, error: ownershipError } =
      await supabase.rpc("owns_gym", {
        g: gymData.id,
      });

    if (ownershipError) {
      throw new Error(ownershipError.message);
    }

    if (!ownsGym) {
      throw new Error("Gym ownership verification failed.");
    }

    const payload = {
      gym_id: gymData.id,
      amount,
      paid_on: form.paid_on,
      category: form.category,
      paid_to: form.paid_to.trim() || null,
      mode: form.mode,
      note: form.note.trim() || null,
    };

   

    const { error: insertError } = await supabase
      .from("expenses")
      .insert(payload);

    if (insertError) {
   
      throw new Error(insertError.message);
    }

    setForm((f) => ({
      ...f,
      amount: "",
      paid_to: "",
      note: "",
    }));

    await onChanged?.();

  } catch (err) {
    setError(err.message || "Unable to add expense.");
  } finally {
    setSaving(false);
  }
}

async function handleDelete(id) {
  if (!gymId) return;

  if (!confirm("Delete this expense?")) return;

  setError("");

  const { error: delError } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("gym_id", gymId);

  if (delError) {
    setError(delError.message);
  } else {
    await onChanged?.();
  }
}

  const input =
    "w-full border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#52772D]";

  const recent = [...expenses]
    .sort((a, b) => (b.paid_on || "").localeCompare(a.paid_on || ""))
    .slice(0, 8);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <h3 className="font-bold text-[#17211A]">Add Expense</h3>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 mt-4">
        <input type="number" min="0" step="0.01" placeholder="Amount (₹)" value={form.amount} onChange={set("amount")} className={input} />
        <input type="date" value={form.paid_on} max={today} onChange={set("paid_on")} className={input} />

        <select value={form.category} onChange={set("category")} className={input}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={form.mode} onChange={set("mode")} className={input}>
          {MODES.map((m) => <option key={m}>{m}</option>)}
        </select>

        <input placeholder="Paid to (landlord, vendor, trainer...)" value={form.paid_to} onChange={set("paid_to")} className={`${input} col-span-2`} />
        <input placeholder="Note (optional)" value={form.note} onChange={set("note")} className={`${input} col-span-2`} />

        {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving || !gymId}
          className="col-span-2 inline-flex cursor-pointer items-center justify-center gap-2 bg-[#17211A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          <Plus size={15} />
          {saving ? "Saving..." : "Add expense"}
        </button>
      </form>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Recent expenses</p>

        {recent.length === 0 ? (
          <p className="text-sm text-gray-400">No expenses in this period.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recent.map((e) => (
              <li key={e.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#17211A] truncate">
                    {e.category}{e.paid_to ? ` → ${e.paid_to}` : ""}
                  </p>
                  <p className="text-xs text-gray-400">{e.paid_on} · {e.mode}{e.note ? ` · ${e.note}` : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-red-600">-{fmt(e.amount)}</span>
                  <button onClick={() => handleDelete(e.id)} className="cursor-pointer text-gray-300 hover:text-red-500" aria-label="Delete expense">
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}