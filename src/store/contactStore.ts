import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type {
  ActivityLog,
  Connection,
  Contact,
  ContactFormValues,
  DashboardStats,
  HowWeMet,
  Tag,
} from "@/types";

type ContactState = {
  contacts: Contact[];
  tags: Tag[];
  connections: Connection[];
  activities: ActivityLog[];
  loading: boolean;
  error: string | null;
  selectedContactId: string | null;
  graphTagFilter: string | null;
  howWeMetFilter: HowWeMet | "all";
  searchTerm: string;
  fetchAll: () => Promise<void>;
  createContact: (values: ContactFormValues) => Promise<Contact | null>;
  updateContact: (id: string, values: ContactFormValues) => Promise<Contact | null>;
  deleteContact: (id: string) => Promise<void>;
  markContactedToday: (id: string) => Promise<void>;
  addActivity: (contactId: string, noteText: string, actionType?: string) => Promise<void>;
  setSelectedContactId: (id: string | null) => void;
  setGraphTagFilter: (tagId: string | null) => void;
  setHowWeMetFilter: (value: HowWeMet | "all") => void;
  setSearchTerm: (value: string) => void;
  stats: () => DashboardStats;
};

const normalizeContact = (row: Contact): Contact => ({
  ...row,
  tag_ids: row.tags?.map((tag) => tag.id) ?? row.tag_ids ?? [],
  mutual_connection_ids:
    row.mutual_connections?.map((contact) => contact.id) ?? row.mutual_connection_ids ?? [],
});

const ensureTags = async (labels: string[], existingTags: Tag[]) => {
  const normalizedLabels = labels
    .map((label) => label.trim().toLowerCase())
    .filter(Boolean)
    .filter((label, index, all) => all.indexOf(label) === index);

  const createdOrExisting: Tag[] = [];
  const palette = ["#f59e0b", "#38bdf8", "#a78bfa", "#34d399", "#f97316", "#e879f9"];

  for (const label of normalizedLabels) {
    const existing = existingTags.find((tag) => tag.label.toLowerCase() === label);
    if (existing) {
      createdOrExisting.push(existing);
      continue;
    }

    const { data, error } = await supabase
      .from("tags")
      .insert({ label, color: palette[createdOrExisting.length % palette.length] })
      .select("*")
      .single();

    if (error) throw error;
    createdOrExisting.push(data as Tag);
    existingTags.push(data as Tag);
  }

  return createdOrExisting;
};

const mapFormToContact = (values: ContactFormValues) => ({
  full_name: values.full_name,
  photo_url: values.photo_url || null,
  company: values.company || null,
  role_title: values.role_title || null,
  email: values.email || null,
  phone: values.phone || null,
  linkedin_url: values.linkedin_url || null,
  how_met: values.how_met,
  introduced_by_contact_id: values.introduced_by_contact_id || null,
  date_first_met: values.date_first_met || null,
  location_met: values.location_met || null,
  relationship_strength: values.relationship_strength,
  notes: values.notes || null,
  one_liner_note: values.one_liner_note || null,
  last_contacted_at: values.last_contacted_at || null,
  source: values.source,
  second_degree_through_contact_id: values.second_degree_through_contact_id || null,
});

const syncRelationships = async (contactId: string, values: ContactFormValues, tags: Tag[]) => {
  const tagRows = await ensureTags(values.tag_labels, tags);

  await supabase.from("contact_tags").delete().eq("contact_id", contactId);
  if (tagRows.length > 0) {
    const { error } = await supabase.from("contact_tags").insert(
      tagRows.map((tag) => ({
        contact_id: contactId,
        tag_id: tag.id,
      })),
    );
    if (error) throw error;
  }

  await supabase
    .from("connections")
    .delete()
    .or(`contact_id_a.eq.${contactId},contact_id_b.eq.${contactId}`);

  const uniqueConnectionIds = values.mutual_connection_ids
    .filter((id) => id && id !== contactId)
    .filter((id, index, all) => all.indexOf(id) === index);

  if (uniqueConnectionIds.length > 0) {
    const { error } = await supabase.from("connections").insert(
      uniqueConnectionIds.map((connectionId) => ({
        contact_id_a: contactId < connectionId ? contactId : connectionId,
        contact_id_b: contactId < connectionId ? connectionId : contactId,
        relationship_type: "knows",
      })),
    );
    if (error) throw error;
  }
};

