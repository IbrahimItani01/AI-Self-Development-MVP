import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  Bot,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  LockKeyhole,
  MessageCircle,
  Radar,
  School,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { GhostLink, LinkButton } from "@/components/ui/button";

const signalRows = [
  { name: "Omar", focus: "Study rhythm", status: "Check-in steady", progress: "74%" },
  { name: "Maya", focus: "Confidence", status: "Needs encouragement", progress: "48%" },
  { name: "Karim", focus: "Career direction", status: "New goal drafted", progress: "63%" },
];

const adminMetrics = [
  { label: "Active students", value: "184", helper: "+27 this month" },
  { label: "Weekly check-ins", value: "71%", helper: "completion rate" },
  { label: "Follow-up signals", value: "9", helper: "human review queue" },
];

const productPillars = [
  {
    icon: MessageCircle,
    title: "A familiar student channel",
    description:
      "Students join from Telegram with an invite code, complete onboarding, reflect in short bursts, and receive practical next steps.",
  },
  {
    icon: BarChart3,
    title: "A calm school dashboard",
    description:
      "Admins see engagement, summaries, check-ins, usage, and follow-up signals without reading every raw conversation first.",
  },
  {
    icon: ShieldCheck,
    title: "Human support stays visible",
    description:
      "The product surfaces school-appropriate signals that may benefit from mentor or counselor follow-up.",
  },
];

const flow = [
  "Create a school organization",
  "Generate invite codes",
  "Students join on Telegram",
  "AI supports reflection",
  "Weekly check-ins build rhythm",
  "Admins review summaries and signals",
];

