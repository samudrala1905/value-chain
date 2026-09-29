import React from "react";
import Sidebar from "@/components/layout/Sidebar";

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <Sidebar />
      <main className="ml-64 min-h-screen">{children}</main>
    </div>
  );
}
