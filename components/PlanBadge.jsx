// components/PlanBadge.js
// Small pill for the navbar, next to the profile icon.
// Usage: <PlanBadge gym={gym} onClick={() => setProfileOpen(true)} />
"use client";
import { Sparkles } from "lucide-react";
import { subscriptionState } from "@/lib/subscription";

const TONE = {
  active: "bg-[#8BC34A]/15 text-[#3F6B1E] hover:bg-[#8BC34A]/25",
  ending: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  expired: "bg-red-100 text-red-700 hover:bg-red-200",
  suspended: "bg-red-100 text-red-700 hover:bg-red-200",
};

export default function PlanBadge({ gym, onClick }) {
  if (!gym) return null;
  const st = subscriptionState(gym);
  const planName = gym.saas_plans?.name;
  const cls = `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${TONE[st.key]}`;

  const content = (
    <>
      <Sparkles size={14} aria-hidden="true" />
      {planName && <span className="hidden sm:inline">{planName}</span>}
      {planName && (
        <span className="hidden opacity-50 sm:inline" aria-hidden="true">
          ·
        </span>
      )}
      <span>{st.text}</span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`cursor-pointer ${cls}`}>
        {content}
      </button>
    );
  }
  return <span className={cls}>{content}</span>;
}