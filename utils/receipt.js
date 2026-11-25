const REGISTRATION_LABELS = {
  gst: "GSTIN",
  udyam: "MSME / Udyam",
  shop: "Shop & Establishment",
  cin: "CIN",
  other: "Registration No.",
};

const COLORS = {
  primary: [23, 33, 26],
  green: [139, 195, 74],
  darkGreen: [82, 119, 45],
  muted: [130, 144, 135],
  border: [220, 228, 222],
  light: [248, 250, 248],
  lightGreen: [234, 243, 226],
  white: [255, 255, 255],
};

function fmtDate(str) {
  if (!str) return "-";

  const [y, m, d] = String(str)
    .slice(0, 10)
    .split("-")
    .map(Number);

  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtMobile(mobile) {
  if (!mobile) return "";

  const value = String(mobile).replace(/\D/g, "");

  if (value.length === 10) {
    return `+91 ${value.slice(0, 5)} ${value.slice(5)}`;
  }

  if (value.length === 12 && value.startsWith("91")) {
    return `+91 ${value.slice(2, 7)} ${value.slice(7)}`;
  }

  return String(mobile);
}

function fmtMode(mode) {
  if (!mode) return "-";

  const value = String(mode).toLowerCase();

  if (value === "upi") return "UPI";

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function safeFileName(text) {
  return (
    String(text || "member")
      .replace(/[^\w\- ]+/g, "")
      .trim()
      .replace(/\s+/g, "-") || "member"
  );
}

export async function generateReceipt({
  gymName,
  gymMobile,
  registrationType,
  registrationNumber,
  memberName,
  memberMobile,
  paymentId,
  paymentMode,
  planName,
  amount,
  paidOn,
  nextDue,
}) {
  const { jsPDF } = await import("jspdf");

  const W = 110;
  const M = 8;
  const inner = W - M * 2;

  const money =
    "Rs. " +
    Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const registrationLabel =
    REGISTRATION_LABELS[registrationType] || "Registration No.";

  const registrationText = registrationNumber
    ? `${registrationLabel}: ${registrationNumber}`
    : "";

  // Measure content before creating the final PDF.
  const measure = new jsPDF({ unit: "mm" });

  measure.setFont("helvetica", "bold");
  measure.setFontSize(17);

  const gymLines = measure.splitTextToSize(
    String(gymName || "Gym"),
    inner,
  );

  measure.setFont("helvetica", "normal");
  measure.setFontSize(8);

  const registrationLines = registrationText
    ? measure.splitTextToSize(registrationText, inner)
    : [];

  measure.setFont("helvetica", "bold");
  measure.setFontSize(13);

  const memberLines = measure.splitTextToSize(
    String(memberName || "-"),
    inner - 8,
  );

  measure.setFontSize(10);

  const planLines = measure.splitTextToSize(
    String(planName || "-"),
    inner - 8,
  );

  measure.setFontSize(8);

  const referenceLines = paymentId
    ? measure.splitTextToSize(String(paymentId), inner)
    : [];

  // Dynamic receipt height.
  const headerHeight =
    19 +
    gymLines.length * 7 +
    (gymMobile ? 5 : 0) +
    registrationLines.length * 4;

  const memberHeight =
    14 +
    memberLines.length * 5.5 +
    (memberMobile ? 5 : 0);

  const paymentHeight = 46 + planLines.length * 5;

  const referenceHeight = paymentId
    ? 7 + referenceLines.length * 4
    : 0;

  const H =
    headerHeight +
    memberHeight +
    paymentHeight +
    referenceHeight +
    86;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [W, H],
  });

  function setText(size, color, weight = "normal") {
    doc.setFont("helvetica", weight);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  }

  function divider(y) {
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.25);
    doc.line(M, y, W - M, y);
  }

  // ==========================================
  // HEADER
  // ==========================================

  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, W, headerHeight, "F");

  doc.setFillColor(...COLORS.green);
  doc.rect(0, 0, W, 2, "F");

  let y = 11;

  setText(17, COLORS.white, "bold");

  gymLines.forEach((line) => {
    doc.text(line, W / 2, y, {
      align: "center",
    });

    y += 7;
  });

  // Gym contact number
  if (gymMobile) {
    setText(9, COLORS.border);

    doc.text(
      `Mobile: ${fmtMobile(gymMobile)}`,
      W / 2,
      y,
      { align: "center" },
    );

    y += 5;
  }

  // Government registration
  if (registrationLines.length) {
    setText(8, COLORS.border);

    registrationLines.forEach((line) => {
      doc.text(line, W / 2, y, {
        align: "center",
      });

      y += 4;
    });
  }

  // ==========================================
  // RECEIPT TITLE
  // ==========================================

  y = headerHeight + 10;

  setText(15, COLORS.primary, "bold");

  doc.text("PAYMENT RECEIPT", W / 2, y, {
    align: "center",
  });

  y += 5;

  setText(8, COLORS.muted);

  doc.text(
    "Membership fee acknowledgement",
    W / 2,
    y,
    { align: "center" },
  );

  y += 6;

  divider(y);

  y += 8;

  // ==========================================
  // MEMBER INFORMATION
  // ==========================================

  doc.setFillColor(...COLORS.light);
  doc.roundedRect(M, y, inner, memberHeight, 3, 3, "F");

  let memberY = y + 6;

  setText(7.5, COLORS.muted, "bold");
  doc.text("RECEIVED FROM", M + 4, memberY);

  memberY += 6;

  setText(13, COLORS.primary, "bold");

  memberLines.forEach((line) => {
    doc.text(line, M + 4, memberY);
    memberY += 5.5;
  });

  if (memberMobile) {
    setText(9, COLORS.muted);

    doc.text(
      fmtMobile(memberMobile),
      M + 4,
      memberY,
    );
  }

  y += memberHeight + 8;

  // ==========================================
  // PAYMENT DETAILS
  // ==========================================

  setText(8, COLORS.darkGreen, "bold");

  doc.text("PAYMENT DETAILS", M, y);

  y += 4;

  divider(y);

  y += 7;

  function detailRow(label, value) {
    setText(9, COLORS.muted);

    doc.text(label, M, y);

    setText(10, COLORS.primary, "bold");

    doc.text(String(value || "-"), W - M, y, {
      align: "right",
    });

    y += 9;
  }

  // Membership plan supports multiple lines.
  setText(9, COLORS.muted);
  doc.text("Membership Plan", M, y);

  y += 5;

  setText(10, COLORS.primary, "bold");

  planLines.forEach((line) => {
    doc.text(line, M, y);
    y += 5;
  });

  y += 3;

  detailRow("Payment Method", fmtMode(paymentMode));

  detailRow("Payment Date", fmtDate(paidOn));

  detailRow("Membership Expiry", fmtDate(nextDue));

  // ==========================================
  // PAYMENT REFERENCE
  // ==========================================

  if (paymentId) {
    setText(7.5, COLORS.muted, "bold");

    doc.text("PAYMENT REFERENCE", M, y);

    y += 5;

    setText(8, COLORS.primary);

    referenceLines.forEach((line) => {
      doc.text(line, M, y);
      y += 4;
    });

    y += 2;
  }

  // ==========================================
  // AMOUNT PAID
  // ==========================================

  const amountBoxHeight = 27;

  doc.setFillColor(...COLORS.lightGreen);
  doc.setDrawColor(...COLORS.green);
  doc.setLineWidth(0.3);

  doc.roundedRect(
    M,
    y,
    inner,
    amountBoxHeight,
    3,
    3,
    "FD",
  );

  setText(8, COLORS.darkGreen, "bold");

  doc.text("TOTAL AMOUNT PAID", M + 5, y + 7);

  setText(23, COLORS.primary, "bold");

  // Prevent large amounts from overflowing.
  while (
    doc.getTextWidth(money) > inner - 10 &&
    doc.getFontSize() > 10
  ) {
    doc.setFontSize(doc.getFontSize() - 1);
  }

  doc.text(money, M + 5, y + 18);

  y += amountBoxHeight + 9;

  // ==========================================
  // THANK YOU MESSAGE
  // ==========================================

  setText(11, COLORS.primary, "bold");

  doc.text("Thank you for your payment!", W / 2, y, {
    align: "center",
  });

  y += 5;

  setText(8, COLORS.muted);

  doc.text("Stay consistent. Stay strong.", W / 2, y, {
    align: "center",
  });

  // ==========================================
  // FOOTER & BRANDING
  // ==========================================

  const footerY = H - 24;

  divider(footerY);

  setText(7, COLORS.muted);

  doc.text(
    "This is a computer-generated payment receipt.",
    W / 2,
    footerY + 5,
    { align: "center" },
  );

  setText(7.5, COLORS.muted);

  doc.text("Powered by", W / 2, footerY + 11, {
    align: "center",
  });

  setText(13, COLORS.primary, "bold");

  doc.text("GYM PILOT", W / 2, footerY + 16, {
    align: "center",
  });

  setText(7, COLORS.darkGreen);

  doc.text(
    "Gym Management Software",
    W / 2,
    footerY + 20,
    { align: "center" },
  );

  doc.setFillColor(...COLORS.green);
  doc.rect(0, H - 2, W, 2, "F");

    // ==========================================
  // RETURN GENERATED PDF
  // ==========================================

  const stamp =
    String(paidOn || "").slice(0, 10) ||
    new Date().toISOString().slice(0, 10);

  const fileName =
    `Receipt-${safeFileName(memberName)}-${stamp}.pdf`;

  return { doc, fileName };
}

// ==========================================
// DOWNLOAD RECEIPT
// ==========================================

export async function downloadReceipt(data) {
  const { doc, fileName } = await generateReceipt(data);

  doc.save(fileName);
}

// ==========================================
// SHARE PDF RECEIPT
// ==========================================

export async function shareReceipt(data) {
  const { doc, fileName } = await generateReceipt(data);

  const file = new File(
    [doc.output("blob")],
    fileName,
    {
      type: "application/pdf",
    },
  );

  if (
    typeof navigator.share !== "function" ||
    !navigator.canShare?.({ files: [file] })
  ) {
    throw new Error(
      "PDF sharing is not supported on this browser or device."
    );
  }

  await navigator.share({
    files: [file],
  });
}