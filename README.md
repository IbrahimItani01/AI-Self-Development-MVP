# AI Student Development Companion

![AI Student Development Companion product poster](assets/project-poster.png)

A school-based full-stack MVP that pairs a Telegram student reflection companion with a real-time school admin dashboard.

The product helps schools support student development at scale through reflection, clarity, habits, confidence, academic/career direction, check-ins, growth plans, and cautious human follow-up signals.

> This is not therapy, diagnosis, medical support, crisis support, or a replacement for counselors. The AI supports humans; it does not replace them.

## Highlights

| Area | What is implemented |
| --- | --- |
| Student channel | Telegram bot with invite-code onboarding, grade-aware AI replies, growth plans, weekly check-ins, and account deletion |
| School dashboard | Protected Next.js dashboard with live Firestore data, search, filtering, sorting, billing, settings, and follow-up workflows |
| AI layer | OpenAI-compatible service abstraction, structured outputs, function-tool follow-up requests, summaries, fallback behavior, token/cost tracking |
| Data and auth | Firebase Auth, session cookies, Firebase Admin SDK, organization-scoped Firestore data, rules, indexes, and cleanup services |
| Billing | Stripe Checkout, Billing Portal, webhook idempotency, subscription status mapping, Firestore-backed Pro plan configuration |
| Automation | Vercel Cron check-in reminders and low-engagement follow-up flags based on student cadence |

## Product Flow

```text
School admin creates invite code
        |
        v
Student joins through Telegram
        |
        v
Onboarding -> focus area -> goal -> cadence -> AI growth plan
        |
        v
Student chats and completes check-ins
        |
        v
AI creates summaries, next steps, and cautious follow-up signals
        |
        v
School dashboard updates in real time for human review
```

## Core Features

### Public and Admin Web App

- Modern public landing page at `/`
- Firebase email/password login at `/login`
- Organization registration at `/register`
- Plan selection at `/register/plan`
- Protected dashboard routes under `/dashboard`
- Responsive dashboard shell with desktop sidebar, mobile top bar, mobile drawer, and scrollable tables
- Organization account deletion from `/dashboard/settings`

### Dashboard Pages

```text
/dashboard
/dashboard/students
/dashboard/students/[studentId]
/dashboard/invites
/dashboard/check-ins
/dashboard/follow-ups
/dashboard/billing
/dashboard/settings
```

Dashboard capabilities include:

- Live overview cards for students, follow-ups, check-ins, token usage, estimated AI cost, plan, and access status
- Student table with profile photo, Telegram username, grade/cohort, focus area, status, last interaction, check-in count, and follow-up state
- Invite code generation, activation, and deactivation
- Weekly check-in review with AI summary and suggested next step
- Follow-up flag search, filtering, sorting, review, close, and reopen actions
- Billing actions for Stripe Checkout and Billing Portal
- Custom destructive confirmation flows for student and organization deletion

### Telegram Bot

Entry point:

```text
POST /api/telegram/webhook
```

Supported commands:

```text
/start
/help
/checkin
/plan
/reset
/delete
```

Student flow:

- Student joins with an organization-prefixed invite code
- Onboarding stores preferred name, grade, focus area, challenge, goal/progress definition, and check-in cadence
- AI generates a growth plan with practical weekly actions
- Student can chat normally with character-limit protection before AI calls
- Student can complete context-aware check-ins through Telegram
- Student can delete their own account with `/delete`
- Telegram stop/block events trigger deletion when Telegram provides the webhook event

### AI Behavior

AI functions live in `src/lib/ai`.

Implemented AI capabilities:

- `generateGrowthPlan`
- `generateChatReply`
- `summarizeConversation`
- `generateCheckInSummary`
- `classifyFollowUpNeed`
- `estimateUsageCost`

The AI layer includes:

- Grade-aware tone and output limits
- Shared prompt policy boundaries
- Running conversation summaries instead of sending full history
- Strict JSON check-in summaries
- AI usage logging and estimated cost tracking
- Deterministic fallback behavior when OpenAI is not configured
- Function-tool follow-up requests through `flag_human_follow_up`

Safety boundaries:

- No diagnosis
- No therapy positioning
- No medical advice
- No replacement of counselors, mentors, teachers, or administrators
- Cautious language such as "may benefit from mentor/counselor follow-up"

### Human Follow-Up Signals

Follow-up flags can be created from:

