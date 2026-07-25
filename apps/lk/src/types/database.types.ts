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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json
          id: string
          module: string
          operator_id: string | null
          operator_name: string
          status: string
          target_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details: Json
          id?: string
          module: string
          operator_id?: string | null
          operator_name: string
          status?: string
          target_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json
          id?: string
          module?: string
          operator_id?: string | null
          operator_name?: string
          status?: string
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          date: string
          id: string
          note: string | null
          schedule_id: string
          status: string
          student_id: string
          teacher_id: string
        }
        Insert: {
          date?: string
          id?: string
          note?: string | null
          schedule_id: string
          status: string
          student_id: string
          teacher_id: string
        }
        Update: {
          date?: string
          id?: string
          note?: string | null
          schedule_id?: string
          status?: string
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "attendance_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      course_categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      course_teachers: {
        Row: {
          course_id: string
          teacher_id: string
        }
        Insert: {
          course_id: string
          teacher_id: string
        }
        Update: {
          course_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_teachers_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_teachers_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          color_value: number | null
          description: string | null
          duration: string
          id: string
          name: string
          photo_url: string | null
          price: number
          status: string
          student_count: number
        }
        Insert: {
          category: string
          color_value?: number | null
          description?: string | null
          duration: string
          id?: string
          name: string
          photo_url?: string | null
          price: number
          status?: string
          student_count?: number
        }
        Update: {
          category?: string
          color_value?: number | null
          description?: string | null
          duration?: string
          id?: string
          name?: string
          photo_url?: string | null
          price?: number
          status?: string
          student_count?: number
        }
        Relationships: []
      }
      documents: {
        Row: {
          document_number: string
          file_url: string | null
          id: string
          joining_date: string
          parent_name: string | null
          student_email: string
          student_name: string
          template_data: Json
        }
        Insert: {
          document_number: string
          file_url?: string | null
          id?: string
          joining_date?: string
          parent_name?: string | null
          student_email: string
          student_name: string
          template_data: Json
        }
        Update: {
          document_number?: string
          file_url?: string | null
          id?: string
          joining_date?: string
          parent_name?: string | null
          student_email?: string
          student_name?: string
          template_data?: Json
        }
        Relationships: []
      }
      grades: {
        Row: {
          course_id: string
          date: string
          id: string
          note: string | null
          score: number
          student_id: string
          teacher_id: string
        }
        Insert: {
          course_id: string
          date?: string
          id?: string
          note?: string | null
          score: number
          student_id: string
          teacher_id: string
        }
        Update: {
          course_id?: string
          date?: string
          id?: string
          note?: string | null
          score?: number
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "grades_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      payments: {
        Row: {
          id: string
          payment_date: string
          payment_number: string
          payment_type: string
          price: number
          status: string
          student_id: string
        }
        Insert: {
          id?: string
          payment_date?: string
          payment_number: string
          payment_type: string
          price: number
          status?: string
          student_id: string
        }
        Update: {
          id?: string
          payment_date?: string
          payment_number?: string
          payment_type?: string
          price?: number
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
        ]
      }
      schedules: {
        Row: {
          course_id: string
          end_date: string
          id: string
          lesson_type: string
          meeting_url: string | null
          room: string | null
          start_date: string
          status: string
          teacher_id: string
        }
        Insert: {
          course_id: string
          end_date: string
          id?: string
          lesson_type?: string
          meeting_url?: string | null
          room?: string | null
          start_date: string
          status?: string
          teacher_id: string
        }
        Update: {
          course_id?: string
          end_date?: string
          id?: string
          lesson_type?: string
          meeting_url?: string | null
          room?: string | null
          start_date?: string
          status?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      student_courses: {
        Row: {
          course_id: string
          student_id: string
        }
        Insert: {
          course_id: string
          student_id: string
        }
        Update: {
          course_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_courses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
        ]
      }
      students: {
        Row: {
          birth_date: string | null
          contract_id: string | null
          language_level: string
          photo_url: string | null
          registration_date: string
          status: string
          student_id: string
        }
        Insert: {
          birth_date?: string | null
          contract_id?: string | null
          language_level?: string
          photo_url?: string | null
          registration_date?: string
          status?: string
          student_id: string
        }
        Update: {
          birth_date?: string | null
          contract_id?: string | null
          language_level?: string
          photo_url?: string | null
          registration_date?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          birth_date: string | null
          color_value: number | null
          contract_id: string | null
          experience: string | null
          hire_date: string
          photo_url: string | null
          status: string
          teacher_id: string
        }
        Insert: {
          birth_date?: string | null
          color_value?: number | null
          contract_id?: string | null
          experience?: string | null
          hire_date?: string
          photo_url?: string | null
          status?: string
          teacher_id: string
        }
        Update: {
          birth_date?: string | null
          color_value?: number | null
          contract_id?: string | null
          experience?: string | null
          hire_date?: string
          photo_url?: string | null
          status?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teachers_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          phone: string | null
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id: string
          is_active?: boolean
          last_name: string
          phone?: string | null
          role: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_student_with_auth:
        | {
            Args: {
              birth_date_val: string
              contract_id_val: string
              email_val: string
              first_name_val: string
              language_level_val: string
              last_name_val: string
              password_val: string
              photo_url_val: string
              registration_date_val: string
              status_val: string
            }
            Returns: string
          }
        | {
            Args: {
              birth_date_val: string
              contract_id_val: string
              email_val: string
              first_name_val: string
              language_level_val: string
              last_name_val: string
              password_val: string
              phone_val?: string
              photo_url_val: string
              registration_date_val: string
              status_val: string
            }
            Returns: string
          }
      create_teacher_with_auth:
        | {
            Args: {
              birth_date_val: string
              contract_id_val: string
              email_val: string
              experience_val: number
              first_name_val: string
              hire_date_val: string
              last_name_val: string
              password_val: string
              photo_url_val: string
              status_val: string
            }
            Returns: string
          }
        | {
            Args: {
              birth_date_val: string
              contract_id_val: string
              email_val: string
              experience_val: number
              first_name_val: string
              hire_date_val: string
              last_name_val: string
              password_val: string
              phone_val?: string
              photo_url_val: string
              status_val: string
            }
            Returns: string
          }
      get_user_role: { Args: never; Returns: string }
      update_user_password: {
        Args: { password_val: string; user_id_val: string }
        Returns: undefined
      }
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
