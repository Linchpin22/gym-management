
const pad = (n) => String(n).padStart(2, "0");

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d + days);

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function daysLeft(expiry) {
  if (!expiry) return null;

  const [y, m, d] = expiry.split("-").map(Number);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.round(
    (new Date(y, m - 1, d) - start) / 86400000
  );
}

export function formatDate(date) {
  if (!date) return "-";

  const [y, m, d] = date.split("-").map(Number);

  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getStatus(expiry) {
  const left = daysLeft(expiry);

  if (left === null) return "No Plan";
  if (left < 0) return "Expired";
  if (left <= 7) return "Expiring";

  return "Active";
}

export function waLink(phone, name, expiry) {
  const digits = (phone || "").replace(/\D/g, "");
  const full = digits.length === 10 ? "91" + digits : digits;

  const message = `Hi ${name}, your gym membership expires on ${expiry}. Please renew to continue. Thank you!`;

  return `https://wa.me/${full}?text=${encodeURIComponent(message)}`;
}

export function formatPaymentMode(mode) {
  if (!mode) return "No payment";

  const methods = {
    cash: "Cash",
    upi: "UPI",
    card: "Card",
    other: "Other",
  };

  return methods[mode.toLowerCase()] || mode;
}
