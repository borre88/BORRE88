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
      blood_test_values: {
        Row: {
          blood_test_id: string
          id: string
          marker_key: string
          value: number
        }
        Insert: {
          blood_test_id: string
          id?: string
          marker_key: string
          value: number
        }
        Update: {
          blood_test_id?: string
          id?: string
          marker_key?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "blood_test_values_blood_test_id_fkey"
            columns: ["blood_test_id"]
            isOneToOne: false
            referencedRelation: "blood_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_tests: {
        Row: {
          client_id: string
          created_at: string
          id: string
          lab_name: string | null
          notes: string | null
          test_date: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          lab_name?: string | null
          notes?: string | null
          test_date: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          lab_name?: string | null
          notes?: string | null
          test_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "blood_tests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string
          gender: string | null
          group_name: string | null
          id: string
          phone: string | null
          profile_id: string | null
          trainer_id: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          group_name?: string | null
          id?: string
          phone?: string | null
          profile_id?: string | null
          trainer_id: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          group_name?: string | null
          id?: string
          phone?: string | null
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
      cooking_conversions: {
        Row: {
          category: string
          cooked_kcal: number
          cooked_weight_g: number
          id: string
          ingredient: string
          method: string
          position: number
          raw_kcal: number
          raw_weight_g: number
        }
        Insert: {
          category: string
          cooked_kcal: number
          cooked_weight_g: number
          id?: string
          ingredient: string
          method: string
          position?: number
          raw_kcal: number
          raw_weight_g: number
        }
        Update: {
          category?: string
          cooked_kcal?: number
          cooked_weight_g?: number
          id?: string
          ingredient?: string
          method?: string
          position?: number
          raw_kcal?: number
          raw_weight_g?: number
        }
        Relationships: []
      }
      delivery_requests: {
        Row: {
          client_id: string
          created_at: string
          deliveries_per_week: number | null
          delivery_area: string | null
          goal: string | null
          id: string
          meals: string[] | null
          meals_per_week: number | null
          notes: string | null
          preferences: string | null
          preferred_days: string[] | null
          preferred_time: string | null
          status: string
          viewed_by_trainer_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          deliveries_per_week?: number | null
          delivery_area?: string | null
          goal?: string | null
          id?: string
          meals?: string[] | null
          meals_per_week?: number | null
          notes?: string | null
          preferences?: string | null
          preferred_days?: string[] | null
          preferred_time?: string | null
          status?: string
          viewed_by_trainer_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          deliveries_per_week?: number | null
          delivery_area?: string | null
          goal?: string | null
          id?: string
          meals?: string[] | null
          meals_per_week?: number | null
          notes?: string | null
          preferences?: string | null
          preferred_days?: string[] | null
          preferred_time?: string | null
          status?: string
          viewed_by_trainer_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
          activity_level: string | null
          alcohol_weekly: number | null
          bench_1rm: number | null
          body_fat_percent: number | null
          client_id: string
          cooper_test_meters: number | null
          created_at: string
          date: string
          deadlift_1rm: number | null
          fish_weekly: number | null
          five_km_time_minutes: number | null
          fruit_veg_daily: number | null
          height_cm: number | null
          hip_cm: number | null
          hrv: number | null
          id: string
          junk_food_weekly: number | null
          neck_cm: number | null
          protein_meals_daily: number | null
          pullup_max_reps: number | null
          red_meat_weekly: number | null
          resting_hr: number | null
          sleep_hours: number | null
          sleep_quality: number | null
          squat_1rm: number | null
          trainer_notes: string | null
          vo2max: number | null
          waist_cm: number | null
          water_daily_liters: number | null
          weight_kg: number | null
          workouts_per_week: number | null
        }
        Insert: {
          activity_level?: string | null
          alcohol_weekly?: number | null
          bench_1rm?: number | null
          body_fat_percent?: number | null
          client_id: string
          cooper_test_meters?: number | null
          created_at?: string
          date: string
          deadlift_1rm?: number | null
          fish_weekly?: number | null
          five_km_time_minutes?: number | null
          fruit_veg_daily?: number | null
          height_cm?: number | null
          hip_cm?: number | null
          hrv?: number | null
          id?: string
          junk_food_weekly?: number | null
          neck_cm?: number | null
          protein_meals_daily?: number | null
          pullup_max_reps?: number | null
          red_meat_weekly?: number | null
          resting_hr?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          squat_1rm?: number | null
          trainer_notes?: string | null
          vo2max?: number | null
          waist_cm?: number | null
          water_daily_liters?: number | null
          weight_kg?: number | null
          workouts_per_week?: number | null
        }
        Update: {
          activity_level?: string | null
          alcohol_weekly?: number | null
          bench_1rm?: number | null
          body_fat_percent?: number | null
          client_id?: string
          cooper_test_meters?: number | null
          created_at?: string
          date?: string
          deadlift_1rm?: number | null
          fish_weekly?: number | null
          five_km_time_minutes?: number | null
          fruit_veg_daily?: number | null
          height_cm?: number | null
          hip_cm?: number | null
          hrv?: number | null
          id?: string
          junk_food_weekly?: number | null
          neck_cm?: number | null
          protein_meals_daily?: number | null
          pullup_max_reps?: number | null
          red_meat_weekly?: number | null
          resting_hr?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          squat_1rm?: number | null
          trainer_notes?: string | null
          vo2max?: number | null
          waist_cm?: number | null
          water_daily_liters?: number | null
          weight_kg?: number | null
          workouts_per_week?: number | null
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
          tags: string[]
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
          tags?: string[]
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
          tags?: string[]
          time_minutes?: number
        }
        Relationships: []
      }
      shopping_list_items: {
        Row: {
          checked: boolean
          client_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          checked?: boolean
          client_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          checked?: boolean
          client_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      supplement_requests: {
        Row: {
          client_id: string
          created_at: string
          id: string
          items: string[] | null
          notes: string | null
          status: string
          viewed_by_trainer_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          items?: string[] | null
          notes?: string | null
          status?: string
          viewed_by_trainer_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          items?: string[] | null
          notes?: string | null
          status?: string
          viewed_by_trainer_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplement_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_checkins: {
        Row: {
          braccio_dx_cm: number | null
          braccio_sx_cm: number | null
          client_id: string
          coscia_dx_cm: number | null
          coscia_sx_cm: number | null
          created_at: string
          diet_slips: number | null
          energy: number | null
          fianchi_cm: number | null
          glutei_cm: number | null
          id: string
          notes: string | null
          petto_cm: number | null
          polpaccio_dx_cm: number | null
          polpaccio_sx_cm: number | null
          polso_dx_cm: number | null
          polso_sx_cm: number | null
          sleep_hours: number | null
          stress_level: number | null
          tiredness: number | null
          viewed_by_trainer_at: string | null
          vita_cm: number | null
          week_start: string
          weight_kg: number | null
          workouts_count: number | null
        }
        Insert: {
          braccio_dx_cm?: number | null
          braccio_sx_cm?: number | null
          client_id: string
          coscia_dx_cm?: number | null
          coscia_sx_cm?: number | null
          created_at?: string
          diet_slips?: number | null
          energy?: number | null
          fianchi_cm?: number | null
          glutei_cm?: number | null
          id?: string
          notes?: string | null
          petto_cm?: number | null
          polpaccio_dx_cm?: number | null
          polpaccio_sx_cm?: number | null
          polso_dx_cm?: number | null
          polso_sx_cm?: number | null
          sleep_hours?: number | null
          stress_level?: number | null
          tiredness?: number | null
          viewed_by_trainer_at?: string | null
          vita_cm?: number | null
          week_start: string
          weight_kg?: number | null
          workouts_count?: number | null
        }
        Update: {
          braccio_dx_cm?: number | null
          braccio_sx_cm?: number | null
          client_id?: string
          coscia_dx_cm?: number | null
          coscia_sx_cm?: number | null
          created_at?: string
          diet_slips?: number | null
          energy?: number | null
          fianchi_cm?: number | null
          glutei_cm?: number | null
          id?: string
          notes?: string | null
          petto_cm?: number | null
          polpaccio_dx_cm?: number | null
          polpaccio_sx_cm?: number | null
          polso_dx_cm?: number | null
          polso_sx_cm?: number | null
          sleep_hours?: number | null
          stress_level?: number | null
          tiredness?: number | null
          viewed_by_trainer_at?: string | null
          vita_cm?: number | null
          week_start?: string
          weight_kg?: number | null
          workouts_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_checkins_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_assignment_exercises: {
        Row: {
          assignment_id: string
          id: string
          name: string
          position: number
          reps: string
          rest: string
          sets: number
        }
        Insert: {
          assignment_id: string
          id?: string
          name: string
          position?: number
          reps: string
          rest: string
          sets: number
        }
        Update: {
          assignment_id?: string
          id?: string
          name?: string
          position?: number
          reps?: string
          rest?: string
          sets?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_assignment_exercises_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "workout_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_assignments: {
        Row: {
          category: string | null
          client_id: string
          created_at: string
          date: string
          duration_minutes: number | null
          id: string
          name: string
          notes: string | null
        }
        Insert: {
          category?: string | null
          client_id: string
          created_at?: string
          date: string
          duration_minutes?: number | null
          id?: string
          name: string
          notes?: string | null
        }
        Update: {
          category?: string | null
          client_id?: string
          created_at?: string
          date?: string
          duration_minutes?: number | null
          id?: string
          name?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
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
          category: string
          created_at: string
          duration_minutes: number
          equipment: string
          goal: string
          id: string
          level: number | null
          name: string
          subcategory: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          duration_minutes: number
          equipment: string
          goal: string
          id?: string
          level?: number | null
          name: string
          subcategory?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          duration_minutes?: number
          equipment?: string
          goal?: string
          id?: string
          level?: number | null
          name?: string
          subcategory?: string | null
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
