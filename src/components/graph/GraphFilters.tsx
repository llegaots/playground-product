import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useContactStore } from "@/store/contactStore";

export function GraphFilters() {
  const tags = useContactStore((state) => state.tags);
  const graphTagFilter = useContactStore((state) => state.graphTagFilter);
  const howMetFilter = useContactStore((state) => state.howWeMetFilter);
  const searchTerm = useContactStore((state) => state.searchTerm);
  const setGraphTagFilter = useContactStore((state) => state.setGraphTagFilter);
  const setHowMetFilter = useContactStore((state) => state.setHowWeMetFilter);
  const setSearchTerm = useContactStore((state) => state.setSearchTerm);

  return (
    <div className="flex flex-col gap-3 border-b border-amber-200/10 bg-slate-950/80 p-4 backdrop-blur lg:flex-row lg:items-end">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-amber-200/45" />
        <Input
          label="Search graph"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Highlight a specific person"
          className="pl-9"
        />
      </div>
      <Select
        label="Tag"
        value={graphTagFilter ?? "all"}
        onChange={(event) => setGraphTagFilter(event.target.value === "all" ? null : event.target.value)}
      >
        <option value="all">All tags</option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {tag.label}
          </option>
        ))}
      </Select>
      <Select
        label="How we met"
        value={howMetFilter}
        onChange={(event) => setHowMetFilter(event.target.value as typeof howMetFilter)}
      >
        <option value="all">All sources</option>
        <option value="zoom_call">Zoom call</option>
        <option value="in_person">In-person</option>
        <option value="introduced_by">Intro&apos;d by contact</option>
        <option value="conference">Conference</option>
        <option value="other">Other</option>
      </Select>
    </div>
  );
}
