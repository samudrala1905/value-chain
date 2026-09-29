import React, { useState, useEffect } from "react";
import { useVC } from "@/context/ValueChainContext";
import { KpiCard, StatusChip, LineageFlow } from "@/components/shared/primitives";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { REQUEST_TYPES } from "@/data/mockData";

const match = (o, q, name) => !q || (JSON.stringify(o) + name).toLowerCase().includes(q.toLowerCase());
const STEPS = ["Select Supplier", "Select Contact", "Select Material", "Reporting Period", "Required Information", "Set Due Date", "Add Instructions", "Preview Request", "Send Invitation"];

export default function InvitationsTab({ search, registerPrimary }) {
  const { invitations, suppliers, supplierName, CONTACTS, addInvitation } = useVC();
  const [wizard, setWizard] = useState(false);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [d, setD] = useState({ supplierId: "", contact: "", material: "", period: "FY 2026", requested: [], due: "", instructions: "" });

  useEffect(() => registerPrimary("invitations", () => { setWizard(true); setStep(0); }), [registerPrimary]);

  const rows = invitations.filter((i) => match(i, search, supplierName(i.supplierId)));
  const sent = invitations.length;
  const accepted = invitations.filter((i) => i.status === "ACCEPTED").length;
  const pending = invitations.filter((i) => ["SENT", "OPENED", "IN PROGRESS"].includes(i.status)).length;
  const expired = invitations.filter((i) => i.status === "EXPIRED").length;

  const toggleReq = (r) => setD((p) => ({ ...p, requested: p.requested.includes(r) ? p.requested.filter((x) => x !== r) : [...p.requested, r] }));
  const finish = () => {
    addInvitation({ supplierId: d.supplierId, contact: d.contact, material: d.material, requested: d.requested, due: d.due || "2026-04-30" });
    toast.success("Secure invitation sent", { description: `${supplierName(d.supplierId)} · lightweight Supplier Portal link generated` });
    setWizard(false); setD({ supplierId: "", contact: "", material: "", period: "FY 2026", requested: [], due: "", instructions: "" });
  };
  const canNext = [d.supplierId, d.contact, d.material, d.period, d.requested.length, true, true, true, true][step];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Invitations Sent" value={sent} testId="inv-kpi-sent" />
        <KpiCard label="Accepted" value={accepted} testId="inv-kpi-accepted" />
        <KpiCard label="Pending" value={pending} subTone="warn" testId="inv-kpi-pending" />
        <KpiCard label="Expired" value={expired} subTone="down" testId="inv-kpi-expired" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white vc-scroll">
        <Table>
          <TableHeader><TableRow className="bg-slate-50">
            {["Invitation ID", "Supplier", "Contact", "Material", "Requested Info", "Sent", "Due", "Opened", "Progress", "Status"].map((h) => <TableHead key={h} className="text-xs whitespace-nowrap">{h}</TableHead>)}
          </TableRow></TableHeader>
          <TableBody>
            {rows.map((i) => (
              <TableRow key={i.id} className="cursor-pointer hover:bg-emerald-50/40" onClick={() => setSelected(i)} data-testid={`inv-row-${i.id}`}>
                <TableCell className="font-mono text-xs">{i.id}</TableCell>
                <TableCell className="font-semibold">{supplierName(i.supplierId)}</TableCell>
                <TableCell className="text-sm">{i.contact}</TableCell>
                <TableCell className="text-sm">{i.material}</TableCell>
                <TableCell className="text-xs text-slate-500">{i.requested.length} items</TableCell>
                <TableCell className="text-xs">{new Date(i.sent).toLocaleDateString("en-GB")}</TableCell>
                <TableCell className="text-xs">{new Date(i.due).toLocaleDateString("en-GB")}</TableCell>
                <TableCell>{i.opened ? "Yes" : "No"}</TableCell>
                <TableCell className="w-28"><Progress value={i.progress} className="h-1.5" /></TableCell>
                <TableCell><StatusChip status={i.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Invitation detail drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader><SheetTitle>{selected.id}</SheetTitle></SheetHeader>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-slate-200 p-3 text-sm">
                  <div className="font-semibold">{supplierName(selected.supplierId)} · {selected.contact}</div>
                  <div className="text-slate-500">{selected.material} · {selected.status}</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase text-slate-500 mb-1">Requested Information</div>
                  <div className="flex flex-wrap gap-1">{selected.requested.map((r) => <span key={r} className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs">{r}</span>)}</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase text-slate-500 mb-2">Supplier Response Flow</div>
                  <LineageFlow steps={[
                    { label: "1", value: "Invitation" }, { label: "2", value: "Supplier Portal" }, { label: "3", value: "Data Entry" },
                    { label: "4", value: "Upload" }, { label: "5", value: "Declaration" }, { label: "6", value: "Submit" },
                  ]} />
                </div>
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600" onClick={() => window.open(`/supplier-portal/${selected.id}`, "_blank")} data-testid="open-portal-btn">
                  Open Supplier Portal (demo)
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Invitation wizard */}
      <Dialog open={wizard} onOpenChange={setWizard}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Invite Supplier · Step {step + 1}/9</DialogTitle></DialogHeader>
          <Progress value={((step + 1) / 9) * 100} className="h-1.5" />
          <div className="min-h-[180px] py-2">
            <div className="mb-3 text-sm font-semibold text-slate-700">{STEPS[step]}</div>
            {step === 0 && (
              <Select value={d.supplierId} onValueChange={(v) => setD({ ...d, supplierId: v, material: suppliers.find((s) => s.id === v)?.material || "" })}>
                <SelectTrigger data-testid="wiz-supplier"><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            )}
            {step === 1 && (
              <Select value={d.contact} onValueChange={(v) => setD({ ...d, contact: v })}>
                <SelectTrigger data-testid="wiz-contact"><SelectValue placeholder="Select contact" /></SelectTrigger>
                <SelectContent>{(CONTACTS[d.supplierId] || []).map((c) => <SelectItem key={c.email} value={c.name}>{c.name} — {c.role}</SelectItem>)}</SelectContent>
              </Select>
            )}
            {step === 2 && <Input value={d.material} onChange={(e) => setD({ ...d, material: e.target.value })} placeholder="Material / product" data-testid="wiz-material" />}
            {step === 3 && (
              <Select value={d.period} onValueChange={(v) => setD({ ...d, period: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="FY 2026">FY 2026</SelectItem><SelectItem value="FY 2025">FY 2025</SelectItem></SelectContent>
              </Select>
            )}
            {step === 4 && (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto vc-scroll">
                {REQUEST_TYPES.map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm"><Checkbox checked={d.requested.includes(r)} onCheckedChange={() => toggleReq(r)} data-testid={`wiz-req-${r.replace(/[^a-z]+/gi, "-").toLowerCase()}`} /> {r}</label>
                ))}
              </div>
            )}
            {step === 5 && <Input type="date" value={d.due} onChange={(e) => setD({ ...d, due: e.target.value })} data-testid="wiz-due" />}
            {step === 6 && <Textarea value={d.instructions} onChange={(e) => setD({ ...d, instructions: e.target.value })} placeholder="Instructions for supplier…" />}
            {step === 7 && (
              <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                <div><b>Supplier:</b> {supplierName(d.supplierId)}</div>
                <div><b>Contact:</b> {d.contact}</div>
                <div><b>Material:</b> {d.material}</div>
                <div><b>Period:</b> {d.period}</div>
                <div><b>Requested:</b> {d.requested.join(", ") || "—"}</div>
                <div><b>Due:</b> {d.due || "—"}</div>
              </div>
            )}
            {step === 8 && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">A secure, lightweight Supplier Portal link will be generated. The supplier does <b>not</b> need a full Saurient account.</div>}
          </div>
          <DialogFooter>
            {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
            {step < 8
              ? <Button className="bg-emerald-500 hover:bg-emerald-600" disabled={!canNext} onClick={() => setStep(step + 1)} data-testid="wiz-next">Next</Button>
              : <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={finish} data-testid="wiz-send">Send Secure Invitation</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
