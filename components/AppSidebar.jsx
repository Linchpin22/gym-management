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
  Phone,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSubscription } from "@/lib/subscription";
import PlanBadge from "@/components/PlanBadge";
import PlanCard from "@/components/PlanCard";
import Image from "next/image";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/plans", label: "Membership Plans", icon: CreditCard },
  { href: "/members", label: "Members", icon: Users },
  { href: "/analytics", label: "Analytics", icon: ChartNoAxesCombined },
];

const REGISTRATION_TYPES = [
  { value: "", label: "Not registered" },
  { value: "gst", label: "GSTIN" },
  { value: "udyam", label: "MSME / Udyam Registration" },
  {
    value: "shop",
    label: "Shop & Establishment Registration",
  },
  { value: "cin", label: "Company Registration (CIN)" },
  { value: "other", label: "Other Registration" },
];

export default function AppSidebar({ onLogout }) {
  const pathname = usePathname();

  // Plan info (loaded once, used by the sidebar badge and the profile modal)
  const { gym: subGym, plans, refresh: refreshPlan } = useSubscription();

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

  const [planOpen, setPlanOpen] = useState(false);

  const [editedMobile, setEditedMobile] = useState("");

  const [editedRegistrationType, setEditedRegistrationType] = useState("");

  const [editedRegistrationNumber, setEditedRegistrationNumber] = useState("");

  function openPlan() {
    setMobileOpen(false);
    setProfileOpen(false);
    setPlanOpen(true);
    refreshPlan();
  }

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
      if (e.key === "Escape" && !saving) {
        setMobileOpen(false);
        setProfileOpen(false);
        setPlanOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [saving]);

  useEffect(() => {
    document.body.style.overflow =
      mobileOpen || profileOpen || planOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, profileOpen, planOpen]);

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
    setMobileOpen(false);
    setPlanOpen(false);
    setProfileOpen(true);
    setProfileLoading(true);
    setEditing(false);
    setProfileError("");
    setProfileSuccess("");
    setUser(null);
    setGym(null);

    try {
      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !currentUser) {
        setProfileError(authError?.message || "Unable to get your account.");
        return;
      }

      setUser(currentUser);

      const { data: gymData, error: gymError } = await supabase
        .from("gyms")
        .select(
          `
        id,
        name,
        mobile_number,
        registration_type,
        registration_number
      `,
        )
        .eq("owner_id", currentUser.id)
        .limit(1)
        .maybeSingle();

      if (gymError) {
        setProfileError(gymError.message);
        return;
      }

      if (!gymData) {
        setProfileError("No gym profile found for this account.");
        return;
      }

      setGym(gymData);
      setEditedGymName(gymData.name || "");
      setEditedMobile(gymData.mobile_number || "");
      setEditedRegistrationType(gymData.registration_type || "");
      setEditedRegistrationNumber(gymData.registration_number || "");
    } catch (err) {
      setProfileError(err.message || "Unable to load profile.");
    } finally {
      setProfileLoading(false);
    }
  }

  // Save updated gym name
  async function handleSaveProfile(e) {
    e.preventDefault();

    if (saving) return;

    setProfileError("");
    setProfileSuccess("");

    const name = editedGymName.trim();
    const mobile = editedMobile.trim();
    const registrationType = editedRegistrationType;
    const registrationNumber = editedRegistrationNumber.trim().toUpperCase();

    if (!name) {
      setProfileError("Please enter a gym name.");
      return;
    }

    if (name.length > 80) {
      setProfileError("Gym name cannot exceed 80 characters.");
      return;
    }

    if (mobile && !/^[6-9]\d{9}$/.test(mobile)) {
      setProfileError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!REGISTRATION_TYPES.some((item) => item.value === registrationType)) {
      setProfileError("Please select a valid registration type.");
      return;
    }

    if (registrationType && !registrationNumber) {
      setProfileError("Please enter your registration number.");
      return;
    }

    if (
      registrationType === "gst" &&
      !/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(registrationNumber)
    ) {
      setProfileError("Please enter a valid GSTIN format.");
      return;
    }

    if (
      registrationType === "udyam" &&
      !/^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/.test(registrationNumber)
    ) {
      setProfileError("Please enter a valid Udyam registration format.");
      return;
    }

    if (registrationNumber.length > 100) {
      setProfileError("Registration number is too long.");
      return;
    }

    if (!user || !gym) {
      setProfileError("Gym profile not found.");
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("gyms")
        .update({
          name,
          mobile_number: mobile || null,
          registration_type: registrationType || null,
          registration_number: registrationType ? registrationNumber : null,
        })
        .eq("id", gym.id)
        .eq("owner_id", user.id)
        .select(
          `
        id,
        name,
        mobile_number,
        registration_type,
        registration_number
      `,
        )
        .single();

      if (error) {
        setProfileError(error.message);
        return;
      }

      setGym(data);
      setEditedGymName(data.name || "");
      setEditedMobile(data.mobile_number || "");

      setEditedRegistrationType(data.registration_type || "");

      setEditedRegistrationNumber(data.registration_number || "");

      setEditing(false);
      setProfileSuccess("Profile updated successfully.");

      refreshPlan();
    } catch (err) {
      setProfileError(err.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  const Logo = () => (
    <Link
      href="/dashboard"
      aria-label="GymHisab Dashboard"
      className="flex cursor-pointer items-center gap-3"
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
        <Image
          src="/icon.png"
          alt="GymHisab Logo"
          fill
          sizes="40px"
          priority
          className="object-cover brightness-0 invert"
        />
      </div>

      <div>
        <h1 className="text-lg font-bold tracking-wide">GymHisab</h1>
        <p className="text-[11px] text-gray-400">GYM MANAGEMENT</p>
      </div>
    </Link>
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
    <>
      {subGym && (
        <div className="mb-2 px-1">
          <PlanBadge gym={subGym} onClick={openPlan} />
        </div>
      )}

      <button
        type="button"
        onClick={openProfile}
        className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
      >
        <UserRound size={19} />
        My Profile
      </button>
    </>
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

  const SubscriptionModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close subscription"
        onClick={() => setPlanOpen(false)}
        className="absolute inset-0 cursor-default"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-title"
        className="relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#E8EDE9] bg-white shadow-2xl"
      >
        {/* Fixed Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E8EDE9] bg-white px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3E2] text-[#668D43]">
              <CreditCard size={22} />
            </div>

            <div className="min-w-0">
              <h2
                id="subscription-title"
                className="text-base font-bold text-[#17211A] sm:text-lg"
              >
                My Subscription
              </h2>

              <p className="mt-1 text-xs text-[#829087]">
                View and manage your GymHisab plan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPlanOpen(false)}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#829087] transition hover:bg-gray-100 hover:text-[#17211A]"
          >
            <X size={19} />
          </button>
        </div>

        {/* Scrollable Subscription Content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {subGym ? (
            <PlanCard gym={subGym} plans={plans} />
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
              <AlertCircle size={18} className="shrink-0" />
              Subscription information is unavailable.
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 border-t border-[#E8EDE9] bg-[#F8FAF8] px-4 py-3 sm:px-6 sm:py-4">
          <p className="text-center text-xs text-[#829087]">
            GymHisab · Subscription Management
          </p>
        </div>
      </div>
    </div>
  );

  const ProfileModal = () => {
    const inputClass =
      "w-full rounded-xl border border-[#DCE4DE] bg-white px-4 py-3 text-sm text-[#17211A] outline-none transition focus:border-[#8BC34A] focus:ring-4 focus:ring-[#8BC34A]/10 disabled:opacity-60";

    const labelClass =
      "mb-2 block text-xs font-semibold uppercase tracking-wider text-[#829087]";

    const displayClass =
      "flex items-center gap-3 rounded-xl border border-[#E8EDE9] bg-[#F8FAF8] px-4 py-3";

    const registrationLabel =
      REGISTRATION_TYPES.find((item) => item.value === gym?.registration_type)
        ?.label || "Not registered";

    function cancelEditing() {
      setEditedGymName(gym?.name || "");
      setEditedMobile(gym?.mobile_number || "");
      setEditedRegistrationType(gym?.registration_type || "");
      setEditedRegistrationNumber(gym?.registration_number || "");
      setEditing(false);
      setProfileError("");
    }

    function closeProfile() {
      if (!saving) {
        setProfileOpen(false);
      }
    }

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Close profile"
          onClick={closeProfile}
          disabled={saving}
          className="absolute inset-0 cursor-default"
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-title"
          className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#E8EDE9] bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-[#E8EDE9] px-6 py-5">
            <div>
              <h2
                id="profile-title"
                className="text-lg font-bold text-[#17211A]"
              >
                My Profile
              </h2>

              <p className="mt-1 text-xs text-[#829087]">
                Manage your gym and business information
              </p>
            </div>

            <button
              type="button"
              onClick={closeProfile}
              disabled={saving}
              aria-label="Close"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[#829087] transition hover:bg-gray-100 hover:text-[#17211A] disabled:opacity-50"
            >
              <X size={19} />
            </button>
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
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
              <form
                id="gym-profile-form"
                onSubmit={handleSaveProfile}
                className="space-y-5"
              >
                {/* Profile identity */}
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3E2] text-[#668D43]">
                    <Dumbbell size={27} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-bold text-[#17211A]">
                      {gym?.name || "Gym Profile"}
                    </h3>

                    <p className="mt-1 truncate text-sm text-[#829087]">
                      {user?.email}
                    </p>
                  </div>

                  {!editing && gym && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(true);
                        setProfileError("");
                        setProfileSuccess("");
                      }}
                      className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-[#EAF3E2] px-3 py-2 text-xs font-semibold text-[#668D43] transition hover:bg-[#DDEBCF]"
                    >
                      <Pencil size={14} />
                      Edit Profile
                    </button>
                  )}
                </div>

                {/* Gym information */}
                <div className="space-y-4">
                  <h3 className="border-b border-[#E8EDE9] pb-2 text-xs font-bold uppercase tracking-wider text-[#668D43]">
                    Gym Information
                  </h3>

                  {/* Gym Name */}
                  <div>
                    <label htmlFor="profileGymName" className={labelClass}>
                      Gym Name
                    </label>

                    {editing ? (
                      <input
                        id="profileGymName"
                        type="text"
                        value={editedGymName}
                        onChange={(e) => setEditedGymName(e.target.value)}
                        maxLength={80}
                        required
                        autoFocus
                        disabled={saving}
                        placeholder="Enter gym name"
                        className={inputClass}
                      />
                    ) : (
                      <div className={displayClass}>
                        <Building2
                          size={18}
                          className="shrink-0 text-[#829087]"
                        />

                        <span className="truncate text-sm font-semibold text-[#17211A]">
                          {gym?.name || "Not available"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label htmlFor="profileMobile" className={labelClass}>
                      Mobile Number
                    </label>

                    {editing ? (
                      <div className="flex gap-2">
                        <div className="flex shrink-0 items-center rounded-xl border border-[#DCE4DE] bg-[#F8FAF8] px-3 text-sm font-semibold text-[#526157]">
                          +91
                        </div>

                        <input
                          id="profileMobile"
                          type="tel"
                          inputMode="numeric"
                          value={editedMobile}
                          onChange={(e) =>
                            setEditedMobile(
                              e.target.value.replace(/\D/g, "").slice(0, 10),
                            )
                          }
                          maxLength={10}
                          disabled={saving}
                          placeholder="Enter mobile number"
                          className={inputClass}
                        />
                      </div>
                    ) : (
                      <div className={displayClass}>
                        <Phone size={18} className="shrink-0 text-[#829087]" />

                        <span className="text-sm font-semibold text-[#17211A]">
                          {gym?.mobile_number
                            ? `+91 ${gym.mobile_number}`
                            : "Not provided"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Registered Email */}
                  <div>
                    <label className={labelClass}>Registered Email</label>

                    <div className={displayClass}>
                      <Mail size={18} className="shrink-0 text-[#829087]" />

                      <span className="truncate text-sm text-[#526157]">
                        {user?.email || "Not available"}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-[#829087]">
                      Your registered email cannot be changed here.
                    </p>
                  </div>
                </div>

                {/* Business Registration */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E8EDE9] pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#668D43]">
                      Business Registration
                    </h3>

                    <span className="text-xs text-[#829087]">Optional</span>
                  </div>

                  {/* Registration Type */}
                  <div>
                    <label htmlFor="registrationType" className={labelClass}>
                      Registration Type
                    </label>

                    {editing ? (
                      <select
                        id="registrationType"
                        value={editedRegistrationType}
                        onChange={(e) => {
                          setEditedRegistrationType(e.target.value);
                          setEditedRegistrationNumber("");
                        }}
                        disabled={saving}
                        className={inputClass}
                      >
                        {REGISTRATION_TYPES.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className={displayClass}>
                        <FileText
                          size={18}
                          className="shrink-0 text-[#829087]"
                        />

                        <span className="text-sm font-semibold text-[#17211A]">
                          {registrationLabel}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Registration Number */}
                  {(editing
                    ? editedRegistrationType
                    : gym?.registration_type) && (
                    <div>
                      <label
                        htmlFor="registrationNumber"
                        className={labelClass}
                      >
                        Registration Number
                      </label>

                      {editing ? (
                        <input
                          id="registrationNumber"
                          type="text"
                          value={editedRegistrationNumber}
                          onChange={(e) =>
                            setEditedRegistrationNumber(
                              e.target.value.toUpperCase(),
                            )
                          }
                          maxLength={100}
                          required
                          disabled={saving}
                          placeholder={
                            editedRegistrationType === "gst"
                              ? "Enter GSTIN"
                              : editedRegistrationType === "udyam"
                                ? "UDYAM-XX-00-0000000"
                                : "Enter registration number"
                          }
                          className={inputClass}
                        />
                      ) : (
                        <div className={displayClass}>
                          <FileText
                            size={18}
                            className="shrink-0 text-[#829087]"
                          />

                          <span className="break-all text-sm font-semibold text-[#17211A]">
                            {gym?.registration_number || "Not provided"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-start gap-2 rounded-xl border border-[#E4EED9] bg-[#F3F8ED] p-3">
                    <AlertCircle
                      size={16}
                      className="mt-0.5 shrink-0 text-[#668D43]"
                    />

                    <p className="text-xs leading-relaxed text-[#668D43]">
                      Business registration details are optional. You can
                      provide your GSTIN, MSME or other government-issued
                      business registration number.
                    </p>
                  </div>
                </div>

                {/* Error */}
                {profileError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600"
                  >
                    <AlertCircle size={17} className="mt-0.5 shrink-0" />

                    <span>{profileError}</span>
                  </div>
                )}

                {/* Success */}
                {profileSuccess && (
                  <div
                    role="status"
                    className="flex items-start gap-2 rounded-xl border border-[#8BC34A]/30 bg-[#8BC34A]/10 p-3 text-sm text-[#537D2D]"
                  >
                    <CheckCircle2 size={17} className="mt-0.5 shrink-0" />

                    <span>{profileSuccess}</span>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-[#E8EDE9] bg-[#F8FAF8] px-5 py-4 sm:px-6">
            {editing && !profileLoading ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="flex-1 cursor-pointer rounded-xl border border-[#DCE4DE] bg-white px-4 py-3 text-sm font-semibold text-[#526157] transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  form="gym-profile-form"
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
            ) : (
              <p className="text-center text-xs text-[#829087]">
                GymHisab · Gym Management
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

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
      {/* Profile Popup */}
      {profileOpen && ProfileModal()}

      {/* Subscription Popup */}
      {planOpen && SubscriptionModal()}
    </>
  );
}
