import { computeMatch, rankCandidates } from "./scoring";
import type { Candidate, Job, ShortlistEntry } from "./types";

export function candidatesForJob(job: Job, candidates: Candidate[]): Candidate[] {
  return candidates.filter((c) => c.jobIds.includes(job.id));
}

export interface JobStats {
  candidateCount: number;
  avgMatch: number;
  shortlisted: number;
}

export function jobStats(
  job: Job,
  candidates: Candidate[],
  shortlists: ShortlistEntry[],
): JobStats {
  const pool = candidatesForJob(job, candidates);
  const scores = pool.map((c) => computeMatch(job, c).score);
  const avg = scores.length ? scores.reduce((s, n) => s + n, 0) / scores.length : 0;
  return {
    candidateCount: pool.length,
    avgMatch: Math.round(avg * 10) / 10,
    shortlisted: shortlists.filter((s) => s.jobId === job.id).length,
  };
}

export function topCandidatesAcrossJobs(
  jobs: Job[],
  candidates: Candidate[],
  limit = 5,
) {
  const rows = jobs
    .filter((j) => j.status === "Active")
    .flatMap((job) =>
      rankCandidates(job, candidatesForJob(job, candidates)).map((r) => ({ ...r, job })),
    )
    .sort((a, z) => z.match.score - a.match.score);
  const seen = new Set<string>();
  const unique = rows.filter((r) => {
    if (seen.has(r.candidate.id)) return false;
    seen.add(r.candidate.id);
    return true;
  });
  return unique.slice(0, limit);
}

export function averageMatchAcrossJobs(jobs: Job[], candidates: Candidate[]): number {
  const all = jobs
    .filter((j) => j.status === "Active")
    .flatMap((job) => candidatesForJob(job, candidates).map((c) => computeMatch(job, c).score));
  if (!all.length) return 0;
  return Math.round((all.reduce((s, n) => s + n, 0) / all.length) * 10) / 10;
}

export function primaryJobFor(candidate: Candidate, jobs: Job[]): Job | undefined {
  return jobs.find((j) => candidate.jobIds.includes(j.id));
}

/** Fairness signals. Audit-only: never feeds back into scoring or ranking. */
export interface BiasSignal {
  id: string;
  title: string;
  status: "Review Recommended" | "Looks balanced";
  explanation: string;
}

export function biasAudit(jobs: Job[], candidates: Candidate[], shortlists: ShortlistEntry[]) {
  const tiers: (1 | 2 | 3)[] = [1, 2, 3];
  const total = candidates.length || 1;
  const distribution = tiers.map((tier) => {
    const pool = candidates.filter((c) => c.collegeTier === tier);
    const scores = jobs
      .filter((j) => j.status === "Active")
      .flatMap((job) =>
        pool.filter((c) => c.jobIds.includes(job.id)).map((c) => computeMatch(job, c).score),
      );
    const shortlistedIds = new Set(shortlists.map((s) => s.candidateId));
    const shortlistedCount = pool.filter((c) => shortlistedIds.has(c.id)).length;
    return {
      tier,
      candidates: pool.length,
      applicantShare: Math.round((pool.length / total) * 100),
      avgScore: scores.length
        ? Math.round((scores.reduce((s, n) => s + n, 0) / scores.length) * 10) / 10
        : 0,
      shortlisted: shortlistedCount,
      shortlistShare: shortlists.length
        ? Math.round((shortlistedCount / shortlists.length) * 100)
        : 0,
    };
  });

  const signals: BiasSignal[] = [];
  for (const row of distribution) {
    if (row.candidates === 0) continue;
    const delta = row.applicantShare - row.shortlistShare;
    if (delta >= 15) {
      signals.push({
        id: `tier-${row.tier}-under`,
        title: `Tier-${row.tier} candidates represent ${row.applicantShare}% of applicants but ${row.shortlistShare}% of the shortlist.`,
        status: "Review Recommended",
        explanation:
          "This is a fairness signal for recruiter review. It does not automatically indicate discrimination, and it has not changed any candidate's score or rank.",
      });
    } else if (delta <= -15) {
      signals.push({
        id: `tier-${row.tier}-over`,
        title: `Tier-${row.tier} candidates represent ${row.applicantShare}% of applicants but ${row.shortlistShare}% of the shortlist.`,
        status: "Review Recommended",
        explanation:
          "Shortlisting is concentrated in this group. Review whether the underlying evidence justifies the difference.",
      });
    }
  }

  const notVerifiedHeavy = candidates.filter((c) =>
    c.skills.some((s) => s.evidence.every((e) => e.confidence === "NOT_VERIFIED")),
  ).length;
  if (notVerifiedHeavy > 0) {
    signals.push({
      id: "evidence-quality",
      title: `${notVerifiedHeavy} candidate(s) have at least one skill supported only by unverified, self-reported information.`,
      status: "Review Recommended",
      explanation:
        "Self-reported skills are scored on weaker evidence. Consider requesting an assessment or project link before making a decision.",
    });
  }

  return { distribution, signals };
}
