
"use client";

import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppSidebar from "@/components/AppSidebar";

export default function LayoutShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const showSidebar = pathname !== "/login";

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (!showSidebar) {
    return children;
  }

  return (
    <div className="min-h-screen bg-[#F5F7F6]">
      <AppSidebar onLogout={handleLogout} />
      <main className="min-h-screen md:ml-64">
        {children}
      </main>
    </div>
  );
}
