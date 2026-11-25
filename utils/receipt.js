
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
  muted: [110, 125, 115],
  border: [220, 228, 222],
  light: [248, 250, 248],
  lightGreen: [234, 243, 226],
  white: [255, 255, 255],
};

// ==========================================
// HELPERS
// ==========================================

function fmtDate(str) {
  if (!str) return "-";

  const [y, m, d] = String(str)
    .slice(0, 10)
    .split("-")
    .map(Number);

  const date = new Date(y, m - 1, d);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
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

  const value = String(mode).trim().toLowerCase();

  const modes = {
    upi: "UPI",
    cash: "Cash",
    card: "Card",
    bank_transfer: "Bank Transfer",
    "bank transfer": "Bank Transfer",
    cheque: "Cheque",
    online: "Online",
  };

  return (
    modes[value] ||
    value.charAt(0).toUpperCase() + value.slice(1)
  );
}

function safeFileName(text) {
  return (
    String(text || "member")
      .replace(/[^\w\- ]+/g, "")
      .trim()
      .replace(/\s+/g, "-") || "member"
  );
}

function fmtAmount(amount) {
  const value = Number(amount ?? 0);

  return (
    "Rs. " +
    (Number.isFinite(value) ? value : 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )
  );
}

// ==========================================
// GENERATE RECEIPT
// ==========================================

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

  const money = fmtAmount(amount);

  const registrationLabel =
    REGISTRATION_LABELS[
      String(registrationType || "").toLowerCase()
    ] || "Registration No.";

  const registrationText = registrationNumber
    ? `${registrationLabel}: ${registrationNumber}`
    : "";

  // ==========================================
  // RENDER RECEIPT
  // ==========================================

  function renderReceipt(doc) {
    let y = 0;

    function setText(size, color, weight = "normal") {
      doc.setFont("helvetica", weight);
      doc.setFontSize(size);
      doc.setTextColor(...color);
    }

    function divider(position) {
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.25);
      doc.line(M, position, W - M, position);
    }

    function getLines(value, width = inner) {
      return doc.splitTextToSize(
        String(value ?? "-"),
        width
      );
    }

    function drawLines(
      lines,
      x,
      startY,
      lineHeight,
      align = "left"
    ) {
      let currentY = startY;

      lines.forEach((line) => {
        doc.text(String(line), x, currentY, {
          align,
        });

        currentY += lineHeight;
      });

      return currentY;
    }

    // ==========================================
    // HEADER MEASUREMENT
    // ==========================================

    setText(17, COLORS.white, "bold");

    const gymLines = getLines(gymName || "Gym");

    setText(8.5, COLORS.border);

    const gymMobileLines = gymMobile
      ? getLines(`Mobile: ${fmtMobile(gymMobile)}`)
      : [];

    setText(8, COLORS.border);

    const registrationLines = registrationText
      ? getLines(registrationText)
      : [];

    const headerHeight =
      12 +
      gymLines.length * 7 +
      gymMobileLines.length * 4.5 +
      registrationLines.length * 4;

    // ==========================================
    // HEADER BACKGROUND
    // ==========================================

    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, W, headerHeight, "F");

    doc.setFillColor(...COLORS.green);
    doc.rect(0, 0, W, 2, "F");

    y = 10;

    // Gym name
    setText(17, COLORS.white, "bold");

    y = drawLines(
      gymLines,
      W / 2,
      y,
      7,
      "center"
    );

    // Gym mobile
    if (gymMobileLines.length) {
      setText(8.5, COLORS.border);

      y = drawLines(
        gymMobileLines,
        W / 2,
        y,
        4.5,
        "center"
      );
    }

    // Government registration
    if (registrationLines.length) {
      setText(8, COLORS.border);

      y = drawLines(
        registrationLines,
        W / 2,
        y,
        4,
        "center"
      );
    }

    // ==========================================
    // RECEIPT TITLE
    // ==========================================

    y = headerHeight + 9;

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
      {
        align: "center",
      }
    );

    y += 5;

    divider(y);

    y += 6;

    // ==========================================
    // MEMBER INFORMATION
    // ==========================================

    setText(13, COLORS.primary, "bold");

    const memberLines = getLines(
      memberName || "-",
      inner - 8
    );

    setText(9, COLORS.muted);

    const memberMobileLines = memberMobile
      ? getLines(
          fmtMobile(memberMobile),
          inner - 8
        )
      : [];

    const memberHeight =
      12 +
      memberLines.length * 5.5 +
      memberMobileLines.length * 4.5;

    doc.setFillColor(...COLORS.light);

    doc.roundedRect(
      M,
      y,
      inner,
      memberHeight,
      3,
      3,
      "F"
    );

    let memberY = y + 6;

    setText(7.5, COLORS.muted, "bold");

    doc.text(
      "RECEIVED FROM",
      M + 4,
      memberY
    );

    memberY += 6;

    setText(13, COLORS.primary, "bold");

    memberY = drawLines(
      memberLines,
      M + 4,
      memberY,
      5.5
    );

    if (memberMobileLines.length) {
      setText(9, COLORS.muted);

      drawLines(
        memberMobileLines,
        M + 4,
        memberY,
        4.5
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

    y += 6;

    // Payment details row with text wrapping.
    function detailRow(label, value) {
      const labelWidth = inner * 0.44;
      const gap = 4;
      const valueWidth = inner - labelWidth - gap;
      const lineHeight = 4.5;

      setText(9, COLORS.muted);

      const labelLines = getLines(
        label,
        labelWidth
      );

      drawLines(
        labelLines,
        M,
        y,
        lineHeight
      );

      setText(10, COLORS.primary, "bold");

      const valueLines = getLines(
        value || "-",
        valueWidth
      );

      drawLines(
        valueLines,
        W - M,
        y,
        lineHeight,
        "right"
      );

      y +=
        Math.max(
          labelLines.length,
          valueLines.length
        ) *
          lineHeight +
        4;
    }

    // Membership plan
    setText(9, COLORS.muted);

    doc.text("Membership Plan", M, y);

    y += 5;

    setText(10, COLORS.primary, "bold");

    const planLines = getLines(planName || "-");

    y = drawLines(
      planLines,
      M,
      y,
      5
    );

    y += 3;

    detailRow(
      "Payment Method",
      fmtMode(paymentMode)
    );

    detailRow(
      "Payment Date",
      fmtDate(paidOn)
    );

    detailRow(
      "Membership Expiry",
      fmtDate(nextDue)
    );

    // ==========================================
    // PAYMENT REFERENCE
    // ==========================================

    if (paymentId) {
      setText(7.5, COLORS.muted, "bold");

      doc.text(
        "PAYMENT REFERENCE",
        M,
        y
      );

      y += 5;

      setText(8, COLORS.primary);

      const referenceLines = getLines(
        String(paymentId)
      );

      y = drawLines(
        referenceLines,
        M,
        y,
        4
      );

      y += 3;
    }

    // ==========================================
    // TOTAL AMOUNT PAID
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
      "FD"
    );

    setText(8, COLORS.darkGreen, "bold");

    doc.text(
      "TOTAL AMOUNT PAID",
      M + 5,
      y + 7
    );

    setText(23, COLORS.primary, "bold");

    // Prevent amount overflow.
    while (
      doc.getTextWidth(money) > inner - 10 &&
      doc.getFontSize() > 6
    ) {
      doc.setFontSize(
        doc.getFontSize() - 1
      );
    }

    doc.text(
      money,
      M + 5,
      y + 18
    );

    // Move below amount box.
    y += amountBoxHeight + 9;

    // ==========================================
    // THANK YOU MESSAGE
    // ==========================================

    setText(11, COLORS.primary, "bold");

    doc.text(
      "Thank you for your payment!",
      W / 2,
      y,
      {
        align: "center",
      }
    );

    y += 5;

    setText(8, COLORS.muted);

    doc.text(
      "Stay consistent. Stay strong.",
      W / 2,
      y,
      {
        align: "center",
      }
    );

    // Proper gap before footer.
    y += 9;

    // ==========================================
    // FOOTER & BRANDING
    // ==========================================

    // Footer follows content instead of using H - 24.
    divider(y);

    y += 6;

    setText(7, COLORS.muted);

    const disclaimerLines = getLines(
      "This is a computer-generated payment receipt."
    );

    y = drawLines(
      disclaimerLines,
      W / 2,
      y,
      3.5,
      "center"
    );

    y += 3;

    setText(7.5, COLORS.muted);

    doc.text(
      "Powered by",
      W / 2,
      y,
      {
        align: "center",
      }
    );

    y += 6;

    setText(13, COLORS.primary, "bold");

    doc.text(
      "GymHisab",
      W / 2,
      y,
      {
        align: "center",
      }
    );

    y += 5;

    setText(7, COLORS.darkGreen);

    doc.text(
      "Gym Management Software",
      W / 2,
      y,
      {
        align: "center",
      }
    );

    y += 6;

    // ==========================================
    // BOTTOM BRANDING STRIP
    // ==========================================

    doc.setFillColor(...COLORS.green);
    doc.rect(0, y, W, 2, "F");

    y += 2;

    // Return exact content height.
    return y;
  }

  // ==========================================
  // FIRST PASS: CALCULATE RECEIPT HEIGHT
  // ==========================================

  const measureDoc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [W, 1000],
  });

  const H = renderReceipt(measureDoc);

  // ==========================================
  // SECOND PASS: GENERATE FINAL PDF
  // ==========================================

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [W, H],
    compress: true,
  });

  doc.setProperties({
    title: "Gym Membership Payment Receipt",
    subject: "Membership Payment Receipt",
    author: gymName || "GymHisab",
    creator: "GymHisab",
  });

  renderReceipt(doc);

  // ==========================================
  // FILE NAME
  // ==========================================

  const stamp =
    String(paidOn || "").slice(0, 10) ||
    new Date().toISOString().slice(0, 10);

  const fileName =
    `Receipt-${safeFileName(memberName)}-${stamp}.pdf`;

  return {
    doc,
    fileName,
  };
}

// ==========================================
// DOWNLOAD RECEIPT
// ==========================================

export async function downloadReceipt(data) {
  const { doc, fileName } =
    await generateReceipt(data);

  doc.save(fileName);
}

// ==========================================
// SHARE PDF RECEIPT
// ==========================================

export async function shareReceipt(data) {
  const { doc, fileName } =
    await generateReceipt(data);

  const file = new File(
    [doc.output("blob")],
    fileName,
    {
      type: "application/pdf",
    }
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

// ==========================================
// PRINT RECEIPT
// ==========================================

export async function printReceipt(data) {
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    throw new Error(
      "Please allow popups to print the receipt."
    );
  }

  try {
    const { doc } = await generateReceipt(data);

    doc.autoPrint();

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);

    printWindow.location.href = url;

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 300000);
  } catch (error) {
    printWindow.close();
    throw error;
  }
}
