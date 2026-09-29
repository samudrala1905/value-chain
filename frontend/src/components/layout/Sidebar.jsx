import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home, Building2, Database, BarChart3, Boxes, Ship, ShieldCheck, QrCode,
} from "lucide-react";

const NAV = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/organisation", label: "Organisation", icon: Building2 },
  { to: "/data", label: "Data", icon: Database },
  { to: "/carbon-accounting", label: "Carbon Accounting", icon: BarChart3 },
  { to: "/value-chain", label: "Value Chain", icon: Boxes },
  { to: "/cbam", label: "CBAM", icon: Ship },
  { to: "/mrv", label: "MRV & Verification", icon: ShieldCheck },
  { to: "/carbon-passports", label: "Carbon Passports", icon: QrCode },
];

export default function Sidebar() {
  const loc = useLocation();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-[#0B1220] text-slate-300">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 font-black text-white">S</div>
        <div>
          <div className="text-[15px] font-extrabold leading-none text-white">Saurient</div>
          <div className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">Carbon Passport</div>
        </div>
      </div>
      <nav className="mt-2 flex-1 space-y-1 px-3">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = loc.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              data-testid={`nav-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-white/5 px-6 py-4">
        <div className="text-xs font-semibold text-white">Asante Cocoa Coop.</div>
        <div className="text-[11px] text-slate-500">Org Admin · Ghana</div>
      </div>
    </aside>
  );
}
