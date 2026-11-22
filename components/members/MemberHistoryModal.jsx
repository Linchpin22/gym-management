// components/members/MemberHistoryModal.js
"use client";

import { useEffect, useState } from "react";
import { X, LoaderCircle, AlertCircle, RefreshCw, MessageCircle, Download } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getStatus, daysLeft } from "@/utils/memberUtils";
import { downloadReceipt } from "@/utils/receipt";
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
  return mode.toLowerCase() === "upi" ? "UPI" : mode.charAt(0).toUpperCase() + mode.slice(1);
}

const STATUS_STYLE = {
  Active: "bg-[#8BC34A]/15 text-[#3F6B1E]",
  Expiring: "bg-amber-100 text-amber-800",
  Expired: "bg-red-100 text-red-700",
};

export default function MemberHistoryModal({ member, plans = [], gymName, onClose, onRenew }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [receiptBusy, setReceiptBusy] = useState(false);
  const [receiptError, setReceiptError] = useState("");

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
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const planName = (id) => plans.find((p) => String(p.id) === String(id))?.name || "-";
  const total = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const visible = showAll ? payments : payments.slice(0, SHOW_FIRST);

  // Receipt for the latest payment; next payment = the member's current expiry date
  async function handleReceipt() {
    const latest = payments[0];
    if (!latest || receiptBusy) return;
    setReceiptBusy(true);
    setReceiptError("");
    try {
      await downloadReceipt({
        gymName,
        memberName: member.name,
        amount: latest.amount,
        paidOn: latest.paid_on,
        nextDue: member.expiry_date,
      });
    } catch (err) {
      setReceiptError(err.message || "Could not create the receipt.");
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
        } ${fmtDate(member.expiry_date)}. Please renew to continue.`
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
            <h2 className="truncate text-lg font-bold text-[#17211A]">{member.name}</h2>
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
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#829087]">Total paid</p>
              <p className="mt-1 text-sm font-bold sm:text-base text-[#17211A]">{loading ? "-" : inr(total)}</p>
            </div>
            <div className="rounded-xl bg-[#F8FAF8] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#829087]">Last paid</p>
              <p className="mt-1 text-sm font-bold sm:text-base text-[#17211A]">
                {loading || !payments[0] ? "-" : fmtDate(payments[0].paid_on)}
              </p>
            </div>
            <div className="rounded-xl bg-[#F8FAF8] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#829087]">Expires</p>
              <p className="mt-1 text-sm font-bold sm:text-base text-[#17211A]">{fmtDate(member.expiry_date)}</p>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-[#526157]">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[status] || ""}`}>
              {status}
            </span>
            <span>Plan: {member.plans?.name || planName(member.plan_id)}</span>
          </div>

          {!loading && payments[0] && (
            <>
              <button
                type="button"
                onClick={handleReceipt}
                disabled={receiptBusy}
                className="mb-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#DCE4DE] px-4 py-3 text-sm font-semibold text-[#17211A] transition hover:bg-[#F8FAF8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {receiptBusy ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {receiptBusy ? "Preparing..." : "Download latest receipt"}
              </button>
              {receiptError && (
                <p role="alert" className="mb-2 text-sm text-red-600">
                  {receiptError}
                </p>
              )}
              <div className="mb-3" />
            </>
          )}

          {/* Payments */}
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#829087]">
            Payment history
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoaderCircle size={26} className="animate-spin text-[#8BC34A]" />
            </div>
          ) : error ? (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
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
                  <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#17211A]">{fmtDate(p.paid_on)}</p>
                      <p className="text-xs text-[#829087]">
                        {planName(p.plan_id)} · {fmtMode(p.mode)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-[#17211A]">{inr(p.amount)}</p>
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
        </div>
      </div>
    </div>
  );
}