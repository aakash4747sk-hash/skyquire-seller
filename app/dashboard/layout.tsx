"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setName(user.user_metadata?.full_name || user.email || "Seller");
    });
  }, [router]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="h-16 flex items-center justify-between px-6 sticky top-0 z-50"
        style={{ background: "rgba(7,6,15,.7)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--line)" }}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-display font-extrabold text-lg">Sky<span style={{ color: "var(--orange)" }}>quire</span></span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(251,146,60,.14)", color: "#fdba74" }}>Sellers</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm hidden sm:inline" style={{ color: "var(--soft)" }}>{name}</span>
          <button onClick={signOut} className="text-sm" style={{ color: "var(--dim)" }}>Sign out</button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
