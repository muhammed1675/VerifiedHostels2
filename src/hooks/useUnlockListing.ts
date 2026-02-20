import { useState, useCallback } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';
import type { UnlockResponse } from '@/types/listing.types';

interface UseUnlockListingReturn {
  unlockListing: (listingId: string) => Promise<UnlockResponse>;
  isUnlocking: boolean;
  error: string | null;
  clearError: () => void;
}

export const useUnlockListing = (): UseUnlockListingReturn => {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const unlockListing = useCallback(async (listingId: string): Promise<UnlockResponse> => {
    setIsUnlocking(true);
    setError(null);

    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new Error('You must be logged in to unlock listings');
      }

      const { data, error: rpcError } = await supabase
        .rpc('unlock_listing', {
          p_listing_id: listingId,
          p_user_id: user.id,
        } as any);

      if (rpcError) throw rpcError;

      const response = data as {
        success: boolean;
        contact_info?: string;
        token_balance?: number;
        already_unlocked?: boolean;
        error?: string;
        message?: string;
      };

      if (!response.success) {
        throw new Error(response.error || 'Failed to unlock listing');
      }

      return {
        success: true,
        contactInfo: response.contact_info,
        newTokenBalance: response.token_balance,
        alreadyUnlocked: response.already_unlocked || false,
      };
    } catch (err) {
      console.error('Unlock error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to unlock listing';
      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsUnlocking(false);
    }
  }, []);

  return {
    unlockListing,
    isUnlocking,
    error,
    clearError,
  };
};
