
"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  X,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-[#FAFBFA] px-4 py-3 text-sm outline-none transition focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/15";

function normalizeHeader(value) {
  return String(value || "").trim().toLowerCase().replace(/[_\s]+/g, " ");
}

function parseDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatLocalDate(value);
  }

  const text = String(value || "").trim();

  if (!text) return null;

  // Excel serial date
  if (/^\d+(\.\d+)?$/.test(text)) {
    const parsed = XLSX.SSF.parse_date_code(Number(text));

    if (parsed) {
      return `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(
        parsed.d,
      ).padStart(2, "0")}`;
    }
  }

  // YYYY-MM-DD
  let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (match) {
    const [, year, month, day] = match;
    return isValidDate(year, month, day)
      ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      : null;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

  if (match) {
    const [, day, month, year] = match;

    return isValidDate(year, month, day)
      ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      : null;
  }

  return null;
}

function isValidDate(year, month, day) {
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return (
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
  );
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function downloadTemplate() {
  const rows = [
    {
      Name: "Rahul Sharma",
      Phone: "9876543210",
      Plan: "Monthly",
      "Join Date": "2026-11-21",
      "Amount Paid": 1200,
      "Payment Mode": "cash",
    },
    {
      Name: "Amit Verma",
      Phone: "9876543211",
      Plan: "Quarterly",
      "Join Date": "2026-11-20",
      "Amount Paid": 3000,
      "Payment Mode": "upi",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 24 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Members");

  XLSX.writeFile(workbook, "gym-hisab-members-template.xlsx");
}

function validateRows(rawRows, plans, existingMembers) {
  const existingPhones = new Set(
    existingMembers.map((member) => String(member.phone || "").trim()),
  );

  const seenPhones = new Set();

  return rawRows.map((row, index) => {
    const values = {};

    Object.entries(row).forEach(([key, value]) => {
      values[normalizeHeader(key)] = value;
    });

    const name = String(values.name || "").trim();
    const phone = String(values.phone || "").replace(/\D/g, "");
    const planName = String(values.plan || "").trim();
    const joinDate = parseDate(values["join date"]);
    const amountValue = String(values["amount paid"] ?? "").trim();
    const amount = Number(amountValue);
    const mode = String(values["payment mode"] || "cash")
      .trim()
      .toLowerCase();

    const plan = plans.find(
      (item) => item.name.trim().toLowerCase() === planName.toLowerCase(),
    );

    const errors = [];

    if (!name) errors.push("Name is required.");
    if (!/^\d{10}$/.test(phone)) errors.push("Invalid 10-digit phone.");
    if (!plan) errors.push(`Plan "${planName || "blank"}" not found.`);
    if (!joinDate) errors.push("Invalid or missing join date.");

    if (
      amountValue === "" ||
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      errors.push("Invalid payment amount.");
    }

    if (!["cash", "upi", "card", "other"].includes(mode)) {
      errors.push("Invalid payment mode.");
    }

    if (phone && existingPhones.has(phone)) {
      errors.push("Phone number already exists.");
    }

    if (phone && seenPhones.has(phone)) {
      errors.push("Duplicate phone in uploaded file.");
    }

    if (phone) seenPhones.add(phone);

    return {
      rowNumber: index + 2,
      name,
      phone,
      planId: plan?.id || null,
      planName: plan?.name || planName,
      durationDays: plan?.duration_days || null,
      joinDate,
      amount,
      mode,
      errors,
      valid: errors.length === 0,
    };
  });
}

export default function ImportMembersModal({
  onClose,
  plans,
  existingMembers,
  onImport,
  saving,
}) {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");

  const validRows = useMemo(
    () => rows.filter((row) => row.valid),
    [rows],
  );

  const invalidRows = useMemo(
    () => rows.filter((row) => !row.valid),
    [rows],
  );

  async function handleFileChange(event) {
    const file = event.target.files?.[0];

    setRows([]);
    setFileError("");
    setFileName("");

    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["xlsx", "xls", "csv"].includes(extension)) {
      setFileError("Please upload an Excel (.xlsx, .xls) or CSV file.");
      event.target.value = "";
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: true,
      });

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

      if (!firstSheet) {
        setFileError("The uploaded file does not contain a worksheet.");
        return;
      }

      const rawRows = XLSX.utils.sheet_to_json(firstSheet, {
        defval: "",
        raw: true,
      });

      if (!rawRows.length) {
        setFileError("No member records found in this file.");
        return;
      }

      const headers = Object.keys(rawRows[0]).map(normalizeHeader);
      const requiredHeaders = [
        "name",
        "phone",
        "plan",
        "join date",
        "amount paid",
        "payment mode",
      ];

      const missingHeaders = requiredHeaders.filter(
        (header) => !headers.includes(header),
      );

      if (missingHeaders.length) {
        setFileError(
          `Missing columns: ${missingHeaders.join(", ")}. Please use the provided template.`,
        );
        return;
      }

      setRows(validateRows(rawRows, plans, existingMembers));
      setFileName(file.name);
    } catch {
      setFileError("Unable to read this file. Please check the Excel format.");
    }

    event.target.value = "";
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[#101810]/60 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 bg-gradient-to-r from-[#F1F7E9] to-white p-5 sm:p-6">
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5F0D9] text-[#52772D]">
              <FileSpreadsheet size={20} />
            </div>

            <h2 className="text-lg font-bold text-[#17211A]">
              Import members from Excel
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Upload your member records and review them before importing.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl p-2 cursor-pointer text-gray-500 transition hover:bg-white disabled:opacity-50"
            aria-label="Close import modal"
          >
            <X size={19} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-[#E4EED9] bg-[#F7FAF3] p-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-[#17211A]">
                First, download the Excel template
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Fill in the member details using the exact column headings.
              </p>
            </div>

            <button
              type="button"
              onClick={downloadTemplate}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#DCE8D1] bg-white px-4 py-2.5 text-sm font-semibold text-[#52772D] transition hover:bg-[#EEF6E7]"
            >
              <Download size={16} />
              Download template
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Upload Excel or CSV file
            </label>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-[#FAFBFA] px-4 py-8 text-center transition hover:border-[#8BC34A] hover:bg-[#F7FAF3]">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF4E8] text-[#52772D]">
                <Upload size={22} />
              </div>

              <span className="text-sm font-semibold text-gray-800">
                {fileName || "Click to select your file"}
              </span>

              <span className="mt-1 text-xs text-gray-500">
                XLSX, XLS or CSV
              </span>

              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={saving}
              />
            </label>

            {fileError && (
              <p className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                {fileError}
              </p>
            )}
          </div>

          {rows.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Total rows</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {rows.length}
                  </p>
                </div>

                <div className="rounded-xl bg-green-50 p-3">
                  <p className="text-xs text-green-700">Valid</p>
                  <p className="mt-1 text-xl font-bold text-green-700">
                    {validRows.length}
                  </p>
                </div>

                <div className="rounded-xl bg-red-50 p-3">
                  <p className="text-xs text-red-700">Invalid</p>
                  <p className="mt-1 text-xl font-bold text-red-700">
                    {invalidRows.length}
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-gray-800">
                    Import preview
                  </h3>

                  <span className="text-xs text-gray-500">
                    Showing {rows.length} rows
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full min-w-[900px] text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        <th className="px-3 py-3">Row</th>
                        <th className="px-3 py-3">Member</th>
                        <th className="px-3 py-3">Phone</th>
                        <th className="px-3 py-3">Plan</th>
                        <th className="px-3 py-3">Join date</th>
                        <th className="px-3 py-3">Amount</th>
                        <th className="px-3 py-3">Status / issues</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {rows.map((row) => (
                        <tr key={row.rowNumber}>
                          <td className="px-3 py-3 text-gray-500">
                            {row.rowNumber}
                          </td>
                          <td className="px-3 py-3 font-semibold text-gray-800">
                            {row.name || "—"}
                          </td>
                          <td className="px-3 py-3 text-gray-600">
                            {row.phone || "—"}
                          </td>
                          <td className="px-3 py-3 text-gray-600">
                            {row.planName || "—"}
                          </td>
                          <td className="px-3 py-3 text-gray-600">
                            {row.joinDate || "—"}
                          </td>
                          <td className="px-3 py-3 text-gray-600">
                            ₹{Number.isFinite(row.amount) ? row.amount : "—"}
                          </td>
                          <td className="px-3 py-3">
                            {row.valid ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-green-700">
                                <CheckCircle2 size={14} />
                                Valid
                              </span>
                            ) : (
                              <span className="text-red-600">
                                {row.errors.join(" ")}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border cursor-pointer border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onImport(validRows)}
            disabled={saving || validRows.length === 0}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#17211A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#304B32] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FileSpreadsheet size={16} />
            {saving
              ? "Importing..."
              : `Import ${validRows.length} members`}
          </button>
        </div>
      </div>
    </div>
  );
}
