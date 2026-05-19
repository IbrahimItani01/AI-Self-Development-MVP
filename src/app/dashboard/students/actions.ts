"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { deleteStudentAccount } from "@/lib/db/students";

const deleteStudentSchema = z.object({
  studentId: z.string().min(1),
  returnTo: z.string().optional(),
});

export async function deleteStudentFromDashboard(formData: FormData) {
  const { organization } = await requireAdmin();
  const input = deleteStudentSchema.parse({
    studentId: formData.get("studentId"),
    returnTo: formData.get("returnTo") || "/dashboard/students",
  });

  await deleteStudentAccount({
    organizationId: organization.id,
    studentId: input.studentId,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard/check-ins");
  revalidatePath("/dashboard/follow-ups");
  redirect(input.returnTo?.startsWith("/dashboard") ? input.returnTo : "/dashboard/students");
}
