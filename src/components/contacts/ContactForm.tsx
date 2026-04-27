import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { contactFormSchema, howMetOptions } from "@/lib/contactSchema";
import { useContactStore } from "@/store/contactStore";
import type { Contact, ContactFormValues } from "@/types";

type ContactFormProps = {
  contact?: Contact;
  mode?: "full" | "quick";
  onDone?: () => void;
};

const toDateValue = (value: string | null | undefined) => value ?? "";

const defaultValues: ContactFormValues = {
  full_name: "",
  photo_url: "",
  company: "",
  role_title: "",
  email: "",
  phone: "",
  linkedin_url: "",
  how_met: "other",
  introduced_by_contact_id: "",
  date_first_met: "",
  location_met: "",
  relationship_strength: 3,
  tag_labels: [],
  notes: "",
  one_liner_note: "",
  last_contacted_at: "",
  source: "manual",
  second_degree_through_contact_id: "",
  mutual_connection_ids: [],
};

export function ContactForm({ contact, mode = "full", onDone }: ContactFormProps) {
  const contacts = useContactStore((state) => state.contacts);
  const createContact = useContactStore((state) => state.createContact);
  const updateContact = useContactStore((state) => state.updateContact);
  const loading = useContactStore((state) => state.loading);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
  });

  const otherContacts = useMemo(
    () => contacts.filter((candidate) => candidate.id !== contact?.id),
    [contacts, contact?.id],
  );

  useEffect(() => {
    if (!contact) {
      form.reset(defaultValues);
      return;
    }

    form.reset({
      full_name: contact.full_name,
      photo_url: contact.photo_url ?? "",
      company: contact.company ?? "",
      role_title: contact.role_title ?? "",
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      linkedin_url: contact.linkedin_url ?? "",
      how_met: contact.how_met,
      introduced_by_contact_id: contact.introduced_by_contact_id ?? "",
      date_first_met: toDateValue(contact.date_first_met),
      location_met: contact.location_met ?? "",
      relationship_strength: contact.relationship_strength,
      tag_labels: contact.tags?.map((tag) => tag.label) ?? [],
      notes: contact.notes ?? "",
      one_liner_note: contact.one_liner_note ?? "",
      last_contacted_at: toDateValue(contact.last_contacted_at),
      source: contact.source,
      second_degree_through_contact_id: contact.second_degree_through_contact_id ?? "",
      mutual_connection_ids: contact.mutual_connection_ids ?? [],
    });
  }, [contact, form]);

  const onSubmit = async (values: ContactFormValues) => {
    const saved = contact
      ? await updateContact(contact.id, values)
      : await createContact({
          ...values,
          relationship_strength: mode === "quick" ? 3 : values.relationship_strength,
        });

    if (saved) {
      form.reset(defaultValues);
      onDone?.();
    }
  };

  const errors = form.formState.errors;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <Input label="Full name" error={errors.full_name?.message} {...form.register("full_name")} />

      <div className="grid gap-4 md:grid-cols-2">
        <Select label="How we met" {...form.register("how_met")}>
          {howMetOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        {mode === "full" ? (
          <Input label="Date first met" type="date" {...form.register("date_first_met")} />
        ) : null}
      </div>

      {mode === "quick" ? (
        <Textarea
          label="One-line note"
          rows={3}
          placeholder="Why this person matters, where you met, or what to remember."
          {...form.register("one_liner_note")}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Company" {...form.register("company")} />
            <Input label="Role / title" {...form.register("role_title")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Email" error={errors.email?.message} {...form.register("email")} />
            <Input label="Phone" {...form.register("phone")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="LinkedIn URL" error={errors.linkedin_url?.message} {...form.register("linkedin_url")} />
            <Input label="Photo URL" error={errors.photo_url?.message} {...form.register("photo_url")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Location met" {...form.register("location_met")} />
            <Input label="Last contacted" type="date" {...form.register("last_contacted_at")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Intro'd by" {...form.register("introduced_by_contact_id")}>
              <option value="">Not specified</option>
              {otherContacts.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.full_name}
                </option>
              ))}
            </Select>
            <Select label="Second-degree through" {...form.register("second_degree_through_contact_id")}>
              <option value="">Not mapped yet</option>
              {otherContacts.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.full_name}
                </option>
              ))}
            </Select>
          </div>
          <label className="block space-y-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-amber-200/60">
              Relationship strength: {form.watch("relationship_strength")}
            </span>
            <input
              className="w-full accent-amber-400"
              max={5}
              min={1}
              type="range"
              {...form.register("relationship_strength", { valueAsNumber: true })}
            />
          </label>
          <Input
            label="Tags"
            placeholder="investor, operator, advisor"
            value={form.watch("tag_labels").join(", ")}
            onChange={(event) =>
              form.setValue(
                "tag_labels",
                event.currentTarget.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              )
            }
          />
          <label className="block space-y-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-amber-200/60">
              Mutual connections
            </span>
            <select
              className="min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-sm text-amber-50 outline-none transition focus:border-amber-300/60"
              multiple
              value={form.watch("mutual_connection_ids")}
              onChange={(event) =>
                form.setValue(
                  "mutual_connection_ids",
                  Array.from(event.currentTarget.selectedOptions).map((option) => option.value),
                )
              }
            >
              {otherContacts.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.full_name}
                </option>
              ))}
            </select>
          </label>
          <Textarea label="Notes" rows={5} {...form.register("notes")} />
        </>
      )}

      <div className="flex justify-end gap-3 pt-2">
        {onDone ? (
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        ) : null}
        <Button disabled={form.formState.isSubmitting || loading} type="submit">
          {contact ? "Save changes" : mode === "quick" ? "Quick add" : "Create contact"}
        </Button>
      </div>
    </form>
  );
}
