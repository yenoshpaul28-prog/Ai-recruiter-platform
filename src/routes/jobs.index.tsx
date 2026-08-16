import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DemoTag, EmptyState, PageHeader } from "@/components/ct/primitives";
import { useStore } from "@/lib/ct/store";
import { jobStats } from "@/lib/ct/selectors";
import type { JobStatus } from "@/lib/ct/types";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Jobs — Clear Talent AI" },
      {
        name: "description",
        content:
          "Create, search and manage recruitment jobs with skill requirements and transparent scoring rubrics.",
      },
      { property: "og:title", content: "Jobs — Clear Talent AI" },
      {
        property: "og:description",
        content: "Manage open roles, rubrics and candidate pipelines in one place.",
      },
    ],
  }),
  component: JobsPage,
});

const STATUS_TABS: (JobStatus | "All")[] = ["All", "Active", "Draft", "Closed"];

function JobsPage() {
  const { jobs, candidates, shortlists, loading, duplicateJob, setJobStatus } = useStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<JobStatus | "All">("All");
  const [closeTarget, setCloseTarget] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const t = query.trim().toLowerCase();
    return jobs.filter(
      (j) =>
        (status === "All" || j.status === status) &&
        (!t || j.title.toLowerCase().includes(t) || j.location.toLowerCase().includes(t)),
    );
  }, [jobs, query, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        subtitle="Every job carries its own skill rubric, so match scores stay explainable."
        actions={
          <Button asChild>
            <Link to="/jobs/new">
              <Plus className="size-4" aria-hidden /> Create Job
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs"
            aria-label="Search jobs"
            className="pl-9"
          />
        </div>
        <Tabs value={status} onValueChange={(v) => setStatus(v as JobStatus | "All")}>
          <TabsList>
            {STATUS_TABS.map((s) => (
              <TabsTrigger key={s} value={s}>
                {s}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="space-y-3" aria-busy="true">
          <p className="text-sm text-muted-foreground">Loading jobs…</p>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="size-5" aria-hidden />}
          title="No jobs found"
          description={
            query || status !== "All"
              ? "Try a different search term or status filter."
              : "Create your first job to start matching candidates."
          }
          action={
            <Button asChild>
              <Link to="/jobs/new">Create Job</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => {
            const s = jobStats(job, candidates, shortlists);
            const statusCls =
              job.status === "Active"
                ? "border-success/30 bg-success-soft text-success"
                : job.status === "Draft"
                  ? "border-warning/35 bg-warning-soft text-warning-foreground"
                  : "border-border bg-muted text-muted-foreground";
            return (
              <div key={job.id} className="surface-card p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to="/jobs/$jobId"
                        params={{ jobId: job.id }}
                        className="text-base font-semibold hover:underline"
                      >
                        {job.title}
                      </Link>
                      <Badge variant="outline" className={statusCls}>
                        {job.status}
                      </Badge>
                      {job.isDemo ? <DemoTag /> : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {job.location} · {job.experience} · {job.jobType} · Created{" "}
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <dl className="grid grid-cols-3 gap-4 text-sm lg:w-72">
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

                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/jobs/$jobId" params={{ jobId: job.id }}>
                        View job
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          More
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to="/jobs/$jobId" params={{ jobId: job.id }} search={{ tab: "edit" }}>
                            Edit job
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            duplicateJob(job.id);
                            toast.success("Job duplicated as a draft.");
                          }}
                        >
                          Duplicate job
                        </DropdownMenuItem>
                        {job.status !== "Closed" ? (
                          <DropdownMenuItem onClick={() => setCloseTarget(job.id)}>
                            Close job
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => {
                              setJobStatus(job.id, "Active");
                              toast.success("Job reopened.");
                            }}
                          >
                            Reopen job
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={closeTarget !== null} onOpenChange={(o) => !o && setCloseTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close this job?</AlertDialogTitle>
            <AlertDialogDescription>
              Closing stops the job from appearing in active pipelines. Candidates, evidence and
              shortlists are kept, and no candidate is rejected automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (closeTarget) {
                  setJobStatus(closeTarget, "Closed");
                  toast.success("Job closed.");
                }
                setCloseTarget(null);
              }}
            >
              Close job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
