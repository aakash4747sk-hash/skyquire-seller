export const SECTORS = [
  "Fintech", "IT Services", "Retail", "Logistics", "Healthcare",
  "EV / Auto", "Real Estate", "FMCG / Agri", "EdTech", "Pharma", "Manufacturing", "Other",
];

export const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  draft:      { label: "Draft",            color: "#cbd5e1", bg: "rgba(148,163,184,.16)" },
  submitted:  { label: "Submitted",        color: "#7dd3fc", bg: "rgba(56,189,248,.16)" },
  in_review:  { label: "In review",        color: "#fdba74", bg: "rgba(251,146,60,.16)" },
  needs_info: { label: "Needs more info",  color: "#fcd34d", bg: "rgba(251,191,36,.16)" },
  approved:   { label: "Approved · Live",  color: "#6ee7b7", bg: "rgba(52,211,153,.16)" },
  rejected:   { label: "Not approved",     color: "#fca5a5", bg: "rgba(248,113,113,.16)" },
};
