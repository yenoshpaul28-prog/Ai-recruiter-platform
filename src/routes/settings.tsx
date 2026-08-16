import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HumanInLoop, PageHeader } from "@/components/ct/primitives";
import { useStore } from "@/lib/ct/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Clear Talent AI" },
      {
        name: "description",
        content:
          "Manage your recruiter profile, reset demo data and read how Clear Talent AI keeps scoring transparent and recruiter-controlled.",
      },
      { property: "og:title", content: "Settings — Clear Talent AI" },
      {
        property: "og:description",
        content: "Recruiter profile and responsible AI disclosures.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { recruiter, updateRecruiter, resetDemoData } = useStore();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Your profile and how this product uses AI." />

      <form
        className="surface-card space-y-4 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          updateRecruiter({
            name: String(f.get("name") ?? ""),
            email: String(f.get("email") ?? ""),
            organization: String(f.get("organization") ?? ""),
          });
          toast.success("Profile updated.");
        }}
      >
        <h2 className="text-sm font-semibold">Recruiter profile</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="s-name">Name</Label>
            <Input id="s-name" name="name" defaultValue={recruiter.name} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-email">Email</Label>
            <Input id="s-email" name="email" type="email" defaultValue={recruiter.email} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-org">Organization</Label>
            <Input id="s-org" name="organization" defaultValue={recruiter.organization} />
          </div>
        </div>
        <Button type="submit">Save profile</Button>
      </form>

      <div className="surface-card space-y-3 p-5">
        <h2 className="text-sm font-semibold">Demo data</h2>
        <p className="text-sm text-muted-foreground">
          Restore the sample jobs and candidates. This clears jobs, candidates and shortlists you
          created in this browser.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            resetDemoData();
            toast.success("Demo data restored.");
          }}
        >
          <RotateCcw className="size-4" aria-hidden /> Reset demo data
        </Button>
      </div>

      <div className="surface-card space-y-3 p-5 text-sm text-muted-foreground">
        <h2 className="text-sm font-semibold text-foreground">How scoring works</h2>
        <p>
          Match scores are a deterministic weighted sum: each job rubric skill has a weight, and a
          candidate's evidence level for that skill contributes proportionally. The same inputs
          always produce the same score, and every point is traceable to a specific piece of
          evidence.
        </p>
        <p>
          Attributes such as college, college tier, gender, age or background are never inputs to
          scoring. They are recorded only so fairness audits are possible.
        </p>
        <p>
          Clear Talent AI recommends and explains. It never rejects, auto-hires or makes a final
          decision — recruiters do.
        </p>
      </div>

      <HumanInLoop />
    </div>
  );
}
