import type { Database } from './database.types';

// Export types from database
export type Listing = Database['public']['Tables']['listings']['Row'];
export type ListingImage = Database['public']['Tables']['listing_images']['Row'];
export type UserTokens = Database['public']['Tables']['user_tokens']['Row'];
export type UnlockedListing = Database['public']['Tables']['unlocked_listings']['Row'];

// Extended listing type with unlocked contact info
export interface ListingWithContact extends Listing {
  contact_info: string | null;
}

// Unlock response type
export interface UnlockResponse {
  success: boolean;
  contactInfo?: string;
  newTokenBalance?: number;
  alreadyUnlocked?: boolean;
  error?: string;
}

// Contact unlocker props
export interface ContactUnlockerProps {
  listingId: string;
  status: 'available' | 'rented';
  isUnlocked: boolean;
  contactInfo: string | null;
  tokenBalance: number;
  onUnlock: () => void;
  isUnlocking: boolean;
  error: string | null;
}

// Image slider props
export interface ImageSliderProps {
  images: string[];
  title?: string;
}

// Listing header props
export interface ListingHeaderProps {
  title: string;
  price: number;
  location: string;
  status: 'available' | 'rented';
}

// Trust badge props
export interface TrustBadgeProps {
  lastVerified: string | null;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

// User type
export interface User {
  id: string;
  email: string;
  created_at: string;
}
