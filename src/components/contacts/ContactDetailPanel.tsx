import { formatDistanceToNow } from "date-fns";
import { CalendarCheck, Edit3, Mail, Network, Phone, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useContactStore } from "@/store/contactStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { Textarea } from "@/components/ui/Textarea";
import { ContactForm } from "./ContactForm";
import { howMetLabels, strengthLabels } from "@/types";

export function ContactDetailPanel() {
  const {
    activities,
    addActivity,
    contacts,
    deleteContact,
    markContactedToday,
    selectedContactId,
    setSelectedContactId,
  } = useContactStore();
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState("");

  const contact = contacts.find((item) => item.id === selectedContactId);

  const connections = useMemo(() => {
    if (!contact) return [];
    return contacts.filter((item) => (contact.mutual_connection_ids ?? []).includes(item.id));
  }, [contact, contacts]);

  if (!contact) return null;

  const contactActivities = activities.filter((activity) => activity.contact_id === contact.id);

  const logNote = async () => {
    if (!note.trim()) return;
    await addActivity(contact.id, note.trim(), "note");
    setNote("");
  };

  return (
    <aside className="fixed right-0 top-0 z-40 flex h-screen w-full max-w-xl flex-col border-l border-amber-200/10 bg-slate-950/95 p-6 shadow-2xl shadow-black/70 backdrop-blur">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-amber-300/20 bg-amber-300/10 font-display text-2xl text-amber-200">
            {contact.photo_url ? (
              <img src={contact.photo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              contact.full_name.charAt(0)
            )}
          </div>
          <div>
            <p className="font-display text-3xl text-amber-50">{contact.full_name}</p>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-400">
              {[contact.role_title, contact.company].filter(Boolean).join(" / ") || "Profile"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setSelectedContactId(null)}>
          <X size={16} />
        </Button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {editing ? (
          <ContactForm contact={contact} onDone={() => setEditing(false)} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Panel className="p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">Strength</p>
                <p className="mt-2 text-lg text-amber-100">
                  {contact.relationship_strength}/5 {strengthLabels[contact.relationship_strength]}
                </p>
              </Panel>
              <Panel className="p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">Met</p>
                <p className="mt-2 text-lg text-amber-100">{howMetLabels[contact.how_met]}</p>
              </Panel>
            </div>

            <Panel className="space-y-3 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">Contact</p>
              <div className="grid gap-2 text-sm text-slate-300">
                {contact.email && (
                  <a className="flex items-center gap-2 hover:text-amber-100" href={`mailto:${contact.email}`}>
                    <Mail size={14} /> {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <a className="flex items-center gap-2 hover:text-amber-100" href={`tel:${contact.phone}`}>
                    <Phone size={14} /> {contact.phone}
                  </a>
                )}
                {contact.linkedin_url && (
                  <a className="flex items-center gap-2 hover:text-amber-100" href={contact.linkedin_url} target="_blank" rel="noreferrer">
                    <Network size={14} /> LinkedIn
                  </a>
                )}
              </div>
            </Panel>

            <Panel className="space-y-3 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">Context</p>
              <div className="flex flex-wrap gap-2">
                {contact.tags?.map((tag) => (
                  <Badge key={tag.id} style={{ borderColor: tag.color, color: tag.color }}>
                    {tag.label}
                  </Badge>
                ))}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                {contact.notes || contact.one_liner_note || "No notes yet."}
              </p>
              <dl className="grid grid-cols-2 gap-3 border-t border-white/10 pt-3 text-xs text-slate-400">
                <div>
                  <dt className="font-mono uppercase tracking-widest">First met</dt>
                  <dd className="mt-1 text-slate-200">{contact.date_first_met || "Unknown"}</dd>
                </div>
                <div>
                  <dt className="font-mono uppercase tracking-widest">Location</dt>
                  <dd className="mt-1 text-slate-200">{contact.location_met || "Unknown"}</dd>
                </div>
                <div>
                  <dt className="font-mono uppercase tracking-widest">Last contacted</dt>
                  <dd className="mt-1 text-slate-200">{contact.last_contacted_at || "Never"}</dd>
                </div>
                <div>
                  <dt className="font-mono uppercase tracking-widest">Source</dt>
                  <dd className="mt-1 text-slate-200">{contact.source.replaceAll("_", " ")}</dd>
                </div>
              </dl>
            </Panel>

            <Panel className="space-y-3 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">Connections</p>
              {connections.length === 0 ? (
                <p className="text-sm text-slate-500">No mutual contacts linked yet.</p>
              ) : (
                <div className="grid gap-2">
                  {connections.map((connection) => (
                    <button
                      key={connection.id}
                      onClick={() => setSelectedContactId(connection.id)}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left text-sm text-slate-200 hover:border-amber-300/40"
                    >
                      {connection.full_name}
                      <span className="block text-xs text-slate-500">
                        {[connection.role_title, connection.company].filter(Boolean).join(" / ")}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </Panel>

            <Panel className="space-y-3 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">Activity log</p>
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Log a note about this person..."
              />
              <Button onClick={() => void logNote()} size="sm">
                <Plus size={14} /> Log a note
              </Button>
              <div className="space-y-3 border-t border-white/10 pt-3">
                {contactActivities.map((activity) => (
                  <div key={activity.id} className="rounded-xl bg-black/20 p-3">
                    <p className="text-sm text-slate-200">{activity.note_text}</p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      {activity.action_type} /{" "}
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
        <Button onClick={() => void markContactedToday(contact.id)}>
          <CalendarCheck size={16} /> Mark contacted today
        </Button>
        <Button variant="secondary" onClick={() => setEditing((value) => !value)}>
          <Edit3 size={16} /> {editing ? "Cancel edit" : "Edit"}
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            void deleteContact(contact.id);
          }}
        >
          <Trash2 size={16} /> Delete
        </Button>
      </div>
    </aside>
  );
}
