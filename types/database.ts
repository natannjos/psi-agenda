export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          time_range: unknown;
          status: 'pending' | 'confirmed' | 'canceled' | 'expired';
          price_cents: number;
          currency: string;
          created_at: string | null;
          expires_at: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          time_range: unknown;
          status?: 'pending' | 'confirmed' | 'canceled' | 'expired';
          price_cents: number;
          currency?: string;
          created_at?: string | null;
          expires_at?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          provider: string;
          provider_intent_id: string | null;
          amount_cents: number;
          currency: string;
          status: string;
          raw: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          booking_id: string;
          provider?: string;
          provider_intent_id?: string | null;
          amount_cents: number;
          currency?: string;
          status: string;
          raw?: Json | null;
          created_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      profiles: {
        Row: {
          user_id: string;
          full_name: string | null;
          phone: string | null;
          created_at: string | null;
        };
        Insert: {
          user_id: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      room_blackouts: {
        Row: {
          id: string;
          room_id: string;
          starts_at: string;
          ends_at: string;
          reason: string | null;
        };
        Insert: {
          id?: string;
          room_id: string;
          starts_at: string;
          ends_at: string;
          reason?: string | null;
        };
        Update: Partial<Database['public']['Tables']['room_blackouts']['Insert']>;
      };
      room_openings: {
        Row: {
          id: string;
          room_id: string;
          weekday: number;
          start_minute: number;
          end_minute: number;
        };
        Insert: {
          id?: string;
          room_id: string;
          weekday: number;
          start_minute: number;
          end_minute: number;
        };
        Update: Partial<Database['public']['Tables']['room_openings']['Insert']>;
      };
      rooms: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          capacity: number | null;
          amenities: Json;
          price_cents: number;
          active: boolean;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          capacity?: number | null;
          amenities?: Json;
          price_cents?: number;
          active?: boolean;
          created_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['rooms']['Insert']>;
      };
    };
    Views: never;
    Functions: never;
    Enums: never;
  };
}
