"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsConfirm, setNeedsConfirm] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, phone, user_type: "seller" } },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setLoading(false);
    if (!data.session) { setNeedsConfirm(true); return; }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <span className="font-display font-extrabold text-xl">Sky<span className="text-brand">quire</span></span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FFF7ED", color: "#EA580C" }}>Sellers</span>
        </div>
        <h1 className="font-display text-2xl font-bold mb-1">Sell your business</h1>
        <p className="text-slate-500 text-sm mb-7">Create an account to submit your business for listing.</p>

        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
        {needsConfirm ? (
          <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-sm">
            Almost there! We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click it, then sign in.
            <div className="mt-3"><Link href="/login" className="text-brand font-medium">Go to sign in →</Link></div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" placeholder="Aakash Kumar" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Min. 8 characters" />
            </div>
            <button type="submit" disabled={loading} className="btn-brand w-full">{loading ? "Creating…" : "Create account"}</button>
          </form>
        )}

        <p className="text-center text-sm text-slate-500 mt-7">
          Already have an account? <Link href="/login" className="text-brand font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
