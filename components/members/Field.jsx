
export const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/15 transition placeholder:text-gray-400 bg-[#FAFBFA] focus:bg-white";

export default function Field({ label, children }) {
  return (
    <div className="space-y-2 min-w-0">
      <label className="text-sm font-semibold text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}
