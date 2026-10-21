import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface TeamProfileInput {
  displayName: string;
  description: string;
  skills: string;
  experienceLevel: string;
  preferredWork: string;
  isOwner?: boolean;
}
const blankProfile = (): TeamProfileInput => ({
  displayName: "",
  description: "",
  skills: "",
  experienceLevel: "",
  preferredWork: "",
});
interface Props {
  initialProfiles: TeamProfileInput[];
  teamSize: number;
  onSubmit: (profiles: TeamProfileInput[]) => void;
  onBack: () => void;
  onDraftChange?: (profiles: TeamProfileInput[]) => void;
}

export default function TeamProfilesForm({
  initialProfiles,
  teamSize,
  onSubmit,
  onBack,
  onDraftChange,
}: Props) {
  const [profiles, setProfiles] = useState<TeamProfileInput[]>(() => {
    const values = initialProfiles.length
      ? initialProfiles.slice(0, teamSize)
      : [blankProfile()];
    return values.map((profile, index) => ({
      ...profile,
      isOwner: values.some((p) => p.isOwner) ? !!profile.isOwner : index === 0,
    }));
  });
  const save = (values: TeamProfileInput[]) => {
    setProfiles(values);
    onDraftChange?.(values);
  };
  const update = (
    index: number,
    field: keyof TeamProfileInput,
    value: string,
  ) =>
    save(
      profiles.map((profile, i) =>
        i === index ? { ...profile, [field]: value } : profile,
      ),
    );
  const remove = (index: number) => {
    const next = profiles.filter((_, i) => i !== index);
    if (!next.some((profile) => profile.isOwner) && next[0])
      next[0] = { ...next[0], isOwner: true };
    save(next);
  };
  return (
    <div className="mx-auto max-w-2xl py-6">
      <div className="mb-8">
        <h1 className="font-editorial text-4xl sm:text-5xl">
          Who’s building with you?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Add up to {teamSize} members, including yourself. Skills and
          preferences help shape the suggested workload.
        </p>
      </div>
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          const names = profiles.map((p) => p.displayName.trim().toLowerCase());
          if (new Set(names).size !== names.length) {
            toast.error("Give each team member a unique name.");
            return;
          }
          onSubmit(
            profiles.map((p) => ({ ...p, displayName: p.displayName.trim() })),
          );
        }}
      >
        {profiles.map((profile, index) => (
          <fieldset key={index} className="surface min-w-0 space-y-5 p-6">
            <legend className="sr-only">Team member {index + 1}</legend>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">
                Member {index + 1}
                {profile.isOwner && (
                  <span className="ml-3 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                    You
                  </span>
                )}
              </h2>
              {profiles.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove member ${index + 1}`}
                  className="text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`member-${index}-name`}>Name</Label>
              <Input
                id={`member-${index}-name`}
                required
                maxLength={100}
                value={profile.displayName}
                onChange={(event) =>
                  update(index, "displayName", event.target.value)
                }
                placeholder="How your team knows them"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`member-${index}-skills`}>
                Skills{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id={`member-${index}-skills`}
                value={profile.skills}
                onChange={(event) =>
                  update(index, "skills", event.target.value)
                }
                placeholder="e.g. Research, design, React"
                maxLength={1000}
              />
            </div>
            <details className="rounded-lg bg-muted/40 p-4">
              <summary className="cursor-pointer rounded-md text-sm font-medium">
                More about this member{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (optional)
                </span>
              </summary>
              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`member-${index}-experience`}>
                    Experience level
                  </Label>
                  <select
                    id={`member-${index}-experience`}
                    value={profile.experienceLevel}
                    onChange={(event) =>
                      update(index, "experienceLevel", event.target.value)
                    }
                    className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Choose if useful</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`member-${index}-work`}>Preferred work</Label>
                  <Input
                    id={`member-${index}-work`}
                    value={profile.preferredWork}
                    onChange={(event) =>
                      update(index, "preferredWork", event.target.value)
                    }
                    placeholder="What would they like to take on?"
                    maxLength={1000}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`member-${index}-description`}>
                    Role notes
                  </Label>
                  <Textarea
                    id={`member-${index}-description`}
                    rows={2}
                    value={profile.description}
                    onChange={(event) =>
                      update(index, "description", event.target.value)
                    }
                    maxLength={2000}
                  />
                </div>
              </div>
            </details>
          </fieldset>
        ))}
        {profiles.length < teamSize && (
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full border-dashed"
            onClick={() => save([...profiles, blankProfile()])}
          >
            <Plus />
            Add a team member
          </Button>
        )}
        <fieldset className="space-y-3 border-t pt-6">
          <legend className="sr-only">Which team member are you?</legend>
          <h2 className="text-sm font-semibold">Which one is you?</h2>
          <p className="text-xs text-muted-foreground">
            Your account will be connected to this profile as the project owner.
          </p>
          {profiles.map((profile, index) => (
            <label
              key={index}
              htmlFor={`owner-${index}`}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 hover:bg-muted"
            >
              <input
                type="radio"
                name="project-owner"
                id={`owner-${index}`}
                checked={!!profile.isOwner}
                onChange={() =>
                  save(profiles.map((p, i) => ({ ...p, isOwner: i === index })))
                }
                className="size-4 accent-[hsl(var(--primary))]"
              />
              <span className="text-sm">
                {profile.displayName || `Member ${index + 1}`}
              </span>
            </label>
          ))}
        </fieldset>
        <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row">
          <Button type="button" variant="ghost" onClick={onBack}>
            <ArrowLeft />
            Back to project
          </Button>
          <Button type="submit" className="sm:ml-auto" size="lg">
            Generate a plan
            <ArrowRight />
          </Button>
        </div>
      </form>
    </div>
  );
}
