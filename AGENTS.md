# AGENTS.md

Main project context for Codex and future coding agents working in this repository.

Every agent must read this file before making changes. Update this file whenever you add, remove, or significantly change a feature, route, service, data model, integration, or operational workflow.

## Project Overview

- Project name: AI Student Development Companion
- Product format:
  - Telegram bot for students
  - Lightweight web dashboard for schools/admins
  - Firebase backend/database/auth
  - Stripe subscription tracking
  - AI-powered reflection, check-ins, summaries, growth plans, and follow-up flags
- Current repository state:
  - Next.js App Router TypeScript app
  - Tailwind UI
  - Firebase Admin SDK for server-side data access
  - Firebase client Auth for dashboard login
  - Telegram webhook endpoint
  - Stripe Checkout, Billing Portal, and webhook endpoints
  - OpenAI-compatible AI service abstraction with fallback behavior

## Product Purpose

- Help schools support student development at scale.
- Support student reflection, clarity, habits, confidence, academic direction, career direction, goal setting, and progress.
- Give school admins visibility into engagement, progress summaries, weekly check-ins, usage, and cautious human follow-up signals.
- The AI supports humans. It does not replace school counselors, mentors, teachers, or administrators.

## Safety And Positioning Boundaries

- Do not position this product as therapy, medical support, diagnosis, treatment, crisis support, or a replacement for counselors.
- Do not add UI copy, prompts, docs, or bot replies that imply clinical or medical support.
- Use language such as:
  - student development
  - reflection
  - clarity
  - habits
  - confidence
  - progress
  - academic/career direction
  - may benefit from mentor/counselor follow-up
- Student data must be treated carefully.
- Prefer summaries and school-appropriate support signals over exposing raw conversations.
- Raw conversation review, where present for demo purposes, must remain responsibly framed.

## Main User Roles

- Platform Owner / Developer
  - Creates demo organizations/admin mappings through seed script or Firestore.
  - No complex super-admin dashboard exists in V1.
- School Admin / Counselor
  - Logs into the dashboard with Firebase Auth.
  - Can only access their organization.
  - Views students, summaries, check-ins, follow-up flags, invite codes, billing status, and usage.
- Student
  - Uses the Telegram bot only.
  - Joins with an invite code.
  - Completes onboarding.
  - Selects a development focus area.
  - Chats with the AI companion.
  - Completes weekly check-ins.
  - Receives practical next steps.

## Current Implemented Features

- Modern animated public landing page at `/` with student-centered product narrative, Telegram companion preview, school dashboard preview, feature grid, Pro pricing card, testimonials, FAQ, workflow, safety positioning, and footer
- Firebase email/password dashboard login at `/login`
- Organization registration at `/register` and plan selection at `/register/plan`
- Organization account deletion from `/dashboard/settings` with custom in-app confirmation, full organization-scoped data cleanup, and Firebase Auth admin deletion
- Server session cookie creation at `/api/auth/session`
- Session logout at `/api/auth/logout`
- Protected dashboard routes under `/dashboard`
- Redux Toolkit dashboard state store with persistent client-side Firebase Firestore listeners for real-time organization, student, invite, check-in, follow-up, usage, plan, growth-plan, and conversation updates
- Dashboard login handoff shows a live-data loading animation while the Redux store opens Firestore subscriptions
- Dashboard list pages for students, invite codes, check-ins, and follow-up flags include client-side search, filtering, sorting, empty states, and live counts
- Shared button primitives support inline loading spinners for async login, registration, billing, invite, follow-up, logout, and destructive confirmation actions
- Dashboard pages:
  - `/dashboard`
  - `/dashboard/students`
  - `/dashboard/students/[studentId]`
  - `/dashboard/invites`
  - `/dashboard/check-ins`
  - `/dashboard/follow-ups`
  - `/dashboard/billing`
  - `/dashboard/settings`
