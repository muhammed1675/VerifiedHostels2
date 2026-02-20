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
      listings: {
        Row: {
          id: string
          title: string
          price: number
          location: string
          description: string | null
          status: 'available' | 'rented'
          last_verified: string | null
          contact_info: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          price: number
          location: string
          description?: string | null
          status?: 'available' | 'rented'
          last_verified?: string | null
          contact_info?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          price?: number
          location?: string
          description?: string | null
          status?: 'available' | 'rented'
          last_verified?: string | null
          contact_info?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      listing_images: {
        Row: {
          id: string
          listing_id: string
          image_url: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          image_url: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          image_url?: string
          display_order?: number
          created_at?: string
        }
      }
      user_tokens: {
        Row: {
          id: string
          user_id: string
          token_balance: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token_balance?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token_balance?: number
          updated_at?: string
        }
      }
      unlocked_listings: {
        Row: {
          id: string
          user_id: string
          listing_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          listing_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          listing_id?: string
          unlocked_at?: string
        }
      }
    }
    Functions: {
      unlock_listing: {
        Args: {
          p_listing_id: string
          p_user_id: string
        }
        Returns: {
          success: boolean
          contact_info?: string
          token_balance?: number
          already_unlocked?: boolean
          error?: string
          message?: string
        }
      }
      initialize_user_tokens: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Export table row types for convenience
export type Listing = Database['public']['Tables']['listings']['Row'];
export type ListingImage = Database['public']['Tables']['listing_images']['Row'];
export type UserTokens = Database['public']['Tables']['user_tokens']['Row'];
export type UnlockedListing = Database['public']['Tables']['unlocked_listings']['Row'];
