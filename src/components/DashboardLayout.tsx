"use client";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  tabs?: string[];
  defaultTab?: string;
}

export default function DashboardLayout({ children, tabs, defaultTab }: Props) {
  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#0e0e10",
    }}>
      {/* Fixed sidebar */}
      <Sidebar />

      {/* Main content: offset by sidebar width */}
      <div style={{
        marginLeft: 220,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#0e0e10",
        overflowX: "hidden",
      }}>
        {/* Top navigation */}
        <TopNav tabs={tabs} defaultTab={defaultTab} />

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
