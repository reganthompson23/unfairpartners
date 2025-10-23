export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          company_name: string
          contact_name: string
          phone: string
          address: string
          city: string
          state: string
          zip: string
          country: string
          tax_id: string | null
          status: 'pending' | 'approved' | 'rejected'
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          company_name: string
          contact_name: string
          phone: string
          address: string
          city: string
          state: string
          zip: string
          country: string
          tax_id?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          company_name?: string
          contact_name?: string
          phone?: string
          address?: string
          city?: string
          state?: string
          zip?: string
          country?: string
          tax_id?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string
          sku: string
          price: number
          wholesale_price: number
          image_url: string | null
          is_available: boolean
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          sku: string
          price: number
          wholesale_price: number
          image_url?: string | null
          is_available?: boolean
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          sku?: string
          price?: number
          wholesale_price?: number
          image_url?: string | null
          is_available?: boolean
          category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          sku: string
          wholesale_price: number
          rrp_price: number
          is_available: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          sku: string
          wholesale_price: number
          rrp_price: number
          is_available?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          sku?: string
          wholesale_price?: number
          rrp_price?: number
          is_available?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          order_number: string
          status: 'submitted' | 'processing' | 'completed' | 'cancelled'
          total_amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_number: string
          status?: 'submitted' | 'processing' | 'completed' | 'cancelled'
          total_amount: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_number?: string
          status?: 'submitted' | 'processing' | 'completed' | 'cancelled'
          total_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_name: string
          product_sku: string
          quantity: number
          unit_price: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_name: string
          product_sku: string
          quantity: number
          unit_price: number
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          product_sku?: string
          quantity?: number
          unit_price?: number
          subtotal?: number
          created_at?: string
        }
      }
    }
    Functions: {
      generate_order_number: {
        Args: Record<string, never>
        Returns: string
      }
    }
  }
}
