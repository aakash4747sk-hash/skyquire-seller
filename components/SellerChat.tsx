"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Message = {
  id: string;
  inquiry_id: string;
  sender_id: string;
  sender_role: "buyer" | "admin" | "seller";
  channel: "buyer" | "seller";
  body: string;
  created_at: string;
};

// Seller-side thread. Talks only to the Skyquire team (channel='seller').
export default function SellerChat({ inquiryId }: { inquiryId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("inquiry_id", inquiryId)
        .eq("channel", "seller")
        .order("created_at", { ascending: true });
      if (active) {
        setMessages(data || []);
        setLoading(false);
      }
    }
    load();

    const sub = supabase
      .channel(`seller-messages:${inquiryId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `inquiry_id=eq.${inquiryId}` },
        (payload) => {
          const msg = payload.new as Message;
          if (msg.channel !== "seller") return;
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(sub);
    };
  }, [inquiryId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send() {
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSending(false); return; }

    const { data, error } = await supabase
      .from("messages")
      .insert({ inquiry_id: inquiryId, sender_id: session.user.id, sender_role: "seller", channel: "seller", body })
      .select()
      .single();

    if (!error && data) {
      setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
      setInput("");
    }
    setSending(false);
  }

  const mine = (m: Message) => m.sender_role === "seller";

  return (
    <div className="rounded-xl border flex flex-col" style={{ background: "var(--panel, #0b0a14)", borderColor: "var(--line)" }}>
      <div className="max-h-72 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <p className="text-xs text-center py-4" style={{ color: "var(--dim)" }}>Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: "var(--dim)" }}>
            No messages yet. The Skyquire team will reach out here when a buyer is interested.
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${mine(m) ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${mine(m) ? "rounded-br-sm text-white" : "rounded-bl-sm"}`}
                style={mine(m)
                  ? { background: "var(--orange, #f97316)" }
                  : { background: "rgba(255,255,255,.06)", color: "var(--soft)" }}
              >
                {m.body}
                <p className="text-[10px] mt-1" style={{ opacity: 0.7 }}>
                  {mine(m) ? "You" : "Skyquire team"} · {new Date(m.created_at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 p-2 border-t" style={{ borderColor: "var(--line)" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Message the Skyquire team…"
          className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: "rgba(255,255,255,.04)", border: "1px solid var(--line)", color: "var(--soft)" }}
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all disabled:opacity-40"
          style={{ background: "var(--orange, #f97316)" }}
        >
          {sending ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
