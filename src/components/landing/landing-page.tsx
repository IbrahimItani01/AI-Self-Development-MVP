import { ArrowRight, Bot, CheckCircle2, LayoutDashboard, School } from "lucide-react";
import { GhostLink, LinkButton } from "@/components/ui/button";

const steps = [
  "School creates organization and invite code",
  "Student joins Telegram bot using invite code",
  "Student completes onboarding",
  "Student chats with AI companion",
  "Student completes weekly check-ins",
  "School sees engagement, summaries, and follow-up flags",
];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-sand text-ink">
      <section className="mx-auto grid min-h-[88vh] max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-wine shadow-sm">
            School-based student development
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-normal lg:text-7xl">
            AI Student Development Companion
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-ink/70">
            Telegram-based student support tool with a lightweight school dashboard.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink/65">
            Helping schools support student growth through AI-guided reflection, weekly check-ins, progress summaries, and human follow-up signals.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/login">
              Login to School Dashboard <ArrowRight size={17} />
            </LinkButton>
            <GhostLink href="#demo">View Demo Flow</GhostLink>
          </div>
        </div>
        <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-sand p-5">
              <Bot className="text-wine" />
              <h2 className="mt-4 font-semibold">Student Telegram Bot</h2>
              <p className="mt-2 text-sm text-ink/60">Short onboarding, reflection chat, weekly check-ins, and practical next steps.</p>
            </div>
            <div className="rounded-lg bg-sand p-5">
              <LayoutDashboard className="text-sage" />
              <h2 className="mt-4 font-semibold">School Dashboard</h2>
              <p className="mt-2 text-sm text-ink/60">Engagement, progress summaries, invite codes, usage, and follow-up signals.</p>
            </div>
            <div className="rounded-lg bg-sand p-5 sm:col-span-2">
              <School className="text-gold" />
              <h2 className="mt-4 font-semibold">Human Support Stays Central</h2>
              <p className="mt-2 text-sm text-ink/60">
                The AI supports reflection, clarity, habits, confidence, academic direction, career direction, and goal setting. It does not replace counselors.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold">Schools want to support every student, but personalized attention is hard to scale.</h2>
          </div>
          <p className="text-lg leading-8 text-ink/65">
            Students need regular reflection, confidence-building, direction, and small progress habits. Schools need a respectful way to see early support signals without turning every interaction into a formal intervention.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold">Students use Telegram. Schools use a dashboard.</h2>
            <p className="mt-4 leading-7 text-ink/65">
              The system helps students reflect, check in, and make small progress while giving schools visibility into engagement, summaries, usage, and human follow-up needs.
            </p>
          </div>
          <div className="grid gap-3">
            {["student development", "reflection", "clarity", "habits", "progress", "early support signals"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-sm">
                <CheckCircle2 size={18} className="text-sage" />
                <span className="font-medium capitalize">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="bg-ink py-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-semibold">How It Works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step} className="rounded-lg border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-gold">Step {index + 1}</p>
                <p className="mt-3 text-lg font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
