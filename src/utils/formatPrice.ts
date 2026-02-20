/**
 * Format price in Nigerian Naira
 * @param price - Price in Naira (integer)
 * @returns Formatted price string (e.g., "₦450,000/yr")
 */
export const formatPrice = (price: number): string => {
  if (price === null || price === undefined || isNaN(price)) {
    return '₦0/yr';
  }

  // Format with thousand separators
  const formattedNumber = price.toLocaleString('en-NG');
  
  return `₦${formattedNumber}/yr`;
};

/**
 * Format price without the /yr suffix
 * @param price - Price in Naira (integer)
 * @returns Formatted price string (e.g., "₦450,000")
 */
export const formatPriceShort = (price: number): string => {
  if (price === null || price === undefined || isNaN(price)) {
    return '₦0';
  }

  const formattedNumber = price.toLocaleString('en-NG');
  
  return `₦${formattedNumber}`;
};

/**
 * Parse price string to number
 * @param priceString - Price string (e.g., "450000" or "450,000")
 * @returns Price as number
 */
export const parsePrice = (priceString: string): number => {
  if (!priceString) return 0;
  
  // Remove all non-numeric characters
  const numericString = priceString.replace(/[^0-9]/g, '');
  
  return parseInt(numericString, 10) || 0;
};
