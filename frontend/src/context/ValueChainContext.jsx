import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import {
  ORG, INTERNAL_MATERIALS, SUPPLIERS, CONTACTS, INVITATIONS, DECLARATIONS, EVIDENCE,
  CATALOGUE, IMPROVEMENTS, CUSTOMER_REQUESTS, CUSTOMER_CATALOGUE, CUSTOMER_PACKAGES,
  AGG, AUDIT_SEED, WORKFLOW_STAGES,
} from "@/data/mockData";

const Ctx = createContext(null);
export const useVC = () => useContext(Ctx);

let seq = 100;
const nextId = (prefix) => `${prefix}-${++seq}`;

export function ValueChainProvider({ children }) {
  const [suppliers, setSuppliers] = useState(SUPPLIERS);
  const [invitations, setInvitations] = useState(INVITATIONS);
  const [declarations, setDeclarations] = useState(DECLARATIONS);
  const [evidence, setEvidence] = useState(EVIDENCE);
  const [catalogue, setCatalogue] = useState(CATALOGUE);
  const [improvements, setImprovements] = useState(IMPROVEMENTS);
  const [customerRequests, setCustomerRequests] = useState(CUSTOMER_REQUESTS);
  const [customerCatalogue] = useState(CUSTOMER_CATALOGUE);
  const [packages, setPackages] = useState(CUSTOMER_PACKAGES);
  const [changeEvents, setChangeEvents] = useState([]);
  const [audit, setAudit] = useState(AUDIT_SEED);

  const logAudit = useCallback((object, objectId, prev, next, reason, user = "A. Boateng", role = "Org Admin") => {
    setAudit((a) => [
      { id: nextId("AUD"), object, objectId, user, role, prev, next, reason, ts: new Date().toISOString() },
      ...a,
    ]);
  }, []);

  const supplierById = useCallback((id) => suppliers.find((s) => s.id === id), [suppliers]);
  const supplierName = useCallback((id) => supplierById(id)?.name || id, [supplierById]);

  // ---- Derived Scope 3 emissions per supplier (volume * intensity) --------
  const scope3 = useMemo(() => {
    const rows = suppliers.map((s) => {
      const kg = s.volume > 1 ? s.volume : 1;
      const emissions = Math.round((kg * s.pcfIntensity) * (s.volume > 1 ? 1 : 1)); // kgCO2e
      return { id: s.id, name: s.name, material: s.material, materialCode: s.materialCode, emissions, dataClass: s.dataClass, score: s.score, pcfIntensity: s.pcfIntensity };
    });
    const total = rows.reduce((a, r) => a + r.emissions, 0);
    rows.forEach((r) => (r.contribution = total ? (r.emissions / total) * 100 : 0));
    return { rows, total };
  }, [suppliers]);

  const scope3ContributionFor = useCallback(
    (id) => scope3.rows.find((r) => r.id === id)?.contribution ?? 0,
    [scope3]
  );

  // Emissions grouped by material
  const scope3ByMaterial = useMemo(() => {
    const map = {};
    scope3.rows.forEach((r) => {
      map[r.materialCode] = map[r.materialCode] || { code: r.materialCode, name: INTERNAL_MATERIALS.find((m) => m.code === r.materialCode)?.name || r.materialCode, emissions: 0 };
      map[r.materialCode].emissions += r.emissions;
    });
    return Object.values(map).sort((a, b) => b.emissions - a.emissions);
  }, [scope3]);

  // ---- Derived module metrics --------------------------------------------
  const metrics = useMemo(() => {
    const primaryClasses = ["PRIMARY_VERIFIED", "PRIMARY_DECLARED"];
    const primaryCat = catalogue.filter((c) => primaryClasses.includes(c.dataClass));
    const proxyCat = catalogue.filter((c) => c.dataClass === "PROXY" || c.dataClass === "SECONDARY");
    const withEvidence = suppliers.filter((s) => s.evidenceComplete >= 70).length;
    const avgQuality = Math.round(suppliers.reduce((a, s) => a + s.score, 0) / suppliers.length);
    const withPcf = catalogue.filter((c) => c.pcf).length;

    return {
      primaryDataCoverage: Math.round((primaryCat.length / catalogue.length) * 100),
      scope3SupplierSpecific: Math.round((primaryCat.length / catalogue.length) * 100),
      proxyDependency: Math.round((proxyCat.length / catalogue.length) * 100),
      evidenceCoverage: Math.round((withEvidence / suppliers.length) * 100),
      supplierPcfCoverage: Math.round((withPcf / catalogue.length) * 100),
      avgDataQuality: avgQuality,
      declarationsExpiring: AGG.declarationsExpiring,
      openCustomerRequests: customerRequests.filter((r) => !["COMPLETED"].includes(r.status)).length,
    };
  }, [catalogue, suppliers, customerRequests]);

  // ---- Actions ------------------------------------------------------------
  const addSupplier = useCallback((s) => {
    const id = `SUP-GH-${String(Math.floor(Math.random() * 900) + 100)}`;
    const rec = {
      id, tier: "Tier 1", country: "Ghana", primaryData: false, pcfAvailable: false,
      verification: "ESTIMATED", dataClass: "PROXY", score: 55, pcfIntensity: 2.0, status: "INVITED",
      workflow: "SUPPLIER", declarations: 0, evidenceComplete: 0, yoyChange: 0, lastUpdate: new Date().toISOString(),
      scores: { primaryData: 20, evidence: 10, pcfAvailability: 0, verification: 0, freshness: 90, methodology: 40, timeliness: 80, traceability: 30 },
      ...s,
    };
    setSuppliers((p) => [rec, ...p]);
    logAudit("Supplier", id, "—", "CREATED", "New supplier added");
    return rec;
  }, [logAudit]);

  const addInvitation = useCallback((inv) => {
    const id = nextId("INV");
    const rec = { id, opened: false, progress: 0, status: "SENT", sent: new Date().toISOString(), ...inv };
    setInvitations((p) => [rec, ...p]);
    logAudit("Invitation", id, "DRAFT", "SENT", `Invited ${supplierName(inv.supplierId)}`);
    return rec;
  }, [logAudit, supplierName]);

  const updateInvitationStatus = useCallback((id, status) => {
    setInvitations((p) => p.map((i) => (i.id === id ? { ...i, status, progress: status === "SUBMITTED" || status === "ACCEPTED" ? 100 : i.progress } : i)));
    logAudit("Invitation", id, "—", status, "Status change");
  }, [logAudit]);

  const reviewDeclaration = useCallback((id, action) => {
    const map = { accept: "ACCEPTED", correct: "CORRECTION REQUIRED", reject: "REJECTED", clarify: "UNDER REVIEW" };
    const status = map[action] || "UNDER REVIEW";
    setDeclarations((p) => p.map((d) => (d.id === id ? { ...d, status } : d)));
    logAudit("Declaration", id, "UNDER REVIEW", status, `Review: ${action}`);
  }, [logAudit]);

  const reviewEvidence = useCallback((id, action) => {
    const map = { accept: "ACCEPTED", reject: "REJECTED", replace: "UNDER REVIEW" };
    const status = map[action] || "UNDER REVIEW";
    setEvidence((p) => p.map((e) => (e.id === id ? { ...e, status, version: action === "replace" ? e.version + 1 : e.version } : e)));
    logAudit("Evidence", id, "—", status, `Evidence ${action}`);
  }, [logAudit]);

  const mapCatalogue = useCallback((id, internalMaterial) => {
    setCatalogue((p) => p.map((c) => (c.id === id ? { ...c, mapped: true, internalMaterial, status: "ACTIVE" } : c)));
    logAudit("Catalogue", id, "UNMAPPED", "MAPPED", `Mapped to ${internalMaterial}`);
  }, [logAudit]);

  const addCatalogueProduct = useCallback((c) => {
    const id = nextId("CAT");
    const rec = { id, mapped: false, status: "ACTION REQUIRED", dataClass: "PROXY", verification: "Not verified", ...c };
    setCatalogue((p) => [rec, ...p]);
    logAudit("Catalogue", id, "—", "CREATED", "Catalogue product added");
    return rec;
  }, [logAudit]);

  const addImprovement = useCallback((imp) => {
    const id = nextId("IMP");
    const rec = { id, status: "SENT", ...imp };
    setImprovements((p) => [rec, ...p]);
    logAudit("Improvement", id, "—", "CREATED", `Improvement request for ${supplierName(imp.supplierId)}`);
    return rec;
  }, [logAudit, supplierName]);

  const respondCustomerRequest = useCallback((id, status) => {
    setCustomerRequests((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));
    logAudit("CustomerRequest", id, "—", status, "Customer request response");
  }, [logAudit]);

  const generatePackage = useCallback((pkg) => {
    const id = nextId("PKG");
    const rec = { id, generated: new Date().toISOString(), by: "Carbon Manager", access: 0, expiry: "2026-09-01", ...pkg };
    setPackages((p) => [rec, ...p]);
    logAudit("CustomerPackage", id, "—", "GENERATED", `Package for ${pkg.customer}`);
    return rec;
  }, [logAudit]);

  // ---- Supplier data change impact engine --------------------------------
  const runImpactAnalysis = useCallback((supplierId, changeType) => {
    const s = supplierById(supplierId);
    const cats = catalogue.filter((c) => c.supplierId === supplierId);
    const materials = [...new Set(cats.map((c) => c.internalMaterial))];
    const affectedMaterials = INTERNAL_MATERIALS.filter((m) => materials.includes(m.code));
    // any material feeding our product affects the product + batch + pcf + passport
    const affectsProduct = affectedMaterials.length > 0;
    const result = {
      supplier: s?.name,
      changeType,
      materials: affectedMaterials.map((m) => m.code),
      boms: affectsProduct ? [ORG.product] : [],
      products: affectsProduct ? [ORG.product] : [],
      batches: affectsProduct ? [ORG.batch] : [],
      pcfProjects: affectsProduct ? [ORG.pcfProject] : [],
      passports: affectsProduct ? ["CP-GH-2026-0001"] : [],
      recalcRequired: affectsProduct,
      reverifyRequired: affectsProduct && (s?.verification === "VERIFIED"),
    };
    const ev = {
      id: nextId("CHG"), supplierId, supplier: s?.name, changeType, ts: new Date().toISOString(),
      status: "RECALCULATION REQUIRED", ...result,
    };
    setChangeEvents((p) => [ev, ...p]);
    logAudit("ChangeEvent", ev.id, "—", "IMPACT ANALYSIS", `Supplier ${s?.name} changed ${changeType}`);
    logAudit("PCF", ORG.pcfProject, "VERIFIED", "RECALCULATION REQUIRED", "Supplier data change impact");
    return ev;
  }, [supplierById, catalogue, logAudit]);

  // reverse traceability: which products/materials depend on a supplier
  const dependenciesFor = useCallback((supplierId) => {
    const cats = catalogue.filter((c) => c.supplierId === supplierId);
    return {
      catalogue: cats,
      materials: [...new Set(cats.map((c) => c.internalMaterial))],
      products: cats.length ? [ORG.product] : [],
      pcfProjects: cats.length ? [ORG.pcfProject] : [],
      passports: cats.length ? ["CP-GH-2026-0001"] : [],
    };
  }, [catalogue]);

  const value = {
    ORG, WORKFLOW_STAGES, INTERNAL_MATERIALS, CONTACTS, AGG,
    suppliers, invitations, declarations, evidence, catalogue, improvements,
    customerRequests, customerCatalogue, packages, changeEvents, audit,
    supplierById, supplierName, scope3, scope3ContributionFor, scope3ByMaterial, metrics,
    addSupplier, addInvitation, updateInvitationStatus, reviewDeclaration, reviewEvidence,
    mapCatalogue, addCatalogueProduct, addImprovement, respondCustomerRequest, generatePackage,
    runImpactAnalysis, dependenciesFor, logAudit,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
