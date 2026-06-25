"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import SellerChat from "@/components/SellerChat";

type Thread = {
  inquiry_id: string;
  listing_id: string;
  listing_name: string;
  status: string;
  created_at: string;
  message_count: number;
};

const STATUS_COLOR: Record<string, string> = {
  Submitted: "rgba(56,189,248,.16)",
  "In Review": "rgba(251,146,60,.16)",
  "NDA Sent": "rgba(139,92,246,.16)",
  "Under DD": "rgba(52,211,153,.16)",
  Closed: "rgba(255,255,255,.08)",
  Declined: "rgba(244,114,182,.16)",
};

export default function SellerMessages() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Thread | null>(null);

  useEffect(() => {
    supabase
      .rpc("get_seller_inbox")
      .then(({ data }) => {
        const rows = (data as Thread[]) || [];
        setThreads(rows);
        setActive((prev) => prev ?? rows[0] ?? null);
        setLoading(false);
      });
  }, []);

  function timeAgo(s: string) {
    const days = Math.floor((Date.now() - new Date(s).getTime()) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Messages</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--soft)" }}>
          Buyer interest on your listings — relayed privately by the Skyquire team. Buyers never see your identity.
        </p>
      </div>

      {loading ? (
        <p className="text-sm py-12 text-center" style={{ color: "var(--dim)" }}>Loading…</p>
      ) : threads.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-4xl mb-3">💬</div>
          <p className="font-display font-bold text-lg">No buyer interest yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--soft)" }}>
            Once a buyer inquires about one of your listed businesses, the conversation appears here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[300px_1fr]">
          {/* Thread list */}
          <div className="space-y-2">
            {threads.map((t) => (
              <button
                key={t.inquiry_id}
                onClick={() => setActive(t)}
                className="w-full text-left card p-3.5 transition-all"
                style={{ borderColor: active?.inquiry_id === t.inquiry_id ? "var(--orange)" : "var(--line)" }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm truncate">{t.listing_name}</p>
                  <span className="text-[10px] flex-shrink-0" style={{ color: "var(--dim)" }}>{timeAgo(t.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: STATUS_COLOR[t.status] || "rgba(255,255,255,.08)", color: "var(--soft)" }}>
                    {t.status}
                  </span>
                  {t.message_count > 0 && (
                    <span className="text-[11px]" style={{ color: "var(--dim)" }}>{t.message_count} message{t.message_count === 1 ? "" : "s"}</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Active thread */}
          <div>
            {active ? (
              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-display font-bold">{active.listing_name}</p>
                    <p className="text-xs" style={{ color: "var(--dim)" }}>Buyer interest · {active.status}</p>
                  </div>
                </div>
                <SellerChat inquiryId={active.inquiry_id} />
              </div>
            ) : (
              <div className="card p-10 text-center text-sm" style={{ color: "var(--dim)" }}>Select a conversation.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
