import { useState } from "react";
import { Plus } from "lucide-react";
import { ContactDetailPanel } from "@/components/contacts/ContactDetailPanel";
import { ContactForm } from "@/components/contacts/ContactForm";
import { ContactList } from "@/components/contacts/ContactList";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { useContactStore } from "@/store/contactStore";
import type { Contact } from "@/types";

export function ContactsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>();
  const contacts = useContactStore((state) => state.contacts);

  const closeForm = () => {
    setShowForm(false);
    setEditingContact(undefined);
  };

  return (
    <div className="grid min-h-[calc(100vh-7rem)] grid-cols-1 gap-5 xl:grid-cols-[1fr_28rem]">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 border-b border-amber-200/10 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-amber-200/60">
              Rolodex
            </p>
            <h1 className="font-display text-5xl text-stone-100">Contact ledger</h1>
          </div>
          <Button
            onClick={() => {
              setEditingContact(undefined);
              setShowForm((value) => !value);
            }}
          >
            <Plus className="h-4 w-4" />
            {showForm ? "Close form" : "Add contact"}
          </Button>
        </div>

        {showForm && (
          <Panel>
            <ContactForm contact={editingContact} onDone={closeForm} />
          </Panel>
        )}

        <ContactList
          contacts={contacts}
          onEdit={(contact) => {
            setEditingContact(contact);
            setShowForm(true);
          }}
        />
      </div>
      <ContactDetailPanel />
    </div>
  );
}
