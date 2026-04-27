import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useContactStore } from "@/store/contactStore";

export function useContactRealtime() {
  const fetchAll = useContactStore((state) => state.fetchAll);

  useEffect(() => {
    const refresh = () => {
      void fetchAll();
    };

    const channel = supabase
      .channel("relationship-intelligence")
      .on("postgres_changes", { event: "*", schema: "public", table: "contacts" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "connections" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_tags" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_log" }, refresh)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchAll]);
}
