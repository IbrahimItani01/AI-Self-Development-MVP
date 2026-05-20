import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore, Timestamp, type Firestore } from "firebase-admin/firestore";
import { toDate } from "@/lib/utils/dates";

function privateKey(): string | undefined {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey());
}

export function getAdminApp(): App {
  if (getApps().length) return getApps()[0]!;
  if (!isFirebaseAdminConfigured()) {
    throw new Error("Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.");
  }
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey(),
    }),
  });
}

export function adminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function adminAuth() {
  return getAuth(getAdminApp());
}

export function serverTimestamp() {
  return FieldValue.serverTimestamp();
}

export function toFirestoreDate(date?: Date | null) {
  return date ? Timestamp.fromDate(date) : null;
}

export function fromDoc<T extends { id: string }>(doc: FirebaseFirestore.DocumentSnapshot): T {
  const data = doc.data() ?? {};
  const normalized = Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (
        key.toLowerCase().endsWith("at") ||
        key.endsWith("WeekStart") ||
        key === "weekStart" ||
        key === "subscriptionCurrentPeriodEnd" ||
        key === "expiresAt"
      ) {
        return [key, toDate(value)];
      }
      return [key, value];
    }),
  );
  return { id: doc.id, ...normalized } as T;
}

export function cleanUndefined<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as T;
}
