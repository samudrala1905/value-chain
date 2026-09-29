import React, { useRef, useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import { useVC } from "@/context/ValueChainContext";
import { KpiCard, MetricCard, WorkflowTracker, Legend, SectionTitle } from "@/components/shared/primitives";
import Analytics from "@/components/shared/Analytics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Download, Search, Plus, ChevronDown, BarChart2, History } from "lucide-react";
import { toast } from "sonner";
import { fmtPct } from "@/lib/format";

import SuppliersTab from "@/pages/tabs/SuppliersTab";
import InvitationsTab from "@/pages/tabs/InvitationsTab";
import DeclarationsTab from "@/pages/tabs/DeclarationsTab";
import EvidenceTab from "@/pages/tabs/EvidenceTab";
import ScorecardsTab from "@/pages/tabs/ScorecardsTab";
import SupplyCatalogueTab from "@/pages/tabs/SupplyCatalogueTab";
import CustomerRequestsTab from "@/pages/tabs/CustomerRequestsTab";
import CustomerCatalogueTab from "@/pages/tabs/CustomerCatalogueTab";

const TABS = [
  { key: "suppliers", label: "Suppliers", primary: "Add Supplier" },
  { key: "invitations", label: "Invitations", primary: "Invite Supplier" },
  { key: "declarations", label: "Declarations", primary: "Review Declaration" },
  { key: "evidence", label: "Evidence", primary: "Review Evidence" },
  { key: "scorecards", label: "Scorecards", primary: "Create Improvement Request" },
  { key: "catalogue", label: "Supply Catalogue", primary: "Add Catalogue Product" },
  { key: "customer-requests", label: "Customer Requests", primary: "Respond to Request" },
  { key: "customer-catalogue", label: "Customer Catalogue", primary: "Share Product Carbon Data" },
];

const DOWNLOADS = [
  "Supplier Register", "Supplier Carbon Data Report", "Declaration Register", "Evidence Register",
  "Supplier Scorecards", "Supply Catalogue", "Primary Data Coverage Report", "Scope 3 Supplier Report",
  "Supplier Data Gap Report", "Customer Request Register", "Customer Catalogue", "Value Chain Audit Trail",
];

export default function ValueChain() {
  const nav = useNavigate();
  const { ORG, AGG, metrics, audit, WORKFLOW_STAGES } = useVC();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState(params.get("tab") || "suppliers");
  const [search, setSearch] = useState("");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const primaryRefs = useRef({});

  useEffect(() => { const t = params.get("tab"); if (t) setTab(t); }, [params]);
  const changeTab = (t) => { setTab(t); setParams({ tab: t }); };
  const registerPrimary = (key, fn) => { primaryRefs.current[key] = fn; };
  const runPrimary = () => { primaryRefs.current[tab]?.(); };

  const current = TABS.find((t) => t.key === tab);

  const tabProps = { search, registerPrimary, goToTab: changeTab, active: tab };

  return (
    <AppShell>
      <div className="px-8 py-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Value Chain / Supplier &amp; Customer Network</div>
            <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-slate-900">Supplier &amp; Customer Network</h1>
            <p className="mt-1 text-sm text-slate-500">Primary carbon data, declarations, evidence and improvement workflow</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">Simulated</span>
            <Button variant="outline" size="sm" onClick={() => setAuditOpen(true)} data-testid="audit-btn"><History className="mr-1.5 h-4 w-4" /> Audit</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" data-testid="download-btn"><Download className="mr-1.5 h-4 w-4" /> Download</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Value Chain Reports</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {DOWNLOADS.map((d) => (
                  <DropdownMenuItem key={d} onClick={() => toast.success(`Generating: ${d}`, { description: "Simulated export (.xlsx)" })} data-testid={`dl-${d.toLowerCase().replace(/[^a-z]+/g, "-")}`}>{d}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={runPrimary} data-testid="primary-action-btn">
              <Plus className="mr-1.5 h-4 w-4" /> {current?.primary}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Select defaultValue="tema">
            <SelectTrigger className="h-9 w-56 bg-white" data-testid="facility-filter"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="tema">{ORG.facility}</SelectItem><SelectItem value="all">All Facilities</SelectItem></SelectContent>
          </Select>
          <Select defaultValue="fy26">
            <SelectTrigger className="h-9 w-40 bg-white" data-testid="period-filter"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="fy26">{ORG.reportingPeriod}</SelectItem><SelectItem value="fy25">FY 2025</SelectItem></SelectContent>
          </Select>
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search records, suppliers, IDs, products…" className="h-9 bg-white pl-9" data-testid="global-search" />
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowAnalytics((s) => !s)} data-testid="toggle-analytics">
            <BarChart2 className="mr-1.5 h-4 w-4" /> Analytics <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showAnalytics ? "rotate-180" : ""}`} />
          </Button>
        </div>

        {/* Primary KPI cards */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard testId="kpi-active-suppliers" label="Active Suppliers" value={AGG.activeSuppliers} sub={`${AGG.primaryDataEnabled} primary-data enabled`} onClick={() => changeTab("suppliers")} />
          <KpiCard testId="kpi-response-rate" label="Supplier Response Rate" value={`${AGG.responseRate}%`} sub={`↑ ${AGG.responseDelta}% this quarter`} subTone="up" onClick={() => changeTab("invitations")} />
          <KpiCard testId="kpi-verified-pcf" label="Verified Supplier PCFs" value={AGG.verifiedPCFs} sub={`${AGG.supplierCoverage}% supplier coverage`} onClick={() => changeTab("catalogue")} />
          <KpiCard testId="kpi-incomplete" label="Incomplete Records" value={AGG.incompleteRecords} sub="Correction required" subTone="warn" onClick={() => changeTab("declarations")} />
        </div>

        {/* Second analytics metric strip */}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          <MetricCard testId="m-primary-coverage" label="Primary Data Coverage" value={fmtPct(metrics.primaryDataCoverage)} onClick={() => changeTab("catalogue")} />
          <MetricCard testId="m-scope3-specific" label="Scope 3 Supplier-Specific" value={fmtPct(metrics.scope3SupplierSpecific)} onClick={() => changeTab("catalogue")} />
          <MetricCard testId="m-proxy" label="Proxy Data Dependency" value={fmtPct(metrics.proxyDependency)} onClick={() => changeTab("scorecards")} />
          <MetricCard testId="m-evidence-coverage" label="Evidence Coverage" value={fmtPct(metrics.evidenceCoverage)} onClick={() => changeTab("evidence")} />
          <MetricCard testId="m-pcf-coverage" label="Supplier PCF Coverage" value={fmtPct(metrics.supplierPcfCoverage)} onClick={() => changeTab("catalogue")} />
          <MetricCard testId="m-avg-quality" label="Avg Data Quality" value={`${metrics.avgDataQuality}/100`} onClick={() => changeTab("scorecards")} />
          <MetricCard testId="m-expiring" label="Declarations Expiring" value={metrics.declarationsExpiring} onClick={() => changeTab("declarations")} />
          <MetricCard testId="m-open-requests" label="Open Customer Requests" value={metrics.openCustomerRequests} onClick={() => changeTab("customer-requests")} />
        </div>

        {/* Workflow tracker */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <SectionTitle right={<Legend />}>Value Chain Workflow</SectionTitle>
          <WorkflowTracker stages={WORKFLOW_STAGES} currentIndex={6} />
        </div>

        {/* Analytics */}
        {showAnalytics && (
          <div className="mt-4">
            <Analytics onFilter={(t) => changeTab(t)} />
          </div>
        )}

        {/* Tabs */}
        <div className="mt-6">
          <Tabs value={tab} onValueChange={changeTab}>
            <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-transparent p-0">
              {TABS.map((t) => (
                <TabsTrigger key={t.key} value={t.key} data-testid={`tab-${t.key}`}
                  className="rounded-lg border border-transparent px-4 py-2 text-sm font-semibold data-[state=active]:border-emerald-200 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="mt-4">
              <TabsContent value="suppliers"><SuppliersTab {...tabProps} /></TabsContent>
              <TabsContent value="invitations"><InvitationsTab {...tabProps} /></TabsContent>
              <TabsContent value="declarations"><DeclarationsTab {...tabProps} /></TabsContent>
              <TabsContent value="evidence"><EvidenceTab {...tabProps} /></TabsContent>
              <TabsContent value="scorecards"><ScorecardsTab {...tabProps} /></TabsContent>
              <TabsContent value="catalogue"><SupplyCatalogueTab {...tabProps} /></TabsContent>
              <TabsContent value="customer-requests"><CustomerRequestsTab {...tabProps} /></TabsContent>
              <TabsContent value="customer-catalogue"><CustomerCatalogueTab {...tabProps} /></TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Audit trail drawer */}
      <Sheet open={auditOpen} onOpenChange={setAuditOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader><SheetTitle>Value Chain Audit Trail</SheetTitle></SheetHeader>
          <div className="mt-4 space-y-2">
            {audit.map((a) => (
              <div key={a.id} className="rounded-lg border border-slate-200 p-3 text-sm" data-testid={`audit-row-${a.id}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{a.object} · {a.objectId}</span>
                  <span className="text-xs text-slate-400">{new Date(a.ts).toLocaleString("en-GB")}</span>
                </div>
                <div className="mt-1 text-xs text-slate-500">{a.prev} → <span className="font-semibold text-emerald-600">{a.next}</span> · {a.reason}</div>
                <div className="mt-0.5 text-[11px] text-slate-400">{a.user} · {a.role}</div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
