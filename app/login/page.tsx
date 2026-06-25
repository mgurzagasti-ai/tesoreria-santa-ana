import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  const appName = process.env.APP_NAME ?? "Tesoreria Santa Ana";

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="login-shell">
      <section className="login-hero">
        <div className="login-brand">
          <p className="eyebrow">Tesoreria Privada</p>
          <object
            className="login-logo-slot"
            data="/logo-santa-ana.pdf#toolbar=0&navpanes=0&scrollbar=0"
            type="application/pdf"
            aria-label={`Logo de ${appName}`}
          >
            <img
              className="login-logo-fallback"
              src="/logo-santa-ana.pdf"
              alt={`Logo de ${appName}`}
            />
          </object>
          <h1>{appName}</h1>
        </div>
      </section>

      <LoginForm />
    </main>
  );
}
