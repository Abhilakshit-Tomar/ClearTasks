import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronRight,
  Leaf,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/Feedback";
import garden from "@/assets/campus-garden-480.webp";
import gardenLarge from "@/assets/campus-garden-960.webp";

const demoTasks = [
  {
    title: "Research native plants",
    owner: "AM",
    date: "Oct 24",
    color: "bg-amber-100 text-amber-900",
  },
  {
    title: "Map the courtyard",
    owner: "RK",
    date: "Oct 26",
    color: "bg-orange-100 text-orange-900",
  },
  {
    title: "Prepare the proposal",
    owner: "JS",
    date: "Oct 28",
    color: "bg-violet-100 text-violet-900",
  },
];

export default function LandingPage() {
  const [done, setDone] = useState<string[]>([demoTasks[0].title]);
  const toggle = (title: string) =>
    setDone((previous) =>
      previous.includes(title)
        ? previous.filter((item) => item !== title)
        : [...previous, title],
    );
  return (
    <div className="min-h-dvh overflow-x-clip">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="landing-container">
        <div className="flex min-h-24 items-center justify-between gap-4 border-b">
          <Brand />
          <nav
            aria-label="Main navigation"
            className="flex items-center gap-3 sm:gap-6"
          >
            <Link
              className="rounded-md px-1 py-3 text-sm font-semibold hover:text-primary"
              to="/login"
            >
              Login
            </Link>
            <Button asChild>
              <Link to="/signup">
                Get Started
                <ArrowRight className="hidden sm:block" aria-hidden="true" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main id="main-content">
        <section className="landing-container landing-hero">
          <div className="relative z-10">
            <h1 className="landing-title font-editorial">
              Who is doing what,
              <br />
              <em className="font-medium text-primary">and are we on track?</em>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">
              Plan the work. Share the load.
              <br className="hidden sm:block" /> See what’s next.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
              <Button
                size="lg"
                asChild
                className="shine-button h-14 px-6 text-base"
              >
                <Link to="/signup">
                  Start Your Project
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Link
                to="/login"
                className="inline-flex min-h-11 items-center gap-1 rounded-md text-sm font-semibold text-primary underline decoration-primary/40 underline-offset-8"
              >
                Login to Dashboard
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="size-4" aria-hidden="true" />A shared plan for
              your student team.
            </p>
          </div>
          <div className="landing-demo mb-7 mt-10 lg:mt-0">
            <img
              src={garden}
              srcSet={`${garden} 480w, ${gardenLarge} 960w`}
              sizes="(min-width: 1024px) 400px, 240px"
              alt=""
              className="hero-photo"
              fetchPriority="high"
              width="1536"
              height="1024"
            />
            <div className="demo-sheet">
              <div className="flex flex-wrap items-center gap-3 px-5 pb-5 pt-6 sm:px-7">
                <span className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
                  <Leaf className="size-5" aria-hidden="true" />
                </span>
                <h2 className="font-editorial text-2xl sm:text-3xl">
                  Campus garden
                </h2>
                <span className="ml-auto rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold text-violet-900">
                  Example project
                </span>
              </div>
              <div className="mx-5 flex items-center justify-between gap-3 border-b pb-4 sm:mx-7">
                <span className="text-sm font-semibold text-primary">
                  The next steps
                </span>
                <span className="text-xs text-muted-foreground">
                  Try completing a task{" "}
                  <ArrowDown
                    className="ml-1 inline size-3"
                    aria-hidden="true"
                  />
                </span>
              </div>
              <div className="px-5 sm:px-7">
                {demoTasks.map((task) => (
                  <div
                    key={task.title}
                    className="flex items-center gap-3 border-b py-5 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={done.includes(task.title)}
                      onChange={() => toggle(task.title)}
                      id={`demo-${task.owner}`}
                      className="size-[18px] shrink-0 cursor-pointer accent-[hsl(var(--primary))]"
                    />
                    <label
                      htmlFor={`demo-${task.owner}`}
                      className={`min-w-0 flex-1 cursor-pointer text-sm font-medium ${done.includes(task.title) ? "text-muted-foreground line-through" : ""}`}
                    >
                      {task.title}
                    </label>
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${task.color}`}
                      aria-label={`Assigned to ${task.owner}`}
                    >
                      {task.owner}
                    </span>
                    <span className="hidden w-12 text-right text-xs tabular-nums text-muted-foreground sm:block">
                      {task.date}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-muted/35 px-5 py-5 sm:px-7">
                <p className="mb-5 text-xs font-semibold text-muted-foreground">
                  Project milestones
                </p>
                <div className="flex items-start">
                  {["Plan", "Build", "Present"].map((name, i) => (
                    <div key={name} className="relative flex-1 text-center">
                      {i < 2 && (
                        <span className="absolute left-1/2 right-[-50%] top-3 border-t border-border" />
                      )}
                      <span
                        className={`relative mx-auto mb-2 flex size-6 items-center justify-center rounded-full border ${i === 0 ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card"}`}
                      >
                        {i === 0 && (
                          <Check className="size-3.5" aria-hidden="true" />
                        )}
                      </span>
                      <span className="text-xs font-medium">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <span className="demo-annotation">Everyone has a next step.</span>
            <span className="sr-only" role="status">
              {done.length} of 3 example tasks complete.
            </span>
          </div>
        </section>
        <section
          className="landing-container pb-16"
          aria-label="How ClearTasks works"
        >
          <ol className="grid gap-8 border-t pt-9 md:grid-cols-3 md:gap-10">
            {[
              {
                title: "Describe your project",
                text: "Start with your goal, deadline, and the people you’re building with.",
              },
              {
                title: "Review your plan",
                text: "Let AI suggest tasks and milestones. Review the details and refine the plan.",
              },
              {
                title: "Start together",
                text: "Know who owns each task and keep the next shared milestone in sight.",
              },
            ].map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span
                  className={`mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${["bg-amber-100 text-amber-900", "bg-orange-100 text-orange-900", "bg-violet-100 text-violet-900"][index]}`}
                >
                  {index + 1}
                </span>
                <div>
                  <h2 className="font-editorial text-2xl">{step.title}</h2>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <footer className="landing-container">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t py-6 text-xs text-muted-foreground">
          <span>ClearTasks. Created for student teams.</span>
          <span>A little structure. A lot more together.</span>
        </div>
      </footer>
    </div>
  );
}
