import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useVC } from "@/context/ValueChainContext";
import { WorkflowTracker } from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck, Upload, Check } from "lucide-react";
import { toast } from "sonner";

const STAGES = ["INVITATION", "PORTAL", "DATA ENTRY", "UPLOAD", "DECLARATION", "SUBMIT"];

export default function SupplierPortal() {
  const { inviteId } = useParams();
  const { invitations, supplierName, updateInvitationStatus } = useVC();
  const inv = invitations.find((i) => i.id === inviteId) || invitations[0];
  const [step, setStep] = useState(0);
  const [pcf, setPcf] = useState("");
  const [declared, setDeclared] = useState(false);
  const [done, setDone] = useState(false);

  const submit = () => {
    if (inv) updateInvitationStatus(inv.id, "SUBMITTED");
    setDone(true);
    toast.success("Submission received by Asante Cocoa Cooperative");
  };

  return (
    <div className="min-h-screen bg-[#0B1220] py-10">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-6 flex items-center gap-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 font-black">S</div>
          <div>
            <div className="text-lg font-extrabold">Saurient · Supplier Portal</div>
            <div className="text-xs text-slate-400">Secure lightweight access — no full account required</div>
          </div>
          <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400"><ShieldCheck className="h-3.5 w-3.5" /> Secure link</span>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl">
          {!done ? (
            <>
              <div className="text-xs font-semibold uppercase text-emerald-600">{inv?.id} · from Asante Cocoa Cooperative</div>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Carbon Data Request</h1>
              <p className="text-sm text-slate-500">{inv ? `${supplierName(inv.supplierId)} · ${inv.material}` : "Raw Cocoa Beans"}</p>

              <div className="my-5"><WorkflowTracker stages={STAGES} currentIndex={step} /></div>

              {step === 0 && (
                <div className="space-y-3">
                  <div className="rounded-lg border border-slate-200 p-3 text-sm text-slate-600">You have been invited to submit carbon and product information. Requested: {inv?.requested?.join(", ") || "Product PCF, Evidence, Declaration"}.</div>
                </div>
              )}
              {step === 1 && (
                <div className="space-y-3">
                  <div><Label>Product Name</Label><Input defaultValue="Raw Cocoa Beans" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Product Code</Label><Input defaultValue="RCB-GH-001" /></div>
                    <div><Label>Facility</Label><Input defaultValue="Kumasi Processing Facility" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Product PCF (kgCO2e/kg)</Label><Input value={pcf} onChange={(e) => setPcf(e.target.value)} placeholder="1.92" data-testid="portal-pcf" /></div>
                    <div><Label>Boundary</Label><Input defaultValue="Cradle-to-Gate" /></div>
                  </div>
                </div>
              )}
              {step === 2 && (
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-emerald-400" onClick={() => toast.success("Evidence uploaded (simulated)")} data-testid="portal-upload">
                  <Upload className="h-8 w-8 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">Upload evidence (PCF report, invoices, records)</span>
                </label>
              )}
              {step === 3 && (
                <div className="space-y-3">
                  <Textarea placeholder="Declaration notes / methodology…" />
                  <label className="flex items-center gap-2 text-sm"><Checkbox checked={declared} onCheckedChange={setDeclared} data-testid="portal-declare" /> I confirm this declaration is accurate and authorised.</label>
                </div>
              )}
              {step === 4 && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">Ready to submit. Your data will be reviewed — it is not automatically treated as verified.</div>
              )}

              <div className="mt-6 flex justify-between">
                <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
                {step < 4
                  ? <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={() => setStep(step + 1)} data-testid="portal-next">Continue</Button>
                  : <Button className="bg-emerald-500 hover:bg-emerald-600" disabled={!declared} onClick={submit} data-testid="portal-submit">Submit Declaration</Button>}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100"><Check className="h-8 w-8 text-emerald-600" /></div>
              <h1 className="text-2xl font-extrabold text-slate-900">Submission Received</h1>
              <p className="max-w-sm text-sm text-slate-500">Thank you. Asante Cocoa Cooperative will review your declaration and evidence. You may close this window.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
