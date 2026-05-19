import "dotenv/config";
import { adminDb } from "../src/lib/firebase/admin";
import { sendTelegramMessage } from "../src/lib/telegram/bot";
import type { Organization, Student } from "../src/types";

async function main() {
  const db = adminDb();
  const studentsSnap = await db.collection("students").where("status", "in", ["active", "flagged"]).get();
  let sent = 0;

  for (const doc of studentsSnap.docs) {
    const student = { id: doc.id, ...doc.data() } as Student;
    const organizationDoc = await db.collection("organizations").doc(student.organizationId).get();
    const organization = { id: organizationDoc.id, ...organizationDoc.data() } as Organization;
    if (!["active", "trial"].includes(organization.status)) continue;
    await sendTelegramMessage({
      chatId: student.telegramUserId,
      text: "Weekly check-in is ready. Send /checkin when you have a minute to reflect on progress and choose one small next step.",
    });
    sent += 1;
  }

  console.log(`Sent ${sent} weekly check-in reminders.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
