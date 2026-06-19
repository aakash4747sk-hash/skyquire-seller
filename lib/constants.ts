export const SECTORS = [
  "Fintech", "IT Services", "Retail", "Logistics", "Healthcare",
  "EV / Auto", "Real Estate", "FMCG / Agri", "EdTech", "Pharma", "Manufacturing", "Other",
];

export const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  draft:      { label: "Draft",            color: "#64748B", bg: "#F1F5F9" },
  submitted:  { label: "Submitted",        color: "#0369A1", bg: "#E0F2FE" },
  in_review:  { label: "In review",        color: "#9A3412", bg: "#FFEDD5" },
  needs_info: { label: "Needs more info",  color: "#B45309", bg: "#FEF3C7" },
  approved:   { label: "Approved · Live",  color: "#15803D", bg: "#DCFCE7" },
  rejected:   { label: "Not approved",     color: "#B91C1C", bg: "#FEE2E2" },
};
