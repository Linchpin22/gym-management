// utils/exportMembers.js
// Builds an Excel file with two sheets: Members (one row each) and Payments (every payment).
import { supabase } from "@/lib/supabase";
import { daysLeft, getStatus } from "@/utils/memberUtils";

const PAGE = 1000; // Supabase returns at most 1000 rows per request

async function fetchAllPayments(gymId) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("payments")
      .select("id, member_id, plan_id, amount, mode, paid_on")
      .eq("gym_id", gymId)
      .order("paid_on", { ascending: false })
      .order("id", { ascending: false })
      .range(from, from + PAGE - 1);

    if (error) throw new Error(error.message);
    rows.push(...(data || []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

// "2026-11-22" -> a Date Excel shows as that exact day (no timezone shift)
function toExcelDate(str) {
  if (!str) return null;
  const [y, m, d] = String(str).slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

function modeLabel(mode) {
  if (!mode) return "";
  return mode.toLowerCase() === "upi"
    ? "UPI"
    : mode.charAt(0).toUpperCase() + mode.slice(1);
}

function safeFileName(text) {
  return (
    String(text || "gym")
      .replace(/[^\w\- ]+/g, "")
      .trim()
      .replace(/\s+/g, "-") || "gym"
  );
}

const DATE_FMT = "dd-mmm-yyyy";
const MONEY_FMT = "#,##0";

function styleHeader(sheet) {
  const row = sheet.getRow(1);
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.alignment = { vertical: "middle" };
  row.height = 22;
  row.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF17211A" },
    };
  });
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columnCount },
  };
}

export async function exportMembersToExcel({ gym, members, plans = [] }) {
  const ExcelJS = (await import("exceljs")).default; // loaded only when the button is clicked

  const payments = await fetchAllPayments(gym.id);
  const planName = (id) =>
    plans.find((p) => String(p.id) === String(id))?.name || "";
  const memberById = new Map(members.map((m) => [m.id, m]));

  // payments are newest first, so the first one found for a member is the latest
  const totals = new Map();
  for (const p of payments) {
    totals.set(
      p.member_id,
      (totals.get(p.member_id) || 0) + Number(p.amount || 0),
    );
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = "GymHisab";
  wb.created = new Date();

  // ---- Members sheet
  const ms = wb.addWorksheet("Members");
  ms.columns = [
    { header: "Name", key: "name", width: 24 },
    { header: "Phone", key: "phone", width: 14 },
    { header: "Plan", key: "plan", width: 18 },
    {
      header: "Join date",
      key: "join",
      width: 14,
      style: { numFmt: DATE_FMT },
    },
    {
      header: "Expiry date",
      key: "expiry",
      width: 14,
      style: { numFmt: DATE_FMT },
    },
    { header: "Status", key: "status", width: 11 },
    { header: "Days left", key: "left", width: 10 },
    {
      header: "Last payment (₹)",
      key: "lastAmt",
      width: 16,
      style: { numFmt: MONEY_FMT },
    },
    {
      header: "Last payment date",
      key: "lastDate",
      width: 17,
      style: { numFmt: DATE_FMT },
    },
    { header: "Last payment mode", key: "lastMode", width: 17 },
    {
      header: "Total paid (₹)",
      key: "total",
      width: 15,
      style: { numFmt: MONEY_FMT },
    },
  ];

  for (const m of members) {
    const last = m.lastPayment;
    ms.addRow({
      name: m.name || "",
      phone: String(m.phone || ""),
      plan: m.plans?.name || planName(m.plan_id),
      join: toExcelDate(m.join_date),
      expiry: toExcelDate(m.expiry_date),
      status: getStatus(m.expiry_date),
      left: daysLeft(m.expiry_date),
      lastAmt: last ? Number(last.amount) : null,
      lastDate: last ? toExcelDate(last.paid_on) : null,
      lastMode: last ? modeLabel(last.mode) : "",
      total: totals.get(m.id) || 0,
    });
  }
  ms.getColumn("phone").numFmt = "@";
  styleHeader(ms);

  // ---- Payments sheet
  const ps = wb.addWorksheet("Payments");
  ps.columns = [
    { header: "Date", key: "date", width: 14, style: { numFmt: DATE_FMT } },
    { header: "Member", key: "name", width: 24 },
    { header: "Phone", key: "phone", width: 14 },
    { header: "Plan", key: "plan", width: 18 },
    {
      header: "Amount (₹)",
      key: "amount",
      width: 14,
      style: { numFmt: MONEY_FMT },
    },
    { header: "Mode", key: "mode", width: 12 },
  ];

  for (const p of payments) {
    const m = memberById.get(p.member_id);
    ps.addRow({
      date: toExcelDate(p.paid_on),
      name: m?.name || "(deleted member)",
      phone: String(m?.phone || ""),
      plan: planName(p.plan_id),
      amount: Number(p.amount || 0),
      mode: modeLabel(p.mode),
    });
  }
  ps.getColumn("phone").numFmt = "@";
  styleHeader(ps);

  // ---- Download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const stamp = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in the user's timezone
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeFileName(gym.name)}-members-${stamp}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