- Organization-prefixed invite code generation and activation/deactivation
- Admin student account deletion with custom in-app confirmation and organization-scoped data cleanup
- Telegram webhook at `/api/telegram/webhook`
- Telegram `/start`, `/help`, `/checkin`, `/plan`, `/reset`
- Telegram `/delete` student account deletion confirmation flow
- Telegram invite code onboarding
- Telegram normal chat message character limit before AI calls
- AI-generated growth plan
- AI chat reply with function-tool human follow-up flagging and conversation summary
- Shared AI response policy with grade-aware tone and output token caps
- Context-aware Telegram onboarding and check-in prompts with plain-text AI summary and suggested next step
- Automated cadence-based check-in reminders and missed-check-in low-engagement follow-up flags via `/api/cron/check-ins`
- Follow-up classification and flag creation
- Follow-up search, filtering, sorting, and status updates from dashboard
- Stripe Checkout session creation
- Stripe Checkout per-session branding matched to the shared app palette
- Stripe Billing Portal session creation
- Stripe webhook processing and duplicate-event logging
- Firestore-backed Pro subscription plan configuration, student limits, and monthly token limits
- AI usage logging and estimated cost tracking
- Firestore rules and index definitions
- Demo seed script
- Telegram webhook setup script
- Check-in automation script alias for manual runs
- Vercel Cron configuration for daily check-in automation
- README setup and operations documentation

## Planned V1 Features

These are either implemented with simple V1 behavior or structured for future hardening:

- Organization-based access control
- Student access gated by organization subscription status
- Invite code lifecycle management
- School-facing summaries before raw messages
- Usage-based monthly limits
- Better dashboard loading/error states for client-side interactions
- More complete billing portal behavior
- More robust follow-up deduplication
- Formal tests for service modules and API routes
- Deployment-specific instructions for Vercel and Firebase Hosting

## Tech Stack

- Next.js App Router
- React
- Redux Toolkit
- React Redux
- TypeScript
- Tailwind CSS
- Firebase Authentication
- Firestore
- Firebase Admin SDK
- Telegram Bot API webhook
- Stripe Checkout, Billing, and Webhooks
- OpenAI SDK
- Zod
- date-fns
- lucide-react icons
- tsx for scripts

## Folder Structure Overview

- `src/app`
  - Next.js App Router pages and API route handlers.
- `src/app/api/auth`
  - Firebase ID token to server session cookie and logout.
- `src/app/api/telegram/webhook`
  - Telegram webhook entrypoint.
- `src/app/api/stripe`
  - Checkout, Billing Portal, and Stripe webhook handlers.
- `src/app/dashboard`
  - Protected school dashboard pages.
- `src/components/dashboard`
  - Dashboard navigation, login form, billing actions, stat cards, real-time dashboard provider, and Redux-backed dashboard page components.
- `src/components/landing`
  - Public landing page UI.
- `src/components/ui`
  - Simple shared UI primitives.
- `src/lib/firebase`
  - Firebase client and Admin SDK setup.
- `src/lib/redux`
  - Redux store, dashboard slice, typed hooks, and selectors for client-side live dashboard state.
- `src/lib/auth`
  - Server-side admin session/org context helpers.
- `src/lib/db`
  - Firestore data-access modules. Keep Firestore queries here where practical.
- `src/lib/telegram`
  - Bot sending/parsing and Telegram flow handlers.
- `src/lib/ai`
  - AI prompts and AI service functions.
- `src/lib/check-ins`
  - Scheduled check-in automation and cadence-based missed-check-in logic.
- `src/lib/stripe`
  - Stripe client and webhook processing.
- `src/lib/utils`
  - Shared formatting and helper utilities.
- `src/types`
  - Main TypeScript domain models.
- `scripts`
  - Seed, Telegram webhook setup, and reminder scripts.
- `firestore.rules`
  - Firestore security rules.
- `firestore.indexes.json`
  - Firestore composite indexes.

## Important Development Rules

- Read this file before changing code.
- Update this file when adding, removing, or significantly changing features or architecture.
- Do not make large architectural changes without documenting the reason in this file and, if appropriate, the README.
- Use the shared Tailwind palette tokens for UI color work instead of one-off page hex values:
  - `ink` `#1F2320`
  - `surface` `#FFFFFF`
  - `canvas` `#F7F4EE`
  - `muted` `#E8E3DA`
  - `primary` `#1F6F68`
  - `primaryDark` `#174F4A`
  - `sage` `#6F8674`
  - `wine` `#8B3A62`
  - `gold` `#B9874C`
  - `info` `#2A7AB5`
  - `success` `#2F7D55`
  - `warning` `#B7791F`
  - `danger` `#C2413B`
- Keep TypeScript strict and readable.
- Keep business logic out of UI components when practical.
- Keep external service concerns isolated:
  - Telegram logic in `src/lib/telegram`
  - AI logic in `src/lib/ai`
  - Stripe logic in `src/lib/stripe`
  - Firestore queries in `src/lib/db`
