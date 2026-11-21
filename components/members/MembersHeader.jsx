
import { Plus, Dumbbell, FileSpreadsheet } from "lucide-react";

export default function MembersHeader({
  gym,
  onAddMember,
  onImportMembers,
}) {
  return (
    <header className="min-h-16 bg-white border-b border-gray-100 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-10 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-[#EEF4E8] text-[#52772D] flex items-center justify-center shrink-0">
          <Dumbbell size={20} />
        </div>

        <div className="min-w-0">
          <p className="font-bold text-[#17211A] text-sm sm:text-base truncate">
            {gym?.name || "Gym Dashboard"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onImportMembers}
          className="inline-flex cursor-pointer items-center gap-2 border border-[#DCE6D5] bg-white hover:bg-[#F5F8F2] text-[#52772D] px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition"
        >
          <FileSpreadsheet size={17} />
          <span className="hidden sm:inline">Import Excel</span>
          <span className="sm:hidden">Import</span>
        </button>

        <button
          type="button"
          onClick={onAddMember}
          className="inline-flex cursor-pointer items-center gap-2 bg-[#8BC34A] hover:bg-[#9BD45A] text-[#17211A] px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm"
        >
          <Plus size={17} />
          Add member
        </button>
      </div>
    </header>
  );
}
