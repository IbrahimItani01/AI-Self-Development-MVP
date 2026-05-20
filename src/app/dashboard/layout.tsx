import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DashboardProvider } from "@/components/dashboard/dashboard-provider";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { admin, organization } = await requireAdmin();
  return (
    <DashboardProvider admin={admin} organization={organization}>
      <div className="min-h-screen bg-canvas lg:flex">
        <DashboardNav organizationName={organization.name} />
        <main className="w-full px-5 py-6 lg:px-8">{children}</main>
      </div>
    </DashboardProvider>
  );
}
