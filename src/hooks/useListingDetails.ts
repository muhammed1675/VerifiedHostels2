import { useState, useEffect, useCallback } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string | null;
  status: 'available' | 'rented';
  last_verified: string | null;
  contact_info: string | null;
  created_at: string;
  updated_at: string;
}

interface UseListingDetailsReturn {
  listing: Listing | null;
  images: string[];
  isUnlocked: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useListingDetails = (listingId: string | undefined): UseListingDetailsReturn => {
  const [listing, setListing] = useState<Listing | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListingDetails = useCallback(async () => {
    if (!listingId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (listingError) {
        if (listingError.code === 'PGRST116') {
          throw new Error('Listing not found');
        }
        throw listingError;
      }

      const { data: imagesData, error: imagesError } = await supabase
        .from('listing_images')
        .select('image_url')
        .eq('listing_id', listingId)
        .order('display_order', { ascending: true });

      if (imagesError) throw imagesError;

      const user = await getCurrentUser();
      let unlockedStatus = false;
      let contactInfo: string | null = null;

      if (user) {
        const { data: unlockData, error: unlockError } = await supabase
          .from('unlocked_listings')
          .select('id')
          .eq('user_id', user.id)
          .eq('listing_id', listingId)
          .maybeSingle();

        if (unlockError && unlockError.code !== 'PGRST116') {
          throw unlockError;
        }

        unlockedStatus = !!unlockData;

        if (unlockedStatus) {
          const { data: fullListing, error: contactError } = await supabase
            .from('listings')
            .select('contact_info')
            .eq('id', listingId)
            .single();

          if (!contactError && fullListing) {
            contactInfo = (fullListing as { contact_info: string }).contact_info;
          }
        }
      }

      const listingWithContact: Listing = {
        id: (listingData as { id: string }).id,
        title: (listingData as { title: string }).title,
        price: (listingData as { price: number }).price,
        location: (listingData as { location: string }).location,
        description: (listingData as { description: string | null }).description,
        status: (listingData as { status: 'available' | 'rented' }).status,
        last_verified: (listingData as { last_verified: string | null }).last_verified,
        contact_info: contactInfo,
        created_at: (listingData as { created_at: string }).created_at,
        updated_at: (listingData as { updated_at: string }).updated_at,
      };
      
      setListing(listingWithContact);
      setImages(imagesData?.map((img: { image_url: string }) => img.image_url) || []);
      setIsUnlocked(unlockedStatus);

    } catch (err) {
      console.error('Error fetching listing:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchListingDetails();
  }, [fetchListingDetails]);

  useEffect(() => {
    if (!listingId) return;

    const subscription = supabase
      .channel(`listing-${listingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'listings',
          filter: `id=eq.${listingId}`,
        },
        (payload) => {
          setListing((prev) => {
            if (!prev) return null;
            return { ...prev, ...payload.new } as Listing;
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [listingId]);

  return {
    listing,
    images,
    isUnlocked,
    loading,
    error,
    refetch: fetchListingDetails,
  };
};
