import { Brand } from "@/components/Feedback";
import garden from "@/assets/campus-garden-480.webp";
import gardenLarge from "@/assets/campus-garden-960.webp";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-shell">
      <aside className="auth-story">
        <Brand />
        <div className="my-12 max-w-lg">
          <h1 className="font-editorial text-5xl leading-tight xl:text-6xl">
            Good projects.
            <br />
            <em className="text-primary">Better together.</em>
          </h1>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground">
            A shared plan, clear next steps, and a little more room for the work
            you love.
          </p>
          <div className="mt-9 overflow-hidden rounded-2xl">
            <img
              loading="lazy"
              src={garden}
              srcSet={`${garden} 480w, ${gardenLarge} 960w`}
              sizes="(min-width: 1024px) 400px, 240px"
              alt="A sunlit campus garden, an example of something a student team can build together."
              className="h-52 w-full object-cover xl:h-64"
              width="1536"
              height="1024"
            />
            <p className="bg-card px-5 py-4 text-xs text-muted-foreground">
              Big ideas grow one shared step at a time.
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Created for student teams.
        </p>
      </aside>
      <main className="auth-form-panel">
        <div className="mb-10 lg:hidden">
          <Brand />
        </div>
        <div className="w-full max-w-[400px]">{children}</div>
      </main>
    </div>
  );
}
