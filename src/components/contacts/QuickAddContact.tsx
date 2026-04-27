import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useContactStore } from "@/store/contactStore";
import { howMetOptions, quickAddSchema, type QuickAddValues } from "@/lib/contactSchema";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function QuickAddContact() {
  const [open, setOpen] = useState(false);
  const createContact = useContactStore((state) => state.createContact);
  const form = useForm<QuickAddValues>({
    resolver: zodResolver(quickAddSchema),
    defaultValues: {
      full_name: "",
      how_met: "other",
      one_liner_note: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await createContact({
      full_name: values.full_name,
      photo_url: "",
      company: "",
      role_title: "",
      email: "",
      phone: "",
      linkedin_url: "",
      how_met: values.how_met,
      introduced_by_contact_id: "",
      date_first_met: "",
      location_met: "",
      relationship_strength: 3,
      tag_labels: [],
      notes: values.one_liner_note,
      one_liner_note: values.one_liner_note,
      last_contacted_at: "",
      source: "manual",
      mutual_connection_ids: [],
    });
    form.reset();
    setOpen(false);
  });

  return (
    <div className="fixed bottom-6 right-6 z-30">
      {open ? (
        <form
          onSubmit={(event) => {
            void onSubmit(event);
          }}
          className="mb-3 w-80 rounded-3xl border border-amber-400/30 bg-slate-950/95 p-4 shadow-2xl shadow-amber-950/40 backdrop-blur"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber-300">Quick add</p>
          <div className="mt-4 space-y-3">
            <Input label="Name" {...form.register("full_name")} error={form.formState.errors.full_name?.message} />
            <Select label="How we met" {...form.register("how_met")}>
              {howMetOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Input label="One-liner note" {...form.register("one_liner_note")} />
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
              Save
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
      <Button onClick={() => setOpen((value) => !value)} className="shadow-lg shadow-amber-950/40">
        <Plus className="h-4 w-4" /> Quick add
      </Button>
    </div>
  );
}
