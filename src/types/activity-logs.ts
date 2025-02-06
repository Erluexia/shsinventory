import { Json } from "@/integrations/supabase/types";

export interface ItemActivityDetails extends Record<string, any> {
  name?: string;
  quantity?: number;
  maintenance_quantity?: number;
  replacement_quantity?: number;
  room_id?: string;
}

export interface ActivityLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  details: ItemActivityDetails;
  user_id: string | null;
  created_at: string;
  profiles?: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  } | null;
}