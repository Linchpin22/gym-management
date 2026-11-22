import { useEffect, useState } from "react";
import {
  Search,
  Users,
  CreditCard,
  RefreshCw,
  History,
  ChevronRight,
  Download,
  LoaderCircle,
} from "lucide-react";

import { FaWhatsapp } from "react-icons/fa";
import { FiPhoneCall } from "react-icons/fi";

import {
  daysLeft,
  formatDate,
  formatPaymentMode,
  getStatus,
  waLink,
} from "@/utils/memberUtils";

const ITEMS_PER_PAGE = 20;

function StatusBadge({ expiry }) {
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

function MemberActions({ member, onRenew, onViewHistory }) {
  return (
    <div className="flex items-center justify-end gap-2">
      {onViewHistory && (
        <button
          type="button"
          onClick={() => onViewHistory(member)}
          title="Payment history"
          aria-label={`Payment history of ${member.name}`}
          className="cursor-pointer p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
        >
          <History size={17} />
        </button>
      )}

      <button
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

function MemberAvatar({ name, mobile = false }) {
  return (
    <div
      className={`${mobile ? "w-11 h-11" : "w-10 h-10"} rounded-xl bg-[#EEF4E8] text-[#52772D] flex items-center justify-center font-bold text-sm shrink-0`}
    >
      {name?.charAt(0)?.toUpperCase() || "M"}
    </div>
  );
}

function EmptyState({ search, filter, onAddMember }) {
  const hasFilter = search || filter !== "All";

  return (
    <div className="py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#EEF4E8] text-[#719A43] flex items-center justify-center mx-auto mb-4">
        <Users size={28} />
      </div>

      <h3 className="font-bold text-[#17211A]">
        {hasFilter ? "No matching members" : "No members yet"}
      </h3>

      <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
        {hasFilter
          ? "Try changing your search or filters to find members."
          : "Add your first member and start managing your gym community."}
      </p>

      {!hasFilter && (
        <button
          onClick={onAddMember}
          className="inline-flex cursor-pointer items-center gap-2 mt-5 bg-[#17211A] hover:bg-[#304B32] text-white px-5 py-3 rounded-xl text-sm font-semibold transition"
        >
          + Add first member
        </button>
      )}
    </div>
  );
}

function DesktopTable({ members, onRenew, onViewHistory }) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-[#F7F9F7]">
          <tr className="text-[11px] uppercase tracking-wider text-gray-500">
            <th className="px-6 py-4 font-bold">Member</th>
            <th className="px-6 py-4 font-bold">Membership</th>
            <th className="px-6 py-4 font-bold">Join date</th>
            <th className="px-6 py-4 font-bold">Expiry date</th>
            <th className="px-6 py-4 font-bold">Last payment</th>
            <th className="px-6 py-4 font-bold">Status</th>
            <th className="px-6 py-4 font-bold text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {members.map((member) => {
            const left = daysLeft(member.expiry_date);

            return (
              <tr
                key={member.id}
                className="hover:bg-[#F8FBF5] transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <MemberAvatar name={member.name} />
                    <button
                      type="button"
                      onClick={() => onViewHistory?.(member)}
                      className="cursor-pointer text-left text-sm font-semibold text-gray-900 hover:text-[#52772D] hover:underline"
                    >
                      {member.name}
                    </button>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <CreditCard size={15} />
                    </div>
                    <p className="text-sm font-medium text-gray-800">
                      {member.plans?.name || "No plan"}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(member.join_date)}
                </td>

                <td className="px-6 py-4">
                  <p className="text-sm text-gray-700">
                    {formatDate(member.expiry_date)}
                  </p>

                  {left !== null && (
                    <p className="text-xs text-gray-400 mt-1">
                      {left < 0
                        ? `${Math.abs(left)} days overdue`
                        : left === 0
                          ? "Expires today"
                          : `${left} days remaining`}
                    </p>
                  )}
                </td>

                <td className="px-6 py-4">
                  {member.lastPayment ? (
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        ₹
                        {Number(member.lastPayment.amount).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(member.lastPayment.paid_on)} ·{" "}
                        {formatPaymentMode(member.lastPayment.mode)}
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No payment</span>
                  )}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge expiry={member.expiry_date} />
                </td>

                <td className="px-6 py-4">
                  <MemberActions
                    member={member}
                    onRenew={onRenew}
                    onViewHistory={onViewHistory}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MobileActions({ member, onRenew }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] gap-2">
      <button
        type="button"
        onClick={() => onRenew(member)}
        className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#17211A] text-sm font-semibold text-white active:bg-[#304B32]"
      >
        <RefreshCw size={16} />
        Renew
      </button>

      <a
        href={waLink(member.phone, member.name, member.expiry_date)}
        target="_blank"
        rel="noreferrer"
        aria-label={`WhatsApp ${member.name}`}
        className="flex h-12 w-12 items-center justify-center rounded-xl border border-green-200 text-green-600 active:bg-green-50"
      >
        <FaWhatsapp size={22} />
      </a>

      <a
        href={`tel:${(member.phone || "").replace(/\D/g, "")}`}
        aria-label={`Call ${member.name}`}
        className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-200 text-blue-600 active:bg-blue-50"
      >
        <FiPhoneCall size={20} />
      </a>
    </div>
  );
}

function MobileMemberCards({ members, onRenew, onViewHistory }) {
  return (
    <div className="md:hidden divide-y divide-gray-100">
      {members.map((member) => {
        const left = daysLeft(member.expiry_date);

        return (
          <div key={member.id} className="space-y-3 p-4">
            {/* Tap to see payment history */}
            <button
              type="button"
              onClick={() => onViewHistory?.(member)}
              aria-label={`Payment history of ${member.name}`}
              className="flex w-full cursor-pointer items-center gap-3 text-left"
            >
              <MemberAvatar name={member.name} mobile />

              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-gray-900">
                  {member.name}
                </p>
                <p className="mt-0.5 truncate text-sm text-gray-500">
                  {member.phone} · {member.plans?.name || "No plan"}
                </p>
              </div>

              <StatusBadge expiry={member.expiry_date} />
              <ChevronRight size={18} className="shrink-0 text-gray-400" />
            </button>

            <div className="flex items-start justify-between gap-3 rounded-xl bg-[#F8FAF7] px-3 py-3">
              <div>
                <p className="text-[11px] font-medium text-gray-400">Expiry</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-800">
                  {formatDate(member.expiry_date)}
                </p>
                {left !== null && (
                  <p
                    className={`mt-0.5 text-xs font-medium ${
                      left < 0
                        ? "text-red-600"
                        : left <= 7
                          ? "text-orange-600"
                          : "text-gray-500"
                    }`}
                  >
                    {left < 0
                      ? `${Math.abs(left)} days overdue`
                      : left === 0
                        ? "Expires today"
                        : `${left} days left`}
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="text-[11px] font-medium text-gray-400">Last payment</p>
                {member.lastPayment ? (
                  <>
                    <p className="mt-0.5 text-sm font-semibold text-gray-800">
                      ₹{Number(member.lastPayment.amount).toLocaleString("en-IN")}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {formatDate(member.lastPayment.paid_on)}
                    </p>
                  </>
                ) : (
                  <p className="mt-0.5 text-sm text-gray-400">No payment</p>
                )}
              </div>
            </div>

            <MobileActions member={member} onRenew={onRenew} />
          </div>
        );
      })}
    </div>
  );
}

export default function MembersTable({
  members,
  filteredMembers,
  stats,
  search,
  setSearch,
  filter,
  setFilter,
  onRenew,
  onViewHistory,
  onExport,
  exporting = false,
  onAddMember,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const filters = ["All", "Active", "Expiring", "Expired"];

  // Pagination is applied AFTER search and filtering.
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const endIndex = Math.min(
    startIndex + ITEMS_PER_PAGE,
    filteredMembers.length,
  );

  const currentMembers = filteredMembers.slice(startIndex, endIndex);

  // Reset to first page whenever search or filter changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  // Keep the page valid when members are removed.
  useEffect(() => {
    if (currentPage > Math.max(totalPages, 1)) {
      setCurrentPage(Math.max(totalPages, 1));
    }
  }, [currentPage, totalPages]);

  function getCount(item) {
    if (item === "All") return stats.total;
    if (item === "Active") return stats.active;
    if (item === "Expiring") return stats.expiring;
    return stats.expired;
  }

  return (
    <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#EEF4E8] text-[#52772D] flex items-center justify-center">
                <Users size={18} />
              </div>

              <h2 className="font-bold text-[#17211A] text-lg">
                All Members
              </h2>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Showing {filteredMembers.length} of {members.length} members
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <div className="relative w-full lg:w-80">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name or phone..."
              className="w-full pl-11 pr-4 py-3 bg-[#F7F9F7] border border-gray-200 text-gray-900 rounded-xl text-sm outline-none focus:bg-white focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/15 transition"
            />
          </div>

          {onExport && (
            <button
              type="button"
              onClick={onExport}
              disabled={exporting || members.length === 0}
              className="flex h-[46px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#DCE4DE] bg-white px-4 text-sm font-semibold text-[#17211A] transition hover:bg-[#F7F9F7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exporting ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Download size={17} />
              )}
              {exporting ? "Preparing..." : "Download Excel"}
            </button>
          )}
          </div>
        </div>

        <div className="flex gap-2 mt-6 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => {
                setFilter(item);
                setCurrentPage(1);
              }}
              className={`px-4 py-2.5 rounded-xl cursor-pointer text-sm font-semibold whitespace-nowrap transition ${
                filter === item
                  ? "bg-[#17211A] text-white shadow-sm"
                  : "bg-[#F5F7F6] text-gray-600 hover:bg-[#EEF4E8] hover:text-[#52772D]"
              }`}
            >
              {item}
              <span className="ml-2 opacity-70">{getCount(item)}</span>
            </button>
          ))}
        </div>
      </div>

      {filteredMembers.length > 0 ? (
        <>
          <DesktopTable
            members={currentMembers}
            onRenew={onRenew}
            onViewHistory={onViewHistory}
          />

          <MobileMemberCards
            members={currentMembers}
            onRenew={onRenew}
            onViewHistory={onViewHistory}
          />

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 sm:px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-800">
                {startIndex + 1}-{endIndex}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800">
                {filteredMembers.length}
              </span>{" "}
              members
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>

              <span className="text-sm font-semibold text-[#17211A] px-2 whitespace-nowrap">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          search={search}
          filter={filter}
          onAddMember={onAddMember}
        />
      )}
    </section>
  );
}