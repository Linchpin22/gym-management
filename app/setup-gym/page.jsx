"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Dumbbell, ArrowRight, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SetupGymPage() {
  const router = useRouter();

  const [gymName, setGymName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;

    async function checkUser() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      setUser(user);

      // Check whether this user already owns a gym.
      const { data: gym, error: gymError } = await supabase
        .from("gyms")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (!active) return;

      if (gymError) {
        setError(gymError.message);
        setLoading(false);
        return;
      }

      // Existing gym owners don't need setup again.
      if (gym) {
        router.replace("/dashboard");
        return;
      }

      setLoading(false);
    }

    checkUser();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();

    const name = gymName.trim();

    if (!name) {
      setError("Please enter your gym name.");
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    setSaving(true);
    setError("");

    // Check again before inserting to avoid creating
    // another gym if one was created in another session.
    const { data: existingGym, error: checkError } = await supabase
      .from("gyms")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (checkError) {
      setError(checkError.message);
      setSaving(false);
      return;
    }

    if (existingGym) {
      router.replace("/dashboard");
      return;
    }

    const { error: insertError } = await supabase.from("gyms").insert({
      name,
      owner_id: user.id,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F7F6]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#DCE4DE] border-t-[#8BC34A]" />
          <p className="text-sm text-[#829087]">Checking your account...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F7F6] px-5 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[#E8EDE9] bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#8BC34A] text-[#17211A]">
            <Dumbbell size={25} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-[#17211A]">GymHisab</h1>
            <p className="text-xs tracking-wider text-[#829087]">
              GYM MANAGEMENT
            </p>
          </div>
        </div>

        <div className="mb-7">
          <p className="mb-2 text-sm font-semibold text-[#668D43]">
            ONE LAST STEP
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-[#17211A]">
            Set up your gym
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#829087]">
            Enter your gym name to create your GymHisab workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
                maxLength={80}
                required
                autoFocus
                className="w-full rounded-xl border border-[#DCE4DE] bg-white py-3.5 pl-12 pr-4 text-sm text-[#17211A] outline-none transition placeholder:text-gray-400 focus:border-[#8BC34A] focus:ring-4 focus:ring-[#8BC34A]/10"
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#8BC34A] py-3.5 text-sm font-bold text-[#17211A] shadow-sm transition hover:bg-[#7FB53E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#17211A]/30 border-t-[#17211A]" />
                Creating your gym...
              </>
            ) : (
              <>
                Create Gym
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="mt-7 border-t border-[#E8EDE9] pt-5 text-center text-xs text-[#829087]">
          Your gym workspace is private to your account.
        </p>
      </div>
    </main>
  );
}
