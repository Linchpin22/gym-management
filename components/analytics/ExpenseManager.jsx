"use client";

import { useRef, useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  "Rent",
  "Salaries",
  "Electricity",
  "Equipment",
  "Maintenance",
  "Marketing",
  "Supplies",
  "Other",
];
const MODES = ["Cash", "UPI", "Card", "Bank Transfer"];

const COLUMNS = "id, gym_id, amount, paid_on, category, paid_to, mode, note";
const VISIBLE_COUNT = 8;

const fmt = (v) =>
  `₹${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const formatDate = (date) =>
  date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

const emptyForm = (today) => ({
  amount: "",
  paid_on: today,
  category: "Rent",
  paid_to: "",
  mode: "Cash",
  note: "",
});

export default function ExpenseManager({
  gymId,
  expenses,
  today,
  periodLabel,
  onAdded,
  onUpdated,
  onDeleted,
}) {
  const [form, setForm] = useState(() => emptyForm(today));
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const formRef = useRef(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Keep legacy values selectable when editing an old expense.
  const categoryOptions = CATEGORIES.includes(form.category)
    ? CATEGORIES
    : [form.category, ...CATEGORIES];
  const modeOptions = MODES.includes(form.mode) ? MODES : [form.mode, ...MODES];

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm(today));
    setError("");
  }

  function startEdit(expense) {
    setEditingId(expense.id);
    setError("");
    setForm({
      amount: String(expense.amount ?? ""),
      paid_on: expense.paid_on || today,
      category: expense.category || "Other",
      paid_to: expense.paid_to || "",
      mode: expense.mode || "Cash",
      note: expense.note || "",
    });

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (saving) return;

    setError("");

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    if (!form.paid_on) {
      setError("Choose a date.");
      return;
    }

    if (!gymId) {
      setError("Gym information is unavailable.");
      return;
    }

    const payload = {
      amount,
      paid_on: form.paid_on,
      category: form.category,
      paid_to: form.paid_to.trim() || null,
      mode: form.mode,
      note: form.note.trim() || null,
    };

    setSaving(true);

    try {
      if (editingId) {
        const { data, error: updateError } = await supabase
          .from("expenses")
          .update(payload)
          .eq("id", editingId)
          .eq("gym_id", gymId)
          .select(COLUMNS)
          .single();

        if (updateError) throw new Error(updateError.message);

        onUpdated?.(data);
        resetForm();
      } else {
        const { data, error: insertError } = await supabase
          .from("expenses")
          .insert({ gym_id: gymId, ...payload })
          .select(COLUMNS)
          .single();

        if (insertError) throw new Error(insertError.message);

        onAdded?.(data);
        setForm((f) => ({ ...f, amount: "", paid_to: "", note: "" }));
      }
    } catch (err) {
      setError(err.message || "Unable to save expense.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!gymId) return;

    if (!window.confirm("Delete this expense?")) return;

    setError("");

    const { error: delError } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("gym_id", gymId);

    if (delError) {
      setError(delError.message);
      return;
    }

    if (editingId === id) resetForm();

    onDeleted?.(id);
  }

  const input =
    "w-full border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#52772D]";

  const sorted = [...expenses].sort((a, b) => {
    const byDate = (b.paid_on || "").localeCompare(a.paid_on || "");
    return byDate !== 0 ? byDate : String(b.id).localeCompare(String(a.id));
  });

  const visible = showAll ? sorted : sorted.slice(0, VISIBLE_COUNT);

  return (
    <section className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div ref={formRef}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#17211A]">
              {editingId ? "Edit Expense" : "Add Expense"}
            </h3>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-gray-500 hover:text-red-600"
              >
                <X size={14} />
                Cancel edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 mt-4">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Amount (₹)"
              aria-label="Amount"
              value={form.amount}
              onChange={set("amount")}
              className={input}
            />
            <input
              type="date"
              aria-label="Date"
              value={form.paid_on}
              max={today}
              onChange={set("paid_on")}
              className={input}
            />

            <select
              aria-label="Category"
              value={form.category}
              onChange={set("category")}
              className={input}
            >
              {categoryOptions.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              aria-label="Paid via"
              value={form.mode}
              onChange={set("mode")}
              className={input}
            >
              {modeOptions.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>

            <input
              placeholder="Paid to (landlord, vendor, trainer...)"
              aria-label="Paid to"
              value={form.paid_to}
              onChange={set("paid_to")}
              className={`${input} col-span-2`}
            />
            <input
              placeholder="Note (optional)"
              aria-label="Note"
              value={form.note}
              onChange={set("note")}
              className={`${input} col-span-2`}
            />

            {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={saving || !gymId}
              className="col-span-2 inline-flex cursor-pointer items-center justify-center gap-2 bg-[#17211A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {editingId ? <Save size={15} /> : <Plus size={15} />}
              {saving
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Add expense"}
            </button>
          </form>
        </div>

        {/* Recent list */}
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Expenses · {periodLabel}
            </p>
            <p className="text-xs text-gray-400">{sorted.length} total</p>
          </div>

          {sorted.length === 0 ? (
            <p className="text-sm text-gray-400 mt-4">
              No expenses in this period.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-gray-100 mt-2">
                {visible.map((e) => (
                  <li
                    key={e.id}
                    className={`py-2.5 px-2 -mx-2 rounded-lg flex items-center justify-between gap-3 ${
                      editingId === e.id ? "bg-[#F8FAF7]" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#17211A] truncate">
                        {e.category}
                        {e.paid_to ? ` → ${e.paid_to}` : ""}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {formatDate(e.paid_on)} · {e.mode}
                        {e.note ? ` · ${e.note}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold text-red-600">
                        -{fmt(e.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit(e)}
                        className="cursor-pointer text-gray-300 hover:text-[#52772D]"
                        aria-label="Edit expense"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(e.id)}
                        className="cursor-pointer text-gray-300 hover:text-red-500"
                        aria-label="Delete expense"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {sorted.length > VISIBLE_COUNT && (
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="mt-3 cursor-pointer text-xs font-semibold text-[#52772D] hover:underline"
                >
                  {showAll ? "Show fewer" : `Show all ${sorted.length}`}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}