import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useListingDetails } from '@/hooks/useListingDetails';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useUnlockListing } from '@/hooks/useUnlockListing';
import { Loader2, ArrowLeft, Home, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import ImageSlider from './ImageSlider';
import ListingHeader from './ListingHeader';
import TrustBadge from './TrustBadge';
import ContactUnlocker from './ContactUnlocker';

/**
 * Main container for the Listing Details page
 * Fetches data from Supabase and orchestrates child components
 */
const ListingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Custom hooks for data fetching
  const { 
    listing, 
    images, 
    isUnlocked, 
    loading: listingLoading, 
    error: listingError,
    refetch: refetchListing 
  } = useListingDetails(id);

  const { 
    tokenBalance, 
    refetch: refetchTokens 
  } = useTokenBalance();

  const { 
    unlockListing, 
    isUnlocking, 
    error: unlockError,
    clearError 
  } = useUnlockListing();

  // Handle unlock action
  const handleUnlock = useCallback(async () => {
    if (!id) return;

    clearError();
    const result = await unlockListing(id);

    if (result.success) {
      // Refresh token balance and listing data
      await refetchTokens();
      await refetchListing();
    }
  }, [id, unlockListing, clearError, refetchTokens, refetchListing]);

  // Loading state
  if (listingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (listingError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Listing</AlertTitle>
            <AlertDescription>{listingError}</AlertDescription>
          </Alert>
          <Button 
            onClick={() => navigate('/')} 
            className="w-full"
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Listing Not Found</h2>
          <p className="text-gray-600 mb-6">This property may have been removed or doesn&apos;t exist.</p>
          <Button 
            onClick={() => navigate('/')} 
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8"
          >
            Browse Listings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button - Mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => navigate(-1)}
          variant="secondary"
          size="icon"
          className="bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Image Slider - Full width */}
      <ImageSlider images={images} title={listing.title} />

      {/* Content Container */}
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* Back Button - Desktop */}
        <div className="hidden md:block mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to listings
          </Button>
        </div>

        {/* Header: Title, Price, Location, Badges */}
        <ListingHeader
          title={listing.title}
          price={listing.price}
          location={listing.location}
          status={listing.status}
        />

        {/* Trust Badge */}
        <div className="mt-6">
          <TrustBadge lastVerified={listing.last_verified} />
        </div>

        {/* Description */}
        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {listing.description || 'No description available for this property.'}
          </p>
        </div>

        {/* Contact Unlocker - The revenue component */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Agent</h3>
          <ContactUnlocker
            listingId={listing.id}
            status={listing.status}
            isUnlocked={isUnlocked}
            contactInfo={listing.contact_info}
            tokenBalance={tokenBalance}
            onUnlock={handleUnlock}
            isUnlocking={isUnlocking}
            error={unlockError}
          />
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-blue-800 text-sm font-medium">Verified Listings</p>
              <p className="text-blue-700 text-sm mt-1">
                All listings are physically verified by our team. Contact information is only 
                revealed after unlocking with a token to prevent spam and ensure quality.
              </p>
            </div>
          </div>
        </div>

        {/* Listing ID (for support) */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            Listing ID: {listing.id}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailsPage;
