import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ConfidenceBadge,
  EmptyState,
  HumanInLoop,
  MatchBadge,
  PageHeader,
} from "@/components/ct/primitives";
import { computeMatch, levelLabel, requiredLevelFor } from "@/lib/ct/scoring";
import { primaryJobFor } from "@/lib/ct/selectors";
import { useStore } from "@/lib/ct/store";

export const Route = createFileRoute("/candidates/$candidateId")({
  head: () => ({
    meta: [
      { title: "Candidate profile — Clear Talent AI" },
      {
        name: "description",
        content:
          "Full candidate profile with skill-by-skill match breakdown, evidence confidence and plain-language score explanation.",
      },
      { property: "og:title", content: "Candidate profile — Clear Talent AI" },
      {
        property: "og:description",
        content: "See exactly why a candidate scored the way they did.",
      },
    ],
  }),
  component: CandidateProfile,
});

function CandidateProfile() {
  const { candidateId } = useParams({ from: "/candidates/$candidateId" });
  const { candidates, jobs, shortlist, isShortlisted } = useStore();
  const candidate = candidates.find((c) => c.id === candidateId);
  const [jobId, setJobId] = useState<string>("");

  const job = useMemo(() => {
    if (!candidate) return undefined;
    return jobs.find((j) => j.id === jobId) ?? primaryJobFor(candidate, jobs);
  }, [candidate, jobs, jobId]);

  if (!candidate) {
    return (
      <EmptyState
        title="Candidate not found"
        description="This candidate may have been removed or the demo data was reset."
        action={
          <Button asChild variant="outline">
            <Link to="/candidates">Back to candidates</Link>
          </Button>
        }
      />
    );
  }

  const match = job ? computeMatch(job, candidate) : null;
  const shortlisted = job ? isShortlisted(job.id, candidate.id) : false;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/candidates">
          <ArrowLeft className="size-4" aria-hidden /> All candidates
        </Link>
      </Button>

      <PageHeader
        title={candidate.name}
        subtitle={`${candidate.targetRole || "Role not specified"} · ${candidate.location || "Location not provided"} · ${candidate.experienceYears} yrs experience`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={job?.id ?? ""} onValueChange={setJobId}>
              <SelectTrigger className="w-56" aria-label="Score against job">
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
            <Button
              disabled={!job || shortlisted}
              onClick={() => {
                if (!job || !match) return;
                shortlist(job.id, candidate.id, match.score);
                toast.success(`${candidate.name} shortlisted for ${job.title}.`);
              }}
            >
              <Star className="size-4" aria-hidden />
              {shortlisted ? "Shortlisted" : "Shortlist"}
            </Button>
          </div>
        }
      />

      {match && job ? (
        <div className="surface-card space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Match for {job.title}</p>
              <p className="text-3xl font-semibold">{match.score}/100</p>
            </div>
            <MatchBadge status={match.status} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-medium">Skill</th>
                  <th className="py-2 pr-4 font-medium">Weight</th>
                  <th className="py-2 pr-4 font-medium">Required</th>
                  <th className="py-2 pr-4 font-medium">Candidate</th>
                  <th className="py-2 pr-4 font-medium">Evidence</th>
                  <th className="py-2 font-medium">Points</th>
                </tr>
              </thead>
              <tbody>
                {match.breakdown.map((b) => (
                  <tr key={b.skill} className="border-t border-border">
                    <td className="py-2 pr-4 font-medium">{b.skill}</td>
                    <td className="py-2 pr-4">{b.weight}%</td>
                    <td className="py-2 pr-4">{requiredLevelFor(job, b.skill)}</td>
                    <td className="py-2 pr-4">{b.levelLabel}</td>
                    <td className="py-2 pr-4">
                      <ConfidenceBadge confidence={b.confidence} />
                    </td>
                    <td className="py-2">
                      {b.contribution} / {b.weight}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold">What increased this score</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {match.increased.length ? (
                  match.increased.map((t) => <li key={t}>• {t}</li>)
                ) : (
                  <li>No skill reached a strong evidence threshold for this rubric.</li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What lowered this score</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {match.lowered.length ? (
                  match.lowered.map((t) => <li key={t}>• {t}</li>)
                ) : (
                  <li>Nothing significant reduced this score.</li>
                )}
              </ul>
            </div>
          </div>

          {match.gaps.length ? (
            <div>
              <h3 className="text-sm font-semibold">Skill gaps</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {match.gaps.map((g) => (
                  <li key={g.skill}>
                    • {g.skill}: required {g.required}, candidate {g.candidate}. {g.impact}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <EmptyState
          title="No job selected"
          description="Choose a job above to see the transparent match breakdown for this candidate."
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold">Skills and evidence</h3>
          <ul className="mt-3 space-y-3">
            {candidate.skills.map((s) => (
              <li key={s.name} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {levelLabel(s.level)} · {s.level}/100
                  </span>
                </div>
                <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
                  {s.evidence.map((e) => (
                    <li key={e.id} className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="font-normal">
                        {e.type}
                      </Badge>
                      <ConfidenceBadge confidence={e.confidence} />
                      <span>{e.description}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-card space-y-3 p-5 text-sm">
          <h3 className="text-sm font-semibold">Background</h3>
          <p className="text-muted-foreground">
            {candidate.education || "Education not provided"}
            {candidate.college ? ` · ${candidate.college}` : ""}
          </p>
          <p className="text-muted-foreground">{candidate.email || "No email"} · {candidate.phone || "No phone"}</p>
          {candidate.portfolio ? (
            <p className="text-muted-foreground">Portfolio: {candidate.portfolio}</p>
          ) : null}
          {candidate.workExperience.length ? (
            <div>
              <h4 className="font-medium">Work experience</h4>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                {candidate.workExperience.map((w, i) => (
                  <li key={i}>• {w.role} at {w.company} ({w.duration})</li>
                ))}
              </ul>
            </div>
          ) : null}
          {candidate.projects.length ? (
            <div>
              <h4 className="font-medium">Projects</h4>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                {candidate.projects.map((p, i) => (
                  <li key={i}>• {p.name} — {p.description}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            College and college tier are recorded for fairness auditing only. They are never inputs
            to the match score.
          </p>
        </div>
      </div>

      <HumanInLoop />
    </div>
  );
}
