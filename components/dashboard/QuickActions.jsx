import Link from "next/link";
import { ArrowUpRight, Sparkles, Users, Wallet } from "lucide-react";

export default function QuickActions() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg text-[#17211A]">Quick Actions</h2>
          <p className="text-xs text-gray-500 mt-1">
            Get things done faster
          </p>
        </div>

        <div className="w-9 h-9 rounded-xl bg-[#EEF4E8] text-[#52772D] flex items-center justify-center">
          <Sparkles size={17} />
        </div>
      </div>

      <div className="space-y-3 mt-5">
        <Link
          href="/members"
          className="flex items-center justify-between border border-gray-100 rounded-xl p-3.5 hover:border-[#B5D995] hover:bg-[#F8FBF5] transition group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-[#EEF4E8] text-[#587E2F] rounded-xl p-2.5 shrink-0">
              <Users size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                Manage members
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Add or renew memberships
              </p>
            </div>
          </div>

          <ArrowUpRight
            size={17}
            className="text-gray-400 group-hover:text-[#52772D] transition"
          />
        </Link>

        <Link
          href="/plans"
          className="flex items-center justify-between border border-gray-100 rounded-xl p-3.5 hover:border-[#B5D995] hover:bg-[#F8FBF5] transition group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-blue-50 text-blue-600 rounded-xl p-2.5 shrink-0">
              <Wallet size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                Membership plans
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Create and manage plans
              </p>
            </div>
          </div>

          <ArrowUpRight
            size={17}
            className="text-gray-400 group-hover:text-[#52772D] transition"
          />
        </Link>
      </div>
    </div>
  );
}