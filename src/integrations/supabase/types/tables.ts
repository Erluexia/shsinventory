import { Json } from './common';

export interface ActivityLogs {
  Row: {
    action: string
    created_at: string
    details: Json | null
    entity_id: string
    entity_type: string
    id: string
    user_id: string | null
  }
  Insert: {
    action: string
    created_at?: string
    details?: Json | null
    entity_id: string
    entity_type: string
    id?: string
    user_id?: string | null
  }
  Update: {
    action?: string
    created_at?: string
    details?: Json | null
    entity_id?: string
    entity_type?: string
    id?: string
    user_id?: string | null
  }
}

export interface Floors {
  Row: {
    created_at: string
    floor_number: number
    id: string
    name: string
  }
  Insert: {
    created_at?: string
    floor_number: number
    id?: string
    name: string
  }
  Update: {
    created_at?: string
    floor_number?: number
    id?: string
    name?: string
  }
}

export interface ItemHistory {
  Row: {
    changed_by: string | null
    created_at: string
    description: string | null
    id: string
    item_id: string | null
    new_quantity: number | null
    new_status: string | null
    previous_quantity: number | null
    previous_status: string | null
  }
  Insert: {
    changed_by?: string | null
    created_at?: string
    description?: string | null
    id?: string
    item_id?: string | null
    new_quantity?: number | null
    new_status?: string | null
    previous_quantity?: number | null
    previous_status?: string | null
  }
  Update: {
    changed_by?: string | null
    created_at?: string
    description?: string | null
    id?: string
    item_id?: string | null
    new_quantity?: number | null
    new_status?: string | null
    previous_quantity?: number | null
    previous_status?: string | null
  }
}

export interface Items {
  Row: {
    created_at: string
    created_by: string | null
    description: string | null
    id: string
    name: string
    quantity: number
    room_id: string | null
    status: string | null
    updated_at: string
  }
  Insert: {
    created_at?: string
    created_by?: string | null
    description?: string | null
    id?: string
    name: string
    quantity?: number
    room_id?: string | null
    status?: string | null
    updated_at?: string
  }
  Update: {
    created_at?: string
    created_by?: string | null
    description?: string | null
    id?: string
    name?: string
    quantity?: number
    room_id?: string | null
    status?: string | null
    updated_at?: string
  }
}

export interface Profiles {
  Row: {
    avatar_url: string | null
    id: string
    role: string | null
    updated_at: string
    username: string | null
  }
  Insert: {
    avatar_url?: string | null
    id: string
    role?: string | null
    updated_at?: string
    username?: string | null
  }
  Update: {
    avatar_url?: string | null
    id?: string
    role?: string | null
    updated_at?: string
    username?: string | null
  }
}

export interface Rooms {
  Row: {
    created_at: string
    floor_id: string
    floor_number: number
    id: string
    previous_status: string | null
    room_number: string
    status: string | null
    updated_at: string
  }
  Insert: {
    created_at?: string
    floor_id: string
    floor_number: number
    id?: string
    previous_status?: string | null
    room_number: string
    status?: string | null
    updated_at?: string
  }
  Update: {
    created_at?: string
    floor_id?: string
    floor_number?: number
    id?: string
    previous_status?: string | null
    room_number?: string
    status?: string | null
    updated_at?: string
  }
}