
import { getStatus } from "@/utils/memberUtils";

export default function StatusBadge({ expiry }) {
  const status = getStatus(expiry);

  const styles = {
    Active: "bg-[#EEF6E7] text-[#56852E] border-[#DDECCF]",
    Expiring: "bg-orange-50 text-orange-700 border-orange-100",
    Expired: "bg-red-50 text-red-700 border-red-100",
    "No Plan": "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap ${styles[status]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
