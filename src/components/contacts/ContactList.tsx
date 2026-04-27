import { Building2, Mail, Network, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useContactStore } from "@/store/contactStore";
import type { Contact } from "@/types";

const strengthLabel = ["", "Cold", "Cool", "Lukewarm", "Warm", "Inner circle"];

type ContactListProps = {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
};

export function ContactList({ contacts, onEdit }: ContactListProps) {
  const deleteContact = useContactStore((state) => state.deleteContact);
  const setSelectedContactId = useContactStore((state) => state.setSelectedContactId);

  if (contacts.length === 0) {
    return (
      <div className="rounded-3xl border border-amber-400/15 bg-slate-950/55 p-12 text-center">
        <p className="font-display text-3xl text-amber-100">No contacts yet</p>
        <p className="mt-2 text-sm text-slate-400">Use quick add or the full form to start the graph.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-amber-400/15 bg-slate-950/70 shadow-2xl shadow-black/30">
      <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] border-b border-amber-400/10 px-5 py-3 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-amber-200/60">
        <span>Contact</span>
        <span>Company</span>
        <span>Signal</span>
        <span>Tags</span>
        <span />
      </div>
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-amber-400/10 px-5 py-4 last:border-0"
        >
          <button
            className="flex items-center gap-3 text-left"
            onClick={() => setSelectedContactId(contact.id)}
            type="button"
          >
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-amber-300/30 bg-amber-400/10 font-display text-xl text-amber-100">
              {contact.photo_url ? (
                <img alt="" className="h-full w-full object-cover" src={contact.photo_url} />
              ) : (
                contact.full_name.charAt(0).toUpperCase()
              )}
            </div>
            <span>
              <span className="font-semibold text-slate-100 hover:text-amber-200">
                {contact.full_name}
              </span>
              <span className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <Mail className="h-3 w-3" />
                {contact.email || "No email"}
              </span>
            </span>
          </button>
          <span className="text-sm text-slate-300">
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-amber-300/60" />
              {contact.company || "Independent"}
            </span>
            <span className="block pl-6 text-xs text-slate-500">{contact.role_title || "Role unknown"}</span>
          </span>
          <span>
            <Badge>{strengthLabel[contact.relationship_strength]}</Badge>
            <span className="ml-2 font-mono text-xs text-amber-200">{contact.relationship_strength}/5</span>
          </span>
          <span className="flex flex-wrap gap-2">
            {contact.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag.id} style={{ borderColor: `${tag.color}66`, color: tag.color }}>
                {tag.label}
              </Badge>
            ))}
          </span>
          <span className="flex justify-end gap-2">
            <Button onClick={() => onEdit(contact)} size="sm" variant="ghost">
              Edit
            </Button>
            <Button onClick={() => setSelectedContactId(contact.id)} size="sm" variant="ghost">
              <Network className="h-4 w-4" />
            </Button>
            <Button onClick={() => void deleteContact(contact.id)} size="sm" variant="danger">
              <Trash2 className="h-4 w-4" />
            </Button>
          </span>
        </div>
      ))}
    </div>
  );
}