- Use Zod for route input validation where useful.
- Validate and verify webhooks:
  - Telegram secret header when configured
  - Stripe webhook signature
- Scope every dashboard query by `organizationId`.
- Do not allow one school admin to access another school organization.
- Never expose secrets to client code.
- Never commit `.env`, `.env.local`, service account files, API keys, Stripe secrets, Telegram bot token, OpenAI keys, or private keys.
- Do not delete or rewrite student data when subscription access is inactive.
- Avoid sending full conversation history to AI; use running summaries and recent messages.
- Add usage logging after AI calls.
- Prefer cautious, non-diagnostic follow-up language.

## Environment Variables Overview

Public client env vars:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Server-only env vars:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `CRON_SECRET`
- `OPENAI_API_KEY`
- `AI_MODEL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_PRO`
- `PLATFORM_OWNER_EMAIL`

Rules:

- Only `NEXT_PUBLIC_*` values may be used in client components.
- Keep all tokens, private keys, and provider secrets server-side.
- See `.env.example` for the complete template.

## Firebase / Firestore Data Model Summary

Collections:

- `organizations`
  - School organization, plan, access status, Stripe IDs, billing contact fields, student limit, and monthly token limit. Stripe checkout currently uses one paid plan: `pro`.
- `subscriptionPlans`
  - Firestore-backed plan cards, annual price, Stripe price ID, feature list, student limit, monthly token limit, active flag, and sort order.
- `organizationAdmins`
  - Maps Firebase Auth users to an organization and admin role.
- `inviteCodes`
  - Globally unique organization-prefixed invite codes for Telegram student onboarding. Dashboard-created codes are generated server-side from the organization name plus a random suffix and must not overwrite an existing code.
- `students`
  - Telegram-linked student records scoped to an organization, including Telegram profile photo file IDs, selected check-in cadence, last check-in timestamp, reminder timestamp, and missed-check-in flag timestamp when available.
- `studentOnboarding`
  - Onboarding answers and completion timestamp.
- `conversations`
  - One or more student conversations with running summaries.
- `messages`
  - Student and assistant messages.
- `checkIns`
  - Weekly check-in answers, AI summary, next step, follow-up recommendation.
- `growthPlans`
  - Student focus area, goal, weekly actions, prompt, next step.
- `followUpFlags`
  - Non-diagnostic human follow-up signals. Creating a follow-up flag marks the student as `flagged`; closing or reviewing flags clears the student back to `active` only when no open follow-up flags remain for that student.
- `usageLogs`
  - AI model, tokens, request type, estimated cost.
- `stripeEvents`
  - Processed Stripe webhook event IDs for idempotency.
- `organizationDeletionEvents`
  - Server-only anonymized aggregate deletion events retained for future platform-owner insights. Do not store organization names, admin emails, student names, message content, or other identifying school/student data here.
- `botSessions`
  - Server-only Telegram flow state.

Security model:

- Students do not access Firestore directly in V1.
- Bot/API/server scripts use Firebase Admin SDK.
- Dashboard access is scoped by `organizationAdmins/{firebaseUid}.organizationId`.
- Dashboard client views subscribe directly to organization-scoped Firestore data with Firebase Auth and security rules; server route/layout checks still gate dashboard access through the session cookie.
- Public reads are denied.

## Telegram Bot Flow Summary

- Entry endpoint: `POST /api/telegram/webhook`
- Secret verification:
  - Uses `x-telegram-bot-api-secret-token` when `TELEGRAM_WEBHOOK_SECRET` is set.
- Commands:
  - `/start`
  - `/help`
  - `/checkin`
  - `/plan`
  - `/reset`
  - `/delete`
- New student flow:
  - Student sends `/start` or invite code.
  - Invite code is validated and consumed.
  - Student record is created or linked by Telegram user ID and Telegram profile photo metadata is stored when available.
  - Onboarding session begins.
- Onboarding flow:
  - Preferred username/name
  - Lebanon-focused grade selection through Telegram inline buttons
  - Focus area
  - Main challenge
  - Student-defined short-term progress definition, allowing weekly or multi-week goals
  - Check-in cadence through fixed Telegram inline button values
  - AI growth plan generation
  - Save growth plan and mark onboarding complete
