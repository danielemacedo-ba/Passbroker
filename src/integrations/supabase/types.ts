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
      invoices: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          numero: string
          order_id: string
          status: string
          url_pdf: string | null
          valor: number
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          numero?: string
          order_id: string
          status?: string
          url_pdf?: string | null
          valor: number
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          numero?: string
          order_id?: string
          status?: string
          url_pdf?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_audit: {
        Row: {
          acao: string
          actor_id: string | null
          created_at: string
          id: string
          lead_id: string
          motivo: string | null
        }
        Insert: {
          acao: string
          actor_id?: string | null
          created_at?: string
          id?: string
          lead_id: string
          motivo?: string | null
        }
        Update: {
          acao?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          motivo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_audit_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_sources: {
        Row: {
          api_key: string
          ativo: boolean
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          api_key?: string
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          api_key?: string
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          buyer_id: string | null
          campanha: string | null
          created_at: string
          dados_extra: Json
          email: string | null
          id: string
          motivo_reprovacao: string | null
          nome: string | null
          preco: number | null
          regiao: string | null
          segmento: string | null
          source_id: string | null
          status: string
          tags: string[]
          telefone: string | null
          temperatura: string | null
          updated_at: string
        }
        Insert: {
          buyer_id?: string | null
          campanha?: string | null
          created_at?: string
          dados_extra?: Json
          email?: string | null
          id?: string
          motivo_reprovacao?: string | null
          nome?: string | null
          preco?: number | null
          regiao?: string | null
          segmento?: string | null
          source_id?: string | null
          status?: string
          tags?: string[]
          telefone?: string | null
          temperatura?: string | null
          updated_at?: string
        }
        Update: {
          buyer_id?: string | null
          campanha?: string | null
          created_at?: string
          dados_extra?: Json
          email?: string | null
          id?: string
          motivo_reprovacao?: string | null
          nome?: string | null
          preco?: number | null
          regiao?: string | null
          segmento?: string | null
          source_id?: string | null
          status?: string
          tags?: string[]
          telefone?: string | null
          temperatura?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "lead_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          lead_id: string
          order_id: string
          preco_unitario: number
        }
        Insert: {
          id?: string
          lead_id: string
          order_id: string
          preco_unitario?: number
        }
        Update: {
          id?: string
          lead_id?: string
          order_id?: string
          preco_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string
          created_at: string
          gateway: string | null
          gateway_transaction_id: string | null
          id: string
          status_pagamento: string
          tipo: string
          valor_total: number
        }
        Insert: {
          buyer_id: string
          created_at?: string
          gateway?: string | null
          gateway_transaction_id?: string | null
          id?: string
          status_pagamento?: string
          tipo?: string
          valor_total?: number
        }
        Update: {
          buyer_id?: string
          created_at?: string
          gateway?: string | null
          gateway_transaction_id?: string | null
          id?: string
          status_pagamento?: string
          tipo?: string
          valor_total?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string | null
          saldo: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nome?: string | null
          saldo?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          saldo?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          erro: string | null
          id: string
          lead_id: string | null
          payload: Json | null
          source_id: string | null
          sucesso: boolean
        }
        Insert: {
          created_at?: string
          erro?: string | null
          id?: string
          lead_id?: string | null
          payload?: Json | null
          source_id?: string | null
          sucesso?: boolean
        }
        Update: {
          created_at?: string
          erro?: string | null
          id?: string
          lead_id?: string | null
          payload?: Json | null
          source_id?: string | null
          sucesso?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_logs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "lead_sources"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "buyer"
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
    Enums: {
      app_role: ["admin", "buyer"],
    },
  },
} as const
