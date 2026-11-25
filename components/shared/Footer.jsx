export default function Footer() {
  return (
    <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400 pt-2 pb-4">
      <p>GymHisab · Gym Management</p>

      <p className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8BC34A]" />
        Built to keep your gym moving
      </p>
    </footer>
  );
}
