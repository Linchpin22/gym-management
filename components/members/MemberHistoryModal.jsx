import { useEffect, useState } from "react";

import {
  X,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Pencil,
  Save,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getStatus, daysLeft, today } from "@/utils/memberUtils";
import { downloadReceipt, shareReceipt } from "@/utils/receipt";
import { FaWhatsapp } from "react-icons/fa";

const SHOW_FIRST = 5;

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

// "2026-11-22" -> "22 Nov 2026" (no timezone shifts)
function fmtDate(str) {
  if (!str) return "-";
  const [y, m, d] = String(str).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtMode(mode) {
  if (!mode) return "-";
  return mode.toLowerCase() === "upi"
    ? "UPI"
    : mode.charAt(0).toUpperCase() + mode.slice(1);
}

const STATUS_STYLE = {
  Active: "bg-[#8BC34A]/15 text-[#3F6B1E]",
  Expiring: "bg-amber-100 text-amber-800",
  Expired: "bg-red-100 text-red-700",
};

export default function MemberHistoryModal({
  member,
  plans = [],
  gymName,
  onClose,
  onRenew,
  onPaymentUpdated,
}) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [receiptBusy, setReceiptBusy] = useState(false);
  const [receiptError, setReceiptError] = useState("");
  const [editingPayment, setEditingPayment] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editMode, setEditMode] = useState("cash");
  const [editPaidOn, setEditPaidOn] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      const { data, error: err } = await supabase
        .from("payments")
        .select("id, amount, mode, paid_on, plan_id")
        .eq("member_id", member.id)
        .order("paid_on", { ascending: false })
        .limit(500);

      if (cancelled) return;
      if (err) setError(err.message);
      setPayments(data || []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [member.id]);

  useEffect(() => {
    function onKey(e) {
      if (e.key !== "Escape" || editSaving) return;

      if (editingPayment) {
        setEditingPayment(null);
        setEditError("");
        return;
      }

      onClose();
    }

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, editingPayment, editSaving]);

  function openEditPayment(payment) {
    setEditError("");
    setEditAmount(String(payment.amount ?? ""));
    setEditMode(payment.mode || "cash");
    setEditPaidOn(String(payment.paid_on || "").slice(0, 10));
    setEditingPayment(payment);
  }

  function closeEditPayment() {
    if (editSaving) return;

    setEditingPayment(null);
    setEditError("");
    setEditAmount("");
    setEditMode("cash");
    setEditPaidOn("");
  }

  async function updatePayment(e) {
    e.preventDefault();

    if (editSaving || !editingPayment) return;

    setEditError("");

    if (!member.gym_id) {
      setEditError("Gym information is unavailable.");
      return;
    }

    if (
      editAmount.trim() === "" ||
      !Number.isFinite(Number(editAmount)) ||
      Number(editAmount) < 0
    ) {
      setEditError("Please enter a valid payment amount.");
      return;
    }

    if (!["cash", "upi", "card", "other"].includes(editMode)) {
      setEditError("Please select a valid payment method.");
      return;
    }

    if (!editPaidOn || editPaidOn > today()) {
      setEditError("Please enter a valid payment date.");
      return;
    }

    if (member.join_date && editPaidOn < member.join_date) {
      setEditError("Payment date cannot be before the member's joining date.");
      return;
    }

    setEditSaving(true);

    try {
      const { data, error: updateError } = await supabase
        .from("payments")
        .update({
          amount: Number(editAmount),
          mode: editMode,
          paid_on: editPaidOn,
        })
        .eq("id", editingPayment.id)
        .eq("member_id", member.id)
        .eq("gym_id", member.gym_id)
        .select("id, amount, mode, paid_on, plan_id")
        .single();

      if (updateError) {
        setEditError(updateError.message);
        return;
      }

      // Update and reorder local payment history
      setPayments((previous) =>
        previous
          .map((payment) => (payment.id === data.id ? data : payment))
          .sort((a, b) => String(b.paid_on).localeCompare(String(a.paid_on))),
      );

      setEditingPayment(null);
      setEditError("");
      setReceiptError("");

      // Refresh parent members table
      try {
        await onPaymentUpdated?.();
      } catch {
        setError("Payment saved, but member data could not be refreshed.");
      }
    } catch (err) {
      setEditError(err.message || "Unable to update payment.");
    } finally {
      setEditSaving(false);
    }
  }

  const planName = (id) =>
    plans.find((p) => String(p.id) === String(id))?.name || "-";
  const total = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const visible = showAll ? payments : payments.slice(0, SHOW_FIRST);

  // Receipt for the latest payment; next payment = the member's current expiry date
  async function handleReceipt(action = "download") {
    const latest = payments[0];

    if (!latest || receiptBusy) return;

    setReceiptBusy(true);
    setReceiptError("");

    try {
      if (!member.gym_id) {
        throw new Error("Gym information is unavailable.");
      }

      const { data: gymData, error: gymError } = await supabase
        .from("gyms")
        .select(
          `
        name,
        mobile_number,
        registration_type,
        registration_number
      `,
        )
        .eq("id", member.gym_id)
        .single();

      if (gymError) {
        throw new Error(gymError.message);
      }

      const receiptData = {
        gymName: gymData.name || gymName,
        gymMobile: gymData.mobile_number,
        registrationType: gymData.registration_type,
        registrationNumber: gymData.registration_number,

        memberName: member.name,
        memberMobile: member.phone,

        paymentId: latest.id,
        paymentMode: latest.mode,
        planName: planName(latest.plan_id),

        amount: latest.amount,
        paidOn: latest.paid_on,
        nextDue: member.expiry_date,
      };

      if (action === "share") {
        await shareReceipt(receiptData);
      } else {
        await downloadReceipt(receiptData);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setReceiptError(err.message || "Could not create the receipt.");
      }
    } finally {
      setReceiptBusy(false);
    }
  }

  const status = getStatus(member.expiry_date);
  const left = daysLeft(member.expiry_date);
  const waHref = member.phone
    ? `https://wa.me/91${member.phone}?text=${encodeURIComponent(
        `Hi ${member.name}, your gym membership ${
          left !== null && left < 0 ? "expired on" : "expires on"
        } ${fmtDate(member.expiry_date)}. Please renew to continue.`,
      )}`
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${member.name} payment history`}
        className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border sm:rounded-2xl border-[#E8EDE9] bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#E8EDE9] px-4 py-5 sm:px-6">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-[#17211A]">
              {member.name}
            </h2>
            <p className="mt-1 text-sm text-[#829087]">{member.phone}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#829087] transition hover:bg-gray-100 hover:text-[#17211A]"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* Summary */}
          <div className="mb-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-[#F8FAF8] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#829087]">
                Total paid
              </p>
              <p className="mt-1 text-sm font-bold sm:text-base text-[#17211A]">
                {loading ? "-" : inr(total)}
              </p>
            </div>
            <div className="rounded-xl bg-[#F8FAF8] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#829087]">
                Last paid
              </p>
              <p className="mt-1 text-sm font-bold sm:text-base text-[#17211A]">
                {loading || !payments[0] ? "-" : fmtDate(payments[0].paid_on)}
              </p>
            </div>
            <div className="rounded-xl bg-[#F8FAF8] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#829087]">
                Expires
              </p>
              <p className="mt-1 text-sm font-bold sm:text-base text-[#17211A]">
                {fmtDate(member.expiry_date)}
              </p>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-[#526157]">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[status] || ""}`}
            >
              {status}
            </span>
            <span>Plan: {member.plans?.name || planName(member.plan_id)}</span>
          </div>

          {!loading && !editingPayment && payments[0] && (
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleReceipt("download")}
                  disabled={receiptBusy}
                  className="flex cursor-pointer items-center justify-center
        gap-2 rounded-xl border border-[#DCE4DE] px-3 py-3
        text-sm font-semibold text-[#17211A] transition
        hover:bg-[#F8FAF8] disabled:cursor-not-allowed
        disabled:opacity-50"
                >
                  <Download size={16} />
                  Download Receipt
                </button>

                <button
                  type="button"
                  onClick={() => handleReceipt("share")}
                  disabled={receiptBusy}
                  className="flex cursor-pointer items-center justify-center
        gap-2 rounded-xl border border-[#DCE8D4] bg-[#EEF4E8]
        px-3 py-3 text-sm font-semibold text-[#52772D]
        transition hover:bg-[#E4EED9]
        disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaWhatsapp size={16} />
                  Send Receipt
                </button>
              </div>

              {receiptBusy && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#829087]">
                  <LoaderCircle size={14} className="animate-spin" />
                  Preparing receipt...
                </div>
              )}

              {receiptError && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                  {receiptError}
                </p>
              )}
            </div>
          )}

          {/* Payments */}
          {!editingPayment && (
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#829087]">
              Payment history
            </h3>
          )}
          {editingPayment && (
            <div className="mb-5 rounded-2xl border border-[#DCE4DE] bg-[#F8FAF8] p-4 sm:p-5">
              {/* Header */}
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF4E8] text-[#52772D]">
                    <Pencil size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#17211A]">
                      Edit payment
                    </h3>

                    <p className="mt-1 text-xs text-[#829087]">
                      Correct an existing payment record.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeEditPayment}
                  disabled={editSaving}
                  className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                  aria-label="Close payment editor"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Original payment */}
              <div className="mb-4 flex items-center justify-between rounded-xl border border-[#E8EDE9] bg-white p-3">
                <div>
                  <p className="text-xs text-[#829087]">Original payment</p>

                  <p className="mt-1 text-sm font-bold text-[#17211A]">
                    {inr(editingPayment.amount)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-[#829087]">Payment date</p>

                  <p className="mt-1 text-sm font-semibold text-[#17211A]">
                    {fmtDate(editingPayment.paid_on)}
                  </p>
                </div>
              </div>

              <form
                id="edit-payment-form"
                onSubmit={updatePayment}
                className="space-y-4"
              >
                {/* Amount and payment method */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Amount (₹)
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      disabled={editSaving}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/15"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Payment method
                    </label>

                    <select
                      value={editMode}
                      onChange={(e) => setEditMode(e.target.value)}
                      disabled={editSaving}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/15"
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Payment date */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Payment date
                  </label>

                  <input
                    type="date"
                    value={editPaidOn}
                    onChange={(e) => setEditPaidOn(e.target.value)}
                    min={member.join_date || undefined}
                    max={today()}
                    disabled={editSaving}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/15"
                  />
                </div>

                {/* Revenue adjustment preview */}
                {editAmount !== "" &&
                  Number.isFinite(Number(editAmount)) &&
                  Number(editAmount) >= 0 &&
                  Number(editAmount) !== Number(editingPayment.amount) && (
                    <div className="flex items-center justify-between rounded-xl border border-[#E4EED9] bg-[#F3F8ED] p-3">
                      <p className="text-xs font-medium text-gray-600">
                        Revenue adjustment
                      </p>

                      <p
                        className={`text-sm font-bold ${
                          Number(editAmount) > Number(editingPayment.amount)
                            ? "text-green-700"
                            : "text-red-600"
                        }`}
                      >
                        {Number(editAmount) > Number(editingPayment.amount)
                          ? "+"
                          : "-"}
                        {inr(
                          Math.abs(
                            Number(editAmount) - Number(editingPayment.amount),
                          ),
                        )}
                      </p>
                    </div>
                  )}

                {/* Warning */}
                <div className="rounded-xl border border-orange-100 bg-orange-50 p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle
                      size={16}
                      className="mt-0.5 shrink-0 text-orange-600"
                    />

                    <p className="text-xs leading-relaxed text-orange-700">
                      Editing this payment will affect recorded revenue and
                      newly generated receipts. Membership expiry and plan will
                      remain unchanged.
                    </p>
                  </div>
                </div>

                {/* Error */}
                {editError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600"
                  >
                    {editError}
                  </div>
                )}
              </form>
            </div>
          )}

          {editingPayment ? null : loading ? (
            <div className="flex justify-center py-8">
              <LoaderCircle size={26} className="animate-spin text-[#8BC34A]" />
            </div>
          ) : error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600"
            >
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : payments.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#DCE4DE] p-5 text-center text-sm text-[#829087]">
              Abhi tak koi payment nahi.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-[#E8EDE9] rounded-xl border border-[#E8EDE9]">
                {visible.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 px-4 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#17211A]">
                        {fmtDate(p.paid_on)}
                      </p>
                      <p className="text-xs text-[#829087]">
                        {planName(p.plan_id)} · {fmtMode(p.mode)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <p className="text-sm font-bold text-[#17211A]">
                        {inr(p.amount)}
                      </p>

                      <button
                        type="button"
                        onClick={() => openEditPayment(p)}
                        disabled={editSaving}
                        title="Edit payment"
                        aria-label={`Edit payment from ${fmtDate(p.paid_on)}`}
                        className="flex h-8 w-8 cursor-pointer items-center
      justify-center rounded-lg border border-[#DCE4DE]
      text-[#52772D] transition hover:bg-[#EEF4E8]
      disabled:opacity-50"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {payments.length > SHOW_FIRST && (
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="mt-3 cursor-pointer text-sm font-semibold text-[#668D43] hover:underline"
                >
                  {showAll ? "Kam dikhao" : `Sabhi dekho (${payments.length})`}
                </button>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 flex gap-3 border-t border-[#E8EDE9] bg-[#F8FAF8] px-4 py-4 sm:px-6">
          {editingPayment ? (
            <>
              <button
                type="button"
                onClick={closeEditPayment}
                disabled={editSaving}
                className="flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-[#DCE4DE] bg-white px-4 py-3.5 text-sm font-semibold text-[#526157] transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="edit-payment-form"
                disabled={editSaving}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#17211A] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#304B32] disabled:opacity-50"
              >
                {editSaving ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {editSaving ? "Saving..." : "Save changes"}
              </button>
            </>
          ) : (
            <>
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#DCE4DE] bg-white px-4 py-3.5 text-sm font-semibold text-[#526157] transition hover:bg-gray-50"
                >
                  <FaWhatsapp size={16} />
                  WhatsApp
                </a>
              )}
              <button
                type="button"
                onClick={() => onRenew(member)}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#8BC34A] px-4 py-3.5 text-sm font-bold text-[#17211A] transition hover:bg-[#7FB53E]"
              >
                <RefreshCw size={16} />
                Renew
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
