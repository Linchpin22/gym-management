export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bg,
  accent,
}) {
  return (
    <div className="group relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className={`absolute top-0 left-0 w-full h-1 ${accent}`} />

      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight text-[#17211A] mt-3">
            {value}
          </h3>
        </div>

        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${bg} group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon size={22} className={color} strokeWidth={2.1} />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-5">
        <span className={`w-1.5 h-1.5 rounded-full ${accent}`} />
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}