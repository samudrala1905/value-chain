import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ValueChainProvider } from "@/context/ValueChainContext";
import ValueChain from "@/pages/ValueChain";
import SupplierPortal from "@/pages/SupplierPortal";
import StubModule from "@/pages/StubModule";
import { Scope3Record, PassportDetail } from "@/pages/DeepLinkTargets";

function App() {
  return (
    <div className="App">
      <ValueChainProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/value-chain" replace />} />
            <Route path="/value-chain" element={<ValueChain />} />
            <Route path="/supplier-portal" element={<SupplierPortal />} />
            <Route path="/supplier-portal/:inviteId" element={<SupplierPortal />} />
            <Route path="/carbon-accounting/scope3" element={<Scope3Record />} />
            <Route path="/carbon-passports/:id" element={<PassportDetail />} />
            <Route path="/home" element={<StubModule title="Home" breadcrumb="Home" />} />
            <Route path="/organisation" element={<StubModule title="Organisation" breadcrumb="Organisation" />} />
            <Route path="/data" element={<StubModule title="Data" breadcrumb="Data" />} />
            <Route path="/carbon-accounting" element={<StubModule title="Carbon Accounting" breadcrumb="Carbon Accounting / PCF" />} />
            <Route path="/cbam" element={<StubModule title="CBAM" breadcrumb="CBAM" />} />
            <Route path="/mrv" element={<StubModule title="MRV & Verification" breadcrumb="MRV & Verification" />} />
            <Route path="/carbon-passports" element={<StubModule title="Carbon Passports" breadcrumb="Carbon Passports" />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </ValueChainProvider>
    </div>
  );
}

export default App;
