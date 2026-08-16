import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HumanInLoop, PageHeader } from "@/components/ct/primitives";
import { JobForm, emptyJobDraft, type JobDraft } from "@/components/ct/job-form";
import { useStore } from "@/lib/ct/store";

export const Route = createFileRoute("/jobs/new")({
  head: () => ({
    meta: [
      { title: "Create a Job — Clear Talent AI" },
      {
        name: "description",
        content:
          "Define job requirements, evidence preferences and a scoring rubric that totals 100% so every match score stays explainable.",
      },
      { property: "og:title", content: "Create a Job — Clear Talent AI" },
      {
        property: "og:description",
        content: "Set skills, evidence preferences and transparent scoring weights for a new role.",
      },
    ],
  }),
  component: CreateJobPage,
});

function CreateJobPage() {
  const { createJob } = useStore();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<JobDraft>({
    ...emptyJobDraft,
    requiredSkills: ["Python", "SQL", "REST APIs", "Git"],
    mustHaveSkills: ["Python"],
    optionalSkills: ["Docker", "AWS"],
    rubric: [
      { skill: "Python", weight: 30 },
      { skill: "SQL", weight: 25 },
      { skill: "REST APIs", weight: 20 },
      { skill: "Problem Solving", weight: 15 },
      { skill: "Communication", weight: 10 },
    ],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Job"
        subtitle="Requirements and weights decide how candidates are scored — and how the score is explained."
        actions={
          <Button asChild variant="outline">
            <Link to="/jobs">Cancel</Link>
          </Button>
        }
      />
      <HumanInLoop variant="card" />
      <JobForm
        value={draft}
        onChange={setDraft}
        submitLabel="Save job"
        onSubmit={() => {
          const job = createJob(draft);
          toast.success("Job saved. Add candidates to see transparent match scores.");
          void navigate({ to: "/jobs/$jobId", params: { jobId: job.id } });
        }}
      />
    </div>
  );
}
