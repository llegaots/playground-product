import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useContactStore } from "@/store/contactStore";

export function useContactRealtime() {
  const fetchAll = useContactStore((state) => state.fetchAll);

  useEffect(() => {
    const channel = supabase
      .channel("relationship-intelligence")
      .on("postgres_changes", { event: "*", schema: "public", table: "contacts" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "connections" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_tags" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_log" }, fetchAll)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchAll]);
}
