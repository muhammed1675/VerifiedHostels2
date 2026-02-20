import { formatDistanceToNow, format, isValid, parseISO } from 'date-fns';

/**
 * Format verification date to relative time
 * @param dateString - ISO date string from Supabase
 * @returns Formatted relative time (e.g., "Verified 3 days ago")
 */
export const formatVerificationDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return 'Not verified yet';
  }

  try {
    const date = parseISO(dateString);
    
    if (!isValid(date)) {
      return 'Not verified yet';
    }

    const distance = formatDistanceToNow(date, { addSuffix: false });
    
    return `Verified ${distance} ago`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Not verified yet';
  }
};

/**
 * Get verification status color based on how recent the verification was
 * @param dateString - ISO date string from Supabase
 * @returns Color class for the status indicator
 */
export const getVerificationStatusColor = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return 'text-gray-500';
  }

  try {
    const date = parseISO(dateString);
    
    if (!isValid(date)) {
      return 'text-gray-500';
    }

    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays <= 7) {
      return 'text-green-600';
    } else if (diffInDays <= 30) {
      return 'text-yellow-600';
    } else {
      return 'text-orange-600';
    }
  } catch (error) {
    return 'text-gray-500';
  }
};

/**
 * Format date to full format
 * @param dateString - ISO date string
 * @returns Full formatted date (e.g., "October 27, 2023")
 */
export const formatFullDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return 'N/A';
  }

  try {
    const date = parseISO(dateString);
    
    if (!isValid(date)) {
      return 'N/A';
    }

    return format(date, 'MMMM d, yyyy');
  } catch (error) {
    return 'N/A';
  }
};

/**
 * Check if verification is recent (within specified days)
 * @param dateString - ISO date string
 * @param days - Number of days to consider "recent"
 * @returns Boolean indicating if verification is recent
 */
export const isVerificationRecent = (
  dateString: string | null | undefined,
  days: number = 7
): boolean => {
  if (!dateString) return false;

  try {
    const date = parseISO(dateString);
    
    if (!isValid(date)) return false;

    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    return diffInDays <= days;
  } catch (error) {
    return false;
  }
};
