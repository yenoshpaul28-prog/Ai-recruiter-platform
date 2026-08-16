import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, HumanInLoop, PageHeader } from "@/components/ct/primitives";
import { useStore } from "@/lib/ct/store";

export const Route = createFileRoute("/shortlists")({
  head: () => ({
    meta: [
      { title: "Shortlists — Clear Talent AI" },
      {
        name: "description",
        content:
          "Review every shortlisted candidate across all open roles, with the score and evidence that supported the decision.",
      },
      { property: "og:title", content: "Shortlists — Clear Talent AI" },
      {
        property: "og:description",
        content: "Recruiter-owned shortlists across all roles.",
      },
    ],
  }),
  component: ShortlistsPage,
});

const STATUSES = ["Under review", "Interview planned", "On hold"] as const;

function ShortlistsPage() {
  const { shortlists, jobs, candidates, updateShortlist, removeShortlist } = useStore();

  if (shortlists.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Shortlists" subtitle="Candidates you have chosen to move forward." />
        <EmptyState
          icon={<Star className="size-5" aria-hidden />}
          title="No shortlisted candidates yet"
          description="Open a job's ranking view and shortlist the candidates you want to progress."
          action={
            <Button asChild>
              <Link to="/jobs">Go to jobs</Link>
            </Button>
          }
        />
        <HumanInLoop />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shortlists"
        subtitle={`${shortlists.length} candidate(s) shortlisted by a recruiter, never automatically.`}
      />

      <div className="space-y-3">
        {shortlists.map((entry) => {
          const candidate = candidates.find((c) => c.id === entry.candidateId);
          const job = jobs.find((j) => j.id === entry.jobId);
          return (
            <div
              key={entry.id}
              className="surface-card flex flex-wrap items-center justify-between gap-4 p-5"
            >
              <div className="min-w-0">
                <p className="font-semibold">
                  {candidate ? (
                    <Link
                      to="/candidates/$candidateId"
                      params={{ candidateId: candidate.id }}
                      className="hover:underline"
                    >
                      {candidate.name}
                    </Link>
                  ) : (
                    "Candidate removed"
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {job ? (
                    <Link to="/jobs/$jobId" params={{ jobId: job.id }} className="hover:underline">
                      {job.title}
                    </Link>
                  ) : (
                    "Job removed"
                  )}{" "}
                  · match {entry.score}/100 ·{" "}
                  {new Date(entry.shortlistedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={entry.status}
                  onValueChange={(v) =>
                    updateShortlist(entry.id, { status: v as (typeof STATUSES)[number] })
                  }
                >
                  <SelectTrigger className="w-44" aria-label="Shortlist status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    removeShortlist(entry.jobId, entry.candidateId);
                    toast.success("Removed from shortlist.");
                  }}
                >
                  <Trash2 className="size-4" aria-hidden /> Remove
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <HumanInLoop />
    </div>
  );
}
