import { config } from "dotenv";
import { runCheckInAutomation } from "../src/lib/check-ins/automation";

config({ path: ".env.local" });
config();

async function main() {
  const result = await runCheckInAutomation();
  console.log(`Checked ${result.checkedStudents} students.`);
  console.log(`Sent ${result.remindersSent} check-in reminders.`);
  console.log(`Created ${result.flagsCreated} missed check-in follow-up flags.`);
  if (result.errors.length) {
    console.error("Errors:", result.errors);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
