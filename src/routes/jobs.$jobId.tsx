import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BookmarkCheck, BookmarkX, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DemoTag,
  EmptyState,
  HumanInLoop,
  MatchBadge,
  PageHeader,
} from "@/components/ct/primitives";
import { JobForm, type JobDraft } from "@/components/ct/job-form";
import { useStore } from "@/lib/ct/store";
import { rankCandidates, rubricTotal } from "@/lib/ct/scoring";
import { candidatesForJob, jobStats } from "@/lib/ct/selectors";
import type { RubricWeight } from "@/lib/ct/types";

export const Route = createFileRoute("/jobs/$jobId")({
  head: () => ({
    meta: [
      { title: "Job Ranking & Weight Studio — Clear Talent AI" },
      {
        name: "description",
        content:
          "Review the explainable candidate ranking for a role, tune skill weights in Weight Studio and compare candidates side by side.",
      },
      { property: "og:title", content: "Job Ranking & Weight Studio — Clear Talent AI" },
      {
        property: "og:description",
        content: "Transparent candidate ranking with evidence, skill gaps and adjustable weights.",
      },
    ],
  }),
  component: JobDetailPage,
});

function JobDetailPage() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const {
    jobs,
    candidates,
    shortlists,
    loading,
    isShortlisted,
    shortlist,
    removeShortlist,
    updateJob,
    assignCandidateToJob,
  } = useStore();

  const job = jobs.find((j) => j.id === jobId);
  const [query, setQuery] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [onlyShortlisted, setOnlyShortlisted] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [studioRubric, setStudioRubric] = useState<RubricWeight[] | null>(null);
  const [assignId, setAssignId] = useState<string>("");

  const pool = useMemo(() => (job ? candidatesForJob(job, candidates) : []), [job, candidates]);
  const ranked = useMemo(() => (job ? rankCandidates(job, pool) : []), [job, pool]);
  const rubric = studioRubric ?? job?.rubric ?? [];
  const studioRanked = useMemo(
    () => (job ? rankCandidates(job, pool, rubric) : []),
    [job, pool, rubric],
  );

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading job…</p>;
  }

  if (!job) {
    return (
      <EmptyState
        title="Job not found"
        description="This job may have been removed. Head back to the jobs list to pick another role."
        action={
          <Button asChild>
            <Link to="/jobs">Back to jobs</Link>
          </Button>
        }
      />
    );
  }

  const stats = jobStats(job, candidates, shortlists);
  const visible = ranked.filter(
    (r) =>
      r.match.score >= minScore &&
      (!onlyShortlisted || isShortlisted(job.id, r.candidate.id)) &&
      (!query.trim() || r.candidate.name.toLowerCase().includes(query.trim().toLowerCase())),
  );

  const orderChanged =
    studioRubric !== null &&
    studioRanked.map((r) => r.candidate.id).join("|") !== ranked.map((r) => r.candidate.id).join("|");
  const heaviest = [...rubric].sort((a, z) => z.weight - a.weight)[0];

  const compareRows = studioRanked.filter((r) => compareIds.includes(r.candidate.id));
  const unassigned = candidates.filter((c) => !c.jobIds.includes(job.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title={job.title}
        subtitle={`${job.location} · ${job.experience} · ${job.jobType}`}
        actions={
          <>
            <Badge variant="outline" className="h-9 px-3 text-sm">
              {job.status}
            </Badge>
            {job.isDemo ? <DemoTag /> : null}
            <Button asChild variant="outline">
              <Link to="/candidates">Add candidates</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Candidates</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{stats.candidateCount}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Average match</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{stats.avgMatch}%</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Shortlisted</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{stats.shortlisted}</p>
        </div>
      </div>

      <Tabs defaultValue="ranking">
        <TabsList className="w-full overflow-x-auto sm:w-auto">
          <TabsTrigger value="ranking">Candidate Ranking</TabsTrigger>
          <TabsTrigger value="studio">Weight Studio</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>

        {/* ---------- Ranking ---------- */}
        <TabsContent value="ranking" className="mt-5 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search candidates"
                  aria-label="Search candidates in this job"
                  className="pl-9"
                />
              </div>
              <div className="w-full sm:w-56">
                <Label htmlFor="minScore" className="text-xs text-muted-foreground">
                  Minimum score: {minScore}
                </Label>
                <Slider
                  id="minScore"
                  className="mt-2"
                  value={[minScore]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={([v]) => setMinScore(v ?? 0)}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={onlyShortlisted}
                  onCheckedChange={(c) => setOnlyShortlisted(Boolean(c))}
                  aria-label="Shortlisted only"
                />
                Shortlisted only
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Select value={assignId} onValueChange={setAssignId}>
                <SelectTrigger className="w-56" aria-label="Add an existing candidate to this job">
                  <SelectValue placeholder="Add existing candidate" />
                </SelectTrigger>
                <SelectContent>
                  {unassigned.length === 0 ? (
                    <SelectItem value="none" disabled>
                      All candidates already added
                    </SelectItem>
                  ) : (
                    unassigned.slice(0, 30).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                disabled={!assignId || assignId === "none"}
                onClick={() => {
                  assignCandidateToJob(assignId, job.id);
                  toast.success("Candidate added to this job. Match score calculated.");
                  setAssignId("");
                }}
              >
                Add
              </Button>
            </div>
          </div>

          {pool.length === 0 ? (
            <EmptyState
              icon={<Users className="size-5" aria-hidden />}
              title="No candidates in this job yet"
              description="Add candidates and Clear Talent AI will calculate a transparent, reproducible match score for each one."
              action={
                <Button asChild>
                  <Link to="/candidates">Go to candidates</Link>
                </Button>
              }
            />
          ) : visible.length === 0 ? (
            <EmptyState
              title="No candidates found"
              description="No candidate in this job matches your current search and filters."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setMinScore(0);
                    setOnlyShortlisted(false);
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="surface-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">Rank</TableHead>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Match score</TableHead>
                    <TableHead className="hidden md:table-cell">Top skills</TableHead>
                    <TableHead className="hidden lg:table-cell">Evidence</TableHead>
                    <TableHead className="hidden lg:table-cell">Skill gaps</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map(({ candidate, match, rank }) => {
                    const listed = isShortlisted(job.id, candidate.id);
                    return (
                      <TableRow key={candidate.id}>
                        <TableCell className="font-medium tabular-nums">#{rank}</TableCell>
                        <TableCell>
                          <Link
                            to="/candidates/$candidateId"
                            params={{ candidateId: candidate.id }}
                            className="font-medium hover:underline"
                          >
                            {candidate.name}
                          </Link>
                          <span className="block text-xs text-muted-foreground">
                            {candidate.location} · {candidate.experienceYears} yrs
                          </span>
                        </TableCell>
                        <TableCell>
                          <MatchBadge status={match.status} score={match.score} />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {match.breakdown.slice(0, 2).map((b) => (
                              <Badge key={b.skill} variant="secondary" className="font-normal">
                                {b.skill} {b.contribution}/{b.weight}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          {match.evidenceStrength}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          {match.gaps.length === 0 ? (
                            <span className="text-success">None</span>
                          ) : (
                            `${match.gaps.length} (${match.gaps[0]!.skill}${match.gaps.length > 1 ? "…" : ""})`
                          )}
                        </TableCell>
                        <TableCell>
                          {listed ? (
                            <Badge variant="outline" className="border-success/30 bg-success-soft text-success">
                              Shortlisted
                            </Badge>
                          ) : (
                            <Badge variant="outline">In review</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate({
                                  to: "/candidates/$candidateId",
                                  params: { candidateId: candidate.id },
                                })
                              }
                            >
                              View
                            </Button>
                            {listed ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  removeShortlist(job.id, candidate.id);
                                  toast.success(`${candidate.name} removed from shortlist.`);
                                }}
                              >
                                <BookmarkX className="size-4" aria-hidden /> Remove
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => {
                                  shortlist(job.id, candidate.id, match.score);
                                  toast.success(`${candidate.name} shortlisted.`);
                                }}
                              >
                                <BookmarkCheck className="size-4" aria-hidden /> Shortlist
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          <HumanInLoop />
        </TabsContent>

        {/* ---------- Weight Studio ---------- */}
        <TabsContent value="studio" className="mt-5 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="surface-card p-5">
              <h2 className="text-base font-semibold">Weight Studio</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Move a slider and the ranking, contributions and explanations recalculate instantly.
                Weights must total 100% to save.
              </p>
              <div className="mt-5 space-y-5">
                {rubric.map((r) => (
                  <div key={r.skill}>
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`studio-${r.skill}`} className="text-sm font-medium">
                        {r.skill}
                      </Label>
                      <span className="text-sm tabular-nums text-muted-foreground">{r.weight}%</span>
                    </div>
                    <Slider
                      id={`studio-${r.skill}`}
                      className="mt-2"
                      value={[r.weight]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([v]) =>
                        setStudioRubric(
                          rubric.map((x) => (x.skill === r.skill ? { ...x, weight: v ?? 0 } : x)),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                    rubricTotal(rubric) === 100
                      ? "bg-success-soft text-success"
                      : "bg-warning-soft text-warning-foreground"
                  }`}
                  role="status"
                >
                  Total Weight: {rubricTotal(rubric)}%
                </span>
                <Button
                  disabled={rubricTotal(rubric) !== 100 || studioRubric === null}
                  onClick={() => {
                    updateJob(job.id, { rubric });
                    setStudioRubric(null);
                    toast.success("Rubric saved. Ranking updated for everyone on this job.");
                  }}
                >
                  Save rubric
                </Button>
                {studioRubric ? (
                  <Button variant="ghost" onClick={() => setStudioRubric(null)}>
                    Reset changes
                  </Button>
                ) : null}
              </div>
              {rubricTotal(rubric) !== 100 ? (
                <p role="alert" className="mt-3 text-sm text-critical">
                  Weight total must equal 100%.
                </p>
              ) : null}
            </div>

            <div className="surface-card p-5">
              <h2 className="text-base font-semibold">Ranking Preview</h2>
              {orderChanged && heaviest ? (
                <p className="mt-2 rounded-lg bg-primary-soft px-3 py-2 text-sm text-accent-foreground">
                  Ranking changed because {heaviest.skill} now has a higher weight relative to the
                  other skills.
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  {studioRubric ? "Weights changed, but the ranking order is unchanged." : "Live preview of the saved rubric."}
                </p>
              )}
              <ol className="mt-4 space-y-2">
                {studioRanked.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Add candidates to this job to preview a ranking.
                  </p>
                ) : (
                  studioRanked.slice(0, 8).map((r) => (
                    <li key={r.candidate.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                      <span className="text-sm font-medium">
                        #{r.rank} {r.candidate.name}
                      </span>
                      <span className="flex items-center gap-2 text-sm tabular-nums">
                        {r.match.score.toFixed(1)}
                        <Link
                          to="/candidates/$candidateId"
                          params={{ candidateId: r.candidate.id }}
                          aria-label={`Open ${r.candidate.name}`}
                        >
                          <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
                        </Link>
                      </span>
                    </li>
                  ))
                )}
              </ol>
              <HumanInLoop className="mt-4" />
            </div>
          </div>
        </TabsContent>

        {/* ---------- Compare ---------- */}
        <TabsContent value="compare" className="mt-5 space-y-4">
          <div className="surface-card p-5">
            <h2 className="text-base font-semibold">Select 2–3 candidates to compare</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {studioRanked.length === 0 ? (
                <p className="text-sm text-muted-foreground">No candidates in this job yet.</p>
              ) : (
                studioRanked.map((r) => {
                  const checked = compareIds.includes(r.candidate.id);
                  return (
                    <label
                      key={r.candidate.id}
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        aria-label={`Compare ${r.candidate.name}`}
                        onCheckedChange={(c) => {
                          if (c) {
                            if (compareIds.length >= 3) {
                              toast.error("You can compare up to 3 candidates at a time.");
                              return;
                            }
                            setCompareIds([...compareIds, r.candidate.id]);
                          } else {
                            setCompareIds(compareIds.filter((id) => id !== r.candidate.id));
                          }
                        }}
                      />
                      {r.candidate.name}
                      <span className="tabular-nums text-muted-foreground">
                        {r.match.score.toFixed(1)}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {compareRows.length < 2 ? (
            <EmptyState
              title="Pick at least two candidates"
              description="Comparison shows overall score, per-skill contributions, evidence strength and skill gaps side by side."
            />
          ) : (
            <div className="surface-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-40">Attribute</TableHead>
                    {compareRows.map((r) => (
                      <TableHead key={r.candidate.id}>{r.candidate.name}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Overall score</TableCell>
                    {compareRows.map((r) => (
                      <TableCell key={r.candidate.id}>
                        <MatchBadge status={r.match.status} score={r.match.score} />
                      </TableCell>
                    ))}
                  </TableRow>
                  {rubric.map((w) => (
                    <TableRow key={w.skill}>
                      <TableCell className="font-medium">
                        {w.skill}{" "}
                        <span className="text-xs text-muted-foreground">(max {w.weight})</span>
                      </TableCell>
                      {compareRows.map((r) => {
                        const b = r.match.breakdown.find((x) => x.skill === w.skill);
                        return (
                          <TableCell key={r.candidate.id} className="tabular-nums">
                            {b ? `${b.contribution} / ${b.weight}` : "—"}
                            <span className="block text-xs text-muted-foreground">
                              {b ? b.levelLabel : "No evidence"}
                            </span>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="font-medium">Evidence strength</TableCell>
                    {compareRows.map((r) => (
                      <TableCell key={r.candidate.id}>{r.match.evidenceStrength}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Projects</TableCell>
                    {compareRows.map((r) => (
                      <TableCell key={r.candidate.id} className="tabular-nums">
                        {r.candidate.projects.length}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Assessments</TableCell>
                    {compareRows.map((r) => (
                      <TableCell key={r.candidate.id} className="tabular-nums">
                        {r.candidate.assessments.filter((a) => a.status === "Completed").length}{" "}
                        completed
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Skill gaps</TableCell>
                    {compareRows.map((r) => (
                      <TableCell key={r.candidate.id} className="text-sm">
                        {r.match.gaps.length === 0
                          ? "None"
                          : r.match.gaps.map((g) => g.skill).join(", ")}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
          <HumanInLoop />
        </TabsContent>

        {/* ---------- Overview ---------- */}
        <TabsContent value="overview" className="mt-5 space-y-4">
          <div className="surface-card p-5">
            <h2 className="text-base font-semibold">Job description</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {job.description || "No description added yet."}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="surface-card p-5">
              <h2 className="text-base font-semibold">Skills</h2>
              <div className="mt-3 space-y-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Must-have</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {job.mustHaveSkills.map((s) => (
                      <Badge key={s} variant="secondary" className="font-normal">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Required</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {job.requiredSkills.map((s) => (
                      <Badge key={s} variant="secondary" className="font-normal">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Optional</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {job.optionalSkills.length === 0 ? (
                      <span className="text-muted-foreground">None</span>
                    ) : (
                      job.optionalSkills.map((s) => (
                        <Badge key={s} variant="outline" className="font-normal">
                          {s}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="surface-card p-5">
              <h2 className="text-base font-semibold">Scoring rubric</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {job.rubric.map((r) => (
                  <li key={r.skill} className="flex items-center justify-between">
                    <span>{r.skill}</span>
                    <span className="tabular-nums text-muted-foreground">{r.weight}%</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Preferred evidence: {job.evidencePreferences.join(", ") || "Not specified"}
              </p>
            </div>
          </div>
        </TabsContent>

        {/* ---------- Edit ---------- */}
        <TabsContent value="edit" className="mt-5">
          <EditJobTab
            jobId={job.id}
            draft={{
              title: job.title,
              location: job.location,
              jobType: job.jobType,
              experience: job.experience,
              description: job.description,
              requiredSkills: job.requiredSkills,
              mustHaveSkills: job.mustHaveSkills,
              optionalSkills: job.optionalSkills,
              evidencePreferences: job.evidencePreferences,
              rubric: job.rubric,
              status: job.status,
            }}
            onSave={(next) => {
              updateJob(job.id, next);
              toast.success("Job updated. Scores recalculated from the new rubric.");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EditJobTab({
  jobId,
  draft,
  onSave,
}: {
  jobId: string;
  draft: JobDraft;
  onSave: (next: JobDraft) => void;
}) {
  const [value, setValue] = useState<JobDraft>(draft);
  return (
    <JobForm
      key={jobId}
      value={value}
      onChange={setValue}
      submitLabel="Save changes"
      onSubmit={() => onSave(value)}
    />
  );
}
