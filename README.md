# AI Student Development Companion

School-based V1 MVP for a Telegram student development companion with a lightweight school dashboard.

This product is for student development, reflection, clarity, habits, confidence, academic/career direction, and progress support. It is not therapy, medical support, diagnosis, crisis support, or a replacement for counselors. The AI supports humans; it does not replace them.

## Agent context

Developers and coding agents should read `AGENTS.md` before working on this project. It contains the current product context, architecture notes, safety boundaries, data model summary, and maintenance rules. Update `AGENTS.md` whenever a feature, integration, data model, or major workflow changes.

## What is included

- Next.js App Router dashboard and public landing page
- Firebase Authentication dashboard login with session cookies
- Organization registration flow with Stripe customer creation and Firestore-backed Pro plan selection
- Firestore data model for organizations, admins, invite codes, students, conversations, check-ins, growth plans, follow-up flags, usage logs, and Stripe event logs
- Firebase Admin SDK server-side access
- Telegram Bot API webhook at `/api/telegram/webhook`
- Generated invite code onboarding flow with Lebanon-focused grade buttons, fixed check-in cadence buttons, and growth plan generation
- AI chat, conversation summaries, check-in summaries, and cautious follow-up classification
- Automated check-in reminders and missed-check-in follow-up flags based on each student's selected cadence
- Admin and Telegram student account deletion flows with associated data cleanup, including `/delete` and Telegram stop/block events when available
- Stripe Checkout, Billing Portal, and webhook subscription tracking
- Firestore-backed subscription plan features, student limits, and monthly AI token limits
- AI usage and estimated cost logging
- Firestore security rules and indexes
- Demo seed script and Telegram webhook setup script

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill in `.env.local`.

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

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

## Firebase setup

1. Create a Firebase project.
2. Enable Firebase Authentication with email/password.
3. Create a school admin user in Firebase Auth.
4. Create a Firebase service account and add its project ID, client email, and private key to `.env.local`.
5. Set `PLATFORM_OWNER_EMAIL` to the Firebase Auth admin email.
6. Run the demo seed script:

```bash
npm run seed:demo
```

The seed script creates:

- Pro subscription plan configuration in `subscriptionPlans/pro`
- Organization: Cedar Learning School
- Admin profile linked to the Firebase Auth user with `PLATFORM_OWNER_EMAIL` when found
- Invite code: `CEDARS2026`
- Demo students: Omar, Sara, Karim
- Demo check-ins, growth plans, follow-up flag, and usage log

If the Firebase Auth user does not exist yet, the script uses a placeholder UID. Create the user and run the seed again, or set `PLATFORM_OWNER_UID`.

## Telegram setup

1. Create a bot with BotFather.
2. Add `TELEGRAM_BOT_TOKEN` to `.env.local`.
3. Deploy the app or expose local development with a public HTTPS tunnel.
4. Set `NEXT_PUBLIC_APP_URL` to the public URL.
5. Run:

```bash
npm run telegram:set-webhook
```

Equivalent manual webhook URL:

```text
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=<APP_URL>/api/telegram/webhook
```

Test with `/start`, then use invite code `CEDARS2026`.

## Stripe setup

1. Create one Stripe subscription product/price for the Pro plan.
2. Set `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID_PRO`.
3. Run `npm run seed:demo` or create `subscriptionPlans/pro` in Firestore with the Pro plan limits, feature list, and Stripe price ID. Registration and billing plan cards read from this document.
4. Add a Stripe webhook endpoint:

```text
<APP_URL>/api/stripe/webhook
```

5. Subscribe to these events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

6. Set `STRIPE_WEBHOOK_SECRET`.

If Stripe is not configured, the dashboard shows a clear error instead of crashing. Demo organization status can be managed through seed data or Firestore.

## Run locally

```bash
npm run dev
```

Open:

- Landing page: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Dashboard: `http://localhost:3000/dashboard`

## Useful scripts

```bash
npm run seed:demo
npm run telegram:set-webhook
npm run telegram:send-checkins
npm run checkins:run-automation
npm run typecheck
npm run lint
npm run build
```

`checkins:run-automation` evaluates each active student's selected check-in cadence, sends a Telegram reminder when the next check-in is due, and creates a low-engagement follow-up flag when the check-in remains missing after a 2-day grace period. `telegram:send-checkins` is kept as a backward-compatible alias.

## Scheduled check-in automation

The app includes a Vercel Cron job in `vercel.json`:

```text
0 6 * * * -> /api/cron/check-ins
```

Vercel schedules this in UTC. Set `CRON_SECRET` in production; the cron endpoint requires `Authorization: Bearer <CRON_SECRET>`.

The daily job:

- skips inactive/canceled/past-due organizations
- reads each completed student's cadence from `students.checkInCadence`, falling back to onboarding answers and then weekly
- sends the student a Telegram `/checkin` reminder when due
- creates one `low_engagement` follow-up flag for that due window after 2 days overdue

## Firestore security

Rules are in `firestore.rules`.

- Public reads are denied.
- Dashboard access is scoped by `organizationAdmins/{firebaseUid}.organizationId`.
- Students do not access Firestore directly in V1.
- Telegram, AI, Stripe events, and usage logs are written server-side through Firebase Admin SDK.
- Usage logs are read-only for admins.
- Stripe events and bot sessions are server-only.

Deploy rules/indexes with Firebase CLI if using Firestore directly:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## Product boundaries

The MVP intentionally does not include a mobile app, WhatsApp integration, parent portal, enterprise analytics, school SIS integrations, or medical/therapy/diagnostic features.

The code is structured so those can be added later through separate service modules and new interface channels.

## Manual testing checklist

1. Seed demo data.
2. Log in with the Firebase Auth user linked to `PLATFORM_OWNER_EMAIL`.
3. Confirm dashboard overview, students, check-ins, follow-ups, billing, and settings render.
4. Generate an invite code from `/dashboard/invites`.
5. Start the Telegram bot and enter the invite code.
6. Complete onboarding and confirm a growth plan is saved.
7. Send a normal student reflection message and confirm assistant reply plus saved conversation summary.
8. Send `/checkin` and complete four answers.
9. Confirm the check-in appears in `/dashboard/check-ins`.
10. Run `npm run checkins:run-automation` against seeded or adjusted overdue data and confirm reminders/low-engagement flags are created.
11. Confirm follow-up flags can be marked reviewed or closed.
12. Try Checkout from `/dashboard/billing` after Stripe env vars are configured.
13. Send a Stripe webhook test event and confirm organization subscription fields update.

## Assumptions and V1 placeholders

- Dashboard login uses Firebase email/password and server session cookies.
- Platform owner/admin provisioning is done by seed script or Firestore for V1.
- Raw conversation context is hidden behind a disclosure on the student detail page and should be reviewed responsibly.
- AI calls use OpenAI when `OPENAI_API_KEY` is set. Without it, deterministic fallback responses are used and usage is logged with zero cost.
- Monthly AI usage limits are not enforced yet, but usage logging is centralized so limits can be added before AI calls.
- Check-in reminders run through Vercel Cron in production. The same automation can be run manually with `npm run checkins:run-automation`.
