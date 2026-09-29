import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVC } from "@/context/ValueChainContext";
import { KpiCard, StatusChip, QualityBar, ClassBadge, DetailRow, LineageFlow, IntensityPill } from "@/components/shared/primitives";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { fmtKg, fmtPct } from "@/lib/format";

const match = (o, q) => !q || JSON.stringify(o).toLowerCase().includes(q.toLowerCase());

export default function SuppliersTab({ search, registerPrimary, goToTab }) {
  const nav = useNavigate();
  const { suppliers, addSupplier, scope3ContributionFor, dependenciesFor } = useVC();
  const [selected, setSelected] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", country: "Ghana", material: "", volume: "" });

  useEffect(() => registerPrimary("suppliers", () => setAddOpen(true)), [registerPrimary]);

  const rows = suppliers.filter((s) => match(s, search));
  const active = suppliers.filter((s) => s.status === "ACTIVE").length;
  const primary = suppliers.filter((s) => s.primaryData).length;
  const verified = suppliers.filter((s) => s.verification === "VERIFIED").length;
  const incomplete = suppliers.filter((s) => s.status === "ACTION REQUIRED").length;

  const submitAdd = () => {
    if (!form.name) return toast.error("Supplier name required");
    addSupplier({ ...form, volume: Number(form.volume) || 0, materialCode: "MAT-NEW", facility: `${form.name} Facility`, legalName: form.name, tradingName: form.name });
    toast.success(`Supplier added: ${form.name}`, { description: "Status: INVITED · workflow started" });
    setAddOpen(false); setForm({ name: "", country: "Ghana", material: "", volume: "" });
  };

  const dep = selected ? dependenciesFor(selected.id) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Active Suppliers" value={active} testId="sup-kpi-active" />
        <KpiCard label="Primary Data Enabled" value={primary} testId="sup-kpi-primary" />
        <KpiCard label="Verified PCF Suppliers" value={verified} testId="sup-kpi-verified" />
        <KpiCard label="Incomplete Suppliers" value={incomplete} subTone="warn" sub="Action required" testId="sup-kpi-incomplete" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white vc-scroll">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              {["Supplier ID", "Name", "Country", "Tier", "Materials", "Annual Volume", "Primary", "PCF", "Verification", "Data Quality", "Scope 3", "Status", ""].map((h) => <TableHead key={h} className="whitespace-nowrap text-xs">{h}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((s) => (
              <TableRow key={s.id} className="cursor-pointer hover:bg-emerald-50/40" onClick={() => setSelected(s)} data-testid={`supplier-row-${s.id}`}>
                <TableCell className="font-mono text-xs">{s.id}</TableCell>
                <TableCell className="font-semibold text-slate-800">{s.name}</TableCell>
                <TableCell>{s.country}</TableCell>
                <TableCell>{s.tier}</TableCell>
                <TableCell className="text-sm">{s.material}</TableCell>
                <TableCell className="text-sm tabular-nums">{s.volume > 1 ? fmtKg(s.volume) : "Service"}</TableCell>
                <TableCell>{s.primaryData ? <span className="text-emerald-600 font-semibold text-xs">YES</span> : <span className="text-slate-400 text-xs">NO</span>}</TableCell>
                <TableCell>{s.pcfAvailable ? <span className="text-emerald-600 font-semibold text-xs">YES</span> : <span className="text-slate-400 text-xs">NO</span>}</TableCell>
                <TableCell><StatusChip status={s.verification} /></TableCell>
                <TableCell><QualityBar score={s.score} /></TableCell>
                <TableCell className="tabular-nums text-sm">{fmtPct(scope3ContributionFor(s.id), 1)}</TableCell>
                <TableCell><StatusChip status={s.status} /></TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelected(s)}>Open Supplier</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { goToTab("invitations"); toast.info("Request data via Invitations"); }}>Request Data</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success(`Invitation sent to ${s.contact}`)}>Invite Contact</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => goToTab("catalogue")}>View Catalogue</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => goToTab("declarations")}>View Declarations</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => goToTab("evidence")}>View Evidence</DropdownMenuItem>
                      <DropdownMenuItem className="text-rose-600" onClick={() => toast(`${s.name} disabled (simulated)`)}>Disable Supplier</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Supplier profile drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl vc-scroll">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">{selected.name} <StatusChip status={selected.status} /></SheetTitle>
              </SheetHeader>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase text-slate-500">Profile</h4>
                  <DetailRow label="Supplier ID" value={selected.id} mono />
                  <DetailRow label="Legal Name" value={selected.legalName} />
                  <DetailRow label="Trading Name" value={selected.tradingName} />
                  <DetailRow label="Country" value={selected.country} />
                  <DetailRow label="Registration" value={selected.reg} mono />
                  <DetailRow label="Address" value={selected.address} />
                  <DetailRow label="Contact" value={selected.contact} />
                  <DetailRow label="Email" value={selected.email} />
                  <DetailRow label="Industry" value={selected.industry} />
                  <DetailRow label="Tier" value={selected.tier} />
                  <DetailRow label="Facility" value={selected.facility} />
                  <DetailRow label="Primary Data" value={selected.primaryData ? "Enabled" : "Not enabled"} />
                  <DetailRow label="Verification" value={<StatusChip status={selected.verification} />} />
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase text-slate-500">Carbon Summary</h4>
                  <DetailRow label="Annual Volume" value={selected.volume > 1 ? fmtKg(selected.volume) : "Service"} />
                  <DetailRow label="Products Supplied" value={selected.material} />
                  <DetailRow label="Declarations" value={selected.declarations} />
                  <DetailRow label="Evidence Completeness" value={fmtPct(selected.evidenceComplete)} />
                  <DetailRow label="Data Quality" value={<QualityBar score={selected.score} />} />
                  <DetailRow label="Carbon Intensity" value={<IntensityPill value={selected.pcfIntensity} unit={selected.volume > 1 ? "kgCO2e/kg" : "kgCO2e"} />} />
                  <DetailRow label="Scope 3 Contribution" value={fmtPct(scope3ContributionFor(selected.id), 1)} />
                  <DetailRow label="Data Class" value={<ClassBadge dataClass={selected.dataClass} />} />
                  <DetailRow label="Last Data Update" value={new Date(selected.lastUpdate).toLocaleDateString("en-GB")} />
                </div>
              </div>

              <div className="mt-6">
                <h4 className="mb-2 text-xs font-bold uppercase text-slate-500">Relationship & Traceability</h4>
                <LineageFlow steps={[
                  { label: "Supplier", value: selected.name, highlight: true },
                  { label: "Supplier Product", value: selected.material },
                  { label: "Internal Material", value: selected.materialCode },
                  { label: "Our Product", value: "Refined Cocoa Butter" },
                  { label: "Batch", value: "CB-2026-001" },
                  { label: "PCF Project", value: "PCF-GH-2026-001" },
                ]} onStepClick={() => nav("/carbon-accounting/scope3")} />
              </div>

              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-bold uppercase text-slate-500">Depends on this supplier</div>
                <div className="mt-1 text-sm text-slate-700">
                  {dep.materials.length} material(s) · {dep.products.length} product(s) · {dep.pcfProjects.length} PCF project(s) · {dep.passports.length} passport(s)
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setSelected(null)}>Open Supplier</Button>
                <Button size="sm" variant="outline" onClick={() => { goToTab("invitations"); setSelected(null); }}>Request Data</Button>
                <Button size="sm" variant="outline" onClick={() => { goToTab("catalogue"); setSelected(null); }}>View Catalogue</Button>
                <Button size="sm" variant="outline" onClick={() => { goToTab("declarations"); setSelected(null); }}>View Declarations</Button>
                <Button size="sm" variant="outline" onClick={() => { goToTab("evidence"); setSelected(null); }}>View Evidence</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add supplier modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Supplier</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Supplier Name</Label><Input data-testid="add-supplier-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Country</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
              <div><Label>Annual Volume (kg)</Label><Input type="number" value={form.volume} onChange={(e) => setForm({ ...form, volume: e.target.value })} /></div>
            </div>
            <div><Label>Material Supplied</Label><Input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={submitAdd} data-testid="add-supplier-submit">Add Supplier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
