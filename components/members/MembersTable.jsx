"use client";

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

import MemberActionMenu from "./MemberActionMenu";

import {
  daysLeft,
  formatDate,
  formatPaymentMode,
  getStatus,
  waLink,
} from "@/utils/memberUtils";

const ITEMS_PER_PAGE = 20;

/* -------------------------------------------------------------------------- */
/*                                Status Badge                                */
/* -------------------------------------------------------------------------- */

function StatusBadge({ expiry }) {
  const status = getStatus(expiry);

  const styles = {
    Active: "bg-[#EEF6E7] text-[#56852E] border-[#DDECCF]",
    Expiring: "bg-orange-50 text-orange-700 border-orange-100",
    Expired: "bg-red-50 text-red-700 border-red-200",
    "No Plan": "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap
        rounded-full border px-2.5 py-1.5 text-xs font-semibold
        ${styles[status] || styles["No Plan"]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Member Actions                               */
/* -------------------------------------------------------------------------- */

function MemberActions({
  member,
  onRenew,
  onViewHistory,
  onEdit,
  onAdjustMembership,
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      {onViewHistory && (
        <button
          type="button"
          onClick={() => onViewHistory(member)}
          title="Payment history"
          aria-label={`Payment history of ${member.name}`}
          className="cursor-pointer rounded-lg border
            border-gray-200 p-2.5 text-gray-600
            transition hover:bg-gray-50"
        >
          <History size={17} />
        </button>
      )}

      <button
        type="button"
        onClick={() => onRenew(member)}
        className="flex cursor-pointer items-center gap-1.5
          rounded-lg bg-[#17211A] px-3 py-2 text-xs
          font-semibold text-white transition
          hover:bg-[#304B32]"
      >
        <RefreshCw size={14} />
        Renew
      </button>

      <a
        href={waLink(
          member.phone,
          member.name,
          member.expiry_date,
        )}
        target="_blank"
        rel="noreferrer"
        title="WhatsApp reminder"
        className="rounded-lg border border-green-200
          p-2.5 text-green-600 transition hover:bg-green-50"
      >
        <FaWhatsapp size={18} />
      </a>

      <a
        href={`tel:${(member.phone || "").replace(/\D/g, "")}`}
        title={`Call ${member.name}`}
        className="rounded-lg border border-blue-200
          p-2.5 text-blue-600 transition hover:bg-blue-50"
      >
        <FiPhoneCall size={17} />
      </a>

      <MemberActionMenu
        member={member}
        onEdit={onEdit}
        onAdjustMembership={onAdjustMembership}
        onViewHistory={onViewHistory}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Member Avatar                                */
/* -------------------------------------------------------------------------- */

function MemberAvatar({ name, mobile = false }) {
  return (
    <div
      className={`${
        mobile ? "h-11 w-11" : "h-10 w-10"
      } flex shrink-0 items-center justify-center
        rounded-xl bg-[#EEF4E8] text-sm font-bold
        text-[#52772D]`}
    >
      {name?.charAt(0)?.toUpperCase() || "M"}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Empty State                                 */
/* -------------------------------------------------------------------------- */

function EmptyState({ search, filter, onAddMember }) {
  const hasFilter = search || filter !== "All";

  return (
    <div className="px-6 py-16 text-center">
      <div
        className="mx-auto mb-4 flex h-16 w-16 items-center
          justify-center rounded-2xl bg-[#EEF4E8]
          text-[#719A43]"
      >
        <Users size={28} />
      </div>

      <h3 className="font-bold text-[#17211A]">
        {hasFilter ? "No matching members" : "No members yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
        {hasFilter
          ? "Try changing your search or filters to find members."
          : "Add your first member and start managing your gym community."}
      </p>

      {!hasFilter && (
        <button
          type="button"
          onClick={onAddMember}
          className="mt-5 inline-flex cursor-pointer items-center
            gap-2 rounded-xl bg-[#17211A] px-5 py-3
            text-sm font-semibold text-white transition
            hover:bg-[#304B32]"
        >
          + Add first member
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Desktop Table                                */
/* -------------------------------------------------------------------------- */

function DesktopTable({
  members,
  onRenew,
  onViewHistory,
  onEdit,
  onAdjustMembership,
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full text-left">
        <thead className="bg-[#F7F9F7]">
          <tr className="text-[11px] uppercase tracking-wider text-gray-500">
            <th className="px-6 py-4 font-bold">Member</th>
            <th className="px-6 py-4 font-bold">Membership</th>
            <th className="px-6 py-4 font-bold">Join date</th>
            <th className="px-6 py-4 font-bold">Expiry date</th>
            <th className="px-6 py-4 font-bold">Last payment</th>
            <th className="px-6 py-4 font-bold">Status</th>
            <th className="px-6 py-4 text-right font-bold">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {members.map((member) => {
            const left = daysLeft(member.expiry_date);

            return (
              <tr
                key={member.id}
                className="transition-colors hover:bg-[#F8FBF5]"
              >
                {/* Member */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <MemberAvatar name={member.name} />

                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onViewHistory?.(member)}
                        className="cursor-pointer text-left
                          text-sm font-semibold text-gray-900
                          hover:text-[#52772D] hover:underline"
                      >
                        {member.name}
                      </button>

                      <p className="mt-0.5 whitespace-nowrap text-xs text-gray-500">
                        {member.phone || "—"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Membership */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 shrink-0
                        items-center justify-center rounded-lg
                        bg-blue-50 text-blue-600"
                    >
                      <CreditCard size={15} />
                    </div>

                    <p className="text-sm font-medium text-gray-800">
                      {member.plans?.name || "No plan"}
                    </p>
                  </div>
                </td>

                {/* Join Date */}
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {formatDate(member.join_date)}
                </td>

                {/* Expiry Date */}
                <td className="px-6 py-4">
                  <p className="whitespace-nowrap text-sm text-gray-700">
                    {formatDate(member.expiry_date)}
                  </p>

                  {left !== null && (
                    <p
                      className={`mt-1 whitespace-nowrap text-xs
                        ${
                          left < 0
                            ? "text-red-600"
                            : left <= 7
                              ? "text-orange-600"
                              : "text-gray-400"
                        }`}
                    >
                      {left < 0
                        ? `${Math.abs(left)} days overdue`
                        : left === 0
                          ? "Expires today"
                          : `${left} days remaining`}
                    </p>
                  )}
                </td>

                {/* Last Payment */}
                <td className="px-6 py-4">
                  {member.lastPayment ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => onViewHistory?.(member)}
                        className="cursor-pointer whitespace-nowrap
                          text-sm font-semibold text-gray-800
                          hover:text-[#52772D] hover:underline"
                        title="View payment history"
                      >
                        ₹
                        {Number(
                          member.lastPayment.amount,
                        ).toLocaleString("en-IN")}
                      </button>

                      <p className="mt-1 whitespace-nowrap text-xs text-gray-500">
                        {formatDate(member.lastPayment.paid_on)}
                        {" · "}
                        {formatPaymentMode(
                          member.lastPayment.mode,
                        )}
                      </p>
                    </div>
                  ) : (
                    <span className="whitespace-nowrap text-sm text-gray-400">
                      No payment
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <StatusBadge expiry={member.expiry_date} />
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <MemberActions
                    member={member}
                    onRenew={onRenew}
                    onViewHistory={onViewHistory}
                    onEdit={onEdit}
                    onAdjustMembership={onAdjustMembership}
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

/* -------------------------------------------------------------------------- */
/*                               Mobile Actions                               */
/* -------------------------------------------------------------------------- */

function MobileActions({
  member,
  onRenew,
  onEdit,
  onAdjustMembership,
  onViewHistory,
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onRenew(member)}
        className="flex h-12 flex-1 cursor-pointer items-center
          justify-center gap-2 rounded-xl bg-[#17211A]
          text-sm font-semibold text-white
          active:bg-[#304B32]"
      >
        <RefreshCw size={16} />
        Renew
      </button>

      <a
        href={waLink(
          member.phone,
          member.name,
          member.expiry_date,
        )}
        target="_blank"
        rel="noreferrer"
        aria-label={`WhatsApp ${member.name}`}
        className="flex h-12 w-12 shrink-0 items-center
          justify-center rounded-xl border border-green-200
          text-green-600 active:bg-green-50"
      >
        <FaWhatsapp size={22} />
      </a>

      <a
        href={`tel:${(member.phone || "").replace(/\D/g, "")}`}
        aria-label={`Call ${member.name}`}
        className="flex h-12 w-12 shrink-0 items-center
          justify-center rounded-xl border border-blue-200
          text-blue-600 active:bg-blue-50"
      >
        <FiPhoneCall size={20} />
      </a>

      <MemberActionMenu
        member={member}
        onEdit={onEdit}
        onAdjustMembership={onAdjustMembership}
        onViewHistory={onViewHistory}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Mobile Member Cards                             */
/* -------------------------------------------------------------------------- */

function MobileMemberCards({
  members,
  onRenew,
  onViewHistory,
  onEdit,
  onAdjustMembership,
}) {
  return (
    <div className="divide-y divide-gray-100 md:hidden">
      {members.map((member) => {
        const left = daysLeft(member.expiry_date);

        return (
          <div key={member.id} className="space-y-3 p-4">
            {/* Member Information */}
            <button
              type="button"
              onClick={() => onViewHistory?.(member)}
              aria-label={`Payment history of ${member.name}`}
              className="flex w-full cursor-pointer
                items-center gap-3 text-left"
            >
              <MemberAvatar name={member.name} mobile />

              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-gray-900">
                  {member.name}
                </p>

                <p className="mt-0.5 truncate text-sm text-gray-500">
                  {member.phone || "—"} ·{" "}
                  {member.plans?.name || "No plan"}
                </p>
              </div>

              <StatusBadge expiry={member.expiry_date} />

              <ChevronRight
                size={18}
                className="shrink-0 text-gray-400"
              />
            </button>

            {/* Membership and Payment Details */}
            <div
              className="flex items-start justify-between gap-3
                rounded-xl bg-[#F8FAF7] px-3 py-3"
            >
              <div>
                <p className="text-[11px] font-medium text-gray-400">
                  Expiry
                </p>

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
                <p className="text-[11px] font-medium text-gray-400">
                  Last payment
                </p>

                {member.lastPayment ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onViewHistory?.(member)}
                      className="mt-0.5 cursor-pointer text-sm
                        font-semibold text-gray-800
                        hover:text-[#52772D]"
                    >
                      ₹
                      {Number(
                        member.lastPayment.amount,
                      ).toLocaleString("en-IN")}
                    </button>

                    <p className="mt-0.5 text-xs text-gray-500">
                      {formatDate(member.lastPayment.paid_on)}
                      {" · "}
                      {formatPaymentMode(
                        member.lastPayment.mode,
                      )}
                    </p>
                  </>
                ) : (
                  <p className="mt-0.5 text-sm text-gray-400">
                    No payment
                  </p>
                )}
              </div>
            </div>

            <MobileActions
              member={member}
              onRenew={onRenew}
              onEdit={onEdit}
              onAdjustMembership={onAdjustMembership}
              onViewHistory={onViewHistory}
            />
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Main Members Table                              */
/* -------------------------------------------------------------------------- */

export default function MembersTable({
  members = [],
  filteredMembers = [],
  stats = {},
  search,
  setSearch,
  filter,
  setFilter,
  onRenew,
  onViewHistory,
  onEdit,
  onAdjustMembership,
  onExport,
  exporting = false,
  onAddMember,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const filters = ["All", "Active", "Expiring", "Expired"];

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMembers.length / ITEMS_PER_PAGE),
  );

  const validPage = Math.min(currentPage, totalPages);

  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;

  const endIndex = Math.min(
    startIndex + ITEMS_PER_PAGE,
    filteredMembers.length,
  );

  const currentMembers = filteredMembers.slice(
    startIndex,
    endIndex,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function getCount(item) {
    if (item === "All") return stats.total ?? 0;
    if (item === "Active") return stats.active ?? 0;
    if (item === "Expiring") return stats.expiring ?? 0;

    return stats.expired ?? 0;
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-100 p-5 sm:p-6">
        <div
          className="flex flex-col justify-between gap-4
            lg:flex-row lg:items-center"
        >
          <div>
            <div className="flex items-center gap-2">
              <div
                className="flex h-9 w-9 items-center
                  justify-center rounded-xl bg-[#EEF4E8]
                  text-[#52772D]"
              >
                <Users size={18} />
              </div>

              <h2 className="text-lg font-bold text-[#17211A]">
                All Members
              </h2>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Showing {filteredMembers.length} of{" "}
              {members.length} members
            </p>
          </div>

          {/* Search and Export */}
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="relative w-full lg:w-80">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2
                  -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name or phone..."
                className="w-full rounded-xl border border-gray-200
                  bg-[#F7F9F7] py-3 pl-11 pr-4 text-sm
                  text-gray-900 outline-none transition
                  focus:border-[#8BC34A] focus:bg-white
                  focus:ring-2 focus:ring-[#8BC34A]/15"
              />
            </div>

            {onExport && (
              <button
                type="button"
                onClick={onExport}
                disabled={exporting || members.length === 0}
                className="flex h-[46px] shrink-0 cursor-pointer
                  items-center justify-center gap-2 rounded-xl
                  border border-[#DCE4DE] bg-white px-4
                  text-sm font-semibold text-[#17211A]
                  transition hover:bg-[#F7F9F7]
                  disabled:cursor-not-allowed disabled:opacity-50"
              >
                {exporting ? (
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Download size={17} />
                )}

                {exporting ? "Preparing..." : "Download Excel"}
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setFilter(item);
                setCurrentPage(1);
              }}
              className={`cursor-pointer whitespace-nowrap
                rounded-xl px-4 py-2.5 text-sm
                font-semibold transition ${
                  filter === item
                    ? "bg-[#17211A] text-white shadow-sm"
                    : "bg-[#F5F7F6] text-gray-600 hover:bg-[#EEF4E8] hover:text-[#52772D]"
                }`}
            >
              {item}

              <span className="ml-2 opacity-70">
                {getCount(item)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Member Records */}
      {filteredMembers.length > 0 ? (
        <>
          <DesktopTable
            members={currentMembers}
            onRenew={onRenew}
            onViewHistory={onViewHistory}
            onEdit={onEdit}
            onAdjustMembership={onAdjustMembership}
          />

          <MobileMemberCards
            members={currentMembers}
            onRenew={onRenew}
            onViewHistory={onViewHistory}
            onEdit={onEdit}
            onAdjustMembership={onAdjustMembership}
          />

          {/* Pagination */}
          <div
            className="flex flex-col items-center justify-between
              gap-4 border-t border-gray-100 px-5 py-4
              sm:flex-row sm:px-6"
          >
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
                type="button"
                onClick={() =>
                  setCurrentPage((prev) => Math.max(1, prev - 1))
                }
                disabled={validPage === 1}
                className="rounded-lg border border-gray-200
                  px-3 py-2 text-sm font-medium text-gray-600
                  transition hover:bg-gray-50
                  disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="whitespace-nowrap px-2 text-sm font-semibold text-[#17211A]">
                {validPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(totalPages, prev + 1),
                  )
                }
                disabled={validPage >= totalPages}
                className="rounded-lg border border-gray-200
                  px-3 py-2 text-sm font-medium text-gray-600
                  transition hover:bg-gray-50
                  disabled:cursor-not-allowed disabled:opacity-40"
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