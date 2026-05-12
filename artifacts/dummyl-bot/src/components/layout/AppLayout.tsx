import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex w-full bg-background selection:bg-primary/30 text-foreground">
      <Sidebar />
      <main className="flex-1 md:ml-64 w-full min-w-0 transition-all duration-300">
        <div className="max-w-5xl mx-auto p-4 md:p-8 w-full pt-16 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
