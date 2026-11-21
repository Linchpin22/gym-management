
export const pad = (n) => String(n).padStart(2, "0");

export const fmt = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export function daysLeft(expiry, today = new Date()) {
  if (!expiry) return null;

  const [y, m, d] = expiry.split("-").map(Number);

  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return Math.round(
    (new Date(y, m - 1, d) - start) / 86400000
  );
}

export function waLink(phone, name, expiry) {
  const digits = (phone || "").replace(/\D/g, "");
  const full = digits.length === 10 ? "91" + digits : digits;

  const message = `Hi ${name}, your gym membership expires on ${expiry}. Please renew to continue. Thank you!`;

  return `https://wa.me/${full}?text=${encodeURIComponent(message)}`;
}
