import { config } from "dotenv";
import { adminAuth, adminDb, serverTimestamp, toFirestoreDate } from "../src/lib/firebase/admin";

config({ path: ".env.local" });
config();

async function main() {
  const db = adminDb();
  const organizationId = "cedar-learning-school";
  const ownerEmail = process.env.PLATFORM_OWNER_EMAIL || "owner@example.com";
  let firebaseUid = process.env.PLATFORM_OWNER_UID || "replace-with-firebase-uid";
  const proPlan = {
    name: "Pro",
    description: "Annual school plan for a structured student development pilot with Telegram access, dashboard visibility, and AI usage controls.",
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO || "",
    annualPriceCents: 150000,
    currency: "usd",
    studentLimit: 150,
    monthlyTokenLimit: 500000,
    features: [
      "Telegram bot access for enrolled students",
      "School dashboard with student progress summaries",
      "Weekly check-ins and growth plans",
      "Human follow-up flags for school review",
      "AI usage tracking with monthly token limits",
      "Invite code onboarding for one school organization",
    ],
    active: true,
    sortOrder: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const user = await adminAuth().getUserByEmail(ownerEmail);
    firebaseUid = user.uid;
  } catch {
    console.log(`No Firebase Auth user found for ${ownerEmail}. Using placeholder UID: ${firebaseUid}`);
  }

  await db.collection("subscriptionPlans").doc("pro").set(proPlan, { merge: true });

  await db.collection("organizations").doc(organizationId).set(
    {
      name: "Cedar Learning School",
      slug: "cedar-learning-school",
      status: "active",
      plan: "pro",
      maxStudents: proPlan.studentLimit,
      monthlyTokenLimit: proPlan.monthlyTokenLimit,
      billingEmail: ownerEmail.toLowerCase(),
      billingContactName: "Demo School Admin",
      phone: null,
      website: null,
      address: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionCurrentPeriodEnd: toFirestoreDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await db.collection("organizationAdmins").doc(firebaseUid).set(
    {
      organizationId,
      firebaseUid,
      name: "Demo School Admin",
      email: ownerEmail.toLowerCase(),
      role: "owner",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await db.collection("inviteCodes").doc("CEDARS2026").set(
    {
      organizationId,
      code: "CEDARS2026",
      label: "Pilot invite code",
      maxUses: 100,
      usedCount: 0,
      active: true,
      expiresAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  const demoStudents = [
    { id: "omar-demo", displayName: "Omar", username: "omar_student", focus: "Academic direction", goal: "Build a clearer study plan" },
    { id: "sara-demo", displayName: "Sara", username: "sara_student", focus: "Confidence", goal: "Speak up more in class" },
    { id: "karim-demo", displayName: "Karim", username: "karim_student", focus: "Career direction", goal: "Explore engineering paths" },
  ];

  for (const [index, student] of demoStudents.entries()) {
    await db.collection("students").doc(student.id).set(
      {
        organizationId,
        telegramUserId: `900000${index}`,
        telegramUsername: student.username,
        firstName: student.displayName,
        lastName: null,
        displayName: student.displayName,
        gradeLevel: "Grade 10",
        cohort: "Pilot cohort",
        onboardingStatus: "completed",
        selectedFocusArea: student.focus,
        mainGoal: student.goal,
        status: index === 1 ? "flagged" : "active",
        lastInteractionAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    await db.collection("growthPlans").doc(student.id).set(
      {
        studentId: student.id,
        organizationId,
        focusArea: student.focus,
        mainGoal: student.goal,
        focusAreas: [student.focus, "Habits", "Reflection"],
        weeklyActions: ["Choose one priority", "Complete one 20-minute action", "Write a short weekly reflection"],
        reflectionPrompt: "What helped you make progress this week?",
        suggestedNextStep: "Choose one small action for tomorrow and write it down.",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    const conversationRef = db.collection("conversations").doc(`${student.id}-conversation`);
    await conversationRef.set(
      {
        studentId: student.id,
        organizationId,
        telegramChatId: `900000${index}`,
        title: `${student.displayName} reflection`,
        lastMessageAt: serverTimestamp(),
        runningSummary: `${student.displayName} is working on ${student.focus.toLowerCase()} and is choosing smaller weekly actions to build momentum.`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    await db.collection("checkIns").add({
      studentId: student.id,
      organizationId,
      weekStart: toFirestoreDate(new Date()),
      answers: {
        progress: "Completed one focused action.",
        difficulty: "Staying consistent after school.",
        insight: "Small steps are easier to repeat.",
        nextStep: "Plan the first study block before the week starts.",
      },
      aiSummary: `${student.displayName} made steady progress and noticed consistency is easier with a small planned action.`,
      suggestedNextStep: "Pick one repeatable action and schedule it before the week begins.",
      followUpRecommended: index === 1,
      followUpReason: index === 1 ? "Sara may benefit from encouragement around class participation." : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await db.collection("followUpFlags").add({
    studentId: "sara-demo",
    organizationId,
    source: "check_in",
    severity: "medium",
    title: "Confidence support may help",
    summary: "Sara reports wanting to participate more but is hesitating in group settings.",
    recommendedAction: "A mentor or counselor could check in and help her choose one low-pressure participation goal.",
    status: "open",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await db.collection("usageLogs").add({
    organizationId,
    studentId: "omar-demo",
    type: "chat",
    model: process.env.AI_MODEL || "gpt-4o-mini",
    inputTokens: 820,
    outputTokens: 260,
    estimatedCost: 0.00028,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  console.log("Seeded Cedar Learning School demo data.");
  console.log("Invite code: CEDARS2026");
  console.log(`Admin email: ${ownerEmail}`);
  console.log(`Admin Firebase UID: ${firebaseUid}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
