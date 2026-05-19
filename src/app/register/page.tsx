import Link from "next/link";
import { RegisterOrganizationForm } from "@/components/dashboard/register-organization-form";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-sand px-6 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <Card>
          <Link href="/" className="text-sm font-semibold text-wine">
            AI Student Development Companion
          </Link>
          <h1 className="mt-5 text-2xl font-semibold text-ink">Create your school account</h1>
          <p className="mt-2 text-sm text-ink/60">
            Add your organization details first. The next step creates the Pro subscription checkout.
          </p>
          <div className="mt-6">
            <RegisterOrganizationForm />
          </div>
        </Card>
      </div>
    </main>
  );
}
