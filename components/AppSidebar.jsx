
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
  Clock,
  ChartNoAxesCombined,
  UserRound,
  Building2,
  Mail,
  Pencil,
  Save,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members", label: "Members", icon: Users },
  { href: "/plans", label: "Membership Plans", icon: CreditCard },
  { href: "/analytics", label: "Analytics", icon: ChartNoAxesCombined },
];

export default function AppSidebar({ onLogout }) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(null);

  // Profile state
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [user, setUser] = useState(null);
  const [gym, setGym] = useState(null);
  const [editedGymName, setEditedGymName] = useState("");

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setProfileOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow =
      mobileOpen || profileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, profileOpen]);

  const formattedDate = currentTime
    ? currentTime.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  const formattedTime = currentTime
    ? currentTime.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "";

  // Fetch logged-in user's profile and gym
  async function openProfile() {
    setProfileOpen(true);
    setProfileLoading(true);
    setEditing(false);
    setProfileError("");
    setProfileSuccess("");

    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      setProfileError(authError?.message || "Unable to get your account.");
      setProfileLoading(false);
      return;
    }

    setUser(currentUser);

    const { data: gymData, error: gymError } = await supabase
      .from("gyms")
      .select("id, name")
      .eq("owner_id", currentUser.id)
      .limit(1)
      .maybeSingle();

    if (gymError) {
      setProfileError(gymError.message);
      setProfileLoading(false);
      return;
    }

    if (!gymData) {
      setProfileError("No gym profile found for this account.");
      setProfileLoading(false);
      return;
    }

    setGym(gymData);
    setEditedGymName(gymData.name || "");
    setProfileLoading(false);
  }

  // Save updated gym name
  async function handleSaveGymName(e) {
    e.preventDefault();

    const name = editedGymName.trim();

    if (!name) {
      setProfileError("Please enter a gym name.");
      return;
    }

    if (!user || !gym) {
      setProfileError("Gym profile not found. Please try again.");
      return;
    }

    setSaving(true);
    setProfileError("");
    setProfileSuccess("");

    const { data, error } = await supabase
      .from("gyms")
      .update({ name })
      .eq("id", gym.id)
      .eq("owner_id", user.id)
      .select("id, name")
      .single();

    setSaving(false);

    if (error) {
      setProfileError(error.message);
      return;
    }

    setGym(data);
    setEditedGymName(data.name);
    setEditing(false);
    setProfileSuccess("Gym name updated successfully.");
  }

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

  const DateTime = () => (
    <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <p className="mb-3 text-sm font-medium text-white">
        {formattedDate || "Loading date..."}
      </p>

      <div className="flex items-center gap-2">
        <Clock size={15} className="text-[#8BC34A]" />
        <span className="font-mono text-lg font-semibold tabular-nums text-[#8BC34A]">
          {formattedTime || "--:--:--"}
        </span>
      </div>
    </div>
  );

  const ProfileButton = () => (
    <button
      type="button"
      onClick={openProfile}
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
    >
      <UserRound size={19} />
      My Profile
    </button>
  );

  const LogoutButton = () => (
    <button
      onClick={onLogout}
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
    >
      <LogOut size={18} />
      Log out
    </button>
  );

  const ProfileModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close profile"
        onClick={() => setProfileOpen(false)}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[#E8EDE9] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8EDE9] px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-[#17211A]">
              My Profile
            </h2>
            <p className="mt-1 text-xs text-[#829087]">
              Manage your gym information
            </p>
          </div>

          <button
            type="button"
            onClick={() => setProfileOpen(false)}
            aria-label="Close"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[#829087] transition hover:bg-gray-100 hover:text-[#17211A]"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-6">
          {profileLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LoaderCircle
                size={30}
                className="animate-spin text-[#8BC34A]"
              />
              <p className="mt-3 text-sm text-[#829087]">
                Loading profile...
              </p>
            </div>
          ) : (
            <>
              {/* Profile identity */}
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3E2] text-[#668D43]">
                  <Dumbbell size={27} />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-[#17211A]">
                    {gym?.name || "Gym Profile"}
                  </h3>
                  <p className="mt-1 truncate text-sm text-[#829087]">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Gym name */}
              <div className="mb-5">
                <label
                  htmlFor="profileGymName"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#829087]"
                >
                  Gym Name
                </label>

                {editing ? (
                  <form onSubmit={handleSaveGymName}>
                    <input
                      id="profileGymName"
                      type="text"
                      value={editedGymName}
                      onChange={(e) => setEditedGymName(e.target.value)}
                      maxLength={80}
                      autoFocus
                      required
                      placeholder="Enter gym name"
                      className="w-full rounded-xl border border-[#DCE4DE] px-4 py-3 text-sm text-[#17211A] outline-none transition focus:border-[#8BC34A] focus:ring-4 focus:ring-[#8BC34A]/10"
                    />

                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => {
                          setEditing(false);
                          setEditedGymName(gym?.name || "");
                          setProfileError("");
                        }}
                        className="flex-1 cursor-pointer rounded-xl border border-[#DCE4DE] px-4 py-3 text-sm font-semibold text-[#526157] transition hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={saving || !editedGymName.trim()}
                        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#8BC34A] px-4 py-3 text-sm font-bold text-[#17211A] transition hover:bg-[#7FB53E] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <LoaderCircle size={17} className="animate-spin" />
                        ) : (
                          <Save size={17} />
                        )}
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E8EDE9] bg-[#F8FAF8] px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Building2
                        size={19}
                        className="shrink-0 text-[#829087]"
                      />
                      <span className="truncate text-sm font-semibold text-[#17211A]">
                        {gym?.name || "Not available"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditing(true);
                        setProfileError("");
                        setProfileSuccess("");
                      }}
                      className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-[#668D43] transition hover:bg-[#EAF3E2]"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="mb-5">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#829087]">
                  Registered Email
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-[#E8EDE9] px-4 py-3">
                  <Mail size={18} className="shrink-0 text-[#829087]" />
                  <span className="truncate text-sm text-[#526157]">
                    {user?.email || "Not available"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#829087]">
                  Your registered email cannot be changed here.
                </p>
              </div>

              {/* Feedback */}
              {profileError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600"
                >
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div
                  role="status"
                  className="flex items-start gap-2 rounded-xl border border-[#8BC34A]/30 bg-[#8BC34A]/10 p-3 text-sm text-[#537D2D]"
                >
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t border-[#E8EDE9] bg-[#F8FAF8] px-6 py-4">
          <p className="text-center text-xs text-[#829087]">
            Gym Pilot · Gym Management
          </p>
        </div>
      </div>
    </div>
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
          <DateTime />

          <div className="mb-3 border-t border-white/10" />

          <ProfileButton />

          <div className="my-3 border-t border-white/10" />

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
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl hover:bg-white/10"
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
          className="fixed inset-0 z-50 cursor-pointer bg-black/50 md:hidden"
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

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Navigation />
        </div>

        <div className="mt-4 shrink-0 border-t border-white/10 pt-5">
          <DateTime />

          <div className="mb-3 border-t border-white/10" />

          <ProfileButton />

          <div className="my-3 border-t border-white/10" />

          <LogoutButton />
        </div>
      </aside>

      {/* Profile Popup */}
      {profileOpen && <ProfileModal />}
    </>
  );
}
