import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { rubricTotal } from "@/lib/ct/scoring";
import { EVIDENCE_TYPES, type EvidenceType, type Job, type RubricWeight } from "@/lib/ct/types";
import { cn } from "@/lib/utils";

export type JobDraft = Omit<Job, "id" | "createdAt" | "isDemo">;

export const emptyJobDraft: JobDraft = {
  title: "",
  location: "",
  jobType: "Full-time",
  experience: "0–2 years",
  description: "",
  requiredSkills: [],
  mustHaveSkills: [],
  optionalSkills: [],
  evidencePreferences: ["Project", "Assessment"],
  rubric: [],
  status: "Active",
};

function ChipEditor({
  label,
  hint,
  values,
  onChange,
  inputId,
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (next: string[]) => void;
  inputId: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v || values.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...values, v]);
    setDraft("");
  };
  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      <div className="flex gap-2">
        <Input
          id={inputId}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Type a skill and press Enter"
        />
        <Button type="button" variant="outline" onClick={add}>
          <Plus className="size-4" aria-hidden /> Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.length === 0 ? (
          <p className="text-xs text-muted-foreground">No skills added yet.</p>
        ) : (
          values.map((v) => (
            <Badge key={v} variant="secondary" className="gap-1 py-1 pl-2.5 pr-1 font-normal">
              {v}
              <button
                type="button"
                aria-label={`Remove ${v}`}
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="rounded-full p-0.5 hover:bg-background"
              >
                <X className="size-3" aria-hidden />
              </button>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}

export function RubricEditor({
  rubric,
  onChange,
  suggestions,
}: {
  rubric: RubricWeight[];
  onChange: (next: RubricWeight[]) => void;
  suggestions: string[];
}) {
  const [newSkill, setNewSkill] = useState("");
  const total = rubricTotal(rubric);
  const valid = total === 100;

  const setWeight = (skill: string, weight: number) =>
    onChange(rubric.map((r) => (r.skill === skill ? { ...r, weight } : r)));

  const available = suggestions.filter(
    (s) => !rubric.some((r) => r.skill.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {rubric.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add the skills you want to score. Weights must total exactly 100%.
          </p>
        ) : (
          rubric.map((r) => (
            <div key={r.skill} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor={`w-${r.skill}`} className="text-sm font-medium">
                    {r.skill}
                  </Label>
                  <span className="text-sm tabular-nums text-muted-foreground">{r.weight}%</span>
                </div>
                <Slider
                  id={`w-${r.skill}`}
                  className="mt-2"
                  value={[r.weight]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([v]) => setWeight(r.skill, v ?? 0)}
                  aria-label={`${r.skill} weight`}
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={r.weight}
                  onChange={(e) => setWeight(r.skill, Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                  className="w-20"
                  aria-label={`${r.skill} weight value`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${r.skill} from rubric`}
                  onClick={() => onChange(rubric.filter((x) => x.skill !== r.skill))}
                >
                  <X className="size-4" aria-hidden />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Add a scored skill"
          className="w-full sm:w-56"
          aria-label="Add a scored skill"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const v = newSkill.trim();
              if (v && !rubric.some((r) => r.skill.toLowerCase() === v.toLowerCase())) {
                onChange([...rubric, { skill: v, weight: 0 }]);
              }
              setNewSkill("");
            }
          }}
        />
        {available.slice(0, 6).map((s) => (
          <Button
            key={s}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange([...rubric, { skill: s, weight: 0 }])}
          >
            <Plus className="size-3.5" aria-hidden /> {s}
          </Button>
        ))}
      </div>

      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm",
          valid
            ? "border-success/30 bg-success-soft text-success"
            : "border-warning/40 bg-warning-soft text-warning-foreground",
        )}
        role="status"
      >
        <span className="font-medium">Total Weight: {total}%</span>
        <span>
          {valid
            ? "Ready to save — weights total 100%."
            : "Weight total must equal 100% before this rubric can be saved."}
        </span>
      </div>
    </div>
  );
}

export function JobForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  secondaryAction,
}: {
  value: JobDraft;
  onChange: (next: JobDraft) => void;
  onSubmit: () => void;
  submitLabel: string;
  secondaryAction?: React.ReactNode;
}) {
  const [touched, setTouched] = useState(false);
  const total = rubricTotal(value.rubric);
  const errors: string[] = [];
  if (!value.title.trim()) errors.push("Job title is required.");
  if (!value.location.trim()) errors.push("Location is required.");
  if (value.requiredSkills.length === 0 && value.mustHaveSkills.length === 0)
    errors.push("Add at least one required or must-have skill.");
  if (total !== 100) errors.push("Weight total must equal 100%.");

  const suggestions = [
    ...new Set([
      ...value.mustHaveSkills,
      ...value.requiredSkills,
      ...value.optionalSkills,
      "Problem Solving",
      "Communication",
    ]),
  ];

  const set = <K extends keyof JobDraft>(key: K, v: JobDraft[K]) => onChange({ ...value, [key]: v });

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (errors.length === 0) onSubmit();
      }}
      noValidate
    >
      <section className="surface-card p-5 sm:p-6">
        <h2 className="text-base font-semibold">Basic information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Job title</Label>
            <Input
              id="title"
              value={value.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Python Developer"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={value.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Pune, India"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jobType">Job type</Label>
            <Select value={value.jobType} onValueChange={(v) => set("jobType", v as Job["jobType"])}>
              <SelectTrigger id="jobType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Full-time", "Part-time", "Contract", "Internship"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="experience">Experience required</Label>
            <Select value={value.experience} onValueChange={(v) => set("experience", v)}>
              <SelectTrigger id="experience">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["0–2 years", "1–3 years", "3–5 years", "5+ years"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Job description</Label>
            <Textarea
              id="description"
              rows={4}
              value={value.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What will this person work on?"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select value={value.status} onValueChange={(v) => set("status", v as Job["status"])}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Active", "Draft", "Closed"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="surface-card space-y-5 p-5 sm:p-6">
        <h2 className="text-base font-semibold">Skills</h2>
        <ChipEditor
          inputId="must-have"
          label="Must-have skills"
          hint="Advanced evidence expected. Gaps here are highlighted clearly."
          values={value.mustHaveSkills}
          onChange={(v) => set("mustHaveSkills", v)}
        />
        <ChipEditor
          inputId="required"
          label="Required skills"
          hint="Intermediate evidence expected."
          values={value.requiredSkills}
          onChange={(v) => set("requiredSkills", v)}
        />
        <ChipEditor
          inputId="optional"
          label="Optional skills"
          hint="Nice to have. Missing evidence simply contributes nothing."
          values={value.optionalSkills}
          onChange={(v) => set("optionalSkills", v)}
        />
      </section>

      <section className="surface-card p-5 sm:p-6">
        <h2 className="text-base font-semibold">Evidence preferences</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Which kinds of evidence do you trust most for this role? Self-reported information is
          always labelled as unverified.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {EVIDENCE_TYPES.map((t) => {
            const checked = value.evidencePreferences.includes(t);
            return (
              <label key={t} className="flex items-center gap-2.5 text-sm">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(c) =>
                    set(
                      "evidencePreferences",
                      c
                        ? [...value.evidencePreferences, t]
                        : value.evidencePreferences.filter((x) => x !== t),
                    )
                  }
                  aria-label={t}
                />
                {t as EvidenceType}
              </label>
            );
          })}
        </div>
      </section>

      <section className="surface-card p-5 sm:p-6">
        <h2 className="text-base font-semibold">Scoring rubric</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Each weight decides how much a skill can contribute to the final match score. Candidate
          background, college and college tier are never scoring factors.
        </p>
        <div className="mt-4">
          <RubricEditor rubric={value.rubric} onChange={(v) => set("rubric", v)} suggestions={suggestions} />
        </div>
      </section>

      {touched && errors.length > 0 ? (
        <div role="alert" className="surface-card border-critical/30 bg-critical-soft/50 px-5 py-4">
          <p className="text-sm font-medium">Please fix the following:</p>
          <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit">{submitLabel}</Button>
        {secondaryAction}
      </div>
    </form>
  );
}
