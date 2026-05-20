"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  CheckIn,
  Conversation,
  FollowUpFlag,
  GrowthPlan,
  InviteCode,
  Message,
  Organization,
  OrganizationAdmin,
  Student,
  SubscriptionPlan,
  UsageLog,
} from "@/types";

export type DashboardCollection =
  | "students"
  | "inviteCodes"
  | "checkIns"
  | "followUpFlags"
  | "usageLogs"
  | "subscriptionPlans"
  | "growthPlans"
  | "conversations";

type LoadStatus = "idle" | "loading" | "ready" | "error";

type DashboardState = {
  status: LoadStatus;
  error: string | null;
  loaded: Record<DashboardCollection, boolean>;
  organization: Organization | null;
  admin: OrganizationAdmin | null;
  students: Student[];
  inviteCodes: InviteCode[];
  checkIns: CheckIn[];
  followUpFlags: FollowUpFlag[];
  usageLogs: UsageLog[];
  subscriptionPlans: SubscriptionPlan[];
  growthPlans: GrowthPlan[];
  conversations: Conversation[];
  messagesByStudent: Record<string, Message[]>;
  studentMessageStatus: Record<string, LoadStatus>;
};

const emptyLoaded: Record<DashboardCollection, boolean> = {
  students: false,
  inviteCodes: false,
  checkIns: false,
  followUpFlags: false,
  usageLogs: false,
  subscriptionPlans: false,
  growthPlans: false,
  conversations: false,
};

const initialState: DashboardState = {
  status: "idle",
  error: null,
  loaded: emptyLoaded,
  organization: null,
  admin: null,
  students: [],
  inviteCodes: [],
  checkIns: [],
  followUpFlags: [],
  usageLogs: [],
  subscriptionPlans: [],
  growthPlans: [],
  conversations: [],
  messagesByStudent: {},
  studentMessageStatus: {},
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    initializeDashboard(state, action: PayloadAction<{ organization: Organization; admin: OrganizationAdmin }>) {
      state.status = "loading";
      state.error = null;
      state.organization = action.payload.organization;
      state.admin = action.payload.admin;
      state.loaded = { ...emptyLoaded };
    },
    setOrganization(state, action: PayloadAction<Organization | null>) {
      state.organization = action.payload;
    },
    setAdmin(state, action: PayloadAction<OrganizationAdmin | null>) {
      state.admin = action.payload;
    },
    setStudents(state, action: PayloadAction<Student[]>) {
      state.students = action.payload;
      state.loaded.students = true;
      markReadyWhenLoaded(state);
    },
    setInviteCodes(state, action: PayloadAction<InviteCode[]>) {
      state.inviteCodes = action.payload;
      state.loaded.inviteCodes = true;
      markReadyWhenLoaded(state);
    },
    setCheckIns(state, action: PayloadAction<CheckIn[]>) {
      state.checkIns = action.payload;
      state.loaded.checkIns = true;
      markReadyWhenLoaded(state);
    },
    setFollowUpFlags(state, action: PayloadAction<FollowUpFlag[]>) {
      state.followUpFlags = action.payload;
      state.loaded.followUpFlags = true;
      markReadyWhenLoaded(state);
    },
    setUsageLogs(state, action: PayloadAction<UsageLog[]>) {
      state.usageLogs = action.payload;
      state.loaded.usageLogs = true;
      markReadyWhenLoaded(state);
    },
    setSubscriptionPlans(state, action: PayloadAction<SubscriptionPlan[]>) {
      state.subscriptionPlans = action.payload;
      state.loaded.subscriptionPlans = true;
      markReadyWhenLoaded(state);
    },
    setGrowthPlans(state, action: PayloadAction<GrowthPlan[]>) {
      state.growthPlans = action.payload;
      state.loaded.growthPlans = true;
      markReadyWhenLoaded(state);
    },
    setConversations(state, action: PayloadAction<Conversation[]>) {
      state.conversations = action.payload;
      state.loaded.conversations = true;
      markReadyWhenLoaded(state);
    },
    setStudentMessages(state, action: PayloadAction<{ studentId: string; messages: Message[] }>) {
      state.messagesByStudent[action.payload.studentId] = action.payload.messages;
      state.studentMessageStatus[action.payload.studentId] = "ready";
    },
    setStudentMessageLoading(state, action: PayloadAction<string>) {
      state.studentMessageStatus[action.payload] = "loading";
    },
    setDashboardError(state, action: PayloadAction<string>) {
      state.status = "error";
      state.error = action.payload;
    },
    resetDashboard() {
      return initialState;
    },
  },
});

function markReadyWhenLoaded(state: DashboardState) {
  if (Object.values(state.loaded).every(Boolean)) {
    state.status = "ready";
  }
}

export const {
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
  setStudentMessageLoading,
  setStudentMessages,
  setStudents,
  setSubscriptionPlans,
  setUsageLogs,
} = dashboardSlice.actions;

export const dashboardReducer = dashboardSlice.reducer;
