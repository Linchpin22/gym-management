"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Dumbbell,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members", label: "Members", icon: Users },
  { href: "/plans", label: "Membership Plans", icon: CreditCard },
];

export default function AppSidebar({ onLogout }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") setMobileOpen(false);
    }

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const Logo = () => (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8BC34A] text-[#17211A]">
        <Dumbbell size={22} />
      </div>
      <div>
        <h1 className="text-lg font-bold tracking-wide">Gym Pilot</h1>
        <p className="text-[11px] text-gray-400">GYM MANAGEMENT</p>
      </div>
    </div>
  );

  const Navigation = () => (
    <nav className="space-y-1">
      <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-gray-500">
        Workspace
      </p>

      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all ${
              active
                ? "bg-[#8BC34A] font-semibold text-[#17211A]"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={19} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const LogoutButton = () => (
    <button
      onClick={onLogout}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
    >
      <LogOut size={18} />
      Log out
    </button>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col bg-[#17211A] px-5 py-6 text-white md:flex">
        <div className="mb-10 shrink-0 px-2">
          <Logo />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Navigation />
        </div>

        <div className="mt-4 shrink-0 border-t border-white/10 pt-5">
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between bg-[#17211A] px-4 text-white md:hidden">
        <Logo />

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-white/10"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-[60] flex w-[280px] max-w-[85vw] flex-col bg-[#17211A] px-5 py-6 text-white shadow-2xl transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-10 flex items-center justify-between px-2">
          <Logo />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Navigation />
        </div>

        <div className="mt-4 shrink-0 border-t border-white/10 pt-5">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
