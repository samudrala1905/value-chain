// Shared formatting helpers + classification / status config for the Value Chain module.

export const fmtInt = (n) =>
  typeof n === "number" ? n.toLocaleString("en-US") : n ?? "—";

export const fmtKg = (n) => `${fmtInt(n)} kg`;

export const fmtPct = (n, digits = 0) =>
  n === null || n === undefined ? "—" : `${Number(n).toFixed(digits)}%`;

export const fmtIntensity = (n) =>
  n === null || n === undefined ? "—" : `${Number(n).toFixed(2)} kgCO2e/kg`;

export const fmtTonnes = (kg) =>
  kg === null || kg === undefined ? "—" : `${(kg / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })} tCO2e`;

export const fmtDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
};

// Data classification — MUST stay separate from carbon performance.
export const DATA_CLASS = {
  PRIMARY_VERIFIED: { label: "Verified Primary Data", short: "VERIFIED PRIMARY", tone: "emerald" },
  PRIMARY_DECLARED: { label: "Supplier-Declared Primary Data", short: "SUPPLIER DECLARED", tone: "blue" },
  SECONDARY: { label: "Secondary Data", short: "SECONDARY", tone: "amber" },
  PROXY: { label: "Estimated / Proxy Data", short: "PROXY", tone: "rose" },
};

// Sharing confidentiality levels.
export const SHARING = {
  PUBLIC: { label: "Public", tone: "emerald" },
  CUSTOMER: { label: "Customer Shareable", tone: "blue" },
  CONFIDENTIAL: { label: "Confidential", tone: "amber" },
  VERIFIER: { label: "Verifier Only", tone: "violet" },
  INTERNAL: { label: "Internal Only", tone: "slate" },
};

// Generic status → tone mapping.
export const STATUS_TONE = {
  ACTIVE: "emerald",
  VERIFIED: "emerald",
  ACCEPTED: "emerald",
  VALIDATED: "emerald",
  MAPPED: "emerald",
  COMPLETED: "emerald",
  "PASSPORT ACTIVE": "emerald",
  "READY TO SHARE": "emerald",
  READY: "emerald",
  CONNECTED: "blue",
  SUBMITTED: "blue",
  OPENED: "blue",
  SENT: "blue",
  "IN PROGRESS": "blue",
  "UNDER REVIEW": "amber",
  "DATA REQUESTED": "amber",
  PENDING: "amber",
  "CORRECTION REQUIRED": "amber",
  RETURNED: "amber",
  "ACTION REQUIRED": "amber",
  ESTIMATED: "amber",
  "RECALCULATION REQUIRED": "amber",
  DRAFT: "slate",
  INVITED: "slate",
  EXPIRED: "rose",
  DECLINED: "rose",
  REJECTED: "rose",
  BLOCKED: "rose",
  MISSING: "rose",
  CRITICAL: "rose",
};

export const toneClasses = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
};

export const qualityTone = (score) =>
  score >= 90 ? "emerald" : score >= 75 ? "blue" : score >= 60 ? "amber" : "rose";

export const CHART_COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#8b5cf6", "#ef4444", "#14b8a6", "#6366f1", "#ec4899"];
