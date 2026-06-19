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
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-display font-extrabold text-lg">Sky<span className="text-brand">quire</span></span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FFF7ED", color: "#EA580C" }}>Sellers</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500 hidden sm:inline">{name}</span>
          <button onClick={signOut} className="text-sm text-slate-400 hover:text-slate-700">Sign out</button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
