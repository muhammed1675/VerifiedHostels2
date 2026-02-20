import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, A11y } from 'swiper/modules';
import { Home, ImageOff } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ImageSliderProps {
  images: string[];
  title?: string;
}

/**
 * Image slider component for listing photos
 * Images are served from Supabase Storage with public access
 */
const ImageSlider: React.FC<ImageSliderProps> = ({ images = [], title = 'Property' }) => {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [currentSlide, setCurrentSlide] = useState(0);

  // Handle empty images
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-[60vh] md:h-[500px] bg-gray-200 flex flex-col items-center justify-center">
        <Home className="w-24 h-24 text-gray-400 mb-4" />
        <p className="text-gray-600 font-medium text-lg">No photos available</p>
        <p className="text-gray-500 text-sm mt-1">This listing doesn&apos;t have any images yet</p>
      </div>
    );
  }

  // Single image (no slider needed)
  if (images.length === 1) {
    return (
      <div className="w-full h-[60vh] md:h-[500px] bg-gray-900">
        <img
          src={images[0]}
          alt={`${title} - Photo`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/fallback-house.png';
            target.alt = 'Image unavailable';
          }}
          loading="eager"
        />
      </div>
    );
  }

  // Handle image load error
  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="relative w-full h-[60vh] md:h-[500px] bg-gray-900">
      <Swiper
        modules={[Navigation, Pagination, Keyboard, A11y]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          prevEl: '.swiper-button-prev-custom',
          nextEl: '.swiper-button-next-custom',
        }}
        pagination={{
          clickable: true,
          dynamicBullets: images.length > 10,
        }}
        keyboard={{
          enabled: true,
        }}
        onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
        className="w-full h-full"
        role="region"
        aria-label="Property photos carousel"
      >
        {images.map((imageUrl, index) => (
          <SwiperSlide key={index}>
            {imageErrors[index] ? (
              // Fallback for failed images
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
                <ImageOff className="w-16 h-16 text-gray-400 mb-2" />
                <p className="text-gray-400 text-sm">Image unavailable</p>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt={`${title} - Photo ${index + 1} of ${images.length}`}
                className="w-full h-full object-cover"
                onError={() => handleImageError(index)}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      {currentSlide > 0 && (
        <button
          className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 
                     w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 transition
                     flex items-center justify-center backdrop-blur-sm"
          aria-label="Previous image"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {currentSlide < images.length - 1 && (
        <button
          className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 
                     w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 transition
                     flex items-center justify-center backdrop-blur-sm"
          aria-label="Next image"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Slide Counter (for > 10 images) */}
      {images.length > 10 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 
                        bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          {currentSlide + 1} / {images.length}
        </div>
      )}

      {/* Image count badge */}
      <div className="absolute top-4 right-4 z-10 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm backdrop-blur-sm">
        {images.length} {images.length === 1 ? 'photo' : 'photos'}
      </div>
    </div>
  );
};

export default ImageSlider;
