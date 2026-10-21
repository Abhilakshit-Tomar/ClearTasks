import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const appearances = [
    {
      value: "light",
      label: "Light studio",
      description: "Warm paper and forest green.",
      icon: Sun,
    },
    {
      value: "dark",
      label: "After hours",
      description: "A softer workspace for evenings.",
      icon: Moon,
    },
    {
      value: "system",
      label: "Match device",
      description: "Follow your device appearance.",
      icon: Monitor,
    },
  ];
  return (
    <div className="page-shell max-w-4xl">
      <div className="page-heading">
        <div>
          <h1>Make yourself at home.</h1>
          <p>A workspace that feels right for the way you work.</p>
        </div>
      </div>
      <section
        className="surface p-6 sm:p-8"
        aria-labelledby="appearance-heading"
      >
        <h2 id="appearance-heading" className="text-lg font-semibold">
          Appearance
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose your light. Changes save automatically on this device.
        </p>
        <div
          className="mt-7 grid gap-3 sm:grid-cols-3"
          role="group"
          aria-label="Appearance"
        >
          {appearances.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              aria-pressed={theme === option.value}
              onClick={() => {
                setTheme(option.value);
                toast.success(`${option.label} selected`);
              }}
              className={`h-auto min-h-36 flex-col items-start whitespace-normal p-5 text-left ${theme === option.value ? "border-primary bg-primary/5" : ""}`}
            >
              <span className="flex w-full items-center justify-between">
                <option.icon
                  className="!size-5 text-primary"
                  aria-hidden="true"
                />
                {theme === option.value && (
                  <Check className="text-primary" aria-hidden="true" />
                )}
              </span>
              <span className="mt-3">{option.label}</span>
              <span className="text-xs font-normal leading-relaxed text-muted-foreground">
                {option.description}
              </span>
            </Button>
          ))}
        </div>
        <p className="mt-5 text-xs text-muted-foreground" role="status">
          Current preference:{" "}
          {appearances.find((option) => option.value === theme)?.label ||
            "Light studio"}
          . Saved on this device.
        </p>
      </section>
      <section className="border-t pt-7">
        <h2 className="text-lg font-semibold">Project updates</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Task assignments, invitations, and milestone updates live in your
          notifications. Email and browser delivery preferences aren’t available
          yet.
        </p>
      </section>
    </div>
  );
}
