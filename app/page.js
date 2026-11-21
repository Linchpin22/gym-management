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
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.replace("/dashboard");
  }

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

      {/* Right Login Panel */}
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

          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold text-[#668D43]">
              WELCOME BACK
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-[#17211A] sm:text-4xl">
              Owner Login
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#829087]">
              Sign in to access your gym management dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
                  className="w-full rounded-xl border border-[#DCE4DE] bg-white py-3.5 pl-12 pr-4 text-sm text-[#17211A] outline-none transition placeholder:text-gray-400 focus:border-[#8BC34A] focus:ring-4 focus:ring-[#8BC34A]/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[#26352A]"
                >
                  Password
                </label>
              </div>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#829087]"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-[#DCE4DE] bg-white py-3.5 pl-12 pr-12 text-sm text-[#17211A] outline-none transition placeholder:text-gray-400 focus:border-[#8BC34A] focus:ring-4 focus:ring-[#8BC34A]/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 cursor-pointer top-1/2 -translate-y-1/2 text-[#829087] transition hover:text-[#17211A]"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
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
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

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
