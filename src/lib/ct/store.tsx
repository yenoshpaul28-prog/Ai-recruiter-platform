import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buildDemoData } from "./demo-data";
import type {
  ActivityItem,
  AppData,
  Candidate,
  Job,
  ShortlistEntry,
} from "./types";

/**
 * Local persistence layer.
 *
 * All jobs, candidates, shortlists and notes are stored in the browser so the
 * MVP is fully functional without credentials. The shape mirrors the intended
 * relational model (jobs, job_skills, job_rubrics, candidates,
 * candidate_skills, candidate_evidence, shortlists, recruiter_notes), so it can
 * be swapped for a Lovable Cloud / Supabase backed repository without touching
 * the UI. Match scores are always computed from rubric + evidence, never stored.
 */

const STORAGE_KEY = "clear-talent-ai:data:v1";

export const uid = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;

interface StoreValue extends AppData {
  loading: boolean;
  error: string | null;
  createJob: (job: Omit<Job, "id" | "createdAt" | "isDemo">) => Job;
  updateJob: (id: string, patch: Partial<Job>) => void;
  duplicateJob: (id: string) => void;
  setJobStatus: (id: string, status: Job["status"]) => void;
  addCandidate: (candidate: Omit<Candidate, "id" | "createdAt" | "isDemo">) => Candidate;
  addCandidates: (candidates: Omit<Candidate, "id" | "createdAt" | "isDemo">[]) => number;
  assignCandidateToJob: (candidateId: string, jobId: string) => void;
  isShortlisted: (jobId: string, candidateId: string) => boolean;
  shortlist: (jobId: string, candidateId: string, score: number, notes?: string) => void;
  removeShortlist: (jobId: string, candidateId: string) => void;
  updateShortlist: (id: string, patch: Partial<ShortlistEntry>) => void;
  resetDemoData: () => void;
  updateRecruiter: (patch: Partial<AppData["recruiter"]>) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => buildDemoData());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppData;
        if (parsed?.jobs && parsed?.candidates) setData(parsed);
      }
    } catch {
      setError("We couldn't load your saved workspace. Showing demo data instead.");
    } finally {
      // Small delay keeps loading states honest and visible on first paint.
      const t = setTimeout(() => setLoading(false), 250);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      setError("Changes could not be saved locally.");
    }
  }, [data, loading]);

  const logActivity = (message: string): ActivityItem => ({
    id: uid("ac"),
    message,
    at: new Date().toISOString(),
  });

  const createJob: StoreValue["createJob"] = useCallback((job) => {
    const created: Job = { ...job, id: uid("job"), createdAt: new Date().toISOString(), isDemo: false };
    setData((d) => ({
      ...d,
      jobs: [created, ...d.jobs],
      activity: [logActivity(`Job created: ${created.title}`), ...d.activity].slice(0, 25),
    }));
    return created;
  }, []);

  const updateJob: StoreValue["updateJob"] = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      jobs: d.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
      activity: [
        logActivity(`${d.jobs.find((j) => j.id === id)?.title ?? "Job"} updated`),
        ...d.activity,
      ].slice(0, 25),
    }));
  }, []);

  const duplicateJob: StoreValue["duplicateJob"] = useCallback((id) => {
    setData((d) => {
      const src = d.jobs.find((j) => j.id === id);
      if (!src) return d;
      const copy: Job = {
        ...src,
        id: uid("job"),
        title: `${src.title} (Copy)`,
        status: "Draft",
        createdAt: new Date().toISOString(),
        isDemo: false,
      };
      return {
        ...d,
        jobs: [copy, ...d.jobs],
        activity: [logActivity(`Job duplicated: ${src.title}`), ...d.activity].slice(0, 25),
      };
    });
  }, []);

  const setJobStatus: StoreValue["setJobStatus"] = useCallback((id, status) => {
    setData((d) => ({
      ...d,
      jobs: d.jobs.map((j) => (j.id === id ? { ...j, status } : j)),
      activity: [
        logActivity(`${d.jobs.find((j) => j.id === id)?.title ?? "Job"} marked ${status}`),
        ...d.activity,
      ].slice(0, 25),
    }));
  }, []);

  const addCandidate: StoreValue["addCandidate"] = useCallback((candidate) => {
    const created: Candidate = {
      ...candidate,
      id: uid("cand"),
      createdAt: new Date().toISOString(),
      isDemo: false,
    };
    setData((d) => ({
      ...d,
      candidates: [created, ...d.candidates],
      activity: [logActivity(`Candidate added: ${created.name}`), ...d.activity].slice(0, 25),
    }));
    return created;
  }, []);

  const addCandidates: StoreValue["addCandidates"] = useCallback((list) => {
    const created = list.map((c) => ({
      ...c,
      id: uid("cand"),
      createdAt: new Date().toISOString(),
      isDemo: false,
    })) as Candidate[];
    setData((d) => ({
      ...d,
      candidates: [...created, ...d.candidates],
      activity: [logActivity(`${created.length} candidates imported`), ...d.activity].slice(0, 25),
    }));
    return created.length;
  }, []);

  const assignCandidateToJob: StoreValue["assignCandidateToJob"] = useCallback(
    (candidateId, jobId) => {
      setData((d) => ({
        ...d,
        candidates: d.candidates.map((c) =>
          c.id === candidateId && !c.jobIds.includes(jobId)
            ? { ...c, jobIds: [...c.jobIds, jobId] }
            : c,
        ),
      }));
    },
    [],
  );

  const shortlistFn: StoreValue["shortlist"] = useCallback((jobId, candidateId, score, notes) => {
    setData((d) => {
      if (d.shortlists.some((s) => s.jobId === jobId && s.candidateId === candidateId)) return d;
      const entry: ShortlistEntry = {
        id: uid("sl"),
        jobId,
        candidateId,
        score,
        shortlistedAt: new Date().toISOString(),
        notes: notes ?? "",
        status: "Under review",
      };
      return {
        ...d,
        shortlists: [entry, ...d.shortlists],
        activity: [
          logActivity(
            `${d.candidates.find((c) => c.id === candidateId)?.name ?? "Candidate"} shortlisted for ${d.jobs.find((j) => j.id === jobId)?.title ?? "job"}`,
          ),
          ...d.activity,
        ].slice(0, 25),
      };
    });
  }, []);

  const removeShortlist: StoreValue["removeShortlist"] = useCallback((jobId, candidateId) => {
    setData((d) => ({
      ...d,
      shortlists: d.shortlists.filter((s) => !(s.jobId === jobId && s.candidateId === candidateId)),
      activity: [
        logActivity(
          `${d.candidates.find((c) => c.id === candidateId)?.name ?? "Candidate"} removed from shortlist`,
        ),
        ...d.activity,
      ].slice(0, 25),
    }));
  }, []);

  const updateShortlist: StoreValue["updateShortlist"] = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      shortlists: d.shortlists.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }, []);

  const resetDemoData = useCallback(() => {
    setData(buildDemoData());
  }, []);

  const updateRecruiter: StoreValue["updateRecruiter"] = useCallback((patch) => {
    setData((d) => ({ ...d, recruiter: { ...d.recruiter, ...patch } }));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ...data,
      loading,
      error,
      createJob,
      updateJob,
      duplicateJob,
      setJobStatus,
      addCandidate,
      addCandidates,
      assignCandidateToJob,
      isShortlisted: (jobId, candidateId) =>
        data.shortlists.some((s) => s.jobId === jobId && s.candidateId === candidateId),
      shortlist: shortlistFn,
      removeShortlist,
      updateShortlist,
      resetDemoData,
      updateRecruiter,
    }),
    [
      data,
      loading,
      error,
      createJob,
      updateJob,
      duplicateJob,
      setJobStatus,
      addCandidate,
      addCandidates,
      assignCandidateToJob,
      shortlistFn,
      removeShortlist,
      updateShortlist,
      resetDemoData,
      updateRecruiter,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
