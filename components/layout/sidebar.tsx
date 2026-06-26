"use client";

import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

type NavigationItem = {
  href: string;
  label: string;
  exact?: boolean;
};

const navigation: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/empleados", label: "Empleados" },
  { href: "/conceptos", label: "ABM de Conceptos" },
  { href: "/movimientos", label: "Movimientos", exact: true },
  { href: "/movimientos/historial", label: "Historial" },
  { href: "/saldos", label: "Saldos" },
];

export function Sidebar() {
  const pathname = usePathname();
  const appName = "Tesoreria Santa Ana SRL";

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <p className="eyebrow topbar-eyebrow">Informacion reservada</p>
        <h2 className="topbar-title">{appName}</h2>
      </div>

      <nav className="topbar-nav">
        {navigation.map((item) => {
          const isActive =
            item.href === "/movimientos"
              ? pathname === "/movimientos" || pathname.startsWith("/movimientos/carga")
              : item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <a
              key={item.href}
              href={item.href}
              className={cn("nav-link", isActive && "nav-link-active")}
            >
              {item.label}
            </a>
          );
        })}
      </nav>

      <form action={logoutAction} className="topbar-actions">
        <button type="submit" className="button ghost">
          Cerrar sesion
        </button>
      </form>
    </header>
  );
}
