import React, { useState, useEffect } from "react";
import { useVC } from "@/context/ValueChainContext";
import { KpiCard, StatusChip, DetailRow, LineageFlow } from "@/components/shared/primitives";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "sonner";

const CATS = ["All", "Supplier Invoice", "Production Records", "Meter Data", "Utility Bills", "Fuel Records", "Transport Records", "PCF Reports", "Verification Statements", "Certificates", "Methodology", "Emission Factors", "Photos", "Other"];
const match = (o, q, name) => !q || (JSON.stringify(o) + name).toLowerCase().includes(q.toLowerCase());

export default function EvidenceTab({ search, registerPrimary, goToTab }) {
  const { evidence, supplierName, reviewEvidence } = useVC();
  const [selected, setSelected] = useState(null);
  const [cat, setCat] = useState("All");
  useEffect(() => registerPrimary("evidence", () => setSelected(evidence.find((e) => e.status === "UNDER REVIEW") || evidence[0])), [registerPrimary, evidence]);

  const rows = evidence.filter((e) => (cat === "All" || e.category === cat) && match(e, search, supplierName(e.supplierId)));
  const total = evidence.length;
  const accepted = evidence.filter((e) => e.status === "ACCEPTED").length;
  const review = evidence.filter((e) => e.status === "UNDER REVIEW").length;
  const rejected = evidence.filter((e) => ["REJECTED", "MISSING"].includes(e.status)).length;

  const act = (action, label) => { reviewEvidence(selected.id, action); toast.success(`${label}: ${selected.id}`, { description: "Version & audit history preserved — never silently deleted." }); setSelected(null); };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Evidence Items" value={total} testId="evd-kpi-total" />
        <KpiCard label="Accepted" value={accepted} testId="evd-kpi-accepted" />
        <KpiCard label="Under Review" value={review} subTone="warn" testId="evd-kpi-review" />
        <KpiCard label="Rejected / Missing" value={rejected} subTone="down" testId="evd-kpi-rejected" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)} data-testid={`evd-filter-${c.replace(/[^a-z]+/gi, "-").toLowerCase()}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${cat === c ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200"}`}>{c}</button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white vc-scroll">
        <Table>
          <TableHeader><TableRow className="bg-slate-50">
            {["Evidence ID", "Supplier", "Product", "Category", "Declaration", "Period", "Source", "Uploaded By", "Hash", "Ver.", "Status"].map((h) => <TableHead key={h} className="text-xs whitespace-nowrap">{h}</TableHead>)}
          </TableRow></TableHeader>
          <TableBody>
            {rows.map((e) => (
              <TableRow key={e.id} className="cursor-pointer hover:bg-emerald-50/40" onClick={() => setSelected(e)} data-testid={`evd-row-${e.id}`}>
                <TableCell className="font-mono text-xs">{e.id}</TableCell>
                <TableCell className="font-semibold">{supplierName(e.supplierId)}</TableCell>
                <TableCell className="text-sm">{e.product}</TableCell>
                <TableCell className="text-xs">{e.category}</TableCell>
                <TableCell className="font-mono text-xs">{e.declaration}</TableCell>
                <TableCell className="text-xs">{e.period}</TableCell>
                <TableCell className="text-xs">{e.source}</TableCell>
                <TableCell className="text-xs">{e.uploadedBy}</TableCell>
                <TableCell className="font-mono text-[11px]">{e.hash}</TableCell>
                <TableCell className="text-xs">v{e.version}</TableCell>
                <TableCell><StatusChip status={e.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl vc-scroll">
          {selected && (
            <>
              <SheetHeader><SheetTitle className="flex items-center gap-2">{selected.title} <StatusChip status={selected.status} /></SheetTitle></SheetHeader>
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <FileText className="h-8 w-8 text-slate-400" />
                <div><div className="text-sm font-semibold">{selected.file}</div><div className="text-xs text-slate-500">{selected.category} · v{selected.version}</div></div>
              </div>
              <div className="mt-4 grid gap-x-6 md:grid-cols-2">
                <DetailRow label="Evidence ID" value={selected.id} mono />
                <DetailRow label="Supplier" value={supplierName(selected.supplierId)} />
                <DetailRow label="Product" value={selected.product} />
                <DetailRow label="Declaration" value={selected.declaration} mono />
                <DetailRow label="Reporting Period" value={selected.period} />
                <DetailRow label="Source" value={selected.source} />
                <DetailRow label="Uploaded By" value={selected.uploadedBy} />
                <DetailRow label="Uploaded Date" value={new Date(selected.uploadedDate).toLocaleDateString("en-GB")} />
                <DetailRow label="Hash" value={selected.hash} mono />
                <DetailRow label="Version" value={`v${selected.version}`} />
                <DetailRow label="Linked Supplier PCF" value={selected.product} />
                <DetailRow label="Linked Internal Material" value="MAT-COCOA-001" mono />
              </div>
              <div className="mt-5">
                <div className="text-xs font-bold uppercase text-slate-500 mb-2">Traceability</div>
                <LineageFlow steps={[
                  { label: "Evidence", value: selected.id, highlight: true }, { label: "Declaration", value: selected.declaration },
                  { label: "Supplier Product", value: selected.product }, { label: "Supply Catalogue", value: "RCB-GH-001" },
                  { label: "Internal Material", value: "MAT-COCOA-001" }, { label: "Scope 3", value: "PG&S" }, { label: "Our Product PCF", value: "2.84" },
                ]} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => act("accept", "Evidence accepted")} data-testid="evd-accept">Accept Evidence</Button>
                <Button size="sm" variant="outline" className="text-rose-600" onClick={() => act("reject", "Evidence rejected")} data-testid="evd-reject">Reject Evidence</Button>
                <Button size="sm" variant="outline" onClick={() => act("replace", "Replacement requested (new version)")}>Request Replacement</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Evidence linked")}>Link Evidence</Button>
                <Button size="sm" variant="outline" onClick={() => { goToTab("declarations"); setSelected(null); }}>View Declaration</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