- AI chat function-tool requests
- Fallback follow-up classifier
- Check-in summary recommendations
- Missed check-in automation

Flags are intentionally non-diagnostic and school-facing. Closing or reviewing flags clears a student back to `active` only when there are no open follow-up flags for that student.

### Check-In Automation

The app includes a Vercel Cron job:

```text
0 6 * * * -> /api/cron/check-ins
```

The daily automation:

- Skips inactive, canceled, and past-due organizations
- Reads each student's selected check-in cadence
- Sends Telegram reminders when students are due
- Applies a 2-day grace period
- Creates one `low_engagement` follow-up flag per due window

Manual run:

```bash
npm run checkins:run-automation
```

## Tech Stack

| Layer | Stack |
| --- | --- |
| Framework | Next.js App Router, React, TypeScript |
| Styling | Tailwind CSS, lucide-react icons |
| State | Redux Toolkit, React Redux, Firebase client listeners |
| Auth | Firebase Authentication, server session cookies |
| Database | Firestore, Firebase Admin SDK |
| Bot | Telegram Bot API webhooks |
| AI | OpenAI SDK with service abstraction and fallbacks |
| Billing | Stripe Checkout, Billing Portal, Webhooks |
| Validation | Zod |
| Automation | Vercel Cron, tsx scripts |

## Architecture

```text
src/app
  Next.js App Router pages and API routes

src/app/api/auth
  Firebase ID token to server session cookie and logout

src/app/api/telegram/webhook
  Telegram webhook entrypoint

src/app/api/stripe
  Checkout, Billing Portal, and Stripe webhook routes

src/app/api/cron/check-ins
  Scheduled check-in automation endpoint

src/app/dashboard
  Protected school dashboard routes

src/components/dashboard
  Dashboard navigation, providers, page components, billing actions, forms, and stat cards

src/components/landing
  Public landing page UI

src/components/ui
  Shared UI primitives

src/lib/auth
  Server-side admin session and organization context helpers

src/lib/firebase
  Firebase client and Admin SDK setup

src/lib/redux
  Dashboard slice, selectors, hooks, and live state store

src/lib/db
  Firestore data access modules

src/lib/telegram
  Bot parsing, sending, and flow handlers

src/lib/ai
  AI prompts, model calls, summaries, classifiers, and usage estimates

src/lib/check-ins
  Cadence-based reminder and missed-check-in logic

src/lib/stripe
  Stripe client and webhook processing

scripts
  Demo seed, Telegram webhook setup, and reminder scripts
```

## Data Model Summary

Main Firestore collections:

```text
organizations
subscriptionPlans
organizationAdmins
inviteCodes
students
studentOnboarding
conversations
messages
checkIns
growthPlans
followUpFlags
usageLogs
stripeEvents
organizationDeletionEvents
botSessions
```

Security model:

- Public reads are denied
- Dashboard reads are scoped by `organizationAdmins/{firebaseUid}.organizationId`
- Students do not access Firestore directly in V1
- Telegram, Stripe, AI, cron, and deletion workflows use Firebase Admin SDK
- Stripe events and bot sessions are server-only
- Usage logs are readable by organization admins but written server-side

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Client-visible variables:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Server-only variables:

```bash
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
CRON_SECRET=

OPENAI_API_KEY=
AI_MODEL=gpt-4o-mini

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PRO=

PLATFORM_OWNER_EMAIL=admin@example.com
```

Never expose server-only secrets to client components.

## Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
Landing page: http://localhost:3000
Login:        http://localhost:3000/login
Dashboard:    http://localhost:3000/dashboard
```

## Firebase Setup

1. Create a Firebase project.
2. Enable Firebase Authentication with email/password.
3. Create a school admin user in Firebase Auth.
4. Create a Firebase service account.
5. Add Firebase Admin credentials to `.env.local`.
6. Set `PLATFORM_OWNER_EMAIL` to the admin email.
7. Seed demo data.

```bash
npm run seed:demo
```

The seed script creates:

- `subscriptionPlans/pro`
- Organization: `Cedar Learning School`
- Admin mapping for `PLATFORM_OWNER_EMAIL` when the Firebase Auth user exists
- Invite code: `CEDARS2026`
- Demo students
- Demo check-ins
- Demo growth plans
- Demo follow-up flag
- Demo usage log

If the Firebase Auth user does not exist yet, the script uses a placeholder UID. Create the user and rerun the seed, or set `PLATFORM_OWNER_UID`.

Deploy Firestore rules and indexes:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## Telegram Setup

1. Create a Telegram bot with BotFather.
2. Add `TELEGRAM_BOT_TOKEN` to `.env.local`.
3. Deploy the app or expose local development with a public HTTPS tunnel.
4. Set `NEXT_PUBLIC_APP_URL` to the public URL.
5. Set the webhook.

```bash
npm run telegram:set-webhook
```

Manual webhook URL format:

```text
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=<APP_URL>/api/telegram/webhook
```

Test with:

```text
/start
CEDARS2026
```

## Stripe Setup

1. Create one Stripe subscription product/price for the Pro plan.
2. Set `STRIPE_SECRET_KEY`.
3. Set `STRIPE_PRICE_ID_PRO`.
4. Configure Stripe Branding settings to match the app palette.
5. Seed or create `subscriptionPlans/pro` in Firestore.
6. Add the webhook endpoint.

```text
<APP_URL>/api/stripe/webhook
```

Subscribe to:

```text
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.paid
invoice.payment_failed
```

Then set:

```bash
STRIPE_WEBHOOK_SECRET=
```

Stripe Checkout sessions include metadata:

```json
{
  "organizationId": "org_id",
  "plan": "pro"
}
```

Subscription webhook events are stored in `stripeEvents` for idempotency.

## Useful Scripts

```bash
npm run dev
npm run seed:demo
npm run telegram:set-webhook
npm run telegram:send-checkins
npm run checkins:run-automation
npm run typecheck
npm run lint
npm run build
```

`telegram:send-checkins` is kept as a backward-compatible alias for the check-in automation script.

## Validation Checklist

Run before handing off significant changes:

```bash
npm run lint
npm run typecheck
npm run build
```

Manual checks:

- Landing page loads at `/`
- Login page loads at `/login`
- Unauthenticated `/dashboard` redirects to `/login`
- Seed script starts and fails clearly if Firebase Admin env vars are missing
- `npm run seed:demo` creates Cedar Learning School data when Firebase is configured
- Dashboard pages render after signing in as seeded admin
- Invite code can be created and toggled
- Telegram `/start` accepts invite code
- Onboarding completes and saves growth plan
- Normal Telegram message saves conversation and returns AI/fallback reply
- `/checkin` completes the four-step flow and saves a check-in
- `npm run checkins:run-automation` sends due reminders and creates overdue follow-up flags
- Follow-up flags appear and can be reviewed or closed
- Stripe Checkout endpoint returns a session URL when Stripe env vars are configured
- Stripe webhook updates organization subscription fields

## Organization and Student Deletion

Dashboard organization deletion:

- Entry point: `/dashboard/settings`
- Requires typing the exact organization name
- Cancels linked Stripe subscription and deletes Stripe customer when configured
- Deletes organization-scoped documents across invites, students, onboarding, plans, conversations, messages, check-ins, flags, usage logs, bot sessions, admins, and organization records
- Deletes Firebase Auth users mapped as admins for the organization
- Clears the current dashboard session cookie
- Retains only anonymized aggregate deletion events in `organizationDeletionEvents`

Student deletion:

- Admins can delete students from the dashboard
- Students can request deletion through Telegram `/delete`
- Telegram private chat `kicked`/`left` events also trigger deletion when Telegram provides the event
- Dashboard and Telegram deletion paths use organization-scoped cleanup

## Product Boundaries

The MVP intentionally does not include:

- Super-admin dashboard
- Parent portal
- WhatsApp integration
- Mobile app
- SIS integrations
- Clinical, medical, therapy, diagnosis, or crisis-support functionality

The current architecture keeps external concerns isolated so these can be added later through separate modules and routes.

## Current Limitations

- Monthly AI usage limits are logged but not enforced yet
- Follow-up flag deduplication is basic
- Formal automated tests are not yet implemented
- Demo seed depends on configured Firebase Admin credentials
- Billing Portal only works after a Stripe customer is linked
- Deployment instructions are generic and deployment-neutral
- Organization deletion is a direct dashboard server action in V1, not a background queue

## Agent Context

Developers and coding agents must read `AGENTS.md` before making changes.

Update `AGENTS.md` whenever you add, remove, or significantly change:

- Features
- Routes
- Services
- Data models
- Integrations
- Operational workflows
- Safety positioning
