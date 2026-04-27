export type HowWeMet = "zoom_call" | "in_person" | "introduced_by" | "conference" | "other";

export type RelationshipStrength = 1 | 2 | 3 | 4 | 5;

export type RelationshipType =
  | "knows"
  | "introduced_by"
  | "worked_with"
  | "second_degree";

export type ContactSource = "manual" | "zoom_auto_import";

export interface Tag {
  id: string;
  user_id: string;
  label: string;
  color: string;
  created_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  full_name: string;
  photo_url: string | null;
  company: string | null;
  role_title: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  how_met: HowWeMet;
  introduced_by_contact_id: string | null;
  date_first_met: string | null;
  location_met: string | null;
  relationship_strength: RelationshipStrength;
  notes: string | null;
  last_contacted_at: string | null;
  source: ContactSource;
  one_liner_note: string | null;
  second_degree_through_contact_id: string | null;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
  mutual_connection_ids?: string[];
}

export interface Connection {
  id: string;
  user_id: string;
  contact_id_a: string;
  contact_id_b: string;
  relationship_type: RelationshipType;
  notes: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  contact_id: string;
  timestamp: string;
  note_text: string;
  action_type: "note" | "created" | "updated" | "contacted" | "connection_added" | "imported";
  created_at: string;
}

export interface GraphNode {
  id: string;
  name: string;
  role?: string;
  company?: string;
  strength: RelationshipStrength;
  color: string;
  tags: string[];
  contact: Contact;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  type: RelationshipType;
  degree: 1 | 2;
}

export interface ContactFormValues {
  full_name: string;
  photo_url?: string;
  company?: string;
  role_title?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  how_met: HowWeMet;
  introduced_by_contact_id?: string;
  date_first_met?: string;
  location_met?: string;
  relationship_strength: RelationshipStrength;
  tags: string[];
  notes?: string;
  last_contacted_at?: string;
  source: ContactSource;
  one_liner_note?: string;
  mutual_connection_ids: string[];
  tag_labels: string[];
}

export interface DashboardStats {
  totalContacts: number;
  recentlyAdded: Contact[];
  staleContacts: Contact[];
}
