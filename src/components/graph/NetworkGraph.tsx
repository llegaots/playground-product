import { useMemo, useRef } from "react";
import ForceGraph2D, { ForceGraphMethods, LinkObject, NodeObject } from "react-force-graph-2d";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useContactStore } from "@/store/contactStore";
import type { GraphLink, GraphNode, HowWeMet } from "@/types";

const fallbackColors = ["#d6a84f", "#38bdf8", "#a78bfa", "#34d399", "#f97316", "#e879f9"];

const nodeLabel = (node: NodeObject<GraphNode>) => {
  const graphNode = node as GraphNode;
  return `${graphNode.name}${graphNode.role ? ` | ${graphNode.role}` : ""}${
    graphNode.company ? ` @ ${graphNode.company}` : ""
  }`;
};

const drawNode = (
  node: NodeObject<GraphNode>,
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  highlightedId: string | null,
) => {
  const graphNode = node as GraphNode;
  const radius = 4 + graphNode.strength * 2 + Math.min(graphNode.connectionCount, 6);
  const isHighlighted = highlightedId === graphNode.id;
  const x = graphNode.x ?? 0;
  const y = graphNode.y ?? 0;

  ctx.beginPath();
  ctx.arc(x, y, radius + (isHighlighted ? 8 : 4), 0, 2 * Math.PI, false);
  ctx.fillStyle = `${graphNode.color}${isHighlighted ? "55" : "25"}`;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = graphNode.color;
  ctx.shadowColor = graphNode.color;
  ctx.shadowBlur = isHighlighted ? 18 : 10;
  ctx.fill();
  ctx.shadowBlur = 0;

  const fontSize = Math.max(7, 12 / globalScale);
  ctx.font = `${fontSize}px IBM Plex Mono`;
  ctx.fillStyle = "#f8ead2";
  ctx.textAlign = "center";
  ctx.fillText(graphNode.name, x, y + radius + fontSize + 2);
};

export function NetworkGraph() {
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphLink> | undefined>(undefined);
  const {
    contacts,
    connections,
    tags,
    graphTagFilter,
    howWeMetFilter,
    searchTerm,
    setGraphTagFilter,
    setHowWeMetFilter,
    setSearchTerm,
    setSelectedContactId,
  } = useContactStore();

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesTag = !graphTagFilter || (contact.tag_ids ?? []).includes(graphTagFilter);
      const matchesHowMet = howWeMetFilter === "all" || contact.how_met === howWeMetFilter;
      return matchesTag && matchesHowMet;
    });
  }, [contacts, graphTagFilter, howWeMetFilter]);

  const contactById = useMemo(
    () => new Map(filteredContacts.map((contact) => [contact.id, contact] as const)),
    [filteredContacts],
  );

  const graphData = useMemo(() => {
    const nodes: GraphNode[] = filteredContacts.map((contact, index) => {
      const primaryTag = contact.tags?.[0];
      const connectionCount = connections.filter(
        (connection) =>
          connection.contact_id_a === contact.id || connection.contact_id_b === contact.id,
      ).length;

      return {
        id: contact.id,
        name: contact.full_name,
        role: contact.role_title ?? undefined,
        company: contact.company ?? undefined,
        strength: contact.relationship_strength,
        color: primaryTag?.color ?? fallbackColors[index % fallbackColors.length],
        tags: contact.tags?.map((tag) => tag.label) ?? [],
        contact,
        connectionCount,
      };
    });

    const links: GraphLink[] = connections
      .filter(
        (connection) =>
          contactById.has(connection.contact_id_a) && contactById.has(connection.contact_id_b),
      )
      .map((connection) => ({
        source: connection.contact_id_a,
        target: connection.contact_id_b,
        type: connection.relationship_type,
        degree: connection.relationship_type === "second_degree" ? 2 : 1,
      }));

    return { nodes, links };
  }, [contactById, connections, filteredContacts]);

  const highlightedNode = useMemo(() => {
    if (!searchTerm.trim()) return null;
    return graphData.nodes.find((node) =>
      node.name.toLowerCase().includes(searchTerm.trim().toLowerCase()),
    );
  }, [graphData.nodes, searchTerm]);

  const focusSearch = () => {
    if (!highlightedNode || !graphRef.current) return;
    graphRef.current.centerAt(highlightedNode.x, highlightedNode.y, 900);
    graphRef.current.zoom(4, 900);
    setSelectedContactId(highlightedNode.id);
  };

  return (
    <div className="relative h-[calc(100vh-8rem)] min-h-[620px] overflow-hidden rounded-[2rem] border border-amber-200/10 bg-[#050a13]/80">
      <div className="absolute left-5 right-5 top-5 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200/10 bg-[#091426]/90 p-3 backdrop-blur-xl">
        <div className="relative min-w-72 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-200/50" />
          <Input
            className="pl-9"
            placeholder="Search and focus a person..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") focusSearch();
            }}
          />
        </div>
        <Select
          value={graphTagFilter ?? ""}
          onChange={(event) => setGraphTagFilter(event.target.value || null)}
        >
          <option value="">All tags</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.label}
            </option>
          ))}
        </Select>
        <Select
          value={howWeMetFilter}
          onChange={(event) => setHowWeMetFilter(event.target.value as HowWeMet | "all")}
        >
          <option value="all">All origins</option>
          <option value="zoom_call">Zoom call</option>
          <option value="in_person">In-person</option>
          <option value="introduced_by">Introduced by</option>
          <option value="conference">Conference</option>
          <option value="other">Other</option>
        </Select>
      </div>

      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        backgroundColor="rgba(5,10,19,0)"
        nodeCanvasObject={(node, ctx, scale) =>
          drawNode(node, ctx, scale, highlightedNode?.id ?? null)
        }
        nodeLabel={nodeLabel}
        linkColor={(link) => {
          const graphLink = link as LinkObject<GraphNode, GraphLink> & GraphLink;
          return graphLink.degree === 2 ? "rgba(214,168,79,0.22)" : "rgba(214,168,79,0.44)";
        }}
        linkWidth={(link) => {
          const graphLink = link as LinkObject<GraphNode, GraphLink> & GraphLink;
          return graphLink.degree === 2 ? 0.6 : 1.4;
        }}
        linkDirectionalParticles={1}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleWidth={1.4}
        cooldownTicks={80}
        d3VelocityDecay={0.24}
        onNodeClick={(node) => setSelectedContactId((node as GraphNode).id)}
        onNodeDragEnd={(node) => {
          node.fx = node.x;
          node.fy = node.y;
        }}
      />

      <div className="absolute bottom-5 left-5 z-10 rounded-2xl border border-amber-200/10 bg-[#091426]/90 p-4 text-xs text-amber-100/70">
        <p className="mb-3 font-mono uppercase tracking-[0.25em] text-amber-300/80">Legend</p>
        <div className="flex flex-wrap gap-3">
          {tags.slice(0, 8).map((tag) => (
            <span key={tag.id} className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
              {tag.label}
            </span>
          ))}
          {tags.length === 0 && <span>Tags appear here after you add contacts.</span>}
        </div>
      </div>
    </div>
  );
}