- Chat flow:
  - Subscription access is checked before AI calls.
  - Normal chat messages over the configured code-level character limit are rejected before storage or AI usage.
  - Student message is saved.
  - Recent messages and running summary are sent to AI.
  - The chat AI can request the `flag_human_follow_up` tool when the student asks for human help or shares a concern that may benefit from mentor/counselor follow-up.
  - A successful tool request creates a `followUpFlags` dashboard record with cautious school-facing wording and marks the student as flagged.
  - Assistant reply is saved and sent back.
  - Conversation summary runs after the reply, and the separate follow-up classifier remains a fallback when the chat AI did not request the tool.
- Check-in flow:
  - Progress, difficulty, insight, and next-step questions are context-aware and reference the student's focus area, current goal, and earlier answers where useful.
  - AI summary and suggested next step are generated as strict JSON and saved/rendered as clean plain text, without markdown labels or asterisks.
  - Optional follow-up flag
- Scheduled check-in automation:
  - Vercel Cron calls `GET /api/cron/check-ins` daily with `Authorization: Bearer CRON_SECRET`.
  - The job skips inactive/canceled/past-due organizations.
  - Cadence is read from `students.checkInCadence`, with onboarding-answer and weekly fallbacks.
  - Due students receive a Telegram reminder to send `/checkin`.
  - Students still missing the check-in after a 2-day grace period get one `low_engagement` follow-up flag for that due window.
- Account deletion flow:
  - `/delete` asks for explicit Telegram button confirmation.
  - Confirmation deletes the student record and associated onboarding, growth plan, messages, conversations, check-ins, follow-up flags, usage logs, and bot session.
  - Telegram `my_chat_member` updates with private-chat `kicked`/`left` status also trigger deletion when the student stops or blocks the bot.
  - Telegram does not provide a reliable webhook when a student only clears chat history, so deletion must use `/delete`, dashboard removal, or a stop/block event that Telegram actually sends.

## Stripe Subscription Flow Summary

- Checkout endpoint: `POST /api/stripe/create-checkout-session`
  - Requires authenticated school admin.
  - Requires matching `organizationId`.
  - Uses `STRIPE_PRICE_ID_PRO`.
  - Applies `STRIPE_CHECKOUT_BRANDING` from `src/lib/stripe/server.ts` so Checkout uses the app palette.
  - Adds `organizationId` and `plan: "pro"` metadata.
- Billing portal endpoint: `POST /api/stripe/create-billing-portal-session`
  - Requires authenticated school admin.
  - Requires linked Stripe customer ID.
  - Billing Portal color and shape customization is managed in Stripe Dashboard account Branding settings.
- Webhook endpoint: `POST /api/stripe/webhook`
  - Verifies Stripe signature with `STRIPE_WEBHOOK_SECRET`.
  - Stores event IDs in `stripeEvents`.
  - Subscription current period end is read from the first subscription item, with a top-level fallback for older Stripe payloads.
  - Subscription webhook events that map to internal `inactive` do not demote an organization; Checkout and invoice success events are the source of activation because Stripe webhooks can arrive out of order.
  - Handles:
    - `checkout.session.completed`
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `invoice.paid`
    - `invoice.payment_failed`
- Organization status mapping:
  - `active` -> `active`
  - `trialing` -> `trial`
  - `past_due` / `unpaid` -> `past_due`
  - `canceled` / `incomplete_expired` -> `canceled`

## Organization Account Deletion Flow Summary

- Dashboard entrypoint: `/dashboard/settings`
- School admins must type the exact organization name before deleting.
- If the organization has a linked Stripe subscription or customer, the server action cancels the subscription and deletes the Stripe customer before cleanup.
- Cleanup deletes organization-scoped documents from:
  - `inviteCodes`
  - `students`
  - `studentOnboarding`
  - `conversations`
  - `messages`
  - `checkIns`
  - `growthPlans`
  - `followUpFlags`
  - `usageLogs`
  - `botSessions`
  - `organizationAdmins`
  - `organizations`
- Cleanup deletes Firebase Auth users listed in the organization's `organizationAdmins`.
- Cleanup removes the linked Stripe customer record when Stripe is configured.
- The current dashboard session cookie is cleared and the user is redirected to `/login`.
- A minimal `organizationDeletionEvents` aggregate is retained for future product-owner analytics.
- Stripe subscription update webhooks intentionally no-op when the organization document has already been deleted, so late webhooks cannot recreate a partial organization record.
- There is no Firebase Auth trigger in V1; the shared cleanup service can be reused by a future Cloud Functions `onDelete` trigger if Firebase Functions are introduced.

