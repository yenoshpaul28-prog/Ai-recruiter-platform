export type Confidence = "HIGH" | "MEDIUM" | "LOW" | "NOT_VERIFIED";

export type EvidenceType =
  | "Project"
  | "Assessment"
  | "Certification"
  | "Work Experience"
  | "Portfolio"
  | "Verified Credential"
  | "Self-reported";

export const EVIDENCE_TYPES: EvidenceType[] = [
  "Project",
  "Assessment",
  "Certification",
  "Work Experience",
  "Portfolio",
  "Verified Credential",
  "Self-reported",
];

export type LevelLabel = "No evidence" | "Beginner" | "Intermediate" | "Advanced" | "Expert";

export type JobStatus = "Active" | "Draft" | "Closed";

export interface Evidence {
  id: string;
  type: EvidenceType;
  description: string;
  confidence: Confidence;
  source: string;
}

export interface CandidateSkill {
  name: string;
  /** 0-100 deterministic skill level derived from evidence. */
  level: number;
  evidence: Evidence[];
}

export interface Project {
  name: string;
  description: string;
  skills: string[];
}

export interface Assessment {
  name: string;
  score: number;
  status: "Completed" | "Pending";
}

export interface WorkExperienceItem {
  company: string;
  role: string;
  duration: string;
  summary: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  experienceYears: number;
  targetRole: string;
  education: string;
  college: string;
  /** Audit-only attribute. Never used in scoring. */
  collegeTier: 1 | 2 | 3;
  skills: CandidateSkill[];
  projects: Project[];
  certifications: string[];
  assessments: Assessment[];
  workExperience: WorkExperienceItem[];
  portfolio: string;
  jobIds: string[];
  isDemo: boolean;
  createdAt: string;
}

export interface RubricWeight {
  skill: string;
  weight: number;
}

export interface Job {
  id: string;
  title: string;
  location: string;
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship";
  experience: string;
  description: string;
  requiredSkills: string[];
  mustHaveSkills: string[];
  optionalSkills: string[];
  evidencePreferences: EvidenceType[];
  rubric: RubricWeight[];
  status: JobStatus;
  createdAt: string;
  isDemo: boolean;
}

export interface ShortlistEntry {
  id: string;
  jobId: string;
  candidateId: string;
  score: number;
  shortlistedAt: string;
  notes: string;
  status: "Under review" | "Interview planned" | "On hold";
}

export interface ActivityItem {
  id: string;
  message: string;
  at: string;
}

export interface Recruiter {
  id: string;
  name: string;
  email: string;
  organization: string;
}

export interface AppData {
  jobs: Job[];
  candidates: Candidate[];
  shortlists: ShortlistEntry[];
  activity: ActivityItem[];
  recruiter: Recruiter;
}
