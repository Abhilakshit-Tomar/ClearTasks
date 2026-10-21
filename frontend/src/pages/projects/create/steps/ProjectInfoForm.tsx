import { useState } from "react";
import { ArrowRight, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface ProjectInfoValues {
  title: string;
  description: string;
  teamSize: string;
  deadline: string;
}
interface Props {
  initialValues?: Partial<ProjectInfoValues>;
  onSubmit: (data: ProjectInfoValues) => void;
  onDraftChange?: (data: ProjectInfoValues) => void;
}

export default function ProjectInfoForm({
  initialValues,
  onSubmit,
  onDraftChange,
}: Props) {
  const [form, setForm] = useState<ProjectInfoValues>({
    title: "",
    description: "",
    teamSize: "",
    deadline: "",
    ...initialValues,
  });
  const update = (field: keyof ProjectInfoValues, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    onDraftChange?.(next);
  };
  const [minDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });
  return (
    <div className="mx-auto max-w-2xl py-6">
      <div className="mb-8">
        <h1 className="font-editorial text-4xl sm:text-5xl">
          What are you building?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Give the big idea a little shape. We’ll help your team turn it into a
          plan.
        </p>
      </div>
      <form
        className="surface space-y-6 p-6 sm:p-8"
        onSubmit={(event) => {
          event.preventDefault();
          // Native values also cover autofill and date-picker commits that skip change events.
          const values = new FormData(event.currentTarget);
          onSubmit({
            title: String(values.get("title") || "").trim(),
            description: String(values.get("description") || "").trim(),
            teamSize: String(values.get("teamSize") || ""),
            deadline: String(values.get("deadline") || ""),
          });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="project-title">Project name</Label>
          <Input
            id="project-title"
            name="title"
            required
            maxLength={200}
            placeholder="e.g. Campus garden"
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-description">What do you want to make?</Label>
          <Textarea
            id="project-description"
            name="description"
            required
            minLength={10}
            rows={5}
            maxLength={10000}
            placeholder="Describe the goal, what it should do, and what a good result looks like."
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            A few specific details help make the suggested tasks useful.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="team-size" className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              Team size
            </Label>
            <Input
              id="team-size"
              name="teamSize"
              required
              type="number"
              min={1}
              max={50}
              step={1}
              placeholder="Including you"
              value={form.teamSize}
              onChange={(event) => update("teamSize", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="project-deadline"
              className="flex items-center gap-2"
            >
              <Calendar className="size-4 text-muted-foreground" />
              Deadline
            </Label>
            <Input
              id="project-deadline"
              name="deadline"
              required
              type="date"
              min={minDate}
              value={form.deadline}
              onInput={(event) => update("deadline", event.currentTarget.value)}
              onChange={(event) => update("deadline", event.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            Next: introduce your team.
          </p>
          <Button type="submit" size="lg">
            Continue to team
            <ArrowRight />
          </Button>
        </div>
      </form>
    </div>
  );
}
