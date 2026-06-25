"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

export function PrivateShell({
  children,
  currentYear,
  userName,
}: {
  children: React.ReactNode;
  currentYear: number;
  userName: string;
}) {
  const pathname = usePathname();
  const isPrintRoute = pathname.includes("/imprimir");

  if (isPrintRoute) {
    return (
      <div className="app-shell print-app-shell">
        <main className="content-shell print-layout-shell">
          <div className="content-body">{children}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content-shell">
        <header className="content-header">
          <div>
            <p className="eyebrow">Informacion reservada</p>
            <h1>Hola, {userName}</h1>
          </div>
        </header>
        <div className="content-body">{children}</div>
        <footer className="app-footer">
          <div>
            <strong>Sistema Tesoreria Santa Ana SRL</strong>
            <p>Aplicacion desarrollada por Martin Urzagasti</p>
          </div>
          <span>{currentYear}</span>
        </footer>
      </main>
    </div>
  );
}
