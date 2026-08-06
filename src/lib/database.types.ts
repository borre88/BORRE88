export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          profile_id: string | null
          trainer_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          profile_id?: string | null
          trainer_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          profile_id?: string | null
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dining_categories: {
        Row: {
          id: string
          label: string
          position: number
        }
        Insert: {
          id: string
          label: string
          position?: number
        }
        Update: {
          id?: string
          label?: string
          position?: number
        }
        Relationships: []
      }
      dining_dishes: {
        Row: {
          carbs_g: number
          category_id: string
          fat_g: number
          id: string
          kcal: number
          name: string
          protein_g: number
        }
        Insert: {
          carbs_g: number
          category_id: string
          fat_g: number
          id?: string
          kcal: number
          name: string
          protein_g: number
        }
        Update: {
          carbs_g?: number
          category_id?: string
          fat_g?: number
          id?: string
          kcal?: number
          name?: string
          protein_g?: number
        }
        Relationships: [
          {
            foreignKeyName: "dining_dishes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "dining_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      measurements: {
        Row: {
          bench_1rm: number | null
          client_id: string
          created_at: string
          date: string
          deadlift_1rm: number | null
          id: string
          resting_hr: number | null
          sleep_hours: number | null
          squat_1rm: number | null
          vo2max: number | null
          weight_kg: number | null
        }
        Insert: {
          bench_1rm?: number | null
          client_id: string
          created_at?: string
          date: string
          deadlift_1rm?: number | null
          id?: string
          resting_hr?: number | null
          sleep_hours?: number | null
          squat_1rm?: number | null
          vo2max?: number | null
          weight_kg?: number | null
        }
        Update: {
          bench_1rm?: number | null
          client_id?: string
          created_at?: string
          date?: string
          deadlift_1rm?: number | null
          id?: string
          resting_hr?: number | null
          sleep_hours?: number | null
          squat_1rm?: number | null
          vo2max?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "measurements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          health_data_consent_at: string | null
          id: string
          privacy_accepted_at: string | null
          role: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          health_data_consent_at?: string | null
          id: string
          privacy_accepted_at?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          health_data_consent_at?: string | null
          id?: string
          privacy_accepted_at?: string | null
          role?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          carbs_g: number
          created_at: string
          emoji: string | null
          fat_g: number
          goal: string
          id: string
          ingredients: string[]
          kcal: number
          meal: string
          name: string
          protein_g: number
          steps: string[]
          time_minutes: number
        }
        Insert: {
          carbs_g: number
          created_at?: string
          emoji?: string | null
          fat_g: number
          goal: string
          id?: string
          ingredients?: string[]
          kcal: number
          meal: string
          name: string
          protein_g: number
          steps?: string[]
          time_minutes: number
        }
        Update: {
          carbs_g?: number
          created_at?: string
          emoji?: string | null
          fat_g?: number
          goal?: string
          id?: string
          ingredients?: string[]
          kcal?: number
          meal?: string
          name?: string
          protein_g?: number
          steps?: string[]
          time_minutes?: number
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          id: string
          name: string
          position: number
          reps: string
          rest: string
          sets: number
          workout_id: string
        }
        Insert: {
          id?: string
          name: string
          position?: number
          reps: string
          rest: string
          sets: number
          workout_id: string
        }
        Update: {
          id?: string
          name?: string
          position?: number
          reps?: string
          rest?: string
          sets?: number
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          duration_minutes: number
          equipment: string
          goal: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          duration_minutes: number
          equipment: string
          goal: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          equipment?: string
          goal?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_trainer: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
