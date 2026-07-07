import { PrivateShell } from "@/components/layout/private-shell";
import { requireUser } from "@/lib/auth";
import packageJson from "@/package.json";

export const dynamic = "force-dynamic";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const currentYear = new Date().getFullYear();

  return (
    <PrivateShell
      appVersion={packageJson.version}
      currentYear={currentYear}
      userName={user.name}
    >
      {children}
    </PrivateShell>
  );
}
