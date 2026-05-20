"use client";

import { useEffect, useMemo, useRef } from "react";
import { Provider } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  initializeDashboard,
  resetDashboard,
  setAdmin,
  setCheckIns,
  setConversations,
  setDashboardError,
  setFollowUpFlags,
  setGrowthPlans,
  setInviteCodes,
  setOrganization,
  setStudents,
  setSubscriptionPlans,
  setUsageLogs,
} from "@/lib/redux/dashboardSlice";
import { store } from "@/lib/redux/store";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import type { AppDispatch } from "@/lib/redux/store";
import type {
  CheckIn,
  Conversation,
  FollowUpFlag,
  GrowthPlan,
  InviteCode,
  Organization,
  OrganizationAdmin,
  Student,
  SubscriptionPlan,
  UsageLog,
} from "@/types";

export function DashboardProvider({
  admin,
  organization,
  children,
}: {
  admin: OrganizationAdmin;
  organization: Organization;
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <DashboardRealtimeBridge admin={admin} organization={organization}>
        {children}
      </DashboardRealtimeBridge>
    </Provider>
  );
}

function DashboardRealtimeBridge({
  admin,
  organization,
  children,
}: {
  admin: OrganizationAdmin;
  organization: Organization;
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { status, error, loaded } = useAppSelector((state) => state.dashboard);
  const bootstrapped = useRef(false);

  useEffect(() => {
    dispatch(initializeDashboard({ admin, organization }));
    bootstrapped.current = true;

    let firestoreUnsubscribers: Unsubscribe[] = [];
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      firestoreUnsubscribers.forEach((unsubscribe) => unsubscribe());
      firestoreUnsubscribers = [];

      if (!user) {
        dispatch(setDashboardError("The dashboard session is active, but Firebase Auth is not signed in. Please log in again."));
        return;
      }

      const onError = (nextError: Error) => {
        dispatch(setDashboardError(nextError.message || "Live dashboard updates are unavailable."));
      };

      firestoreUnsubscribers = [
        onSnapshot(doc(db, "organizationAdmins", user.uid), (snap) => {
          dispatch(setAdmin(snap.exists() ? fromFirestoreDoc<OrganizationAdmin>(snap) : admin));
        }, onError),
        onSnapshot(doc(db, "organizations", organization.id), (snap) => {
          dispatch(setOrganization(snap.exists() ? fromFirestoreDoc<Organization>(snap) : null));
        }, onError),
        listenOrgCollection<Student>(db, organization.id, "students", setStudents, dispatch, onError),
        listenOrgCollection<InviteCode>(db, organization.id, "inviteCodes", setInviteCodes, dispatch, onError),
        listenOrgCollection<CheckIn>(db, organization.id, "checkIns", setCheckIns, dispatch, onError),
        listenOrgCollection<FollowUpFlag>(db, organization.id, "followUpFlags", setFollowUpFlags, dispatch, onError),
        listenOrgCollection<UsageLog>(db, organization.id, "usageLogs", setUsageLogs, dispatch, onError),
        listenOrgCollection<GrowthPlan>(db, organization.id, "growthPlans", setGrowthPlans, dispatch, onError),
        listenOrgCollection<Conversation>(db, organization.id, "conversations", setConversations, dispatch, onError),
        onSnapshot(collection(db, "subscriptionPlans"), (snap) => {
          dispatch(setSubscriptionPlans(sortByCreatedAt(snap.docs.map((planDoc) => fromFirestoreDoc<SubscriptionPlan>(planDoc)))));
        }, onError),
      ];
    });

    return () => {
      authUnsubscribe();
      firestoreUnsubscribers.forEach((unsubscribe) => unsubscribe());
      if (bootstrapped.current) dispatch(resetDashboard());
    };
  }, [admin, dispatch, organization]);

  const progress = useMemo(() => {
    const values = Object.values(loaded);
    if (!values.length) return 0;
    return Math.round((values.filter(Boolean).length / values.length) * 100);
  }, [loaded]);

  if (status !== "ready") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-canvas px-6">
        <div className="w-full max-w-md rounded-lg border border-ink/10 bg-surface p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-md bg-primary text-white">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-gold" />
            </div>
            <div>
              <p className="font-semibold text-ink">Preparing live dashboard</p>
              <p className="text-sm text-ink/60">Loading school data and opening real-time updates.</p>
            </div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          {error ? <p className="mt-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p> : null}
        </div>
      </div>
    );
  }

  return children;
}

function listenOrgCollection<T extends { id: string; createdAt?: Date | null }>(
  db: ReturnType<typeof getFirebaseDb>,
  organizationId: string,
  collectionName: string,
  actionCreator: (items: T[]) => { type: string; payload: T[] },
  dispatch: AppDispatch,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(collection(db, collectionName), where("organizationId", "==", organizationId)),
    (snap) => {
      dispatch(actionCreator(sortByCreatedAt(snap.docs.map((collectionDoc) => fromFirestoreDoc<T>(collectionDoc)))));
    },
    onError,
  );
}

function fromFirestoreDoc<T extends { id: string }>(snapshot: QueryDocumentSnapshot<DocumentData> | { id: string; data: () => DocumentData }): T {
  return { id: snapshot.id, ...(normalizeFirestoreValue(snapshot.data()) as Record<string, unknown>) } as T;
}

function normalizeFirestoreValue(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  if ("toDate" in value && typeof value.toDate === "function") return value.toDate();
  if (Array.isArray(value)) return value.map((item) => normalizeFirestoreValue(item));
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeFirestoreValue(item)]));
}

function sortByCreatedAt<T extends { createdAt?: Date | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
}
