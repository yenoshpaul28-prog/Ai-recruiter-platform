import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HumanInLoop, PageHeader } from "@/components/ct/primitives";
import { biasAudit } from "@/lib/ct/selectors";
import { useStore } from "@/lib/ct/store";

export const Route = createFileRoute("/bias-audit")({
  head: () => ({
    meta: [
      { title: "Bias Audit — Clear Talent AI" },
      {
        name: "description",
        content:
          "Fairness signals across applicants and shortlists. Audit-only insights that never change a candidate's score or rank.",
      },
      { property: "og:title", content: "Bias Audit — Clear Talent AI" },
      {
        property: "og:description",
        content: "Representation and evidence-quality signals for recruiter review.",
      },
    ],
  }),
  component: BiasAuditPage,
});

function BiasAuditPage() {
  const { jobs, candidates, shortlists } = useStore();
  const { distribution, signals } = biasAudit(jobs, candidates, shortlists);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bias Audit"
        subtitle="Fairness signals for human review. Nothing here feeds back into scoring or ranking."
      />

      <div className="surface-card overflow-x-auto p-5">
        <h2 className="text-sm font-semibold">Representation by college tier (audit-only attribute)</h2>
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="py-2 pr-4 font-medium">Tier</th>
              <th className="py-2 pr-4 font-medium">Candidates</th>
              <th className="py-2 pr-4 font-medium">Applicant share</th>
              <th className="py-2 pr-4 font-medium">Average match</th>
              <th className="py-2 pr-4 font-medium">Shortlisted</th>
              <th className="py-2 font-medium">Shortlist share</th>
            </tr>
          </thead>
          <tbody>
            {distribution.map((row) => (
              <tr key={row.tier} className="border-t border-border">
                <td className="py-2 pr-4 font-medium">Tier {row.tier}</td>
                <td className="py-2 pr-4">{row.candidates}</td>
                <td className="py-2 pr-4">{row.applicantShare}%</td>
                <td className="py-2 pr-4">{row.avgScore}</td>
                <td className="py-2 pr-4">{row.shortlisted}</td>
                <td className="py-2">{row.shortlistShare}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Signals</h2>
        {signals.length === 0 ? (
          <div className="surface-card flex items-start gap-3 p-5">
            <ShieldCheck className="mt-0.5 size-5 text-success" aria-hidden />
            <div>
              <p className="font-medium">No fairness concerns detected</p>
              <p className="text-sm text-muted-foreground">
                Applicant and shortlist representation are broadly aligned, and every scored skill
                has supporting evidence. Keep reviewing as your pipeline grows.
              </p>
            </div>
          </div>
        ) : (
          signals.map((s) => (
            <div key={s.id} className="surface-card space-y-2 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{s.title}</p>
                <Badge variant="secondary">{s.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{s.explanation}</p>
            </div>
          ))
        )}
      </div>

      <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
        Scores are computed only from job-relevant skill evidence. Attributes such as college, tier,
        gender or background are never inputs to the matching engine — they are recorded solely so
        that these audits are possible.
      </p>

      <HumanInLoop />
    </div>
  );
}
