"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { SECTORS } from "@/lib/constants";

export default function NewSubmission() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", sector: "Fintech", location: "", askingCr: "", revenueCr: "",
    ebitda: "", employees: "", founded: "", description: "", highlights: "",
    reason: "", phone: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const askingCr = parseFloat(form.askingCr) || null;
    const revenueCr = parseFloat(form.revenueCr) || null;

    const { data: sub, error: insErr } = await supabase
      .from("business_submissions")
      .insert({
        seller_id: user.id,
        name: form.name,
        sector: form.sector,
        location: form.location || null,
        asking_price: askingCr ? `₹${askingCr} Cr` : null,
        asking_price_cr: askingCr,
        revenue: revenueCr ? `₹${revenueCr} Cr` : null,
        revenue_cr: revenueCr,
        ebitda: form.ebitda || null,
        employees: form.employees ? parseInt(form.employees) : null,
        founded: form.founded ? parseInt(form.founded) : null,
        description: form.description || null,
        highlights: form.highlights ? form.highlights.split(",").map((s) => s.trim()).filter(Boolean) : null,
        reason_for_sale: form.reason || null,
        contact_phone: form.phone || null,
        status: "submitted",
      })
      .select("id")
      .single();

    if (insErr || !sub) { setError(insErr?.message || "Could not submit. Try again."); setSubmitting(false); return; }

    // Upload documents
    for (const file of files) {
      const path = `${user.id}/${sub.id}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("seller-documents").upload(path, file);
      if (upErr) continue;
      await supabase.from("submission_documents").insert({
        submission_id: sub.id, name: file.name, file_path: path, file_size: file.size,
      });
    }

    router.push(`/dashboard/${sub.id}`);
  }

  return (
    <div>
      <button onClick={() => router.push("/dashboard")} className="text-sm text-slate-400 hover:text-slate-700 mb-4">← Back</button>
      <h1 className="font-display text-2xl font-bold mb-1">Submit your business</h1>
      <p className="text-slate-500 text-sm mb-6">Tell us about your business. Our team will verify it before it goes live to buyers.</p>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

      <form onSubmit={submit} className="space-y-5">
        <div className="card p-5 space-y-4">
          <p className="font-semibold text-sm text-slate-700">The business</p>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Business name *</label>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)} className="input" placeholder="e.g. GreenLeaf Organics" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Sector *</label>
              <select value={form.sector} onChange={(e) => set("sector", e.target.value)} className="input">
                {SECTORS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Location</label>
              <input value={form.location} onChange={(e) => set("location", e.target.value)} className="input" placeholder="e.g. Pune" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">What does the business do?</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className="input" style={{ resize: "none" }} placeholder="Describe the business, its customers, and why it's attractive…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Highlights (comma-separated)</label>
            <input value={form.highlights} onChange={(e) => set("highlights", e.target.value)} className="input" placeholder="Profitable, Recurring revenue, 200+ clients" />
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <p className="font-semibold text-sm text-slate-700">Financials</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Asking price (₹ Cr) *</label>
              <input required type="number" step="0.1" value={form.askingCr} onChange={(e) => set("askingCr", e.target.value)} className="input" placeholder="2" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Annual revenue (₹ Cr)</label>
              <input type="number" step="0.1" value={form.revenueCr} onChange={(e) => set("revenueCr", e.target.value)} className="input" placeholder="3" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">EBITDA margin</label>
              <input value={form.ebitda} onChange={(e) => set("ebitda", e.target.value)} className="input" placeholder="e.g. 18%" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Employees</label>
              <input type="number" value={form.employees} onChange={(e) => set("employees", e.target.value)} className="input" placeholder="25" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Founded (year)</label>
              <input type="number" value={form.founded} onChange={(e) => set("founded", e.target.value)} className="input" placeholder="2017" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Contact phone</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="input" placeholder="+91 …" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Reason for selling</label>
            <textarea value={form.reason} onChange={(e) => set("reason", e.target.value)} rows={2} className="input" style={{ resize: "none" }} placeholder="Why are you selling?" />
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <p className="font-semibold text-sm text-slate-700">Documents</p>
          <p className="text-xs text-slate-500">Upload financials, GST returns, or incorporation docs — these stay private and are only seen by our verification team.</p>
          <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="text-sm" />
          {files.length > 0 && <p className="text-xs text-slate-500">{files.length} file{files.length > 1 ? "s" : ""} selected</p>}
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.push("/dashboard")} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-brand">{submitting ? "Submitting…" : "Submit for review"}</button>
        </div>
      </form>
    </div>
  );
}
