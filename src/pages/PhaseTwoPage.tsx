import { Download, Network, Video } from "lucide-react";
import { Panel } from "@/components/ui/Panel";

const items = [
  {
    icon: Video,
    title: "Zoom integration",
    description: "OAuth tables and source enum are ready for a future participant import worker.",
  },
  {
    icon: Network,
    title: "Second-degree network view",
    description: "Connections support degree and intermediary_contact_id so paths through Y can be modeled.",
  },
  {
    icon: Download,
    title: "CSV export",
    description: "The contact store keeps normalized records, tags, and edges for a straightforward export action.",
  },
];

export function PhaseTwoPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-amber-300/70">Scaffold</p>
        <h1 className="mt-2 font-display text-4xl text-stone-100">Phase 2 runway</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-400">
          These capabilities are intentionally scaffolded in the data model and app navigation without the full workflows.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Panel key={item.title} className="space-y-4">
            <item.icon className="h-7 w-7 text-amber-300" />
            <div>
              <h2 className="font-display text-2xl text-stone-100">{item.title}</h2>
              <p className="mt-2 text-sm text-stone-400">{item.description}</p>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
