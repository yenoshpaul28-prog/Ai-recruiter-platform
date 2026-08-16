import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Authentication architecture.
 *
 * This provider owns the whole session surface the app consumes: `session`,
 * `signIn`, `signUp`, `signOut`. Today it is backed by a local demo session so
 * the MVP works without credentials — no external auth service is running and
 * the app never claims otherwise.
 *
 * To move to a real backend (Lovable Cloud / Supabase), replace only the three
 * marked functions below with the provider calls and read configuration from
 * environment variables (import.meta.env.VITE_*). No secret keys live in this
 * file or anywhere else in the client bundle.
 */

export interface Session {
  userId: string;
  name: string;
  email: string;
  organization: string;
}

const SESSION_KEY = "clear-talent-ai:session:v1";

interface AuthValue {
  session: Session | null;
  ready: boolean;
  backend: "local-demo" | "cloud";
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, organization: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) setSession(JSON.parse(raw) as Session);
    } catch {
      /* ignore corrupt session */
    }
    setReady(true);
  }, []);

  const persist = (next: Session | null) => {
    setSession(next);
    if (next) window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    else window.localStorage.removeItem(SESSION_KEY);
  };

  // --- replace with provider auth when credentials are configured ---
  const signIn = useCallback(async (email: string, password: string) => {
    if (!email.includes("@")) throw new Error("Enter a valid email address.");
    if (password.length < 6) throw new Error("Password must be at least 6 characters.");
    persist({
      userId: "local-recruiter",
      name: email.split("@")[0]!.replace(/[._]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
      email,
      organization: "Clear Talent AI (Demo Org)",
    });
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string, organization: string) => {
      if (!name.trim()) throw new Error("Enter your name.");
      if (!email.includes("@")) throw new Error("Enter a valid email address.");
      if (password.length < 6) throw new Error("Password must be at least 6 characters.");
      persist({
        userId: "local-recruiter",
        name: name.trim(),
        email,
        organization: organization.trim() || "Clear Talent AI (Demo Org)",
      });
    },
    [],
  );

  const signOut = useCallback(() => persist(null), []);
  // --- end replaceable block ---

  const value = useMemo<AuthValue>(
    () => ({ session, ready, backend: "local-demo", signIn, signUp, signOut }),
    [session, ready, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
