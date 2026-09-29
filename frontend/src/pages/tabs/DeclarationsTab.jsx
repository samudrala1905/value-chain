import React, { useState, useEffect } from "react";
import { useVC } from "@/context/ValueChainContext";
import { KpiCard, StatusChip, ClassBadge, DetailRow, QualityBar } from "@/components/shared/primitives";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fmtKg, fmtIntensity, fmtInt, DATA_CLASS } from "@/lib/format";

const match = (o, q, name) => !q || (JSON.stringify(o) + name).toLowerCase().includes(q.toLowerCase());

export default function DeclarationsTab({ search, registerPrimary, goToTab }) {
  const { declarations, supplierName, reviewDeclaration } = useVC();
  const [selected, setSelected] = useState(null);
  useEffect(() => registerPrimary("declarations", () => {
    const r = declarations.find((x) => x.status === "UNDER REVIEW") || declarations[0];
    setSelected(r);
  }), [registerPrimary, declarations]);

  const rows = declarations.filter((d) => match(d, search, supplierName(d.supplierId)));
  const total = declarations.length;
  const accepted = declarations.filter((d) => d.status === "ACCEPTED").length;
  const review = declarations.filter((d) => d.status === "UNDER REVIEW").length;
  const correction = declarations.filter((d) => d.status === "CORRECTION REQUIRED").length;

  const act = (action, label) => {
    reviewDeclaration(selected.id, action);
    toast.success(`${label}: ${selected.id}`);
    if (action === "map") { goToTab("catalogue"); }
    setSelected(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Declarations" value={total} testId="dec-kpi-total" />
        <KpiCard label="Accepted" value={accepted} testId="dec-kpi-accepted" />
        <KpiCard label="Under Review" value={review} subTone="warn" testId="dec-kpi-review" />
        <KpiCard label="Correction Required" value={correction} subTone="down" testId="dec-kpi-correction" />
      </div>

      <div className="mb-1 flex flex-wrap gap-2">
        {Object.values(DATA_CLASS).map((c, i) => <ClassBadge key={i} dataClass={Object.keys(DATA_CLASS)[i]} full />)}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white vc-scroll">
        <Table>
          <TableHeader><TableRow className="bg-slate-50">
            {["Declaration ID", "Supplier", "Facility", "Product", "Period", "Quantity", "Declared PCF", "Boundary", "Data Type", "Evidence", "Verification", "Status"].map((h) => <TableHead key={h} className="text-xs whitespace-nowrap">{h}</TableHead>)}
          </TableRow></TableHeader>
          <TableBody>
            {rows.map((d) => (
              <TableRow key={d.id} className="cursor-pointer hover:bg-emerald-50/40" onClick={() => setSelected(d)} data-testid={`dec-row-${d.id}`}>
                <TableCell className="font-mono text-xs">{d.id}</TableCell>
                <TableCell className="font-semibold">{supplierName(d.supplierId)}</TableCell>
                <TableCell className="text-sm">{d.facility}</TableCell>
                <TableCell className="text-sm">{d.product}</TableCell>
                <TableCell className="text-xs">{d.period}</TableCell>
                <TableCell className="text-sm tabular-nums">{d.unit === "kg" ? fmtKg(d.quantity) : d.unit}</TableCell>
                <TableCell className="text-sm tabular-nums">{d.pcf} {d.declaredUnit === "kg" ? "kgCO2e/kg" : `kgCO2e/${d.declaredUnit}`}</TableCell>
                <TableCell className="text-xs">{d.boundary}</TableCell>
                <TableCell><ClassBadge dataClass={d.dataClass} /></TableCell>
                <TableCell className="text-xs">{d.evidence}</TableCell>
                <TableCell className="text-xs">{d.verification}</TableCell>
                <TableCell><StatusChip status={d.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl vc-scroll">
          {selected && (
            <>
              <SheetHeader><SheetTitle className="flex items-center gap-2">{selected.id} <StatusChip status={selected.status} /></SheetTitle></SheetHeader>
              <div className="mt-3"><ClassBadge dataClass={selected.dataClass} full /></div>
              <div className="mt-4 grid gap-x-6 md:grid-cols-2">
                <DetailRow label="Supplier" value={supplierName(selected.supplierId)} />
                <DetailRow label="Facility" value={selected.facility} />
                <DetailRow label="Product" value={selected.product} />
                <DetailRow label="Product Code" value={selected.productCode} mono />
                <DetailRow label="Quantity" value={`${fmtInt(selected.quantity)} ${selected.unit}`} />
                <DetailRow label="Declared Unit" value={selected.declaredUnit} />
                <DetailRow label="PCF Intensity" value={fmtIntensity(selected.pcf)} />
                <DetailRow label="Total Emissions" value={`${fmtInt(Math.round(selected.pcf * selected.quantity))} kgCO2e`} />
                <DetailRow label="Boundary" value={selected.boundary} />
                <DetailRow label="Methodology" value={selected.methodology} />
                <DetailRow label="GWP Basis" value={selected.gwp} />
                <DetailRow label="EF Dataset" value={selected.efDataset} />
                <DetailRow label="Calc Version" value={selected.calcVersion} mono />
                <DetailRow label="Data Quality" value={<QualityBar score={selected.quality} />} />
                <DetailRow label="Verification" value={selected.verification} />
                <DetailRow label="Verifier Ref" value={selected.verifierRef} mono />
                <DetailRow label="Evidence Count" value={selected.evidenceCount} />
                <DetailRow label="Declaration Date" value={new Date(selected.declarationDate).toLocaleDateString("en-GB")} />
                <DetailRow label="Authorised Declarant" value={selected.declarant} />
              </div>
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                Supplier-provided data is <b>not</b> automatically verified. Classification flows into all PCF calculations.
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => act("accept", "Accepted")} data-testid="dec-accept">Accept</Button>
                <Button size="sm" variant="outline" onClick={() => act("correct", "Returned for correction")} data-testid="dec-correct">Return for Correction</Button>
                <Button size="sm" variant="outline" onClick={() => { toast.info("Evidence requested"); goToTab("evidence"); setSelected(null); }}>Request Evidence</Button>
                <Button size="sm" variant="outline" onClick={() => toast.info("Clarification requested")}>Request Clarification</Button>
                <Button size="sm" variant="outline" className="text-rose-600" onClick={() => act("reject", "Rejected")}>Reject</Button>
                <Button size="sm" variant="outline" onClick={() => act("map", "Mapped to catalogue")} data-testid="dec-map">Map to Catalogue</Button>
                <Button size="sm" variant="ghost" onClick={() => { toast.info("Opening PCF impact"); }}>View Impact</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
