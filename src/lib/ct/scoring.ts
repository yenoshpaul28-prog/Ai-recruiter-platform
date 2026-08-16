import type {
  Candidate,
  CandidateSkill,
  Confidence,
  Job,
  LevelLabel,
  RubricWeight,
} from "./types";

/**
 * Transparent, deterministic matching engine.
 *
 * No external AI model is involved. Every number below is reproducible:
 *   contribution = candidate skill level (0-100) x job skill weight (%) / 100
 *   overall score = sum of contributions, normalised to a 100-point scale.
 *
 * Candidate attributes such as college, college tier, gender or background are
 * NEVER inputs to this function. Only job-relevant skill evidence is used.
 */

export function levelLabel(level: number): LevelLabel {
  if (level <= 0) return "No evidence";
  if (level < 40) return "Beginner";
  if (level < 65) return "Intermediate";
  if (level < 85) return "Advanced";
  return "Expert";
}

export function requiredLevelFor(job: Job, skill: string): LevelLabel | "Preferred" {
  if (job.mustHaveSkills.includes(skill)) return "Advanced";
  if (job.requiredSkills.includes(skill)) return "Intermediate";
  return "Preferred";
}

const CONFIDENCE_RANK: Record<Confidence, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  NOT_VERIFIED: 0,
};

export function bestConfidence(skill: CandidateSkill | undefined): Confidence {
  if (!skill || skill.evidence.length === 0) return "NOT_VERIFIED";
  return skill.evidence.reduce<Confidence>(
    (best, e) => (CONFIDENCE_RANK[e.confidence] > CONFIDENCE_RANK[best] ? e.confidence : best),
    "NOT_VERIFIED",
  );
}

export interface SkillContribution {
  skill: string;
  weight: number;
  level: number;
  levelLabel: LevelLabel;
  contribution: number;
  confidence: Confidence;
  evidenceCount: number;
  evidenceTypes: string[];
}

export interface SkillGap {
  skill: string;
  required: string;
  candidate: LevelLabel;
  impact: string;
}

export type MatchStatus = "Strong Match" | "Good Match" | "Partial Match" | "Low Match";

export interface MatchResult {
  score: number;
  status: MatchStatus;
  breakdown: SkillContribution[];
  increased: string[];
  lowered: string[];
  gaps: SkillGap[];
  evidenceStrength: "Strong" | "Moderate" | "Limited";
}

export function matchStatus(score: number): MatchStatus {
  if (score >= 66) return "Strong Match";
  if (score >= 55) return "Good Match";
  if (score >= 40) return "Partial Match";
  return "Low Match";
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function computeMatch(job: Job, candidate: Candidate, rubric?: RubricWeight[]): MatchResult {
  const weights = (rubric ?? job.rubric).filter((r) => r.weight > 0);
  const totalWeight = weights.reduce((s, r) => s + r.weight, 0) || 100;

  const breakdown: SkillContribution[] = weights.map((r) => {
    const skill = candidate.skills.find(
      (s) => s.name.toLowerCase() === r.skill.toLowerCase(),
    );
    const level = skill?.level ?? 0;
    const contribution = (level / 100) * r.weight;
    return {
      skill: r.skill,
      weight: r.weight,
      level,
      levelLabel: levelLabel(level),
      contribution: round1(contribution),
      confidence: bestConfidence(skill),
      evidenceCount: skill?.evidence.length ?? 0,
      evidenceTypes: [...new Set((skill?.evidence ?? []).map((e) => e.type))],
    };
  });

  const raw = breakdown.reduce((s, b) => s + b.contribution, 0);
  // Normalise to a 100-point scale in case the rubric does not total 100.
  const score = round1((raw / totalWeight) * 100);

  const increased: string[] = [];
  const lowered: string[] = [];

  for (const b of [...breakdown].sort((a, z) => z.contribution - a.contribution)) {
    const share = b.weight ? b.contribution / b.weight : 0;
    if (share >= 0.75 && b.confidence === "HIGH") {
      increased.push(
        `Strong ${b.skill} evidence (${b.evidenceTypes.join(", ") || "resume"}) contributed ${b.contribution} of ${b.weight} points.`,
      );
    } else if (share >= 0.6) {
      increased.push(
        `Solid ${b.skill} signal contributed ${b.contribution} of ${b.weight} points, based on ${b.evidenceTypes.join(", ") || "self-reported information"}.`,
      );
    }

    if (b.level === 0) {
      lowered.push(`No reliable ${b.skill} evidence, so it contributed 0 of ${b.weight} points.`);
    } else if (share < 0.6) {
      lowered.push(
        `${b.skill} evidence is ${b.levelLabel.toLowerCase()} level, so it contributed only ${b.contribution} of ${b.weight} points.`,
      );
    } else if (b.confidence === "MEDIUM" || b.confidence === "LOW") {
      lowered.push(
        `${b.skill} evidence is ${b.confidence.toLowerCase()} confidence (${b.evidenceTypes.join(", ") || "self-reported"}), which limits how much it can raise the score.`,
      );
    }
  }

  const gaps: SkillGap[] = [];
  const requirementRank: Record<string, number> = {
    Advanced: 85,
    Intermediate: 65,
    Preferred: 40,
  };
  const allJobSkills = [
    ...new Set([...job.mustHaveSkills, ...job.requiredSkills, ...job.optionalSkills]),
  ];
  for (const skillName of allJobSkills) {
    const required = requiredLevelFor(job, skillName);
    const level =
      candidate.skills.find((s) => s.name.toLowerCase() === skillName.toLowerCase())?.level ?? 0;
    const threshold = requirementRank[required] ?? 40;
    if (level < threshold) {
      const inRubric = weights.some((w) => w.skill.toLowerCase() === skillName.toLowerCase());
      gaps.push({
        skill: skillName,
        required,
        candidate: levelLabel(level),
        impact:
          level === 0
            ? inRubric
              ? "No contribution to the match score"
              : "Not scored — no evidence available"
            : "Reduced match score",
      });
    }
  }

  const highs = breakdown.filter((b) => b.confidence === "HIGH").length;
  const evidenceStrength =
    highs >= Math.max(2, Math.ceil(breakdown.length / 2))
      ? "Strong"
      : highs >= 1
        ? "Moderate"
        : "Limited";

  return {
    score,
    status: matchStatus(score),
    breakdown: breakdown.sort((a, z) => z.contribution - a.contribution),
    increased: increased.slice(0, 4),
    lowered: lowered.slice(0, 4),
    gaps,
    evidenceStrength,
  };
}

export interface RankedCandidate {
  candidate: Candidate;
  match: MatchResult;
  rank: number;
}

export function rankCandidates(
  job: Job,
  candidates: Candidate[],
  rubric?: RubricWeight[],
): RankedCandidate[] {
  return candidates
    .map((candidate) => ({ candidate, match: computeMatch(job, candidate, rubric) }))
    .sort((a, z) => z.match.score - a.match.score || a.candidate.name.localeCompare(z.candidate.name))
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

export function rubricTotal(rubric: RubricWeight[]): number {
  return Math.round(rubric.reduce((s, r) => s + (Number(r.weight) || 0), 0));
}
