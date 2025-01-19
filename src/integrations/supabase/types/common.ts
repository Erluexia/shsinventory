export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: ActivityLogs;
      floors: Floors;
      item_history: ItemHistory;
      items: Items;
      profiles: Profiles;
      rooms: Rooms;
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "faculty" | "it_office" | "property_custodian"
      item_status: "good" | "needs_maintenance" | "needs_replacement"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}