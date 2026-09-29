import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVC } from "@/context/ValueChainContext";
import { KpiCard, StatusChip, ClassBadge, DetailRow, LineageFlow, IntensityPill } from "@/components/shared/primitives";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MoreHorizontal, Check, X, AlertTriangle, Zap } from "lucide-react";
import { toast } from "sonner";
import { fmtInt } from "@/lib/format";

const match = (o, q, name) => !q || (JSON.stringify(o) + name).toLowerCase().includes(q.toLowerCase());

// Supplier PCF selection engine checks
function selectionChecks(c) {
  const ok = c.dataClass !== "PROXY" && c.dataClass !== "SECONDARY";
  return [
    { label: "Supplier product mapping", pass: c.mapped },
    { label: "Supplier PCF available", pass: !!c.pcf },
    { label: "Correct product & facility", pass: true },
    { label: "Valid reporting period", pass: c.validUntil >= "2026-06-01" },
    { label: "Compatible boundary", pass: c.boundary === "Cradle-to-Gate" || c.boundary === "Well-to-Wheel" },
    { label: "Appropriate declared unit", pass: true },
    { label: "Evidence available", pass: ok },
    { label: "Verification status", pass: c.verification === "Verified" },
    { label: "Data quality acceptable", pass: ok },
  ];
}

