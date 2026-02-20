import React from 'react';
import { ListingDetailsPage } from '@/components/listing-details';

/**
 * Listing Page - Wrapper for ListingDetailsPage
 * This allows for future expansion (e.g., adding layout, navigation, etc.)
 */
const ListingPage: React.FC = () => {
  return <ListingDetailsPage />;
};

export default ListingPage;
