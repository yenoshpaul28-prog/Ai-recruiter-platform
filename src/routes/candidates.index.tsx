import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Upload, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DemoTag,
  EmptyState,
  HumanInLoop,
  MatchBadge,
  PageHeader,
} from "@/components/ct/primitives";
import { useStore } from "@/lib/ct/store";
import { computeMatch } from "@/lib/ct/scoring";
import { primaryJobFor } from "@/lib/ct/selectors";
import type { Candidate, CandidateSkill, EvidenceType } from "@/lib/ct/types";

export const Route = createFileRoute("/candidates")({
  head: () => ({
    meta: [
      { title: "Candidates — Clear Talent AI" },
      {
        name: "description",
        content:
          "Search, filter, add and import candidates with structured skills and evidence for explainable match scoring.",
      },
      { property: "og:title", content: "Candidates — Clear Talent AI" },
      {
        property: "og:description",
        content: "Evidence-backed candidate records with transparent match scores.",
      },
    ],
  }),
  component: CandidatesPage,
});

const CONFIDENCE_FOR_TYPE: Record<string, "HIGH" | "MEDIUM" | "LOW" | "NOT_VERIFIED"> = {
  "Verified Credential": "HIGH",
  Certification: "HIGH",
  Assessment: "HIGH",
  Project: "MEDIUM",
  "Work Experience": "MEDIUM",
  Portfolio: "MEDIUM",
  "Self-reported": "NOT_VERIFIED",
};

/**
 * Maps a structured skill string ("Python:80:Project") into candidate skills
 * with evidence. This is deterministic field mapping — no resume parsing model
 * is connected, and the app never claims one is.
 */
function parseSkillSpec(spec: string): CandidateSkill[] {
  return spec
    .split(/[|,;]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [name, levelRaw, typeRaw] = part.split(":").map((p) => p.trim());
      const level = Math.max(0, Math.min(100, Number(levelRaw) || 0));
      const type = (typeRaw || "Self-reported") as EvidenceType;
      const confidence = CONFIDENCE_FOR_TYPE[type] ?? "NOT_VERIFIED";
      return {
        name: name || "Unnamed skill",
        level,
        evidence: [
          {
            id: `ev-${name}-${Math.random().toString(36).slice(2, 7)}`,
            type,
            description: `${type} evidence recorded for ${name} during candidate intake.`,
            confidence,
            source: type === "Self-reported" ? "Resume (self-reported)" : `Resume / ${type}`,
          },
        ],
      } satisfies CandidateSkill;
    });
}

function blankCandidate(): Omit<Candidate, "id" | "createdAt" | "isDemo"> {
  return {
    name: "",
    email: "",
    phone: "",
    location: "",
    experienceYears: 0,
    targetRole: "",
    education: "",
    college: "",
    collegeTier: 2,
    skills: [],
    projects: [],
    certifications: [],
    assessments: [],
    workExperience: [],
    portfolio: "",
    jobIds: [],
  };
}

