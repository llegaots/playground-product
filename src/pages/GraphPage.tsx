import { ContactDetailPanel } from "@/components/contacts/ContactDetailPanel";
import { GraphFilters } from "@/components/graph/GraphFilters";
import { NetworkGraph } from "@/components/graph/NetworkGraph";

export function GraphPage() {
  return (
    <div className="relative h-[calc(100vh-5rem)] overflow-hidden rounded-[2rem] border border-amber-500/15 bg-slate-950/60">
      <GraphFilters />
      <NetworkGraph />
      <ContactDetailPanel />
    </div>
  );
}