export default function SupplyCatalogueTab({ search, registerPrimary }) {
  const nav = useNavigate();
  const { catalogue, supplierName, INTERNAL_MATERIALS, mapCatalogue, addCatalogueProduct, runImpactAnalysis } = useVC();
  const [selected, setSelected] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(null);
  const [mapTo, setMapTo] = useState("");
  const [impact, setImpact] = useState(null);
  const [f, setF] = useState({ supplierId: "", product: "", code: "", unit: "kg", pcf: "", boundary: "Cradle-to-Gate" });

  useEffect(() => registerPrimary("catalogue", () => setAddOpen(true)), [registerPrimary]);

  const rows = catalogue.filter((c) => match(c, search, supplierName(c.supplierId)));
  const total = catalogue.length;
  const pcfAvail = catalogue.filter((c) => c.pcf).length;
  const verified = catalogue.filter((c) => c.verification === "Verified").length;
  const proxy = catalogue.filter((c) => ["PROXY", "SECONDARY"].includes(c.dataClass)).length;

  const doMap = () => { mapCatalogue(mapOpen.id, mapTo); toast.success(`Mapped ${mapOpen.code} → ${mapTo}`); setMapOpen(null); setMapTo(""); };
  const submitAdd = () => {
    if (!f.supplierId || !f.product) return toast.error("Supplier & product required");
    addCatalogueProduct({ ...f, pcf: Number(f.pcf) || 0, internalMaterial: "—", validFrom: "2026-01-01", validUntil: "2026-12-31", pcfVersion: "v0.1", pcfSource: "Pending", qtyUsed: 0, mappingConfidence: "Low" });
    toast.success(`Catalogue product added: ${f.product}`);
    setAddOpen(false); setF({ supplierId: "", product: "", code: "", unit: "kg", pcf: "", boundary: "Cradle-to-Gate" });
  };
  const doImpact = (c) => { const r = runImpactAnalysis(c.supplierId, "PCF update"); setImpact(r); };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Supplier Products" value={total} testId="cat-kpi-total" />
        <KpiCard label="PCF Available" value={pcfAvail} testId="cat-kpi-pcf" />
        <KpiCard label="Verified PCF" value={verified} testId="cat-kpi-verified" />
        <KpiCard label="Using Proxy Factors" value={proxy} subTone="warn" testId="cat-kpi-proxy" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white vc-scroll">
        <Table>
          <TableHeader><TableRow className="bg-slate-50">
            {["Supplier", "Product", "Code", "Internal Material", "Unit", "PCF Intensity", "Boundary", "Data Type", "Verification", "Valid Until", "Status", ""].map((h) => <TableHead key={h} className="text-xs whitespace-nowrap">{h}</TableHead>)}
          </TableRow></TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id} className="cursor-pointer hover:bg-emerald-50/40" onClick={() => setSelected(c)} data-testid={`cat-row-${c.id}`}>
                <TableCell className="font-semibold">{supplierName(c.supplierId)}</TableCell>
                <TableCell className="text-sm">{c.product}</TableCell>
                <TableCell className="font-mono text-xs">{c.code}</TableCell>
                <TableCell className="font-mono text-xs">{c.mapped ? c.internalMaterial : <span className="text-amber-600">Unmapped</span>}</TableCell>
                <TableCell className="text-xs">{c.unit}</TableCell>
                <TableCell><IntensityPill value={c.pcf} unit={`kgCO2e/${c.unit}`} /></TableCell>
                <TableCell className="text-xs">{c.boundary}</TableCell>
                <TableCell><ClassBadge dataClass={c.dataClass} /></TableCell>
                <TableCell className="text-xs">{c.verification}</TableCell>
                <TableCell className="text-xs">{new Date(c.validUntil).toLocaleDateString("en-GB")}</TableCell>
                <TableCell><StatusChip status={c.status} /></TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setMapOpen(c); setMapTo(c.internalMaterial !== "—" ? c.internalMaterial : ""); }}>Map / Replace Mapping</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => nav("/carbon-accounting/scope3")}>View PCF Usage</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info("1 product affected: Refined Cocoa Butter")}>View Affected Products</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => doImpact(c)}>Simulate Supplier PCF Change</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Catalogue product detail + PCF selection engine + lineage */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl vc-scroll">
          {selected && (
            <>
              <SheetHeader><SheetTitle className="flex items-center gap-2">{selected.code} <StatusChip status={selected.status} /></SheetTitle></SheetHeader>
              <div className="mt-3"><ClassBadge dataClass={selected.dataClass} full /></div>
              <div className="mt-4 grid gap-x-6 md:grid-cols-2">
                <DetailRow label="Supplier" value={supplierName(selected.supplierId)} />
                <DetailRow label="Product" value={selected.product} />
                <DetailRow label="Product Code" value={selected.code} mono />
                <DetailRow label="Internal Material" value={selected.internalMaterial} mono />
                <DetailRow label="Declared Unit" value={selected.unit} />
                <DetailRow label="PCF Intensity" value={<IntensityPill value={selected.pcf} unit={`kgCO2e/${selected.unit}`} />} />
                <DetailRow label="Total Emissions" value={`${fmtInt(Math.round(selected.pcf * selected.qtyUsed))} kgCO2e`} />
                <DetailRow label="Boundary" value={selected.boundary} />
                <DetailRow label="PCF Version" value={selected.pcfVersion} mono />
                <DetailRow label="Verification" value={selected.verification} />
                <DetailRow label="PCF Source" value={selected.pcfSource} />
                <DetailRow label="Valid From" value={new Date(selected.validFrom).toLocaleDateString("en-GB")} />
                <DetailRow label="Valid Until" value={new Date(selected.validUntil).toLocaleDateString("en-GB")} />
              </div>

              {/* Selection engine */}
              <div className="mt-5 rounded-xl border border-slate-200 p-4">
                <div className="mb-2 text-xs font-bold uppercase text-slate-500">Supplier PCF Selection Engine · MAT-COCOA-001</div>
                <div className="space-y-1">
                  {selectionChecks(selected).map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {c.pass ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-rose-500" />}
                      <span className={c.pass ? "text-slate-700" : "text-rose-600"}>{c.label}</span>
                    </div>
                  ))}
                </div>
                {selectionChecks(selected).every((c) => c.pass) ? (
                  <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-sm font-semibold text-emerald-700">✓ USE SUPPLIER-SPECIFIC DATA → {selected.dataClass === "PRIMARY_VERIFIED" ? "PRIMARY VERIFIED" : "PRIMARY SUPPLIER DECLARED"}</div>
                ) : (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-sm text-amber-800">
                    <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4" /> SUPPLIER PRIMARY DATA UNAVAILABLE</div>
                    <div className="mt-1">Falls back to SECONDARY / PROXY dataset. A Supplier Data Improvement Request is recommended.</div>
                  </div>
                )}
              </div>

              {/* Data lineage */}
              <div className="mt-5">
                <div className="text-xs font-bold uppercase text-slate-500 mb-2">Data Lineage</div>
                <LineageFlow vertical steps={[
                  { label: "Supplier Product", value: selected.code, highlight: true },
                  { label: "Internal Material", value: selected.internalMaterial },
                  { label: "BOM", value: "Refined Cocoa Butter" },
                  { label: "Batch", value: "CB-2026-001" },
                  { label: "PCF Project", value: "PCF-GH-2026-001" },
                  { label: "Scope 3 Inventory", value: "Purchased Goods & Services" },
                ]} onStepClick={() => nav("/carbon-accounting/scope3")} />
              </div>

              {/* Material mapping panel */}
              <div className="mt-5 rounded-xl border border-slate-200 p-4">
                <div className="mb-2 text-xs font-bold uppercase text-slate-500">Material Mapping</div>
                <div className="grid grid-cols-2 gap-x-4 text-sm">
                  <DetailRow label="BOM Component" value={selected.bomComponent} />
                  <DetailRow label="Quantity Used" value={`${fmtInt(selected.qtyUsed)} ${selected.unit}`} />
                  <DetailRow label="Unit Conversion" value={selected.unitConversion} />
                  <DetailRow label="Mapping Confidence" value={selected.mappingConfidence} />
                </div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setMapOpen(selected); setMapTo(selected.internalMaterial !== "—" ? selected.internalMaterial : ""); }} data-testid="cat-map-btn">Map / Replace Mapping</Button>
                  <Button size="sm" variant="outline" onClick={() => doImpact(selected)} data-testid="cat-impact-btn"><Zap className="mr-1 h-3.5 w-3.5" /> Simulate PCF Change</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Map modal */}
      <Dialog open={!!mapOpen} onOpenChange={(o) => !o && setMapOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Map Supplier Product to Internal Material</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-slate-600">{mapOpen?.product} ({mapOpen?.code})</div>
            <Select value={mapTo} onValueChange={setMapTo}>
              <SelectTrigger data-testid="map-select"><SelectValue placeholder="Select internal material" /></SelectTrigger>
              <SelectContent>{INTERNAL_MATERIALS.map((m) => <SelectItem key={m.code} value={m.code}>{m.code} — {m.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMapOpen(null)}>Cancel</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600" disabled={!mapTo} onClick={doMap} data-testid="map-confirm">Confirm Mapping</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add catalogue product modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Catalogue Product</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Supplier</Label>
              <Select value={f.supplierId} onValueChange={(v) => setF({ ...f, supplierId: v })}>
                <SelectTrigger data-testid="add-cat-supplier"><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>{[...new Set(catalogue.map((c) => c.supplierId))].map((id) => <SelectItem key={id} value={id}>{supplierName(id)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Product</Label><Input value={f.product} onChange={(e) => setF({ ...f, product: e.target.value })} /></div>
              <div><Label>Code</Label><Input value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Unit</Label><Input value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })} /></div>
              <div><Label>PCF</Label><Input type="number" value={f.pcf} onChange={(e) => setF({ ...f, pcf: e.target.value })} /></div>
              <div><Label>Boundary</Label><Input value={f.boundary} onChange={(e) => setF({ ...f, boundary: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={submitAdd} data-testid="add-cat-submit">Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Impact analysis modal */}
      <Dialog open={!!impact} onOpenChange={(o) => !o && setImpact(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> Supplier Data Change Detected</DialogTitle></DialogHeader>
          {impact && (
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <b>{impact.supplier}</b> updated <b>{impact.changeType}</b>. A verified PCF is <b>never</b> silently updated — a change event has been created.
              </div>
              <LineageFlow vertical steps={[
                { label: "Supplier Change", value: `${impact.supplier} · ${impact.changeType}`, highlight: true },
                { label: "Mapped Material", value: impact.materials.join(", ") || "—" },
                { label: "Affected Products", value: impact.products.join(", ") || "None" },
                { label: "Affected Batches", value: impact.batches.join(", ") || "None" },
                { label: "Affected PCF Projects", value: impact.pcfProjects.join(", ") || "None" },
                { label: "Affected Passports", value: impact.passports.join(", ") || "None" },
              ]} />
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-slate-200 p-2.5"><div className="text-xs text-slate-500">Recalculation</div><div className="font-semibold">{impact.recalcRequired ? "REQUIRED" : "Not required"}</div></div>
                <div className="rounded-lg border border-slate-200 p-2.5"><div className="text-xs text-slate-500">Re-verification</div><div className="font-semibold">{impact.reverifyRequired ? "REQUIRED" : "Not required"}</div></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setImpact(null)}>Close</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={() => { toast.success("Change event created · PCF status: RECALCULATION REQUIRED", { description: "Routed to Carbon Accounting → MRV workflow" }); setImpact(null); }} data-testid="impact-create-event">Create Change Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
