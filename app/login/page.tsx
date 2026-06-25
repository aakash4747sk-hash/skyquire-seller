"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { supabase } from "@/lib/supabase";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push(params.get("redirect") || "/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm card p-8">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <span className="font-display font-extrabold text-xl">Sky<span style={{ color: "var(--orange)" }}>quire</span></span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(251,146,60,.14)", color: "#fdba74" }}>Sellers</span>
        </Link>
        <h1 className="font-display text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-sm mb-7" style={{ color: "var(--soft)" }}>Sign in to manage your business listing</p>

        {error && <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: "rgba(248,113,113,.12)", border: "1px solid rgba(248,113,113,.3)", color: "#fca5a5" }}>{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--soft)" }}>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--soft)" }}>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-brand w-full">{loading ? "Signing in…" : "Sign in"}</button>
        </form>

        <p className="text-center text-sm mt-7" style={{ color: "var(--soft)" }}>
          New seller? <Link href="/register" style={{ color: "var(--orange)" }} className="font-medium">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginInner /></Suspense>;
}
