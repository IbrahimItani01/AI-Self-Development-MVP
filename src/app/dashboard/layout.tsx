import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { organization } = await requireAdmin();
  return (
    <div className="min-h-screen bg-sand lg:flex">
      <DashboardNav organizationName={organization.name} />
      <main className="w-full px-5 py-6 lg:px-8">{children}</main>
    </div>
  );
}
