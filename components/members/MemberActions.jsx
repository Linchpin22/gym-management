
import { RefreshCw } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { FiPhoneCall } from "react-icons/fi";
import { waLink } from "@/utils/memberUtils";

export default function MemberActions({ member, onRenew }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onRenew(member)}
        className="flex cursor-pointer items-center gap-1.5 bg-[#17211A] text-white hover:bg-[#304B32] px-3 py-2 rounded-lg text-xs font-semibold transition"
      >
        <RefreshCw size={14} />
        Renew
      </button>

      <a
        href={waLink(member.phone, member.name, member.expiry_date)}
        target="_blank"
        rel="noreferrer"
        title="WhatsApp reminder"
        className="p-2.5 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition"
      >
        <FaWhatsapp size={18} />
      </a>

      <a
        href={`tel:${(member.phone || "").replace(/\D/g, "")}`}
        title={`Call ${member.name}`}
        className="p-2.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
      >
        <FiPhoneCall size={17} />
      </a>
    </div>
  );
}
