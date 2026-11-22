// utils/receipt.js
// Simple payment receipt as a PDF: gym name, member name, amount, date, next payment.

function fmtDate(str) {
  if (!str) return "-";
  const [y, m, d] = String(str).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function safeFileName(text) {
  return String(text || "member").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") || "member";
}

export async function downloadReceipt({ gymName, memberName, amount, paidOn, nextDue }) {
  const { jsPDF } = await import("jspdf"); // loaded only when the button is clicked

  const doc = new jsPDF({ unit: "mm", format: [100, 140] });
  const W = 100;
  const M = 10;
  const inner = W - M * 2;

  // Standard PDF fonts have no rupee sign, so the amount is written as "Rs."
  const money = "Rs. " + Number(amount || 0).toLocaleString("en-IN");

  // Header
  doc.setFillColor(23, 33, 26);
  doc.rect(0, 0, W, 34, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  const gymLines = doc.splitTextToSize(String(gymName || "Gym"), inner).slice(0, 2);
  doc.text(gymLines, W / 2, 13, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(139, 195, 74);
  doc.text("PAYMENT RECEIPT", W / 2 - 0.4, 29, { align: "center", charSpace: 0.8 });

  // Rows
  const rows = [
    ["MEMBER", String(memberName || "-"), 13],
    ["AMOUNT PAID", money, 20],
    ["DATE", fmtDate(paidOn), 13],
    ["NEXT PAYMENT", fmtDate(nextDue), 13],
  ];

  let y = 46;
  rows.forEach(([label, value, size], i) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(130, 144, 135);
    doc.text(label, M, y, { charSpace: 0.4 });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(23, 33, 26);
    const line = doc.splitTextToSize(value, inner)[0];
    doc.text(line + (line !== value ? "..." : ""), M, y + 7);

    if (i < rows.length - 1) {
      doc.setDrawColor(220, 228, 222);
      doc.setLineDashPattern([1, 1], 0);
      doc.line(M, y + 12, W - M, y + 12);
      doc.setLineDashPattern([], 0);
    }
    y += i === 1 ? 24 : 21;
  });

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(130, 144, 135);
  doc.text("Thank you!", W / 2, 133, { align: "center" });

  const stamp = String(paidOn || "").slice(0, 10) || new Date().toLocaleDateString("en-CA");
  doc.save(`Receipt-${safeFileName(memberName)}-${stamp}.pdf`);
}