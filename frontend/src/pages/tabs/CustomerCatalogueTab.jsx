import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVC } from "@/context/ValueChainContext";
import { KpiCard, StatusChip, SharingBadge, DetailRow, IntensityPill } from "@/components/shared/primitives";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { QrCode } from "lucide-react";
import { toast } from "sonner";
import { fmtInt } from "@/lib/format";

const PKG_DOCS = ["Product Carbon Summary", "Verified PCF", "Carbon Passport", "Verification Summary", "CBAM Information", "Methodology Summary", "Boundary", "Scope Breakdown", "Evidence Summary", "Data Quality", "Validity"];
const SHARE_PANEL = [
  { level: "PUBLIC", items: "Product name, verified PCF, passport ID, QR verification" },
  { level: "CUSTOMER", items: "Batch footprint, methodology, boundary, scope breakdown" },
  { level: "CONFIDENTIAL", items: "Supplier-specific evidence, supplier PCF detail" },
  { level: "VERIFIER", items: "Full evidence chain, verifier references" },
  { level: "INTERNAL", items: "Internal costing, mapping confidence, audit notes" },
];
const match = (o, q) => !q || JSON.stringify(o).toLowerCase().includes(q.toLowerCase());

export default function CustomerCatalogueTab({ search, registerPrimary }) {
  const nav = useNavigate();
  const { customerCatalogue, AGG, generatePackage, packages } = useVC();
  const [selected, setSelected] = useState(null);
  const [pkgOpen, setPkgOpen] = useState(null);
  const [docs, setDocs] = useState(["Product Carbon Summary", "Verified PCF", "Carbon Passport"]);

  useEffect(() => registerPrimary("customer-catalogue", () => setPkgOpen(customerCatalogue[0])), [registerPrimary, customerCatalogue]);

  const rows = customerCatalogue.filter((p) => match(p, search));
  const toggle = (d) => setDocs((p) => p.includes(d) ? p.filter((x) => x !== d) : [...p, d]);
  const gen = () => {
    generatePackage({ customer: "Selected Customer", product: pkgOpen.product, batch: pkgOpen.batch, docs, sharing: pkgOpen.sharing });
    toast.success("Customer Carbon Data Package generated", { description: `${docs.length} documents · sharing respects confidentiality` });
    setPkgOpen(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Products" value={AGG.customerProducts} testId="cc-kpi-products" />
        <KpiCard label="Verified PCFs" value={AGG.customerVerified} testId="cc-kpi-verified" />
        <KpiCard label="Active Passports" value={AGG.activePassports} testId="cc-kpi-passports" />
        <KpiCard label="CBAM Ready" value={AGG.cbamReady} testId="cc-kpi-cbam" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white vc-scroll">
        <Table>
          <TableHeader><TableRow className="bg-slate-50">
            {["Product", "Code", "Facility", "Latest Batch", "PCF Intensity", "Boundary", "Verification", "Passport", "CBAM", "Sharing", "Status"].map((h) => <TableHead key={h} className="text-xs whitespace-nowrap">{h}</TableHead>)}
          </TableRow></TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id} className="cursor-pointer hover:bg-emerald-50/40" onClick={() => setSelected(p)} data-testid={`cc-row-${p.id}`}>
                <TableCell className="font-semibold">{p.product}</TableCell>
                <TableCell className="font-mono text-xs">{p.code}</TableCell>
                <TableCell className="text-sm">{p.facility}</TableCell>
                <TableCell className="font-mono text-xs">{p.batch}</TableCell>
                <TableCell><IntensityPill value={p.pcf} /></TableCell>
                <TableCell className="text-xs">{p.boundary}</TableCell>
                <TableCell><StatusChip status={p.verification} /></TableCell>
                <TableCell><StatusChip status={p.passport} /></TableCell>
                <TableCell className="text-xs">{p.cbam}</TableCell>
                <TableCell><SharingBadge level={p.sharing} /></TableCell>
                <TableCell><StatusChip status={p.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {packages.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 text-xs font-bold uppercase text-slate-500">Generated Customer Packages ({packages.length})</div>
          <div className="space-y-2">
            {packages.map((pk) => (
              <div key={pk.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 text-sm" data-testid={`pkg-row-${pk.id}`}>
                <div><span className="font-mono text-xs">{pk.id}</span> · <b>{pk.customer}</b> · {pk.product} · {pk.docs.length} docs</div>
                <div className="flex items-center gap-2"><SharingBadge level={pk.sharing} /><span className="text-xs text-slate-400">exp {pk.expiry}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product carbon profile drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl vc-scroll">
          {selected && (
            <>
              <SheetHeader><SheetTitle className="flex items-center gap-2">{selected.product} <StatusChip status={selected.status} /></SheetTitle></SheetHeader>
              <div className="mt-4 flex items-start justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <div className="text-2xl font-extrabold text-slate-900">{selected.pcf} <span className="text-sm font-normal">kgCO2e/kg</span></div>
                  <div className="text-xs text-slate-500">Verified PCF · {selected.boundary}</div>
                </div>
                <button onClick={() => nav(`/carbon-passports/${selected.passportId}`)} className="flex flex-col items-center gap-1 text-slate-800" data-testid="cc-view-passport">
                  <QrCode className="h-12 w-12" /><span className="text-[10px] font-semibold text-emerald-600">View Passport</span>
                </button>
              </div>
              <div className="mt-4 grid gap-x-6 md:grid-cols-2">
                <DetailRow label="Product Code" value={selected.code} mono />
                <DetailRow label="Producer" value="Asante Cocoa Cooperative" />
                <DetailRow label="Country of Origin" value="Ghana" />
                <DetailRow label="Facility" value={selected.facility} />
                <DetailRow label="Latest Batch" value={selected.batch} mono />
                <DetailRow label="Total Batch Footprint" value={`${fmtInt(Math.round(selected.pcf * selected.production))} kgCO2e`} />
                <DetailRow label="Methodology" value={selected.methodology} />
                <DetailRow label="Calculation Version" value={selected.calcVersion} mono />
                <DetailRow label="Verification" value={<StatusChip status={selected.verification} />} />
                <DetailRow label="Verification Reference" value={selected.verifierRef} mono />
                <DetailRow label="Carbon Passport ID" value={selected.passportId} mono />
                <DetailRow label="Passport Status" value={<StatusChip status={selected.passport} />} />
                <DetailRow label="Issue Date" value={selected.issueDate} />
                <DetailRow label="Validity" value={selected.validity} />
                <DetailRow label="CBAM" value={selected.cbam} />
              </div>

              <div className="mt-5">
                <div className="text-xs font-bold uppercase text-slate-500 mb-2">Data Sharing Panel</div>
                <div className="space-y-1.5">
                  {SHARE_PANEL.map((s) => (
                    <div key={s.level} className="flex items-start gap-2 rounded-lg border border-slate-200 p-2 text-sm">
                      <SharingBadge level={s.level} /><span className="text-slate-600 text-xs pt-0.5">{s.items}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => setPkgOpen(selected)} data-testid="cc-generate-package">Generate Customer Package</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("PCF shared")}>Share PCF</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Carbon Passport shared")}>Share Carbon Passport</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Secure link created")}>Create Secure Link</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Carbon summary downloaded")}>Download Summary</Button>
                <Button size="sm" variant="ghost" onClick={() => nav(`/carbon-passports/${selected.passportId}`)}>View Public Passport</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Package builder modal */}
      <Dialog open={!!pkgOpen} onOpenChange={(o) => !o && setPkgOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Generate Customer Carbon Data Package</DialogTitle></DialogHeader>
          {pkgOpen && (
            <>
              <div className="text-sm text-slate-600">{pkgOpen.product} · {pkgOpen.batch}</div>
              <div className="grid grid-cols-2 gap-2 py-2">
                {PKG_DOCS.map((d) => (
                  <label key={d} className="flex items-center gap-2 text-sm"><Checkbox checked={docs.includes(d)} onCheckedChange={() => toggle(d)} data-testid={`pkg-doc-${d.replace(/[^a-z]+/gi, "-").toLowerCase()}`} /> {d}</label>
                ))}
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">Confidential supplier evidence is excluded unless explicitly authorised.</div>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPkgOpen(null)}>Cancel</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={gen} data-testid="pkg-generate">Generate Package</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
