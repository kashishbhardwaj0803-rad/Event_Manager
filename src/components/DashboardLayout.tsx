"use client";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

interface Props {
  children: React.ReactNode;
  tabs?: string[];
  defaultTab?: string;
}

export default function DashboardLayout({ children, tabs, defaultTab }: Props) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <TopNav tabs={tabs} defaultTab={defaultTab} />
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
}