const operatingRules = [
  "No diagnosis, treatment, medical advice, or therapy positioning.",
  "Grade-aware AI tone with brief responses and practical next steps.",
  "Organization-scoped dashboard access for school admins.",
  "Summaries and support signals are prioritized over raw conversation review.",
];

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-canvas text-ink">
      <section className="landing-grid-bg relative min-h-screen px-5 pb-14 pt-5 sm:px-7 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-lg border border-ink/10 bg-surface/85 px-4 py-3 shadow-[0_18px_60px_rgba(31,35,32,0.08)] backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white">
              <School size={18} />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-none">Student Companion</span>
              <span className="mt-1 block text-xs text-ink/55">School development platform</span>
            </span>
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-ink/65 md:flex">
            <a href="#product" className="hover:text-ink">Product</a>
            <a href="#workflow" className="hover:text-ink">Workflow</a>
            <a href="#safety" className="hover:text-ink">Safety</a>
          </div>
          <div className="flex items-center gap-2">
            <GhostLink href="/login" className="hidden border-ink/10 bg-surface/80 text-ink hover:bg-surface sm:inline-flex">
              Log in
            </GhostLink>
            <LinkButton href="/register">
              Start <ArrowRight size={16} />
            </LinkButton>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-10 pb-8 pt-16 lg:min-h-[calc(100vh-88px)] lg:grid-cols-[0.9fr_1.1fr] lg:pt-8">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-surface/80 px-3 py-2 text-sm font-semibold text-primary shadow-sm">
              <Sparkles size={15} />
              Built for school-wide student development
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-normal text-ink sm:text-6xl lg:text-7xl">
              See every student developing, without turning support into surveillance.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/68 sm:text-xl">
              A Telegram companion for student reflection and weekly check-ins, paired with a focused dashboard for school admins to spot progress, engagement, and cautious human follow-up needs.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/register" className="px-5 py-3">
                Create school account <ArrowRight size={17} />
              </LinkButton>
              <GhostLink href="#demo" className="border-ink/10 bg-surface/85 px-5 py-3 text-ink hover:bg-surface">
                Explore the flow
              </GhostLink>
            </div>
            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {adminMetrics.map((metric) => (
                <div key={metric.label} className="rounded-lg border border-ink/10 bg-surface/75 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase text-ink/45">{metric.label}</p>
                  <p className="mt-3 text-3xl font-semibold">{metric.value}</p>
                  <p className="mt-1 text-sm text-ink/55">{metric.helper}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[640px] lg:min-h-[760px]" aria-label="Animated product preview">
            <div className="landing-signal-ring absolute left-1/2 top-[48%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/15 bg-surface/25" />
            <div className="landing-signal-ring landing-signal-ring-delay absolute left-1/2 top-[48%] h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/15" />

            <div className="landing-float absolute left-0 top-10 w-[260px] rounded-lg border border-ink/10 bg-ink p-4 text-white shadow-[0_22px_70px_rgba(31,35,32,0.25)] sm:w-[310px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
                    <Bot size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Telegram companion</p>
                    <p className="text-xs text-white/50">Student view</p>
                  </div>
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-success" />
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <div className="max-w-[88%] rounded-lg rounded-tl-sm bg-white/10 p-3 text-white/82">
                  What is one small thing that would make this week easier?
                </div>
                <div className="ml-auto max-w-[82%] rounded-lg rounded-tr-sm bg-gold p-3 text-ink">
                  I need a better plan before exams.
                </div>
                <div className="max-w-[91%] rounded-lg rounded-tl-sm bg-white/10 p-3 text-white/82">
                  Let us choose one subject and one 20 minute starting point.
                </div>
              </div>
            </div>

            <div className="landing-float landing-float-delay absolute right-0 top-20 w-[330px] rounded-lg border border-ink/10 bg-surface p-4 shadow-[0_22px_80px_rgba(31,35,32,0.14)] sm:w-[430px]">
              <div className="flex items-center justify-between border-b border-ink/10 pb-4">
                <div>
                  <p className="text-sm font-semibold">Cedar Learning School</p>
                  <p className="mt-1 text-xs text-ink/50">Weekly student development overview</p>
                </div>
                <span className="rounded-md bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">Live</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {adminMetrics.map((metric) => (
                  <div key={metric.label} className="rounded-md bg-canvas p-3">
                    <p className="text-[10px] font-semibold uppercase text-ink/45">{metric.label}</p>
                    <p className="mt-2 text-xl font-semibold">{metric.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {signalRows.map((row) => (
                  <div key={row.name} className="grid grid-cols-[1fr_auto] gap-3 rounded-md border border-ink/10 bg-surface p-3">
                    <div>
                      <p className="text-sm font-semibold">{row.name}</p>
                      <p className="mt-1 text-xs text-ink/50">{row.focus} - {row.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{row.progress}</p>
                      <div className="mt-2 h-1.5 w-16 rounded-full bg-muted">
                        <span className="block h-1.5 rounded-full bg-sage" style={{ width: row.progress }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="landing-float landing-float-slow absolute bottom-16 left-5 w-[300px] rounded-lg border border-ink/10 bg-muted p-4 shadow-[0_18px_60px_rgba(31,35,32,0.12)] sm:w-[360px]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-wine text-white">
                  <Radar size={18} />
                </span>
                <div>
                  <p className="font-semibold">Follow-up queue</p>
                  <p className="text-sm text-ink/55">Non-diagnostic support signals</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {["Review", "Check-in", "Closed"].map((item, index) => (
                  <div key={item} className="rounded-md bg-surface/70 p-3 text-center">
                    <p className="text-2xl font-semibold">{[9, 14, 32][index]}</p>
                    <p className="mt-1 text-xs text-ink/50">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-6 right-5 hidden w-[220px] rounded-lg border border-ink/10 bg-surface/80 p-4 shadow-sm backdrop-blur sm:block">
              <p className="text-xs font-semibold uppercase text-ink/45">This week</p>
              <div className="mt-4 flex items-end gap-2">
                {[42, 68, 55, 79, 64, 88, 72].map((height, index) => (
                  <span
                    key={`${height}-${index}`}
                    className="landing-bar block w-full rounded-t-sm bg-wine"
                    style={{ height: `${height}px`, animationDelay: `${index * 120}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="bg-ink px-5 py-20 text-white sm:px-7 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase text-gold">Product shape</p>
              <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
                Designed around the two places support actually happens.
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {productPillars.map((pillar) => (
                <div key={pillar.title} className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
                  <pillar.icon className="text-gold" size={22} />
                  <h3 className="mt-5 text-lg font-semibold">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/62">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="demo" className="bg-canvas px-5 py-20 sm:px-7 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-warning">Student centered</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              The first interaction feels like a simple reflection, not an enterprise form.
            </h2>
            <p className="mt-5 text-lg leading-8 text-ink/64">
              Students answer short prompts, pick a development focus, and get a small plan they can actually act on this week.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-ink/10 bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <CalendarCheck className="text-sage" />
                <span className="rounded-md bg-success/10 px-2 py-1 text-xs font-semibold text-success">Weekly</span>
              </div>
              <h3 className="mt-8 text-2xl font-semibold">Check-in rhythm</h3>
              <p className="mt-3 leading-7 text-ink/62">
                Progress, difficulty, insight, and next step are captured in a short flow students can finish quickly.
              </p>
            </div>
            <div className="rounded-lg border border-ink/10 bg-muted p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <ClipboardList className="text-wine" />
                <span className="rounded-md bg-surface/70 px-2 py-1 text-xs font-semibold text-wine">Plan</span>
              </div>
              <h3 className="mt-8 text-2xl font-semibold">Growth plan</h3>
              <p className="mt-3 leading-7 text-ink/62">
                A focus area, goal, weekly actions, reflection prompt, and next step give the student a clear path.
              </p>
            </div>
            <div className="rounded-lg border border-ink/10 bg-info/10 p-5 shadow-sm md:col-span-2">
              <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <BellRing className="text-info" />
                  <h3 className="mt-8 text-2xl font-semibold">Summaries before raw messages</h3>
                </div>
                <p className="leading-7 text-ink/64">
                  Schools can understand momentum through concise summaries, engagement data, check-ins, and follow-up flags. Raw context remains secondary and responsibly framed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="bg-muted px-5 py-20 sm:px-7 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-wine">Operating flow</p>
              <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
                A school can move from setup to student insight in one connected path.
              </h2>
            </div>
            <GhostLink href="/register" className="w-fit border-ink/10 bg-surface text-ink hover:bg-canvas">
              Start setup <ChevronRight size={16} />
            </GhostLink>
          </div>

          <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-6">
            {flow.map((step, index) => (
              <div key={step} className="relative rounded-lg border border-ink/10 bg-surface p-5 shadow-sm">
                <p className="text-sm font-semibold text-ink/45">0{index + 1}</p>
                <p className="mt-10 min-h-16 text-lg font-semibold leading-6">{step}</p>
                {index < flow.length - 1 ? (
                  <ChevronRight className="absolute right-4 top-5 hidden text-ink/25 lg:block" size={18} />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="safety" className="bg-canvas px-5 py-20 sm:px-7 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-success">Trust boundary</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Supportive by design. Careful about what it claims.
            </h2>
            <p className="mt-5 text-lg leading-8 text-ink/64">
              The AI helps with reflection, clarity, habits, confidence, progress, and academic or career direction. It does not replace school counselors, mentors, teachers, or administrators.
            </p>
          </div>
          <div className="grid gap-3">
            {operatingRules.map((rule) => (
              <div key={rule} className="flex gap-4 rounded-lg border border-ink/10 bg-surface p-5 shadow-sm">
                <CheckCircle2 className="mt-0.5 shrink-0 text-sage" size={20} />
                <p className="leading-7 text-ink/68">{rule}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink px-5 py-20 text-white sm:px-7 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-lg border border-white/10 bg-white/[0.06] p-6 sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap gap-2 text-sm font-semibold text-white/70">
                <span className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2">
                  <UsersRound size={15} /> Admin visibility
                </span>
                <span className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2">
                  <LockKeyhole size={15} /> Scoped access
                </span>
                <span className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2">
                  <BadgeCheck size={15} /> Student development
                </span>
              </div>
              <h2 className="mt-8 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
                Give students a place to reflect, and give schools a clearer way to respond.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <LinkButton href="/register" className="bg-gold px-5 py-3 text-ink hover:bg-warning">
                Create account <ArrowRight size={17} />
              </LinkButton>
              <GhostLink href="/login" className="border-white/15 bg-white/5 px-5 py-3 text-white hover:bg-white/10">
                School login
              </GhostLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
