"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { STATUS_META } from "@/lib/constants";

type Submission = {
  id: string; name: string; sector: string | null; location: string | null;
  asking_price: string | null; revenue: string | null; ebitda: string | null;
  employees: number | null; founded: number | null; description: string | null;
  status: string; review_notes: string | null; created_at: string;
};
type Doc = { id: string; name: string; file_path: string; created_at: string };

const STEPS = ["submitted", "in_review", "approved"];
const STEP_LABEL: Record<string, string> = { submitted: "Submitted", in_review: "In review", approved: "Live" };

export default function SubmissionDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [sub, setSub] = useState<Submission | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function load() {
    const { data } = await supabase.from("business_submissions").select("*").eq("id", params.id).maybeSingle();
    setSub(data as Submission | null);
    const { data: d } = await supabase.from("submission_documents").select("id, name, file_path, created_at").eq("submission_id", params.id).order("created_at", { ascending: false });
    setDocs((d as Doc[]) || []);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [params.id]);

  async function uploadMore(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    for (const file of files) {
      const path = `${user.id}/${params.id}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const { error } = await supabase.storage.from("seller-documents").upload(path, file);
      if (error) continue;
      await supabase.from("submission_documents").insert({ submission_id: params.id, name: file.name, file_path: path, file_size: file.size });
    }
    // Move back into the review queue after responding to a request.
    if (sub?.status === "needs_info") await supabase.from("business_submissions").update({ status: "submitted" }).eq("id", params.id);
    setUploading(false);
    e.target.value = "";
    load();
  }

  async function downloadDoc(d: Doc) {
    const { data } = await supabase.storage.from("seller-documents").createSignedUrl(d.file_path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  if (loading) return <p className="text-slate-400 text-sm py-12 text-center">Loading…</p>;
  if (!sub) return (
    <div className="text-center py-12">
      <p className="text-slate-500">Submission not found.</p>
      <button onClick={() => router.push("/dashboard")} className="text-brand text-sm mt-3">← Back to dashboard</button>
    </div>
  );

  const meta = STATUS_META[sub.status] || STATUS_META.submitted;
  const currentStep = sub.status === "approved" ? 2 : sub.status === "in_review" ? 1 : 0;

  return (
    <div>
      <button onClick={() => router.push("/dashboard")} className="text-sm text-slate-400 hover:text-slate-700 mb-4">← Back</button>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold">{sub.name}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{sub.sector}{sub.location ? ` · ${sub.location}` : ""}{sub.asking_price ? ` · Asking ${sub.asking_price}` : ""}</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
      </div>

      {/* Status tracker */}
      {sub.status !== "rejected" && (
        <div className="card p-5 mb-4">
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= currentStep ? "bg-brand text-white" : "bg-slate-100 text-slate-400"}`}>
                    {i < currentStep ? "✓" : i + 1}
                  </div>
                  <span className={`text-[11px] mt-1.5 ${i <= currentStep ? "text-slate-700 font-medium" : "text-slate-400"}`}>{STEP_LABEL[s]}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < currentStep ? "bg-brand" : "bg-slate-200"}`} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved */}
      {sub.status === "approved" && (
        <div className="card p-5 mb-4" style={{ background: "#DCFCE7", borderColor: "#86EFAC" }}>
          <p className="font-semibold text-green-800">🎉 Your business is live on Skyquire</p>
          <p className="text-green-700 text-sm mt-1">Verified and listed to qualified buyers. We&apos;ll notify you when a buyer expresses interest.</p>
        </div>
      )}

      {/* Team feedback */}
      {sub.review_notes && (
        <div className="card p-5 mb-4" style={{ background: meta.bg, borderColor: "transparent" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: meta.color }}>Note from our team</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{sub.review_notes}</p>
        </div>
      )}

      {/* Needs info → upload more */}
      {sub.status === "needs_info" && (
        <div className="card p-5 mb-4">
          <p className="font-semibold text-sm text-slate-700 mb-1">We need a bit more</p>
          <p className="text-xs text-slate-500 mb-3">Upload the requested documents and your submission goes back into review automatically.</p>
          <input type="file" multiple onChange={uploadMore} disabled={uploading} className="text-sm" />
          {uploading && <p className="text-xs text-slate-500 mt-2">Uploading…</p>}
        </div>
      )}

      {/* Details */}
      <div className="card p-5 mb-4">
        <p className="font-semibold text-sm text-slate-700 mb-3">Details</p>
        {sub.description && <p className="text-sm text-slate-600 mb-4">{sub.description}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {[
            ["Asking", sub.asking_price], ["Revenue", sub.revenue], ["EBITDA", sub.ebitda],
            ["Employees", sub.employees?.toString()], ["Founded", sub.founded?.toString()], ["Location", sub.location],
          ].filter(([, v]) => v).map(([k, v]) => (
            <div key={k}><p className="text-xs text-slate-400">{k}</p><p className="font-medium text-slate-800">{v}</p></div>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className="card p-5">
        <p className="font-semibold text-sm text-slate-700 mb-3">Documents</p>
        {docs.length === 0 ? (
          <p className="text-sm text-slate-400">No documents uploaded.</p>
        ) : (
          <div className="space-y-2">
            {docs.map((d) => (
              <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100">
                <span>📄</span>
                <span className="text-sm text-slate-700 flex-1 truncate">{d.name}</span>
                <button onClick={() => downloadDoc(d)} className="text-xs text-brand hover:underline">View</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