function AddCandidateDialog() {
  const { jobs, addCandidate, addCandidates } = useStore();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [jobId, setJobId] = useState<string>(jobs[0]?.id ?? "");
  const [skillSpec, setSkillSpec] = useState("Python:80:Project | SQL:70:Assessment");
  const [csv, setCsv] = useState(
    "name,email,location,experienceYears,college,collegeTier,skills\nRohit Sharma,rohit@example.com,Pune India,2,Demo Institute,2,Python:72:Project|SQL:64:Assessment",
  );
  const [markDemo, setMarkDemo] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4" aria-hidden /> Add candidates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add candidates</DialogTitle>
          <DialogDescription>
            Enter a candidate manually or import several at once. Resume files are mapped into this
            structured model — no external resume-parsing AI is connected, so skills and evidence
            are taken exactly from what you provide.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual">
          <TabsList className="w-full">
            <TabsTrigger value="manual" className="flex-1">Manual entry</TabsTrigger>
            <TabsTrigger value="import" className="flex-1">CSV / bulk import</TabsTrigger>
            <TabsTrigger value="resume" className="flex-1">Resume upload</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-4">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const name = String(f.get("name") ?? "").trim();
                if (!name) {
                  toast.error("Candidate name is required.");
                  return;
                }
                setBusy(true);
                const skills = parseSkillSpec(skillSpec);
                addCandidate({
                  ...blankCandidate(),
                  name,
                  email: String(f.get("email") ?? ""),
                  phone: String(f.get("phone") ?? ""),
                  location: String(f.get("location") ?? ""),
                  experienceYears: Number(f.get("experience") ?? 0),
                  targetRole: String(f.get("role") ?? ""),
                  education: String(f.get("education") ?? ""),
                  college: String(f.get("college") ?? ""),
                  collegeTier: Number(f.get("tier") ?? 2) as 1 | 2 | 3,
                  portfolio: String(f.get("portfolio") ?? ""),
                  skills,
                  jobIds: jobId ? [jobId] : [],
                });
                setBusy(false);
                setOpen(false);
                toast.success("Candidate added. Match score calculated from the job rubric.");
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="c-name">Full name</Label>
                  <Input id="c-name" name="name" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-email">Email</Label>
                  <Input id="c-email" name="email" type="email" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-phone">Phone</Label>
                  <Input id="c-phone" name="phone" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-location">Location</Label>
                  <Input id="c-location" name="location" placeholder="Pune, India" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-experience">Experience (years)</Label>
                  <Input id="c-experience" name="experience" type="number" min={0} max={40} defaultValue={0} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-role">Target role</Label>
                  <Input id="c-role" name="role" placeholder="Python Developer" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-education">Education</Label>
                  <Input id="c-education" name="education" placeholder="B.E. Computer Engineering, 2024" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-college">College</Label>
                  <Input id="c-college" name="college" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-tier">College tier (audit only)</Label>
                  <select
                    id="c-tier"
                    name="tier"
                    defaultValue="2"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="1">Tier 1</option>
                    <option value="2">Tier 2</option>
                    <option value="3">Tier 3</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Never used in scoring. Recorded only for fairness audits.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-portfolio">Portfolio</Label>
                  <Input id="c-portfolio" name="portfolio" placeholder="github.com/…" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="c-skills">Skills with evidence</Label>
                <Textarea
                  id="c-skills"
                  rows={3}
                  value={skillSpec}
                  onChange={(e) => setSkillSpec(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Format: <code>Skill:level(0-100):EvidenceType</code>, separated by <code>|</code>.
                  Evidence types: Project, Assessment, Certification, Work Experience, Portfolio,
                  Verified Credential, Self-reported.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="c-job">Consider for job</Label>
                <Select value={jobId} onValueChange={setJobId}>
                  <SelectTrigger id="c-job">
                    <SelectValue placeholder="Select a job" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((j) => (
                      <SelectItem key={j.id} value={j.id}>
                        {j.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={busy}>
                  {busy ? "Calculating match…" : "Add candidate"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="import" className="mt-4 space-y-3">
            <Label htmlFor="csv">CSV rows</Label>
            <Textarea id="csv" rows={7} value={csv} onChange={(e) => setCsv(e.target.value)} />
            <p className="text-xs text-muted-foreground">
              Header row required: name,email,location,experienceYears,college,collegeTier,skills
            </p>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={markDemo} onCheckedChange={(c) => setMarkDemo(Boolean(c))} aria-label="Sample data" />
              These rows are sample/demo data
            </label>
            <div className="space-y-1.5">
              <Label htmlFor="import-job">Consider for job</Label>
              <Select value={jobId} onValueChange={setJobId}>
                <SelectTrigger id="import-job">
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((j) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  const lines = csv.trim().split("\n").slice(1).filter(Boolean);
                  if (lines.length === 0) {
                    toast.error("Add at least one data row below the header.");
                    return;
                  }
                  const rows = lines.map((line) => {
                    const [name, email, location, exp, college, tier, skills] = line.split(",");
                    return {
                      ...blankCandidate(),
                      name: (name ?? "Unnamed").trim() + (markDemo ? " (Sample)" : ""),
                      email: (email ?? "").trim(),
                      location: (location ?? "").trim(),
                      experienceYears: Number(exp) || 0,
                      college: (college ?? "").trim(),
                      collegeTier: (Number(tier) || 2) as 1 | 2 | 3,
                      skills: parseSkillSpec(skills ?? ""),
                      jobIds: jobId ? [jobId] : [],
                      targetRole: "",
                    };
                  });
                  const n = addCandidates(rows);
                  setOpen(false);
                  toast.success(`${n} candidate(s) imported and scored.`);
                }}
              >
                <Upload className="size-4" aria-hidden /> Import candidates
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="resume" className="mt-4 space-y-3">
            <div className="rounded-lg border border-dashed border-input px-5 py-8 text-center">
              <Upload className="mx-auto size-6 text-muted-foreground" aria-hidden />
              <p className="mt-2 text-sm font-medium">Upload resume files</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Files are attached to the candidate record for your review. Automatic resume parsing
                is not connected in this MVP, so after uploading you confirm the skills and evidence
                yourself in the Manual entry tab.
              </p>
              <Input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                className="mx-auto mt-4 max-w-xs"
                aria-label="Upload resume files"
                onChange={(e) => {
                  const n = e.target.files?.length ?? 0;
                  if (n) toast.success(`${n} file(s) staged. Confirm skills in Manual entry.`);
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function CandidatesPage() {
  const { candidates, jobs, shortlists, loading } = useStore();
  const [query, setQuery] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [minScore, setMinScore] = useState("0");
  const [shortlistedOnly, setShortlistedOnly] = useState(false);

  const locations = useMemo(
    () => [...new Set(candidates.map((c) => c.location).filter(Boolean))],
    [candidates],
  );

  const rows = useMemo(() => {
    const shortlistedIds = new Set(shortlists.map((s) => s.candidateId));
    const t = query.trim().toLowerCase();
    return candidates
      .map((candidate) => {
        const job =
          jobFilter !== "all"
            ? jobs.find((j) => j.id === jobFilter)
            : primaryJobFor(candidate, jobs);
        const match = job ? computeMatch(job, candidate) : null;
        return { candidate, job, match };
      })
      .filter(({ candidate, job, match }) => {
        if (jobFilter !== "all" && !candidate.jobIds.includes(jobFilter)) return false;
        if (locationFilter !== "all" && candidate.location !== locationFilter) return false;
        if (shortlistedOnly && !shortlistedIds.has(candidate.id)) return false;
        if (Number(minScore) > 0 && (match?.score ?? 0) < Number(minScore)) return false;
        if (!t) return true;
        return (
          candidate.name.toLowerCase().includes(t) ||
          candidate.targetRole.toLowerCase().includes(t) ||
          candidate.location.toLowerCase().includes(t) ||
          candidate.skills.some((s) => s.name.toLowerCase().includes(t)) ||
          (job?.title.toLowerCase().includes(t) ?? false)
        );
      })
      .sort((a, z) => (z.match?.score ?? 0) - (a.match?.score ?? 0));
  }, [candidates, jobs, shortlists, query, jobFilter, locationFilter, minScore, shortlistedOnly]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidates"
        subtitle="Every candidate score is calculated from job-relevant evidence only."
        actions={<AddCandidateDialog />}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, role, skill or location"
            aria-label="Search candidates"
            className="pl-9"
          />
        </div>
        <Select value={jobFilter} onValueChange={setJobFilter}>
          <SelectTrigger aria-label="Filter by job">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All jobs</SelectItem>
            {jobs.map((j) => (
              <SelectItem key={j.id} value={j.id}>
                {j.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger aria-label="Filter by location">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {locations.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={minScore} onValueChange={setMinScore}>
          <SelectTrigger aria-label="Minimum match score">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["0", "40", "55", "66"].map((v) => (
              <SelectItem key={v} value={v}>
                {v === "0" ? "Any score" : `Score ${v}+`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={shortlistedOnly}
          onCheckedChange={(c) => setShortlistedOnly(Boolean(c))}
          aria-label="Shortlisted only"
        />
        Shortlisted candidates only
      </label>

      {loading ? (
        <div className="space-y-3" aria-busy="true">
          <p className="text-sm text-muted-foreground">Loading candidates…</p>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Users className="size-5" aria-hidden />}
          title="No candidates found"
          description="Adjust your filters, or add candidates manually or through a bulk import."
          action={<AddCandidateDialog />}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ candidate, job, match }) => (
            <div key={candidate.id} className="surface-card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to="/candidates/$candidateId"
                    params={{ candidateId: candidate.id }}
                    className="font-semibold hover:underline"
                  >
                    {candidate.name}
                  </Link>
                  <p className="truncate text-sm text-muted-foreground">
                    {candidate.targetRole || "Role not specified"} · {candidate.location || "—"}
                  </p>
                </div>
                {match ? <MatchBadge status={match.status} score={match.score} /> : null}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {candidate.skills.slice(0, 4).map((s) => (
                  <Badge key={s.name} variant="secondary" className="font-normal">
                    {s.name}
                  </Badge>
                ))}
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                {candidate.experienceYears} yrs experience ·{" "}
                {match ? `${match.evidenceStrength} evidence` : "No job selected"}
              </p>
              {job ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Considered for{" "}
                  <Link to="/jobs/$jobId" params={{ jobId: job.id }} className="font-medium text-foreground hover:underline">
                    {job.title}
                  </Link>
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">Not linked to a job yet.</p>
              )}

              <div className="mt-4 flex items-center justify-between gap-2">
                {candidate.isDemo ? <DemoTag /> : <span />}
                <Button asChild size="sm" variant="outline">
                  <Link to="/candidates/$candidateId" params={{ candidateId: candidate.id }}>
                    View profile
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <HumanInLoop />
    </div>
  );
}
