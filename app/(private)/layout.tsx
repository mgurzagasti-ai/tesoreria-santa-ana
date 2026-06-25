import { PrivateShell } from "@/components/layout/private-shell";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const currentYear = new Date().getFullYear();

  return (
    <PrivateShell currentYear={currentYear} userName={user.name}>
      {children}
    </PrivateShell>
  );
}
