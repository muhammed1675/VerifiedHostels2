import React from 'react';
import { MapPin, Tag } from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';

interface ListingHeaderProps {
  title: string;
  price: number;
  location: string;
  status: 'available' | 'rented';
}

/**
 * Listing header component displaying title, price, location and status
 */
const ListingHeader: React.FC<ListingHeaderProps> = ({ 
  title, 
  price, 
  location, 
  status 
}) => {
  const isAvailable = status === 'available';

  return (
    <div className="space-y-4">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
        {title}
      </h1>

      {/* Price and Status Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-2xl md:text-3xl font-bold text-yellow-600">
            {formatPrice(price)}
          </span>
        </div>

        {/* Status Badge */}
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
          isAvailable 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-gray-100 text-gray-600 border border-gray-200'
        }`}>
          {isAvailable ? 'Available' : 'Rented'}
        </span>
      </div>

      {/* Location */}
      <div className="flex items-start gap-2 text-gray-600">
        <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-500" />
        <span className="text-base">{location}</span>
      </div>

      {/* Price tag indicator */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Tag className="w-4 h-4" />
        <span>Price is negotiable</span>
      </div>
    </div>
  );
};

export default ListingHeader;
