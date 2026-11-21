import Link from "next/link";
import { ChevronRight, Clock, UserCheck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { waLink } from "@/utils/dashboard";

export default function UpcomingRenewals({ members = [] }) {
  return (
    <div className="xl:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#FFF5E5] text-[#C48727] flex items-center justify-center">
                <Clock size={18} />
              </div>
              <h2 className="font-bold text-lg text-[#17211A]">Upcoming Renewals</h2>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Members whose memberships expire within 7 days
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#FFF7E9] text-[#A66C1E] rounded-full px-3 py-1.5 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E7A83E]" />
            {members.length} pending
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {members.length === 0 ? (
          <div className="py-16 px-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#EEF6E7] text-[#66963B] flex items-center justify-center mx-auto mb-4">
              <UserCheck size={28} />
            </div>

            <p className="font-semibold text-[#17211A]">
              All memberships are looking good!
            </p>

            <p className="text-sm text-gray-500 mt-2">
              No upcoming renewals in the next 7 days.
            </p>
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="p-4 sm:px-6 flex items-center justify-between gap-3 hover:bg-[#FAFCF9] transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-[#EEF4E8] flex items-center justify-center text-[#52772D] font-bold text-sm shrink-0">
                  {member.name?.charAt(0)?.toUpperCase() || "M"}
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {member.name}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {member.left === 0
                      ? "Expires today"
                      : `Expires in ${member.left} ${
                          member.left === 1 ? "day" : "days"
                        }`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`hidden sm:inline-flex px-2.5 py-1.5 rounded-lg text-[11px] font-semibold ${
                    member.left <= 2
                      ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {member.left === 0 ? "Today" : `${member.left}d left`}
                </span>

                <a
                  href={waLink(
                    member.phone,
                    member.name,
                    member.expiry_date,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#EAF7EC] text-[#258044] hover:bg-[#DDF1E1] px-3 py-2.5 rounded-xl text-xs font-semibold transition"
                >
                  <FaWhatsapp size={18} />
                  <span>Remind</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-5 sm:px-6 py-4 bg-[#FAFBFA] border-t border-gray-100">
        <Link
          href="/members"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#52772D] hover:text-[#17211A] transition"
        >
          View all members
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}