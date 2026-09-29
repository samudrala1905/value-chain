import React, { useState, useEffect } from "react";
import { useVC } from "@/context/ValueChainContext";
import { KpiCard, StatusChip, QualityBar, IntensityPill } from "@/components/shared/primitives";
import { ScorecardRadar } from "@/components/shared/Analytics";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { fmtPct } from "@/lib/format";

const OPPS = ["Provide Primary Energy Data", "Replace Proxy Factor", "Submit Current PCF", "Provide Verification Evidence", "Update Expired Declaration", "Improve Transport Data", "Submit Facility-Specific Data", "Replace Secondary Data with Primary Data"];
const match = (o, q) => !q || JSON.stringify(o).toLowerCase().includes(q.toLowerCase());

export default function ScorecardsTab({ search, registerPrimary }) {
  const { suppliers, scope3ContributionFor, addImprovement, improvements, supplierName } = useVC();
  const [selected, setSelected] = useState(null);
  const [reqOpen, setReqOpen] = useState(false);
  const [f, setF] = useState({ supplierId: "", issue: OPPS[0], action: "", priority: "High", due: "", owner: "Procurement", expectedGain: "+15 quality" });

  useEffect(() => registerPrimary("scorecards", () => setReqOpen(true)), [registerPrimary]);

  const rows = suppliers.filter((s) => match(s, search));
  const avg = Math.round(suppliers.reduce((a, s) => a + s.score, 0) / suppliers.length);
  const high = suppliers.filter((s) => s.score >= 90).length;
  const action = suppliers.filter((s) => s.score >= 60 && s.score < 75).length + suppliers.filter((s) => s.status === "ACTION REQUIRED").length;
  const critical = suppliers.filter((s) => s.score < 60).length;

  const submit = () => {
    if (!f.supplierId) return toast.error("Select a supplier");
    addImprovement(f);
    toast.success("Improvement request created", { description: `${supplierName(f.supplierId)} · ${f.issue}` });
    setReqOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Average Supplier Score" value={`${avg}/100`} testId="sc-kpi-avg" />
        <KpiCard label="High Quality" value={high} testId="sc-kpi-high" />
        <KpiCard label="Action Required" value={action} subTone="warn" testId="sc-kpi-action" />
        <KpiCard label="Critical Data Gaps" value={critical} subTone="down" testId="sc-kpi-critical" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white vc-scroll">
        <Table>
          <TableHeader><TableRow className="bg-slate-50">
            {["Supplier", "Data Quality", "Primary Data %", "PCF Coverage", "Evidence %", "Verification", "Carbon Intensity", "Scope 3", "Trend", "Status"].map((h) => <TableHead key={h} className="text-xs whitespace-nowrap">{h}</TableHead>)}
          </TableRow></TableHeader>
          <TableBody>
            {rows.map((s) => (
              <TableRow key={s.id} className="cursor-pointer hover:bg-emerald-50/40" onClick={() => setSelected(s)} data-testid={`sc-row-${s.id}`}>
                <TableCell className="font-semibold">{s.name}</TableCell>
                <TableCell><QualityBar score={s.score} /></TableCell>
                <TableCell className="text-sm tabular-nums">{s.scores.primaryData}%</TableCell>
                <TableCell className="text-sm tabular-nums">{s.scores.pcfAvailability}%</TableCell>
                <TableCell className="text-sm tabular-nums">{s.scores.evidence}%</TableCell>
                <TableCell><StatusChip status={s.verification} /></TableCell>
                <TableCell><IntensityPill value={s.pcfIntensity} unit={s.volume > 1 ? "kgCO2e/kg" : "kgCO2e"} /></TableCell>
                <TableCell className="text-sm tabular-nums">{fmtPct(scope3ContributionFor(s.id), 1)}</TableCell>
                <TableCell>{s.yoyChange <= 0 ? <span className="flex items-center gap-1 text-emerald-600 text-xs"><TrendingDown className="h-3.5 w-3.5" />{s.yoyChange}%</span> : <span className="flex items-center gap-1 text-rose-600 text-xs"><TrendingUp className="h-3.5 w-3.5" />+{s.yoyChange}%</span>}</TableCell>
                <TableCell><StatusChip status={s.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl vc-scroll">
          {selected && (
            <>
              <SheetHeader><SheetTitle>{selected.name} — Carbon Data Quality</SheetTitle></SheetHeader>
              <div className="mt-4 flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-4xl font-extrabold text-emerald-700">{selected.score}<span className="text-lg">/100</span></div>
                <div className="text-sm text-emerald-800">Overall Carbon <b>Data Quality</b>. Kept separate from carbon performance.</div>
              </div>
              <ScorecardRadar scores={selected.scores} />
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(selected.scores).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between rounded-lg border border-slate-200 p-2 text-sm">
                    <span className="capitalize text-slate-600">{k.replace(/([A-Z])/g, " $1")}</span><QualityBar score={v} />
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="text-xs font-bold uppercase text-amber-700">Carbon Performance (separate)</div>
                <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
                  <div><div className="text-slate-500 text-xs">Carbon Intensity</div><div className="font-bold">{selected.pcfIntensity} {selected.volume > 1 ? "kgCO2e/kg" : "kgCO2e"}</div></div>
                  <div><div className="text-slate-500 text-xs">Our Scope 3</div><div className="font-bold">{fmtPct(scope3ContributionFor(selected.id), 1)}</div></div>
                  <div><div className="text-slate-500 text-xs">YoY Change</div><div className="font-bold">{selected.yoyChange > 0 ? "+" : ""}{selected.yoyChange}%</div></div>
                </div>
              </div>

              <div className="mt-5">
                <div className="text-xs font-bold uppercase text-slate-500 mb-2">Improvement Opportunities</div>
                <div className="flex flex-wrap gap-1.5">
                  {OPPS.slice(0, selected.score < 75 ? 8 : 3).map((o) => (
                    <button key={o} onClick={() => { setF({ ...f, supplierId: selected.id, issue: o }); setReqOpen(true); }} className="rounded-full border border-slate-200 px-3 py-1 text-xs hover:border-emerald-300 hover:bg-emerald-50">{o}</button>
                  ))}
                </div>
              </div>
              <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600" onClick={() => { setF({ ...f, supplierId: selected.id }); setReqOpen(true); }} data-testid="sc-create-imp">Create Improvement Request</Button>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={reqOpen} onOpenChange={setReqOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Improvement Request</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Supplier</Label>
              <Select value={f.supplierId} onValueChange={(v) => setF({ ...f, supplierId: v })}>
                <SelectTrigger data-testid="imp-supplier"><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Issue / Requested Action</Label>
              <Select value={f.issue} onValueChange={(v) => setF({ ...f, issue: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{OPPS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Textarea placeholder="Requested action detail…" value={f.action} onChange={(e) => setF({ ...f, action: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Priority</Label>
                <Select value={f.priority} onValueChange={(v) => setF({ ...f, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent></Select>
              </div>
              <div><Label>Due Date</Label><Input type="date" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Owner</Label><Input value={f.owner} onChange={(e) => setF({ ...f, owner: e.target.value })} /></div>
              <div><Label>Expected Quality Gain</Label><Input value={f.expectedGain} onChange={(e) => setF({ ...f, expectedGain: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReqOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={submit} data-testid="imp-submit">Create Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {improvements.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 text-xs font-bold uppercase text-slate-500">Open Improvement Requests ({improvements.length})</div>
          <div className="space-y-2">
            {improvements.map((i) => (
              <div key={i.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 text-sm" data-testid={`imp-row-${i.id}`}>
                <div><span className="font-semibold">{supplierName(i.supplierId)}</span> · {i.issue}</div>
                <div className="flex items-center gap-2"><span className="text-xs text-slate-500">{i.expectedGain}</span><StatusChip status={i.priority === "High" ? "ACTION REQUIRED" : "IN PROGRESS"} /></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
