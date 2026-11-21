// app/login/page.js  (your design, now with Sign in / Create account)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dumbbell,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

function friendlyError(message) {
  if (/invalid login credentials/i.test(message)) {
    return "Email or password is incorrect. Please check both and try again.";
  }
  if (/already registered/i.test(message)) {
    return "An account with this email already exists. Please sign in instead.";
  }
  if (/email not confirmed/i.test(message)) {
    return "Please confirm your email first. Check your inbox for the confirmation link.";
  }
  return message;
}



export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [gymName, setGymName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isSignup = mode === "signup";

  function switchMode(next) {
    setMode(next);
    setError("");
    setNotice("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    if (!isSignup) {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (error) {
        setError(friendlyError(error.message));
        return;
      }
      router.replace("/dashboard");
      return;
    }

    // ---- Create account ----
    if (password.length < 8) {
      setLoading(false);
      setError("Password must be at least 8 characters.");
      return;
    }

    // The gym name travels with the signup. A database trigger turns it into
    // the owner's gym row, so it works even when email confirmation is on.
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { gym_name: gymName.trim() } },
    });
    setLoading(false);

    if (error) {
      setError(friendlyError(error.message));
      return;
    }

    // With email confirmation on, an existing email comes back with no identities
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError("An account with this email already exists. Please sign in instead.");
      return;
    }

    // Confirmation off: we already have a session, go straight in
    if (data.session) {
      router.replace("/dashboard");
      return;
    }

    // Confirmation on: ask them to check email, then sign in
    setPassword("");
    setMode("signin");
    setNotice("Account created. Check your email to confirm it, then sign in.");
  }

  async function handleGoogleLogin() {
  setLoading(true);
  setError("");
  setNotice("");

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=/setup-gym`,
    },
  });

  if (error) {
    setLoading(false);
    setError(friendlyError(error.message));
  }
}

  const inputBase =
    "w-full rounded-xl border border-[#DCE4DE] bg-white py-3.5 pl-12 text-sm text-[#17211A] outline-none transition placeholder:text-gray-400 focus:border-[#8BC34A] focus:ring-4 focus:ring-[#8BC34A]/10";

  return (
    <main className="flex min-h-screen bg-[#F5F7F6]">
      {/* Left Branding Panel */}
      <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#17211A] p-12 text-white lg:flex xl:p-16">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/5" />
        <div className="absolute -bottom-40 -left-32 h-[500px] w-[500px] rounded-full border border-white/5" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#8BC34A] text-[#17211A]">
            <Dumbbell size={26} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-wider">Gym Pilot</h1>
            <p className="text-[10px] tracking-[2px] text-gray-400">
              GYM MANAGEMENT
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#8BC34A]/30 bg-[#8BC34A]/10 px-4 py-2 text-xs font-medium text-[#B5E487]">
            <span className="h-2 w-2 rounded-full bg-[#8BC34A]" />
            YOUR GYM. YOUR CONTROL.
          </span>

          <h2 className="text-4xl font-bold leading-tight xl:text-5xl">
            Manage your gym.
            <span className="mt-2 block text-[#8BC34A]">
              Build stronger communities.
            </span>
          </h2>

          <p className="mt-6 max-w-md text-base leading-7 text-gray-400">
            Keep your members, memberships, and payments organized in one simple
            workspace. Spend less time managing and more time growing.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <Dumbbell className="mb-4 text-[#8BC34A]" size={23} />
              <p className="font-semibold">Member Management</p>
              <p className="mt-1 text-xs text-gray-400">
                Keep everything organized.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <LockKeyhole className="mb-4 text-[#8BC34A]" size={23} />
              <p className="font-semibold">Simple & Secure</p>
              <p className="mt-1 text-xs text-gray-400">
                Your gym data in one place.
              </p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-gray-500">
          © 2026 Gym Pilot. All rights reserved.
        </p>
      </section>

      {/* Right Panel */}
      <section className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          {/* Mobile Branding */}
          <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8BC34A] text-[#17211A]">
              <Dumbbell size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-wide text-[#17211A]">
                Gym Pilot
              </h1>
              <p className="text-[10px] tracking-[2px] text-[#829087]">
                GYM MANAGEMENT
              </p>
            </div>
          </div>

          {/* Sign in / Create account switch */}
          <div
            role="tablist"
            aria-label="Sign in or create account"
            className="mb-8 grid grid-cols-2 gap-1 rounded-xl bg-[#E8EDE9] p-1"
          >
            {[
              ["signin", "Sign In"],
              ["signup", "Create Account"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={mode === key}
                onClick={() => switchMode(key)}
                className={`cursor-pointer rounded-lg py-2.5 text-sm font-semibold transition ${
                  mode === key
                    ? "bg-white text-[#17211A] shadow-sm"
                    : "text-[#668D43] hover:text-[#17211A]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold text-[#668D43]">
              {isSignup ? "GET STARTED" : "WELCOME BACK"}
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-[#17211A] sm:text-4xl">
              {isSignup ? "Create your account" : "Owner Login"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#829087]">
              {isSignup
                ? "Set up your gym in a minute. No card needed."
                : "Sign in to access your gym management dashboard."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Gym name (sign up only) */}
            {isSignup && (
              <div>
                <label
                  htmlFor="gymName"
                  className="mb-2 block text-sm font-semibold text-[#26352A]"
                >
                  Gym Name
                </label>

                <div className="relative">
                  <Building2
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#829087]"
                  />

                  <input
                    id="gymName"
                    type="text"
                    placeholder="e.g. Iron Fitness"
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                    autoComplete="organization"
                    required
                    maxLength={80}
                    className={`${inputBase} pr-4`}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#26352A]"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#829087]"
                />

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className={`${inputBase} pr-4`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#26352A]"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#829087]"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isSignup ? "At least 8 characters" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  required
                  minLength={isSignup ? 8 : undefined}
                  className={`${inputBase} pr-12`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#829087] transition hover:text-[#17211A]"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {/* Notice */}
            {notice && (
              <div
                role="status"
                className="flex items-start gap-2 rounded-xl border border-[#8BC34A]/30 bg-[#8BC34A]/10 p-3 text-sm text-[#3F6B1E]"
              >
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <p>{notice}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#8BC34A] py-3.5 text-sm font-bold text-[#17211A] shadow-sm transition hover:bg-[#7FB53E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#17211A]/30 border-t-[#17211A]" />
                  {isSignup ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                <>
                  {isSignup ? "Create Account" : "Sign In"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          {/* Google Login Divider */}
<div className="relative my-6">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-[#E8EDE9]" />
  </div>

  <div className="relative flex justify-center">
    <span className="bg-[#F5F7F6] px-3 text-xs text-[#829087]">
      OR CONTINUE WITH
    </span>
  </div>
</div>

{/* Google Login */}
<button
  type="button"
  onClick={handleGoogleLogin}
  disabled={loading}
  className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-[#DCE4DE] bg-white py-3.5 text-sm font-semibold text-[#17211A] transition hover:border-[#B8C7BA] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
>
  <span className="text-lg font-bold text-[#4285F4]">G</span>
  Continue with Google
</button>

          <div className="mt-8 border-t border-[#E8EDE9] pt-6 text-center">
            <p className="text-xs text-[#829087]">
              Secure gym owner access powered by Gym Pilot
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}