import { StudentDetailPage } from "@/components/dashboard/pages/student-detail-page";

export default async function StudentDetailRoutePage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  return <StudentDetailPage studentId={studentId} />;
}
