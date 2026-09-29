import React from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import { useVC } from "@/context/ValueChainContext";
import { DetailRow, LineageFlow, StatusChip, IntensityPill } from "@/components/shared/primitives";
import { ArrowLeft, ExternalLink, QrCode } from "lucide-react";
import { fmtIntensity, fmtInt } from "@/lib/format";

// Carbon Accounting → PCF → Inventory → Scope 3 → Purchased Goods record
export function Scope3Record() {
  const nav = useNavigate();
  const { ORG, scope3 } = useVC();
  const cocoa = scope3.rows.find((r) => r.id === "SUP-GH-001");
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-8 py-10">
        <button onClick={() => nav("/value-chain")} className="mb-4 flex items-center gap-2 text-sm font-medium text-emerald-600 hover:underline" data-testid="scope3-back">
          <ArrowLeft className="h-4 w-4" /> Back to Value Chain
        </button>
        <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Carbon Accounting / PCF / Inventory / Scope 3 / Purchased Goods & Services</div>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Scope 3 Inventory Record</h1>

        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase text-emerald-700">Source</div>
              <div className="text-sm font-bold text-emerald-900">VALUE CHAIN PRIMARY DATA</div>
            </div>
            <button onClick={() => nav("/value-chain?tab=catalogue")} className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100" data-testid="scope3-to-catalogue">
              View source: Supply Catalogue → RCB-GH-001 <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold uppercase text-slate-700">Purchased Good</h3>
            <DetailRow label="Product PCF" value={ORG.product} />
            <DetailRow label="PCF Project" value={ORG.pcfProject} />
            <DetailRow label="Material" value="Raw Cocoa Beans (MAT-COCOA-001)" mono />
            <DetailRow label="Supplier Product" value="RCB-GH-001" mono />
            <DetailRow label="Quantity" value="130,000 kg" />
            <DetailRow label="Supplier PCF" value={<IntensityPill value={cocoa?.pcfIntensity} />} />
            <DetailRow label="Scope 3 Emissions" value={`${fmtInt(Math.round(cocoa?.emissions))} kgCO2e`} />
            <DetailRow label="Classification" value="PRIMARY VERIFIED" />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold uppercase text-slate-700">Full Lineage</h3>
            <LineageFlow vertical steps={[
              { label: "Our Product PCF", value: `${ORG.currentPCF} kgCO2e/kg` },
              { label: "Scope 3", value: "Purchased Goods & Services" },
              { label: "Material", value: "MAT-COCOA-001" },
              { label: "Supplier Product", value: "RCB-GH-001", highlight: true },
              { label: "Supplier", value: "Ashanti Cocoa Farms" },
              { label: "Supplier PCF", value: fmtIntensity(cocoa?.pcfIntensity) },
              { label: "Declaration", value: "DEC-2026-0041" },
              { label: "Evidence", value: "EVD-2026-0311" },
            ]} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export function PassportDetail() {
  const nav = useNavigate();
  const { ORG } = useVC();
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-8 py-10">
        <button onClick={() => nav("/value-chain")} className="mb-4 flex items-center gap-2 text-sm font-medium text-emerald-600 hover:underline" data-testid="passport-back">
          <ArrowLeft className="h-4 w-4" /> Back to Value Chain
        </button>
        <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Carbon Passports / Passport Detail</div>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold uppercase text-emerald-600">Carbon Passport · CP-GH-2026-0001</div>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-900">{ORG.product}</h1>
              <div className="text-sm text-slate-500">{ORG.productCode} · {ORG.facility} · {ORG.country}</div>
            </div>
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-slate-200 bg-slate-50"><QrCode className="h-14 w-14 text-slate-800" /></div>
          </div>
          <div className="mt-6 grid gap-x-8 md:grid-cols-2">
            <DetailRow label="Verified PCF" value={`${ORG.currentPCF} kgCO2e/kg`} />
            <DetailRow label="Boundary" value={ORG.boundary} />
            <DetailRow label="Latest Batch" value={ORG.batch} />
            <DetailRow label="Verification" value={<StatusChip status="VERIFIED" />} />
            <DetailRow label="Passport Status" value={<StatusChip status="PASSPORT ACTIVE" />} />
            <DetailRow label="Issue Date" value="15 Mar 2026" />
            <DetailRow label="Validity" value="15 Mar 2027" />
            <DetailRow label="Calc Version" value="v3.1" mono />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
