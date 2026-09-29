import React from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import { ArrowLeft } from "lucide-react";

export default function StubModule({ title, breadcrumb, detail }) {
  const nav = useNavigate();
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-8 py-10">
        <button onClick={() => nav("/value-chain")} className="mb-4 flex items-center gap-2 text-sm font-medium text-emerald-600 hover:underline" data-testid="stub-back">
          <ArrowLeft className="h-4 w-4" /> Back to Value Chain
        </button>
        <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{breadcrumb || title}</div>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">{title}</h1>
        {detail ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">{detail}</div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-sm text-slate-500">This module is part of the Saurient platform. The Value Chain deep-links land here.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