export const useContactStore = create<ContactState>((set, get) => ({
  contacts: [],
  tags: [],
  connections: [],
  activities: [],
  loading: false,
  error: null,
  selectedContactId: null,
  graphTagFilter: null,
  howWeMetFilter: "all",
  searchTerm: "",

  fetchAll: async () => {
    set({ loading: true, error: null });
    const [contactsResult, tagsResult, connectionsResult, activitiesResult] = await Promise.all([
      supabase
        .from("contacts")
        .select("*, tags:contact_tags(tags(*))")
        .order("created_at", { ascending: false }),
      supabase.from("tags").select("*").order("label"),
      supabase.from("connections").select("*"),
      supabase.from("activity_log").select("*").order("created_at", { ascending: false }),
    ]);

    const error =
      contactsResult.error ?? tagsResult.error ?? connectionsResult.error ?? activitiesResult.error;

    if (error) {
      set({ loading: false, error: error.message });
      return;
    }

    const contacts = ((contactsResult.data ?? []) as Array<Contact & { tags?: { tags: Tag }[] }>).map(
      (contact) =>
        normalizeContact({
          ...contact,
          tags: contact.tags?.map((joinRow) => joinRow.tags) ?? [],
        }),
    );

    const connections = (connectionsResult.data ?? []) as Connection[];
    const contactsWithConnections = contacts.map((contact) => ({
      ...contact,
      mutual_connection_ids: connections
        .filter(
          (connection) =>
            connection.contact_id_a === contact.id || connection.contact_id_b === contact.id,
        )
        .map((connection) =>
          connection.contact_id_a === contact.id
            ? connection.contact_id_b
            : connection.contact_id_a,
        ),
    }));

    set({
      contacts: contactsWithConnections,
      tags: (tagsResult.data ?? []) as Tag[],
      connections,
      activities: (activitiesResult.data ?? []) as ActivityLog[],
      loading: false,
    });
  },

  createContact: async (values) => {
    const { data, error } = await supabase.from("contacts").insert(mapFormToContact(values)).select("*").single();
    if (error) {
      set({ error: error.message });
      return null;
    }

    await syncRelationships(data.id, values, get().tags);
    await get().addActivity(data.id, values.notes || "Contact created", "created");
    await get().fetchAll();
    return data as Contact;
  },

  updateContact: async (id, values) => {
    const { data, error } = await supabase
      .from("contacts")
      .update(mapFormToContact(values))
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      set({ error: error.message });
      return null;
    }

    await syncRelationships(id, values, get().tags);
    await get().addActivity(id, "Profile updated", "updated");
    await get().fetchAll();
    return data as Contact;
  },

  deleteContact: async (id) => {
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) {
      set({ error: error.message });
      return;
    }
    set((state) => ({
      contacts: state.contacts.filter((contact) => contact.id !== id),
      selectedContactId: state.selectedContactId === id ? null : state.selectedContactId,
    }));
  },

  markContactedToday: async (id) => {
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase
      .from("contacts")
      .update({ last_contacted_at: today })
      .eq("id", id);
    if (error) {
      set({ error: error.message });
      return;
    }
    await get().addActivity(id, "Marked as contacted today", "contacted");
    await get().fetchAll();
  },

  addActivity: async (contactId, noteText, actionType = "note") => {
    const { error } = await supabase.from("activity_log").insert({
      contact_id: contactId,
      note_text: noteText,
      action_type: actionType,
    });
    if (error) set({ error: error.message });
  },

  setSelectedContactId: (id) => set({ selectedContactId: id }),
  setGraphTagFilter: (tagId) => set({ graphTagFilter: tagId }),
  setHowWeMetFilter: (value) => set({ howWeMetFilter: value }),
  setSearchTerm: (value) => set({ searchTerm: value }),

  stats: () => {
    const contacts = get().contacts;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return {
      totalContacts: contacts.length,
      recentlyAdded: [...contacts]
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
        .slice(0, 5),
      staleContacts: contacts
        .filter((contact) => {
          if (!contact.last_contacted_at) return true;
          return Date.parse(contact.last_contacted_at) < thirtyDaysAgo.getTime();
        })
        .slice(0, 8),
    };
  },
}));
