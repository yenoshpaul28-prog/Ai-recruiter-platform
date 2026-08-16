import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BookmarkCheck,
  Scale,
  Settings as SettingsIcon,
  Menu,
  Search,
  Bell,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/ct/auth";
import { useStore } from "@/lib/ct/store";
import { HumanInLoop } from "./primitives";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/candidates", label: "Candidates", icon: Users },
  { to: "/shortlists", label: "Shortlists", icon: BookmarkCheck },
  { to: "/bias-audit", label: "Bias Audit", icon: Scale },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-md px-1 py-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Sparkles className="size-4" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold">Clear Talent AI</span>
        <span className="block text-[11px] text-muted-foreground">Explainable matching</span>
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="space-y-1" aria-label="Main navigation">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function GlobalSearch() {
  const { jobs, candidates } = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return { jobs: [], candidates: [] };
    return {
      jobs: jobs.filter((j) => j.title.toLowerCase().includes(t)).slice(0, 4),
      candidates: candidates
        .filter((c) => c.name.toLowerCase().includes(t) || c.targetRole.toLowerCase().includes(t))
        .slice(0, 5),
    };
  }, [q, jobs, candidates]);

  return (
    <Popover open={open && q.trim().length > 0} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            placeholder="Search jobs and candidates"
            aria-label="Global search"
            className="pl-9"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-2">
        {results.jobs.length === 0 && results.candidates.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">No results for “{q}”.</p>
        ) : (
          <div className="space-y-2">
            {results.jobs.length > 0 && (
              <div>
                <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Jobs</p>
                {results.jobs.map((j) => (
                  <Link
                    key={j.id}
                    to="/jobs/$jobId"
                    params={{ jobId: j.id }}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    {j.title}
                    <span className="ml-2 text-xs text-muted-foreground">{j.location}</span>
                  </Link>
                ))}
              </div>
            )}
            {results.candidates.length > 0 && (
              <div>
                <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Candidates</p>
                {results.candidates.map((c) => (
                  <Link
                    key={c.id}
                    to="/candidates/$candidateId"
                    params={{ candidateId: c.id }}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    {c.name}
                    <span className="ml-2 text-xs text-muted-foreground">{c.targetRole}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function Notifications() {
  const { activity } = useStore();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Notifications (${activity.length})`} className="relative">
          <Bell className="size-4" aria-hidden />
          {activity.length > 0 && (
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <p className="mb-2 text-sm font-semibold">Notifications</p>
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing new right now.</p>
        ) : (
          <ul className="space-y-2">
            {activity.slice(0, 6).map((a) => (
              <li key={a.id} className="text-sm">
                <span className="block">{a.message}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(a.at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <h1 className="text-2xl font-semibold">Clear Talent AI</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Don't just see who matches. See <span className="font-medium text-foreground">why</span>.
          </p>
        </div>
        <div className="surface-card p-6">
          <Tabs defaultValue="signin">
            <TabsList className="w-full">
              <TabsTrigger value="signin" className="flex-1">Sign in</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-5">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  void run(() =>
                    signIn(String(f.get("email") ?? ""), String(f.get("password") ?? "")),
                  );
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="si-email">Work email</Label>
                  <Input id="si-email" name="email" type="email" defaultValue="recruiter@cleartalent.ai" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="si-password">Password</Label>
                  <Input id="si-password" name="password" type="password" defaultValue="demo1234" required />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="mt-5">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  void run(() =>
                    signUp(
                      String(f.get("name") ?? ""),
                      String(f.get("email") ?? ""),
                      String(f.get("password") ?? ""),
                      String(f.get("org") ?? ""),
                    ),
                  );
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="su-name">Full name</Label>
                  <Input id="su-name" name="name" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-org">Organization</Label>
                  <Input id="su-org" name="org" placeholder="Your company" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-email">Work email</Label>
                  <Input id="su-email" name="email" type="email" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-password">Password</Label>
                  <Input id="su-password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Creating account…" : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          {error ? (
            <p role="alert" className="mt-4 text-sm text-critical">
              {error}
            </p>
          ) : null}
          <p className="mt-5 text-xs text-muted-foreground">
            This workspace runs a local demo session and demo data. No external auth service is
            connected yet; credentials can be added later through environment variables.
          </p>
        </div>
        <HumanInLoop className="mt-5 justify-center" />
      </div>
    </main>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { session, ready, signOut } = useAuth();
  const { recruiter } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle =
    NAV.find((n) => (n.to === "/" ? pathname === "/" : pathname.startsWith(n.to)))?.label ??
    "Clear Talent AI";

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading workspace…</p>
      </div>
    );
  }

  if (!session) return <AuthScreen />;

  const initials = (session.name || recruiter.name)
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
        <Brand />
        <div className="mt-7 flex-1">
          <NavLinks />
        </div>
        <HumanInLoop className="pt-4" />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation menu">
                  <Menu className="size-4" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-5">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <Brand />
                <div className="mt-7">
                  <NavLinks onNavigate={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            <h2 className="text-sm font-semibold sm:text-base">{pageTitle}</h2>

            <div className="ml-auto flex items-center gap-2">
              <div className="hidden md:block">
                <GlobalSearch />
              </div>
              <Notifications />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <Avatar className="size-7">
                      <AvatarFallback className="bg-primary-soft text-xs font-semibold text-accent-foreground">
                        {initials || "R"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium sm:inline">{session.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <span className="block text-sm font-medium">{session.name}</span>
                    <span className="block text-xs font-normal text-muted-foreground">{session.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                    <SettingsIcon className="size-4" aria-hidden /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="size-4" aria-hidden /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="border-t border-border px-4 py-2 md:hidden">
            <GlobalSearch />
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
