"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { firebaseClientConfigured, getFirebaseAuth } from "@/lib/firebase/client";

export function RegisterOrganizationForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      if (!firebaseClientConfigured()) throw new Error("Firebase client env vars are not configured.");
      const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      const idToken = await credential.user.getIdToken();

      const registrationResponse = await fetch("/api/register/organization", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          idToken,
          adminName: formData.get("adminName"),
          organizationName: formData.get("organizationName"),
          phone: formData.get("phone"),
          website: formData.get("website"),
          addressLine1: formData.get("addressLine1"),
          city: formData.get("city"),
          country: formData.get("country"),
        }),
      });
      const registration = (await registrationResponse.json()) as { error?: string };
      if (!registrationResponse.ok) throw new Error(registration.error || "Unable to register organization.");

      const sessionResponse = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!sessionResponse.ok) throw new Error("Organization created, but dashboard session could not be started.");

      router.push("/register/plan");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register organization.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="adminName" label="Your name" required />
        <Field name="email" label="Work email" type="email" required />
        <Field name="password" label="Password" type="password" minLength={8} required />
        <Field name="organizationName" label="School / organization name" required />
        <Field name="phone" label="Phone" />
        <Field name="website" label="Website" />
        <Field name="addressLine1" label="Address" />
        <Field name="city" label="City" />
        <Field name="country" label="Country" />
      </div>
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <Button className="w-full" disabled={loading}>
        {loading ? "Creating account..." : "Continue to plan"}
      </Button>
      <p className="text-center text-sm text-ink/60">
        Already have an account? <Link href="/login" className="font-semibold text-wine">Log in</Link>
      </p>
    </form>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return (
    <label className="block text-sm font-medium text-ink">
      {label}
      <input
        className="mt-1 w-full rounded-md border border-ink/10 px-3 py-2 outline-none focus:border-wine"
        {...props}
      />
    </label>
  );
}
