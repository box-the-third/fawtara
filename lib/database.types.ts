// Generated from Supabase project Fawtara-Docs-SaaS (xlfoesqvxevsnkebmnas).
// Regenerate via the Supabase MCP `generate_typescript_types` or the CLI.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null;
          company_name: string | null;
          cr_number: string | null;
          created_at: string;
          email: string | null;
          id: string;
          logo_url: string | null;
          name: string;
          org_id: string;
          phone: string | null;
          vat_number: string | null;
        };
        Insert: {
          address?: string | null;
          company_name?: string | null;
          cr_number?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          logo_url?: string | null;
          name: string;
          org_id: string;
          phone?: string | null;
          vat_number?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
        Relationships: [];
      };
      document_items: {
        Row: {
          description: string;
          document_id: string;
          id: string;
          quantity: number;
          sort_order: number;
          total_price: number;
          unit_price: number;
        };
        Insert: {
          description: string;
          document_id: string;
          id?: string;
          quantity?: number;
          sort_order?: number;
          total_price?: number;
          unit_price?: number;
        };
        Update: Partial<Database["public"]["Tables"]["document_items"]["Insert"]>;
        Relationships: [];
      };
      documents: {
        Row: {
          client_id: string | null;
          client_logo_url: string | null;
          created_at: string;
          currency: string;
          doc_type: Database["public"]["Enums"]["doc_type"];
          document_number: string;
          id: string;
          is_rtl: boolean;
          org_id: string;
          payload: Json;
          pdf_url: string | null;
          status: Database["public"]["Enums"]["doc_status"];
          subtotal: number;
          tax_amount: number;
          tax_rate: number;
          template_id: string | null;
          title: string;
          total_amount: number;
          updated_at: string;
          user_logo_url: string | null;
        };
        Insert: {
          client_id?: string | null;
          client_logo_url?: string | null;
          created_at?: string;
          currency?: string;
          doc_type: Database["public"]["Enums"]["doc_type"];
          document_number: string;
          id?: string;
          is_rtl?: boolean;
          org_id: string;
          payload?: Json;
          pdf_url?: string | null;
          status?: Database["public"]["Enums"]["doc_status"];
          subtotal?: number;
          tax_amount?: number;
          tax_rate?: number;
          template_id?: string | null;
          title: string;
          total_amount?: number;
          updated_at?: string;
          user_logo_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
        Relationships: [];
      };
      memberships: {
        Row: {
          created_at: string;
          id: string;
          org_id: string;
          role: Database["public"]["Enums"]["member_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          org_id: string;
          role?: Database["public"]["Enums"]["member_role"];
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["memberships"]["Insert"]>;
        Relationships: [];
      };
      organizations: {
        Row: {
          created_at: string;
          currency: string;
          id: string;
          is_rtl: boolean;
          language: string;
          logo_url: string | null;
          name: string;
          tax_rate: number;
          updated_at: string;
          vat_number: string | null;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          id?: string;
          is_rtl?: boolean;
          language?: string;
          logo_url?: string | null;
          name: string;
          tax_rate?: number;
          updated_at?: string;
          vat_number?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
        Relationships: [];
      };
      product_categories: {
        Row: { id: string; name: string; org_id: string };
        Insert: { id?: string; name: string; org_id: string };
        Update: Partial<Database["public"]["Tables"]["product_categories"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          category_id: string | null;
          description: string | null;
          id: string;
          name: string;
          org_id: string;
          unit_price: number;
        };
        Insert: {
          category_id?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          org_id: string;
          unit_price?: number;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      templates: {
        Row: {
          css_content: string | null;
          doc_type: Database["public"]["Enums"]["doc_type"];
          html_content: string | null;
          id: string;
          is_default: boolean;
          is_rtl: boolean;
          org_id: string | null;
          title: string;
        };
        Insert: {
          css_content?: string | null;
          doc_type: Database["public"]["Enums"]["doc_type"];
          html_content?: string | null;
          id?: string;
          is_default?: boolean;
          is_rtl?: boolean;
          org_id?: string | null;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["templates"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      create_organization: {
        Args: {
          p_currency?: string;
          p_is_rtl?: boolean;
          p_language?: string;
          p_logo_url?: string;
          p_name: string;
          p_tax_rate?: number;
          p_vat_number?: string;
        };
        Returns: string;
      };
      is_org_member: { Args: { p_org: string }; Returns: boolean };
      next_document_number: {
        Args: { p_org: string; p_type: Database["public"]["Enums"]["doc_type"] };
        Returns: string;
      };
    };
    Enums: {
      doc_status: "DRAFT" | "ISSUED" | "PAID" | "VOID";
      doc_type: "TENDER" | "OFFER_LETTER" | "NOC" | "POLICY_LETTER" | "INVOICE" | "CUSTOM";
      member_role: "OWNER" | "ADMIN" | "MEMBER";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];
export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];

export type DocType = Enums<"doc_type">;
export type DocStatus = Enums<"doc_status">;
export type MemberRole = Enums<"member_role">;
