import { z } from "zod";

export const howMetOptions = [
  "Zoom call",
  "In-person",
  "Intro'd by contact",
  "Conference",
  "Other",
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
  tag_labels: z.array(z.string()).default([]),
  mutual_connection_ids: z.array(z.string().uuid()).default([]),
});

export const quickAddSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required"),
  how_met: z.enum(howMetValues),
  one_liner_note: z.string().trim().optional().or(z.literal("")),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type QuickAddValues = z.infer<typeof quickAddSchema>;
