import { useEffect } from "react";
import { Link, Navigate, NavLink, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { LogOut, Network, Plus, Search, Users } from "lucide-react";
import { QuickAddContact } from "@/components/contacts/QuickAddContact";
import { Button } from "@/components/ui/Button";
import { useContactRealtime } from "@/hooks/useContactRealtime";
import { useAuthStore } from "@/store/authStore";
import { useContactStore } from "@/store/contactStore";
import { ContactsPage } from "@/pages/ContactsPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { GraphPage } from "@/pages/GraphPage";
import { LoginPage } from "@/pages/LoginPage";
import { PhaseTwoPage } from "@/pages/PhaseTwoPage";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: Users },
  { to: "/contacts", label: "Rolodex", icon: Plus },
  { to: "/graph", label: "Graph", icon: Network },
  { to: "/phase-two", label: "Phase 2", icon: Search },
];

function AppShell() {
  const { user, signOut } = useAuthStore();
  const { fetchAll } = useContactStore();
  const navigate = useNavigate();
  useContactRealtime();

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  return (
    <div className="min-h-screen text-amber-50">
      <header className="sticky top-0 z-40 border-b border-amber-400/10 bg-slate-950/85 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link to="/" className="group">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-amber-300/70">
              Private Relationship Intelligence
            </p>
            <h1 className="font-display text-2xl tracking-tight text-amber-50 group-hover:text-amber-200">
              Kinship Ledger
            </h1>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-full border px-3 py-2 font-mono text-xs uppercase tracking-[0.18em] transition",
                    isActive
                      ? "border-amber-300/50 bg-amber-300/15 text-amber-100"
                      : "border-white/10 bg-white/5 text-slate-400 hover:border-amber-300/30 hover:text-amber-100",
                  )
                }
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <QuickAddContact />
            <Button
              variant="ghost"
              onClick={async () => {
                await signOut();
                navigate("/login");
              }}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{user?.email}</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-6">
        <Outlet />
      </main>
    </div>
  );
}

function ProtectedRoute() {
  const { user, initialized } = useAuthStore();
  if (!initialized) return <div className="p-8 font-mono text-amber-200">Initializing secure session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell />;
}

export function App() {
  const { loadSession } = useAuthStore();

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route index element={<DashboardPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="graph" element={<GraphPage />} />
        <Route path="phase-two" element={<PhaseTwoPage />} />
      </Route>
    </Routes>
  );
}
