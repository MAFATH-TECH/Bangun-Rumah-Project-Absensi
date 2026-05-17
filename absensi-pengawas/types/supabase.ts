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
      absensi_harian: {
        Row: {
          id: string
          latitude: number | null
          longitude: number | null
          pengawas_id: string
          selfie_url: string
          status: string | null
          submit_at: string | null
          tanggal: string
        }
        Insert: {
          id?: string
          latitude?: number | null
          longitude?: number | null
          pengawas_id: string
          selfie_url: string
          status?: string | null
          submit_at?: string | null
          tanggal?: string
        }
        Update: {
          id?: string
          latitude?: number | null
          longitude?: number | null
          pengawas_id?: string
          selfie_url?: string
          status?: string | null
          submit_at?: string | null
          tanggal?: string
        }
        Relationships: [
          {
            foreignKeyName: "absensi_harian_pengawas_id_fkey"
            columns: ["pengawas_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          detail: Json | null
          id: string
          target_id: string
          target_table: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          detail?: Json | null
          id?: string
          target_id: string
          target_table: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          detail?: Json | null
          id?: string
          target_id?: string
          target_table?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      foto_progress_harian: {
        Row: {
          captured_at: string
          created_at: string | null
          foto_url: string
          id: string
          latitude: number | null
          longitude: number | null
          pengawas_id: string
          slot: number
          tanggal: string
          urutan_foto: number
        }
        Insert: {
          captured_at: string
          created_at?: string | null
          foto_url: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          pengawas_id: string
          slot: number
          tanggal?: string
          urutan_foto: number
        }
        Update: {
          captured_at?: string
          created_at?: string | null
          foto_url?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          pengawas_id?: string
          slot?: number
          tanggal?: string
          urutan_foto?: number
        }
        Relationships: [
          {
            foreignKeyName: "foto_progress_harian_pengawas_id_fkey"
            columns: ["pengawas_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      konfigurasi_slot: {
        Row: {
          id: string
          jam_mulai: string
          jam_selesai: string
          nama_slot: string
          slot: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          jam_mulai: string
          jam_selesai: string
          nama_slot: string
          slot: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          jam_mulai?: string
          jam_selesai?: string
          nama_slot?: string
          slot?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "konfigurasi_slot_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      laporan_progress: {
        Row: {
          absensi_id: string | null
          created_at: string | null
          deskripsi: string | null
          id: string
          kendala: string | null
          komentar_admin: string | null
          pengawas_id: string
          rekomendasi: string | null
          selfie_url: string | null
          slot1_foto_ids: string[] | null
          slot2_foto_ids: string[] | null
          slot3_foto_ids: string[] | null
          status: string | null
          submitted_at: string | null
          tanggal: string
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          absensi_id?: string | null
          created_at?: string | null
          deskripsi?: string | null
          id?: string
          kendala?: string | null
          komentar_admin?: string | null
          pengawas_id: string
          rekomendasi?: string | null
          selfie_url?: string | null
          slot1_foto_ids?: string[] | null
          slot2_foto_ids?: string[] | null
          slot3_foto_ids?: string[] | null
          status?: string | null
          submitted_at?: string | null
          tanggal?: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          absensi_id?: string | null
          created_at?: string | null
          deskripsi?: string | null
          id?: string
          kendala?: string | null
          komentar_admin?: string | null
          pengawas_id?: string
          rekomendasi?: string | null
          selfie_url?: string | null
          slot1_foto_ids?: string[] | null
          slot2_foto_ids?: string[] | null
          slot3_foto_ids?: string[] | null
          status?: string | null
          submitted_at?: string | null
          tanggal?: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "laporan_progress_absensi_id_fkey"
            columns: ["absensi_id"]
            isOneToOne: false
            referencedRelation: "absensi_harian"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "laporan_progress_pengawas_id_fkey"
            columns: ["pengawas_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "laporan_progress_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lokasi_tracking: {
        Row: {
          akurasi: number | null
          id: string
          latitude: number
          longitude: number
          pengawas_id: string
          timestamp: string | null
        }
        Insert: {
          akurasi?: number | null
          id?: string
          latitude: number
          longitude: number
          pengawas_id: string
          timestamp?: string | null
        }
        Update: {
          akurasi?: number | null
          id?: string
          latitude?: number
          longitude?: number
          pengawas_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lokasi_tracking_pengawas_id_fkey"
            columns: ["pengawas_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          created_by: string | null
          expo_push_token: string | null
          full_name: string
          id: string
          is_active: boolean | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expo_push_token?: string | null
          full_name: string
          id: string
          is_active?: boolean | null
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expo_push_token?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          created_by: string | null
          drive_folder_id: string
          drive_folder_url: string | null
          id: string
          is_active: boolean | null
          nama_project: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          drive_folder_id: string
          drive_folder_url?: string | null
          id?: string
          is_active?: boolean | null
          nama_project: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          drive_folder_id?: string
          drive_folder_url?: string | null
          id?: string
          is_active?: boolean | null
          nama_project?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sop_acknowledgment: {
        Row: {
          acknowledged_at: string | null
          id: string
          pengawas_id: string
          sop_id: string
          tanggal: string
        }
        Insert: {
          acknowledged_at?: string | null
          id?: string
          pengawas_id: string
          sop_id: string
          tanggal?: string
        }
        Update: {
          acknowledged_at?: string | null
          id?: string
          pengawas_id?: string
          sop_id?: string
          tanggal?: string
        }
        Relationships: [
          {
            foreignKeyName: "sop_acknowledgment_pengawas_id_fkey"
            columns: ["pengawas_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_acknowledgment_sop_id_fkey"
            columns: ["sop_id"]
            isOneToOne: false
            referencedRelation: "sop_pengawas"
            referencedColumns: ["id"]
          },
        ]
      }
      sop_pengawas: {
        Row: {
          berlaku_mulai: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          id: string
          is_active: boolean | null
          judul: string
          konten: string
          updated_at: string | null
        }
        Insert: {
          berlaku_mulai: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean | null
          judul: string
          konten: string
          updated_at?: string | null
        }
        Update: {
          berlaku_mulai?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean | null
          judul?: string
          konten?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sop_pengawas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transaksi_pembelian: {
        Row: {
          alasan_tolak: string | null
          catatan: string | null
          created_at: string | null
          drive_foto_urls: string[] | null
          foto_urls: string[] | null
          harga_satuan: number
          id: string
          jumlah: number
          logistik_id: string
          nama_material: string
          nama_supplier: string
          project_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          satuan: string
          status: string | null
          tanggal: string
          total: number | null
          updated_at: string | null
        }
        Insert: {
          alasan_tolak?: string | null
          catatan?: string | null
          created_at?: string | null
          drive_foto_urls?: string[] | null
          foto_urls?: string[] | null
          harga_satuan: number
          id?: string
          jumlah: number
          logistik_id: string
          nama_material: string
          nama_supplier: string
          project_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          satuan: string
          status?: string | null
          tanggal?: string
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          alasan_tolak?: string | null
          catatan?: string | null
          created_at?: string | null
          drive_foto_urls?: string[] | null
          foto_urls?: string[] | null
          harga_satuan?: number
          id?: string
          jumlah?: number
          logistik_id?: string
          nama_material?: string
          nama_supplier?: string
          project_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          satuan?: string
          status?: string | null
          tanggal?: string
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaksi_pembelian_logistik_id_fkey"
            columns: ["logistik_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaksi_pembelian_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaksi_pembelian_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_user_by_admin: {
        Args: {
          p_email: string
          p_full_name: string
          p_password: string
          p_role: string
        }
        Returns: Json
      }
      get_server_now: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      validate_slot_upload: {
        Args: { p_slot: number }
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
