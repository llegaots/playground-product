import { z } from "zod";

export const howMetOptions = [
  { label: "Zoom call", value: "zoom_call" },
  { label: "In-person", value: "in_person" },
  { label: "Intro'd by contact", value: "introduced_by" },
  { label: "Conference", value: "conference" },
  { label: "Other", value: "other" },
] as const;

export const contactSourceOptions = ["manual", "zoom_auto_import"] as const;
export const howMetValues = ["zoom_call", "in_person", "introduced_by", "conference", "other"] as const;

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || /^https?:\/\//i.test(value), "Use a full URL starting with http:// or https://");

export const contactFormSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required"),
  photo_url: optionalUrl,
  company: z.string().trim().optional().or(z.literal("")),
  role_title: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  linkedin_url: optionalUrl,
  how_met: z.enum(howMetValues),
  introduced_by_contact_id: z.string().uuid().optional().nullable().or(z.literal("")),
  date_first_met: z.string().optional().or(z.literal("")),
  location_met: z.string().trim().optional().or(z.literal("")),
  relationship_strength: z.coerce.number().int().min(1).max(5),
  notes: z.string().trim().optional().or(z.literal("")),
  one_liner_note: z.string().trim().optional().or(z.literal("")),
  last_contacted_at: z.string().optional().or(z.literal("")),
  source: z.enum(contactSourceOptions),
  second_degree_through_contact_id: z.string().uuid().optional().nullable().or(z.literal("")),
  tag_labels: z.array(z.string()),
  mutual_connection_ids: z.array(z.string().uuid()),
});

export const quickAddSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required"),
  how_met: z.enum(howMetValues),
  one_liner_note: z.string().trim().optional().or(z.literal("")),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type QuickAddValues = z.infer<typeof quickAddSchema>;
