"use client";

import { useEffect, useRef, useState } from "react";
import {
  EllipsisVertical,
  Pencil,
  CalendarCog,
  History,
} from "lucide-react";

export default function MemberActionMenu({
  member,
  onEdit,
  onAdjustMembership,
  onViewHistory,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, []);

  const actions = [
    {
      label: "Edit member",
      icon: Pencil,
      handler: onEdit,
    },
    {
      label: "Adjust membership",
      icon: CalendarCog,
      handler: onAdjustMembership,
    },
    {
      label: "Payment history",
      icon: History,
      handler: onViewHistory,
    },
  ].filter((action) => action.handler);

  if (!actions.length) return null;

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`More actions for ${member.name}`}
        aria-expanded={open}
        className={`flex h-10 w-10 cursor-pointer items-center
          justify-center rounded-lg border transition
          ${
            open
              ? "border-[#B9CDA8] bg-[#EEF4E8] text-[#52772D]"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
      >
        <EllipsisVertical size={19} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2
          w-52 rounded-xl border border-gray-200
          bg-white p-1.5 shadow-lg"
        >
          {actions.map(({ label, icon: Icon, handler }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setOpen(false);
                handler(member);
              }}
              className="flex w-full cursor-pointer items-center
                gap-3 rounded-lg px-3 py-2.5 text-left
                text-sm font-medium text-gray-700
                transition hover:bg-[#EEF4E8]
                hover:text-[#52772D]"
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}