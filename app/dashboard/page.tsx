"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { STATUS_META } from "@/lib/constants";

type Submission = {
  id: string;
  name: string;
  sector: string | null;
  asking_price: string | null;
  status: string;
  created_at: string;
};

export default function SellerDashboard() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("business_submissions")
        .select("id, name, sector, asking_price, status, created_at")
        .order("created_at", { ascending: false });
      setSubs(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Your businesses</h1>
          <p className="text-slate-500 text-sm mt-0.5">Submit a business, we verify it, then list it to buyers.</p>
        </div>
        <Link href="/dashboard/new" className="btn-brand">+ Submit a business</Link>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm py-12 text-center">Loading…</p>
      ) : subs.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-4xl mb-3">🏷️</div>
          <p className="font-display font-bold text-lg">No submissions yet</p>
          <p className="text-slate-500 text-sm mt-1 mb-5">Submit your business and our team will review and list it.</p>
          <Link href="/dashboard/new" className="btn-brand inline-block">+ Submit your first business</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {subs.map((s) => {
            const meta = STATUS_META[s.status] || STATUS_META.submitted;
            return (
              <Link key={s.id} href={`/dashboard/${s.id}`} className="card p-5 flex items-center justify-between gap-4 hover:border-orange-300 transition-colors block">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{s.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {s.sector || "—"}{s.asking_price ? ` · Asking ${s.asking_price}` : ""}
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0" style={{ background: meta.bg, color: meta.color }}>
                  {meta.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
