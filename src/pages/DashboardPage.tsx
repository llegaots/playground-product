import { Link } from "react-router-dom";
import { Network, Plus, Radio, Users } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import { useContactStore } from "@/store/contactStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";

export function DashboardPage() {
  const stats = useContactStore((state) => state.stats());

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <Panel className="p-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-amber-200/60">
              Total contacts
            </span>
            <Users className="h-5 w-5 text-amber-300" />
          </div>
          <p className="mt-8 font-display text-6xl text-amber-50">{stats.totalContacts}</p>
        </Panel>
        <Panel className="p-6 md:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-amber-200/60">
                Graph command
              </span>
              <h2 className="mt-3 font-display text-4xl text-amber-50">
                Map who knows whom.
              </h2>
            </div>
            <Button asChild>
              <Link to="/graph">
                <Network className="h-4 w-4" /> Open graph
              </Link>
            </Button>
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-3xl text-amber-50">Recently added</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/contacts">
                <Plus className="h-4 w-4" /> Add
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {stats.recentlyAdded.map((contact) => (
              <Link
                key={contact.id}
                to="/contacts"
                className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-amber-300/40"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-amber-50">{contact.full_name}</p>
                    <p className="font-mono text-xs text-slate-400">
                      {[contact.role_title, contact.company].filter(Boolean).join(" / ") || "No metadata"}
                    </p>
                  </div>
                  <Badge>{formatRelativeDate(contact.created_at)}</Badge>
                </div>
              </Link>
            ))}
            {stats.recentlyAdded.length === 0 && (
              <p className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-400">
                No contacts yet. Use quick add to start your private rolodex.
              </p>
            )}
          </div>
        </Panel>

        <Panel className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-3xl text-amber-50">30+ day drift</h2>
            <Radio className="h-5 w-5 text-amber-300" />
          </div>
          <div className="space-y-3">
            {stats.staleContacts.map((contact) => (
              <div key={contact.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-amber-50">{contact.full_name}</p>
                    <p className="font-mono text-xs text-slate-400">
                      Last contacted: {formatRelativeDate(contact.last_contacted_at)}
                    </p>
                  </div>
                  <Badge className="border-red-400/30 text-red-200">follow up</Badge>
                </div>
              </div>
            ))}
            {stats.staleContacts.length === 0 && (
              <p className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-400">
                No stale relationships detected.
              </p>
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}
