import React from "react";
import { cn } from "@/lib/utils";
import { toneClasses, STATUS_TONE, DATA_CLASS, SHARING, qualityTone } from "@/lib/format";
import { Check, Circle, AlertTriangle, X } from "lucide-react";

// ---- Status chip ----------------------------------------------------------
export function StatusChip({ status, className }) {
  const tone = STATUS_TONE[status?.toUpperCase?.()] || "slate";
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide", toneClasses[tone], className)} data-testid={`status-${status}`}>
      {status}
    </span>
  );
}

// ---- Data classification badge -------------------------------------------
export function ClassBadge({ dataClass, full = false }) {
  const c = DATA_CLASS[dataClass] || DATA_CLASS.PROXY;
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold", toneClasses[c.tone])}>
      {full ? c.label : c.short}
    </span>
  );
}

export function SharingBadge({ level }) {
  const c = SHARING[level] || SHARING.INTERNAL;
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold", toneClasses[c.tone])}>
      {c.label}
    </span>
  );
}

// ---- Data quality bar -----------------------------------------------------
export function QualityBar({ score, showValue = true, className }) {
  const tone = qualityTone(score);
  const barColor = { emerald: "bg-emerald-500", blue: "bg-blue-500", amber: "bg-amber-500", rose: "bg-rose-500" }[tone];
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
        <div className={cn("h-full rounded-full", barColor)} style={{ width: `${score}%` }} />
      </div>
      {showValue && <span className="text-xs font-semibold text-slate-700 tabular-nums">{score}/100</span>}
    </div>
  );
}

// ---- Carbon intensity indicator ------------------------------------------
export function IntensityPill({ value, unit = "kgCO2e/kg" }) {
  const tone = value <= 1.5 ? "emerald" : value <= 2.5 ? "amber" : "rose";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums", toneClasses[tone])}>
      {typeof value === "number" ? value.toFixed(2) : value} <span className="opacity-70 font-normal">{unit}</span>
    </span>
  );
}

// ---- KPI card -------------------------------------------------------------
export function KpiCard({ label, value, sub, subTone = "muted", active, onClick, testId }) {
  const subColor = { muted: "text-slate-500", up: "text-emerald-600", warn: "text-amber-600", down: "text-rose-600" }[subTone] || "text-slate-500";
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={cn(
        "group flex w-full flex-col items-start rounded-xl border bg-white p-5 text-left transition-all hover:shadow-md hover:-translate-y-0.5",
        active ? "border-emerald-400 ring-2 ring-emerald-100" : "border-slate-200"
      )}
    >
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <span className="mt-2 text-3xl font-extrabold text-slate-900 tabular-nums">{value}</span>
      {sub && <span className={cn("mt-1 text-sm font-medium", subColor)}>{sub}</span>}
    </button>
  );
}

// ---- Metric mini card -----------------------------------------------------
export function MetricCard({ label, value, hint, onClick, testId }) {
  return (
    <button type="button" onClick={onClick} data-testid={testId}
      className="flex flex-col items-start rounded-lg border border-slate-200 bg-white p-3.5 text-left transition-all hover:border-emerald-300 hover:shadow-sm">
      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <span className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{value}</span>
      {hint && <span className="mt-0.5 text-[11px] text-slate-400">{hint}</span>}
    </button>
  );
}

// ---- Section header -------------------------------------------------------
export function SectionTitle({ children, right }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">{children}</h3>
      {right}
    </div>
  );
}

// ---- Detail row (drawers) -------------------------------------------------
export function DetailRow({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 last:border-0">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className={cn("text-right text-sm font-medium text-slate-800", mono && "font-mono text-xs")}>{value ?? "—"}</span>
    </div>
  );
}

// ---- Workflow tracker -----------------------------------------------------
const stageIcon = {
  complete: <Check className="h-3 w-3" />, pending: <Circle className="h-3 w-3" />,
  action: <AlertTriangle className="h-3 w-3" />, blocked: <X className="h-3 w-3" />,
};
const stageColor = {
  complete: "bg-emerald-500 text-white border-emerald-500",
  pending: "bg-white text-slate-400 border-slate-300",
  action: "bg-amber-500 text-white border-amber-500",
  blocked: "bg-rose-500 text-white border-rose-500",
};

export function WorkflowTracker({ stages, currentIndex, actionIndex }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {stages.map((stage, i) => {
        let state = i < currentIndex ? "complete" : i === currentIndex ? "action" : "pending";
        if (actionIndex === i) state = "action";
        return (
          <React.Fragment key={stage}>
            <div className="flex shrink-0 flex-col items-center gap-1">
              <span className={cn("flex h-6 w-6 items-center justify-center rounded-full border", stageColor[state])}>
                {stageIcon[state]}
              </span>
              <span className={cn("whitespace-nowrap text-[9px] font-semibold uppercase", i <= currentIndex ? "text-slate-700" : "text-slate-400")}>{stage}</span>
            </div>
            {i < stages.length - 1 && <div className={cn("h-0.5 w-4 shrink-0 md:w-8", i < currentIndex ? "bg-emerald-400" : "bg-slate-200")} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ---- Lineage / impact flow ------------------------------------------------
export function LineageFlow({ steps, vertical = false, onStepClick }) {
  return (
    <div className={cn("flex gap-2", vertical ? "flex-col" : "flex-wrap items-center")}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <button
            type="button"
            onClick={() => onStepClick?.(s, i)}
            className={cn(
              "rounded-lg border px-3 py-2 text-left transition-all",
              s.highlight ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-300",
              onStepClick && "cursor-pointer"
            )}
          >
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{s.label}</div>
            <div className="text-sm font-semibold text-slate-800">{s.value}</div>
          </button>
          {i < steps.length - 1 && (
            <span className={cn("text-emerald-400", vertical ? "self-center rotate-90" : "")}>→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
      <span className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-500" /> Complete</span>
      <span className="flex items-center gap-1"><Circle className="h-3 w-3 text-slate-400" /> Pending</span>
      <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-amber-500" /> Action Required</span>
      <span className="flex items-center gap-1"><X className="h-3 w-3 text-rose-500" /> Blocked</span>
    </div>
  );
}
