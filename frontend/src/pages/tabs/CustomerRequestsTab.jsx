import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVC } from "@/context/ValueChainContext";
import { KpiCard, StatusChip, SharingBadge, DetailRow, LineageFlow } from "@/components/shared/primitives";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { fmtInt } from "@/lib/format";

const match = (o, q) => !q || JSON.stringify(o).toLowerCase().includes(q.toLowerCase());

export default function CustomerRequestsTab({ search, registerPrimary, goToTab }) {
  const nav = useNavigate();
  const { customerRequests, respondCustomerRequest, generatePackage } = useVC();
  const [selected, setSelected] = useState(null);
  useEffect(() => registerPrimary("customer-requests", () => setSelected(customerRequests.find((r) => r.status === "UNDER REVIEW" || r.status === "READY TO SHARE") || customerRequests[0])), [registerPrimary, customerRequests]);

  const rows = customerRequests.filter((r) => match(r, search));
  const open = customerRequests.filter((r) => !["COMPLETED"].includes(r.status)).length;
  const dueWeek = customerRequests.filter((r) => r.status === "UNDER REVIEW" || r.status === "READY TO SHARE").length;
  const completed = customerRequests.filter((r) => r.status === "COMPLETED").length;
  const overdue = customerRequests.filter((r) => r.status === "OVERDUE").length;

  const checks = [
    { k: "Product PCF", v: true }, { k: "Verification", v: true },
    { k: "Carbon Passport", v: true }, { k: "CBAM Information", v: true },
  ];

  const genPackage = () => {
    generatePackage({ customer: selected.customer, product: selected.product, batch: selected.batch, docs: ["Verified PCF", "Carbon Passport", "Verification Summary"], sharing: selected.sharing });
    respondCustomerRequest(selected.id, "COMPLETED");
    toast.success("Customer package generated & shared securely", { description: `${selected.customer} · secure link (expires 90 days)` });
    setSelected(null); goToTab("customer-catalogue");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Open Requests" value={open} testId="crq-kpi-open" />
        <KpiCard label="Due This Week" value={dueWeek} subTone="warn" testId="crq-kpi-due" />
        <KpiCard label="Completed" value={completed} testId="crq-kpi-completed" />
        <KpiCard label="Overdue" value={overdue} subTone="down" testId="crq-kpi-overdue" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white vc-scroll">
        <Table>
          <TableHeader><TableRow className="bg-slate-50">
            {["Request ID", "Customer", "Country", "Product", "Batch", "Requested Info", "Requested", "Due", "Sharing", "Status"].map((h) => <TableHead key={h} className="text-xs whitespace-nowrap">{h}</TableHead>)}
          </TableRow></TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} className="cursor-pointer hover:bg-emerald-50/40" onClick={() => setSelected(r)} data-testid={`crq-row-${r.id}`}>
                <TableCell className="font-mono text-xs">{r.id}</TableCell>
                <TableCell className="font-semibold">{r.customer}</TableCell>
                <TableCell className="text-sm">{r.country}</TableCell>
                <TableCell className="text-sm">{r.product}</TableCell>
                <TableCell className="font-mono text-xs">{r.batch}</TableCell>
                <TableCell className="text-xs text-slate-500">{r.requested.length} items</TableCell>
                <TableCell className="text-xs">{new Date(r.requestedDate).toLocaleDateString("en-GB")}</TableCell>
                <TableCell className="text-xs">{new Date(r.due).toLocaleDateString("en-GB")}</TableCell>
                <TableCell><SharingBadge level={r.sharing} /></TableCell>
                <TableCell><StatusChip status={r.status} /></TableCell>
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
              <div className="mt-4 grid gap-x-6 md:grid-cols-2">
                <DetailRow label="Customer" value={selected.customer} />
                <DetailRow label="Contact" value={selected.contact} />
                <DetailRow label="Product" value={selected.product} />
                <DetailRow label="Batch" value={selected.batch} mono />
                <DetailRow label="Quantity" value={`${fmtInt(selected.quantity)} kg`} />
                <DetailRow label="Destination Market" value={selected.market} />
                <DetailRow label="Purpose" value={selected.purpose} />
                <DetailRow label="Due Date" value={new Date(selected.due).toLocaleDateString("en-GB")} />
                <DetailRow label="Internal Owner" value={selected.owner} />
                <DetailRow label="Sharing Permission" value={<SharingBadge level={selected.sharing} />} />
              </div>
              <div className="mt-4">
                <div className="text-xs font-bold uppercase text-slate-500 mb-1">Information Requested</div>
                <div className="flex flex-wrap gap-1">{selected.requested.map((r) => <span key={r} className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs">{r}</span>)}</div>
              </div>

              <div className="mt-5">
                <div className="text-xs font-bold uppercase text-slate-500 mb-2">Request Workflow</div>
                <LineageFlow steps={[
                  { label: "1", value: "Identify Product" }, { label: "2", value: "Identify Batch" }, { label: "3", value: "Latest PCF" },
                  { label: "4", value: "Verification" }, { label: "5", value: "Passport" }, { label: "6", value: "CBAM" },
                  { label: "7", value: "Sharing Check" }, { label: "8", value: "Approval" }, { label: "9", value: "Package" },
                ]} />
              </div>

              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="mb-2 text-xs font-bold uppercase text-emerald-700">{selected.product} · {selected.batch}</div>
                <div className="grid grid-cols-2 gap-2">
                  {checks.map((c) => <div key={c.k} className="flex items-center gap-2 text-sm text-emerald-800"><Check className="h-4 w-4 text-emerald-500" /> {c.k}</div>)}
                </div>
                <div className="mt-2 text-sm font-bold text-emerald-700">Status: READY TO SHARE</div>
                <div className="mt-1 text-xs text-emerald-700">Confidential supplier evidence is never auto-exposed to customers.</div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => { respondCustomerRequest(selected.id, "READY TO SHARE"); toast.success("Sharing approved"); }} data-testid="crq-approve">Approve Sharing</Button>
                <Button size="sm" variant="outline" onClick={genPackage} data-testid="crq-generate">Generate Package</Button>
                <Button size="sm" variant="outline" onClick={() => { toast.success("Secure link shared"); }}>Share Secure Link</Button>
                <Button size="sm" variant="outline" onClick={() => toast.info("Clarification requested")}>Request Clarification</Button>
                <Button size="sm" variant="outline" className="text-rose-600" onClick={() => { respondCustomerRequest(selected.id, "DECLINED"); toast("Request rejected"); setSelected(null); }}>Reject Request</Button>
                <Button size="sm" variant="ghost" onClick={() => nav("/carbon-passports/CP-GH-2026-0001")}>View Passport</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
