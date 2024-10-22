export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      listings: {
        Row: {
          availability:
            | Database["public"]["Enums"]["listing_availability"]
            | null
          created_at: string | null
          deleted_at: string | null
          description: string
          facebook_link: string | null
          gender_preference:
            | Database["public"]["Enums"]["gender_preference"]
            | null
          id: string
          location: string
          monthly_price: number
          owner_id: string | null
          title: string
          type: Database["public"]["Enums"]["listing_type"] | null
          under_review: boolean | null
          updated_at: string | null
        }
        Insert: {
          availability?:
            | Database["public"]["Enums"]["listing_availability"]
            | null
          created_at?: string | null
          deleted_at?: string | null
          description: string
          facebook_link?: string | null
          gender_preference?:
            | Database["public"]["Enums"]["gender_preference"]
            | null
          id?: string
          location: string
          monthly_price: number
          owner_id?: string | null
          title: string
          type?: Database["public"]["Enums"]["listing_type"] | null
          under_review?: boolean | null
          updated_at?: string | null
        }
        Update: {
          availability?:
            | Database["public"]["Enums"]["listing_availability"]
            | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string
          facebook_link?: string | null
          gender_preference?:
            | Database["public"]["Enums"]["gender_preference"]
            | null
          id?: string
          location?: string
          monthly_price?: number
          owner_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["listing_type"] | null
          under_review?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      listings_amenities: {
        Row: {
          amenity: string
          created_at: string | null
          deleted_at: string | null
          id: string
          listing_id: string | null
        }
        Insert: {
          amenity: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          listing_id?: string | null
        }
        Update: {
          amenity?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          listing_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_amenities_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings_conveniences: {
        Row: {
          for_listing: string | null
          id: number
          title: string | null
        }
        Insert: {
          for_listing?: string | null
          id?: number
          title?: string | null
        }
        Update: {
          for_listing?: string | null
          id?: number
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_conveniences_for_listing_fkey"
            columns: ["for_listing"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          listing_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          listing_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          listing_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings_rooms: {
        Row: {
          for_listing: string | null
          id: string
          name: string | null
          occupied_beds: number | null
          total_beds: number | null
        }
        Insert: {
          for_listing?: string | null
          id?: string
          name?: string | null
          occupied_beds?: number | null
          total_beds?: number | null
        }
        Update: {
          for_listing?: string | null
          id?: string
          name?: string | null
          occupied_beds?: number | null
          total_beds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_rooms_for_listing_fkey"
            columns: ["for_listing"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          email: string | null
          id: string
          role: Database["public"]["Enums"]["role_type"] | null
          role_initialized: boolean | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["role_type"] | null
          role_initialized?: boolean | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["role_type"] | null
          role_initialized?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      gender_preference: "Female Only" | "Male Only" | "Both"
      listing_availability: "available" | "full"
      listing_type: "Private" | "Shared"
      role_type: "Student" | "Owner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

