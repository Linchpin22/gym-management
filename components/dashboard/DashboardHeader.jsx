import Link from "next/link";
import { Dumbbell, Plus } from "lucide-react";

export default function DashboardHeader({ gymName }) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-10">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#EEF4E8] text-[#52772D] flex items-center justify-center shrink-0">
          <Dumbbell size={19} />
        </div>

        <div className="min-w-0">
          <p className="font-bold text-[#17211A] text-sm sm:text-base truncate">
            {gymName || "Gym Dashboard"}
          </p>
        </div>
      </div>

      <Link
        href="/members"
        className="inline-flex items-center gap-2 bg-[#17211A] hover:bg-[#2A3A2D] text-white px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm"
      >
        <Plus size={17} />
        <span>Add member</span>
      </Link>
    </header>
  );
}