## AI Behavior And Safety Boundaries

- Main AI functions live in `src/lib/ai/index.ts`.
- Prompt boundaries live in `src/lib/ai/prompts.ts`.
- Supported functions:
  - `generateGrowthPlan`
  - `generateChatReply`
  - `summarizeConversation`
  - `generateCheckInSummary`
  - `classifyFollowUpNeed`
  - `estimateUsageCost`
- `generateChatReply` may return a `flag_human_follow_up` tool request. The Telegram handler is responsible for executing that request by creating the existing `followUpFlags` document; the AI service does not write dashboard data directly.
- The AI should:
  - Be supportive, practical, concise, and school-appropriate.
  - Ask one focused question at a time.
  - Encourage small next steps and reflection.
  - Recommend trusted adult/school counselor follow-up when appropriate.
  - Adapt tone to the student's grade level:
    - Grades 1-3: very simple, warm, short language; at most one light emoji when appropriate.
    - Grades 4-6: simple, friendly, concrete language.
    - Grades 7-9: clear, respectful, practical language.
    - Grades 10+: mature, respectful, simple professional language.
  - Keep responses brief to control token usage.
- The AI must not:
  - Diagnose.
  - Treat.
  - Present itself as therapy.
  - Provide medical advice.
  - Replace counselors or school support staff.
  - Use playful language or emojis for sensitive concerns.
- Follow-up classifier output must remain strict JSON:

```json
{
  "followUpRecommended": true,
  "severity": "low",
  "title": "Short title",
  "summary": "School-appropriate summary",
  "recommendedAction": "Suggested human follow-up"
}
```

## Testing And Validation Checklist

Run before handing off significant changes:

- `npm run lint`
- `npm run typecheck`
- `npm run build`

Manual checks:

- Landing page loads at `/`.
- Login page loads at `/login`.
- Unauthenticated `/dashboard` redirects to `/login`.
- Seed script starts and fails clearly if Firebase Admin env vars are missing.
- With Firebase configured, `npm run seed:demo` creates Cedar Learning School data.
- Dashboard pages render after signing in as seeded admin.
- Invite code can be created and toggled.
- Telegram `/start` accepts invite code.
- Onboarding completes and saves growth plan.
- Normal Telegram message saves conversation and returns AI/fallback reply.
- `/checkin` completes four-step flow and saves check-in.
- `npm run checkins:run-automation` sends due reminders and creates missed-check-in follow-up flags for overdue seeded/adjusted data.
- Follow-up flags appear and can be reviewed/closed.
- Stripe Checkout endpoint returns a session URL when Stripe env vars are configured.
- Stripe webhook updates organization subscription fields.

## Known Limitations / TODOs

- No super-admin dashboard in V1.
- Monthly AI usage limits are logged but not enforced.
- Follow-up flag deduplication is basic; repeated sensitive messages may create multiple flags.
- Formal automated tests are not yet implemented.
- Demo seed depends on configured Firebase Admin credentials.
- Dashboard is server-rendered and simple; richer loading/error states can be added later.
- Billing portal only works after a Stripe customer is linked.
- Raw conversation context exists for demo review but should stay secondary to summaries.
- Deployment instructions are generic and deployment-neutral.
- Organization deletion is a direct dashboard server action in V1, not a background queue or Firebase Functions trigger.

## Instructions For Future Agents

- Read `AGENTS.md` and `README.md` before making code changes.
- Inspect the current git status before editing.
- Preserve user changes and do not revert unrelated work.
- Keep changes scoped to the user request.
- Prefer existing project patterns and service boundaries.
- Add or update Zod validation for new API inputs.
- Add or update TypeScript domain types when data shapes change.
- Update Firestore rules/indexes if new collections or query patterns are added.
- Update `.env.example` when adding environment variables.
- Update README setup instructions when operational workflows change.
- Update this file when adding, removing, or significantly changing features.
- Document the reason for any large architectural change.
- Do not commit secrets or generated local artifacts.
- Treat student data carefully in code, logs, prompts, and UI.
- When changing student deletion behavior, keep dashboard deletion and Telegram self-deletion consistent and organization-scoped.
