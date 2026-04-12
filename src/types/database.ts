export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          phone: string;
          full_name: string;
          username: string;
          avatar_url: string | null;
          blood_type: string;
          gender: string;
          date_of_birth: string;
          city: string;
          state: string;
          pincode: string;
          weight_kg: number;
          last_donated_at: string | null;
          total_donations: number;
          karma: number;
          is_admin: boolean;
          is_available: boolean;
          is_verified: boolean;
          has_chronic_disease: boolean;
          is_smoker: boolean;
          is_on_medication: boolean;
          preferred_language: string;
          consent_terms: boolean;
          consent_privacy: boolean;
          consent_notifications: boolean;
          status: "active" | "banned" | "timeout" | "deleted";
          timeout_until: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          email: string;
          phone: string;
          full_name: string;
          username: string;
          blood_type: string;
          gender: string;
          date_of_birth: string;
          city: string;
          state: string;
          pincode: string;
          weight_kg: number;
          consent_terms: boolean;
          consent_privacy: boolean;
          consent_notifications?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          created_by: string;
          patient_name: string;
          blood_type_needed: string;
          units_needed: number;
          hospital_name: string;
          hospital_address: string;
          city: string;
          state: string;
          latitude: number | null;
          longitude: number | null;
          contact_name: string;
          contact_phone: string;
          contact_email: string | null;
          medical_condition: string | null;
          additional_notes: string | null;
          is_emergency: boolean;
          required_by: string;
          initial_radius_km: number;
          current_radius_km: number;
          expires_at: string;
          status: "active" | "fulfilled" | "expired" | "shadow_banned" | "deleted";
          priority_score: number;
          upvote_count: number;
          donor_count: number;
          approved_donor_id: string | null;
          sms_sent_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["posts"]["Row"]> & {
          created_by: string;
          patient_name: string;
          blood_type_needed: string;
          units_needed: number;
          hospital_name: string;
          hospital_address: string;
          city: string;
          state: string;
          contact_name: string;
          contact_phone: string;
          required_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["posts"]["Row"]>;
        Relationships: [];
      };
      donor_applications: {
        Row: {
          id: string;
          post_id: string;
          donor_id: string;
          status: "pending" | "approved" | "rejected" | "cancelled";
          eligibility_score: number;
          distance_km: number | null;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["donor_applications"]["Row"]> & {
          post_id: string;
          donor_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["donor_applications"]["Row"]>;
        Relationships: [];
      };
      upvotes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          value: -1 | 1;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
          value: -1 | 1;
        };
        Update: Partial<Database["public"]["Tables"]["upvotes"]["Row"]>;
        Relationships: [];
      };
      donations: {
        Row: {
          id: string;
          donor_id: string;
          recipient_id: string | null;
          post_id: string | null;
          donated_at: string;
          units: number;
          hospital_name: string;
          city: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["donations"]["Row"]> & {
          donor_id: string;
          donated_at: string;
          units: number;
          hospital_name: string;
          city: string;
        };
        Update: Partial<Database["public"]["Tables"]["donations"]["Row"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          data: Json | null;
          post_id: string | null;
          read_at: string | null;
          sms_sent: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notifications"]["Row"]> & {
          user_id: string;
          type: string;
          title: string;
          body: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
        Relationships: [];
      };
      admin_actions: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          target_type: string;
          target_id: string;
          reason: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          admin_id: string;
          action: string;
          target_type: string;
          target_id: string;
          reason: string;
          metadata?: Json | null;
        };
        Update: Partial<Database["public"]["Tables"]["admin_actions"]["Row"]>;
        Relationships: [];
      };
      sms_log: {
        Row: {
          id: string;
          to_phone: string;
          message: string;
          post_id: string | null;
          user_id: string | null;
          status: string;
          twilio_sid: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["sms_log"]["Row"]> & {
          to_phone: string;
          message: string;
          status: string;
        };
        Update: Partial<Database["public"]["Tables"]["sms_log"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_karma: {
        Args: {
          user_id: string;
          amount: number;
        };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TableInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TableUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
