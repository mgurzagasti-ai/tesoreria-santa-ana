"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

type NavigationItem = {
  href: Route;
  label: string;
  exact?: boolean;
};

const navigation: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/empleados", label: "Empleados" },
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
            <Link
              key={item.href}
              href={item.href}
              className={cn("nav-link", isActive && "nav-link-active")}
            >
              {item.label}
            </Link>
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
