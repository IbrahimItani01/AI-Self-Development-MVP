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

- Modern animated public landing page at `/` with student-centered product narrative, Telegram companion preview, school dashboard preview, workflow, and safety positioning
- Firebase email/password dashboard login at `/login`
- Organization registration at `/register` and plan selection at `/register/plan`
- Server session cookie creation at `/api/auth/session`
- Session logout at `/api/auth/logout`
- Protected dashboard routes under `/dashboard`
- Dashboard pages:
  - `/dashboard`
  - `/dashboard/students`
  - `/dashboard/students/[studentId]`
  - `/dashboard/invites`
  - `/dashboard/check-ins`
  - `/dashboard/follow-ups`
  - `/dashboard/billing`
  - `/dashboard/settings`
- Invite code creation and activation/deactivation
- Admin student account deletion with organization-scoped data cleanup
- Telegram webhook at `/api/telegram/webhook`
- Telegram `/start`, `/help`, `/checkin`, `/plan`, `/reset`
- Telegram `/delete` student account deletion confirmation flow
- Telegram invite code onboarding
- AI-generated growth plan
- AI chat reply and conversation summary
- Shared AI response policy with grade-aware tone and output token caps
- Weekly check-in flow with summary and suggested next step
- Follow-up classification and flag creation
- Follow-up status updates from dashboard
- Stripe Checkout session creation
- Stripe Billing Portal session creation
- Stripe webhook processing and duplicate-event logging
- Firestore-backed Pro subscription plan configuration, student limits, and monthly token limits
- AI usage logging and estimated cost tracking
- Firestore rules and index definitions
- Demo seed script
- Telegram webhook setup script
- Manual weekly check-in reminder script
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
- Hosted scheduled reminders instead of manual script
- More robust follow-up deduplication
- Formal tests for service modules and API routes
- Deployment-specific instructions for Vercel and Firebase Hosting

## Tech Stack

- Next.js App Router
- React
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
  - Dashboard navigation, login form, billing actions, stat cards.
- `src/components/landing`
  - Public landing page UI.
- `src/components/ui`
  - Simple shared UI primitives.
- `src/lib/firebase`
  - Firebase client and Admin SDK setup.
- `src/lib/auth`
  - Server-side admin session/org context helpers.
- `src/lib/db`
  - Firestore data-access modules. Keep Firestore queries here where practical.
- `src/lib/telegram`
  - Bot sending/parsing and Telegram flow handlers.
- `src/lib/ai`
  - AI prompts and AI service functions.
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
  - Organization invite codes for Telegram student onboarding.
- `students`
  - Telegram-linked student records scoped to an organization, including Telegram profile photo file IDs when available.
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
  - Non-diagnostic human follow-up signals.
- `usageLogs`
  - AI model, tokens, request type, estimated cost.
- `stripeEvents`
  - Processed Stripe webhook event IDs for idempotency.
- `botSessions`
  - Server-only Telegram flow state.

Security model:

- Students do not access Firestore directly in V1.
- Bot/API/server scripts use Firebase Admin SDK.
- Dashboard access is scoped by `organizationAdmins/{firebaseUid}.organizationId`.
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
  - 30-day progress definition
  - Check-in cadence through fixed Telegram inline button values
  - AI growth plan generation
  - Save growth plan and mark onboarding complete
- Chat flow:
  - Subscription access is checked before AI calls.
  - Student message is saved.
  - Recent messages and running summary are sent to AI.
  - Assistant reply is saved and sent back.
  - Conversation summary and follow-up classification run.
- Check-in flow:
  - Progress
  - Difficulty
  - Insight
  - Next step
  - AI summary and suggested next step
  - Optional follow-up flag
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
  - Adds `organizationId` and `plan: "pro"` metadata.
- Billing portal endpoint: `POST /api/stripe/create-billing-portal-session`
  - Requires authenticated school admin.
  - Requires linked Stripe customer ID.
- Webhook endpoint: `POST /api/stripe/webhook`
  - Verifies Stripe signature with `STRIPE_WEBHOOK_SECRET`.
  - Stores event IDs in `stripeEvents`.
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
- Follow-up flags appear and can be reviewed/closed.
- Stripe Checkout endpoint returns a session URL when Stripe env vars are configured.
- Stripe webhook updates organization subscription fields.

## Known Limitations / TODOs

- No super-admin dashboard in V1.
- Weekly reminders are a manual script, not a hosted scheduled function.
- Monthly AI usage limits are logged but not enforced.
- Follow-up flag deduplication is basic; repeated sensitive messages may create multiple flags.
- Formal automated tests are not yet implemented.
- Demo seed depends on configured Firebase Admin credentials.
- Dashboard is server-rendered and simple; richer loading/error states can be added later.
- Billing portal only works after a Stripe customer is linked.
- Raw conversation context exists for demo review but should stay secondary to summaries.
- Deployment instructions are generic and deployment-neutral.

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
