import { Info, ShieldCheck, TriangleAlert, CircleHelp, BadgeCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Confidence } from "@/lib/ct/types";
import type { MatchStatus } from "@/lib/ct/scoring";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "critical";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "critical"
          ? "text-critical"
          : "text-foreground";
  return (
    <Card className="shadow-none">
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={cn("mt-2 text-3xl font-semibold tabular-nums", toneClass)}>{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function MatchBadge({ status, score }: { status: MatchStatus; score?: number }) {
  const map: Record<MatchStatus, string> = {
    "Strong Match": "bg-success-soft text-success border-success/30",
    "Good Match": "bg-primary-soft text-accent-foreground border-primary/25",
    "Partial Match": "bg-warning-soft text-warning-foreground border-warning/35",
    "Low Match": "bg-critical-soft text-critical border-critical/30",
  };
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", map[status])}>
      {score !== undefined ? <span className="tabular-nums">{score.toFixed(1)}</span> : null}
      {status}
    </Badge>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const map: Record<Confidence, { cls: string; label: string; icon: ReactNode }> = {
    HIGH: {
      cls: "bg-success-soft text-success border-success/30",
      label: "High confidence",
      icon: <BadgeCheck className="size-3.5" aria-hidden />,
    },
    MEDIUM: {
      cls: "bg-primary-soft text-accent-foreground border-primary/25",
      label: "Medium confidence",
      icon: <ShieldCheck className="size-3.5" aria-hidden />,
    },
    LOW: {
      cls: "bg-warning-soft text-warning-foreground border-warning/35",
      label: "Low confidence",
      icon: <TriangleAlert className="size-3.5" aria-hidden />,
    },
    NOT_VERIFIED: {
      cls: "bg-muted text-muted-foreground border-border",
      label: "Not verified",
      icon: <CircleHelp className="size-3.5" aria-hidden />,
    },
  };
  const c = map[confidence];
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", c.cls)}>
      {c.icon}
      {c.label}
    </Badge>
  );
}

export function ScoreBar({
  label,
  value,
  max,
  caption,
}: {
  label: string;
  value: number;
  max: number;
  caption?: ReactNode;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm tabular-nums text-muted-foreground">
          {value.toFixed(1)} / {max}
        </span>
      </div>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label={`${label} contribution`}
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      {caption ? <div className="mt-1.5 text-xs text-muted-foreground">{caption}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="surface-card flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <Info className="size-5" aria-hidden />}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message, retry }: { message: string; retry?: ReactNode }) {
  return (
    <div className="surface-card border-critical/30 bg-critical-soft/50 px-5 py-4">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 size-5 text-critical" aria-hidden />
        <div>
          <p className="text-sm font-medium text-foreground">Something needs your attention</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{message}</p>
          {retry ? <div className="mt-3">{retry}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function HumanInLoop({
  className,
  variant = "inline",
}: {
  className?: string;
  variant?: "inline" | "card";
}) {
  if (variant === "card") {
    return (
      <div className={cn("surface-card bg-primary-soft/50 px-5 py-4", className)}>
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 text-primary" aria-hidden />
          <div>
            <p className="text-sm font-semibold">Human-in-the-loop</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Clear Talent AI recommends and explains. The recruiter makes the final decision. No
              candidate is ever automatically rejected, hired or contacted.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <p className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <ShieldCheck className="size-3.5 text-primary" aria-hidden />
      Clear Talent AI recommends and explains — the recruiter makes the final decision.
    </p>
  );
}

export function LoadingBlock({ label, rows = 3 }: { label: string; rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <p className="text-sm text-muted-foreground">{label}</p>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function DemoTag() {
  return (
    <Badge variant="outline" className="border-border bg-muted text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      Demo data
    </Badge>
  );
}
