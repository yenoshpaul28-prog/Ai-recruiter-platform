import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DemoTag,
  EmptyState,
  ErrorState,
  HumanInLoop,
  MatchBadge,
  PageHeader,
  StatCard,
} from "@/components/ct/primitives";
import { useStore } from "@/lib/ct/store";
import {
  averageMatchAcrossJobs,
  biasAudit,
  jobStats,
  topCandidatesAcrossJobs,
} from "@/lib/ct/selectors";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Recruiter Dashboard — Clear Talent AI" },
      {
        name: "description",
        content:
          "Overview of active jobs, top-matching candidates, shortlist activity and fairness signals in Clear Talent AI.",
      },
      { property: "og:title", content: "Recruiter Dashboard — Clear Talent AI" },
      {
        property: "og:description",
        content: "Transparent match scores and explainable rankings for every open role.",
      },
    ],
  }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { jobs, candidates, shortlists, activity, loading, error } = useStore();

  const activeJobs = jobs.filter((j) => j.status === "Active");
  const avgMatch = averageMatchAcrossJobs(jobs, candidates);
  const top = topCandidatesAcrossJobs(jobs, candidates, 5);
  const { signals } = biasAudit(jobs, candidates, shortlists);

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <p className="text-sm text-muted-foreground">Loading your recruitment activity…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${greeting()}, Recruiter`}
        subtitle="Here's an overview of your recruitment activity."
        actions={
          <Button asChild>
            <Link to="/jobs/new">
              <Plus className="size-4" aria-hidden /> Create Job
            </Link>
          </Button>
        }
      />

      {error ? <ErrorState message={error} /> : null}

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Active Jobs" value={activeJobs.length} />
        <StatCard label="Total Candidates" value={candidates.length} />
        <StatCard label="Shortlisted" value={shortlists.length} tone="success" />
        <StatCard label="Average Match" value={`${avgMatch}%`} hint="Across active jobs" />
        <StatCard
          label="Bias Signals"
          value={signals.length}
          tone={signals.length ? "warning" : "success"}
          hint={signals.length ? "Review recommended" : "No signals"}
        />
      </section>

      <section aria-label="Active jobs" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Active Jobs</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/jobs">View all jobs</Link>
          </Button>
        </div>
        {activeJobs.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="size-5" aria-hidden />}
            title="No active jobs yet"
            description="Create a job, define the skills that matter and set your scoring weights to start matching candidates."
            action={
              <Button asChild>
                <Link to="/jobs/new">Create your first job</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeJobs.map((job) => {
              const s = jobStats(job, candidates, shortlists);
              return (
                <Card key={job.id} className="shadow-none transition-shadow hover:shadow-[var(--shadow-raised)]">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">
                        <Link to="/jobs/$jobId" params={{ jobId: job.id }} className="hover:underline">
                          {job.title}
                        </Link>
                      </CardTitle>
                      <Badge variant="outline" className="border-success/30 bg-success-soft text-success">
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {job.location} · {job.experience}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <dl className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <dt className="text-xs text-muted-foreground">Candidates</dt>
                        <dd className="font-semibold tabular-nums">{s.candidateCount}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Avg match</dt>
                        <dd className="font-semibold tabular-nums">{s.avgMatch}%</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Shortlisted</dt>
                        <dd className="font-semibold tabular-nums">{s.shortlisted}</dd>
                      </div>
                    </dl>
                    <div className="flex items-center justify-between">
                      {job.isDemo ? <DemoTag /> : <span />}
                      <Button asChild variant="outline" size="sm">
                        <Link to="/jobs/$jobId" params={{ jobId: job.id }}>
                          Open ranking
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section aria-label="Top candidates" className="space-y-3">
        <h2 className="text-lg font-semibold">Top Candidates</h2>
        {top.length === 0 ? (
          <EmptyState
            icon={<Users className="size-5" aria-hidden />}
            title="No candidates to rank yet"
            description="Add candidates to an active job and Clear Talent AI will calculate a transparent match score for each one."
            action={
              <Button asChild>
                <Link to="/candidates">Add candidates</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {top.map(({ candidate, match, job }) => (
              <div key={candidate.id} className="surface-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      to="/candidates/$candidateId"
                      params={{ candidateId: candidate.id }}
                      className="text-base font-semibold hover:underline"
                    >
                      {candidate.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {candidate.targetRole} · {candidate.location}
                    </p>
                  </div>
                  <MatchBadge status={match.status} score={match.score} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {match.breakdown.slice(0, 3).map((b) => (
                    <Badge key={b.skill} variant="secondary" className="font-normal">
                      {b.skill} · {b.contribution}/{b.weight}
                    </Badge>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Evidence strength:{" "}
                  <span className="font-medium text-foreground">{match.evidenceStrength}</span> · Job:{" "}
                  <Link to="/jobs/$jobId" params={{ jobId: job.id }} className="font-medium text-foreground hover:underline">
                    {job.title}
                  </Link>
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/candidates/$candidateId" params={{ candidateId: candidate.id }}>
                      View profile
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/jobs/$jobId" params={{ jobId: job.id }}>
                      Review &amp; shortlist
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <HumanInLoop />
      </section>

      <section aria-label="Recent activity" className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        {activity.length === 0 ? (
          <EmptyState title="No activity yet" description="Actions you take will appear here." />
        ) : (
          <ul className="surface-card divide-y divide-border">
            {activity.slice(0, 8).map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <span className="text-sm">{a.message}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(a.at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
