// components/PlanCard.js
// Plan section for the profile modal: current plan, days left, and the plans to choose from.
// Usage: const { gym, plans } = useSubscription();  ...  <PlanCard gym={gym} plans={plans} />
"use client";
import { CalendarDays, Check, MessageCircle, Sparkles } from "lucide-react";
import { inr, prettyDate, subscriptionState, upgradeLink } from "@/lib/subscription";
import { FaWhatsapp } from "react-icons/fa";

const BAR = {
  active: "bg-[#8BC34A]",
  ending: "bg-amber-500",
  expired: "bg-red-500",
  suspended: "bg-red-500",
};

const CHIP = {
  active: "bg-[#8BC34A]/15 text-[#3F6B1E]",
  ending: "bg-amber-100 text-amber-800",
  expired: "bg-red-100 text-red-700",
  suspended: "bg-red-100 text-red-700",
};

const MESSAGE = {
  ending: "Your plan ends soon. Choose a plan below to continue.",
  expired: "Your plan has ended. Choose a plan below to continue.",
  suspended: "This account is suspended. Message us on WhatsApp to sort it out.",
};

export default function PlanCard({ gym, plans = [] }) {
  if (!gym) return null;

  const st = subscriptionState(gym);
  const current = gym.saas_plans;
  const duration = current?.duration_days || 1;
  const pct = Math.max(0, Math.min(100, Math.round((st.left / duration) * 100)));

  const monthly = plans.find((p) => p.code === "monthly");
  const paidPlans = plans.filter((p) => p.price_inr > 0);

  return (
    <section aria-label="Your plan" className="space-y-5">
      {/* Current plan */}
      <div className="rounded-2xl border border-[#DCE4DE] bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#668D43]">YOUR PLAN</p>
            <h3 className="mt-1 flex items-center gap-2 text-2xl font-bold text-[#17211A]">
              <Sparkles size={20} className="text-[#8BC34A]" aria-hidden="true" />
              {current?.name ?? "Plan"}
              <span className="text-sm font-medium text-[#829087]">{current?.label}</span>
            </h3>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${CHIP[st.key]}`}>
            {st.text}
          </span>
        </div>

        <div
          role="progressbar"
          aria-label="Plan time remaining"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="mt-4 h-2 overflow-hidden rounded-full bg-[#E8EDE9]"
        >
          <div className={`h-full rounded-full ${BAR[st.key]}`} style={{ width: `${pct}%` }} />
        </div>

        <p className="mt-3 flex items-center gap-2 text-sm text-[#829087]">
          <CalendarDays size={16} aria-hidden="true" />
          Started {prettyDate(gym.sub_started_on)} · Ends {prettyDate(gym.sub_ends_on)}
        </p>

        {MESSAGE[st.key] && (
          <p className="mt-3 rounded-xl bg-[#F5F7F6] p-3 text-sm text-[#26352A]">{MESSAGE[st.key]}</p>
        )}
      </div>

      {/* Plans to choose from */}
      {paidPlans.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-[#26352A]">Choose a plan</h4>
          <ul className="space-y-2">
            {paidPlans.map((p) => {
              const perMonth = Math.round(p.price_inr / (p.duration_days / 30));
              const save =
                monthly && p.code !== "monthly"
                  ? Math.round((1 - p.price_inr / (p.duration_days / 30) / monthly.price_inr) * 100)
                  : 0;
              const isCurrent = p.code === gym.sub_plan;

              return (
                <li
                  key={p.code}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${
                    isCurrent ? "border-[#8BC34A] bg-[#8BC34A]/5" : "border-[#DCE4DE] bg-white"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold text-[#17211A]">
                      {p.name}
                      <span className="text-sm font-normal text-[#829087]">{p.label}</span>
                      {save > 0 && (
                        <span className="rounded-full bg-[#8BC34A]/15 px-2 py-0.5 text-xs font-semibold text-[#3F6B1E]">
                          Save {save}%
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-sm text-[#829087]">
                      {inr(p.price_inr)}
                      {p.code !== "monthly" && <span> · about {inr(perMonth)}/month</span>}
                    </p>
                  </div>

                  {isCurrent && st.key === "active" ? (
                    <span className="flex items-center gap-1 text-sm font-semibold text-[#3F6B1E]">
                      <Check size={16} aria-hidden="true" /> Current
                    </span>
                  ) : (
                    <a
                      href={upgradeLink(gym.name, `${p.name} (${p.label})`)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#8BC34A] px-4 py-2 text-sm font-bold text-[#17211A] transition hover:bg-[#7FB53E]"
                    >
                      <FaWhatsapp size={16} aria-hidden="true" />
                      Choose
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-[#829087]">
            Payment is confirmed on WhatsApp. We activate your plan once it is received.
          </p>
        </div>
      )}
    </section>
  );
}