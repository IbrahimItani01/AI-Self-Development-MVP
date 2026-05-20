import Link from "next/link";
import { LoginForm } from "@/components/dashboard/login-form";
import { Card } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ accountDeleted?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand px-6 py-12">
      <Card className="w-full max-w-md">
        <Link href="/" className="text-sm font-semibold text-wine">
          AI Student Development Companion
        </Link>
        <h1 className="mt-5 text-2xl font-semibold text-ink">School dashboard login</h1>
        <p className="mt-2 text-sm text-ink/60">
          Sign in with the Firebase account linked to your school admin profile.
        </p>
        {params?.accountDeleted ? (
          <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            The organization account and related data were deleted.
          </p>
        ) : null}
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-5 text-center text-sm text-ink/60">
          New school? <Link href="/register" className="font-semibold text-wine">Create an organization account</Link>
        </p>
      </Card>
    </main>
  );
}
