/**
 * Extract phone number from contact info string
 * @param contactInfo - Contact info string (e.g., "08012345678 (Mr. Ade)")
 * @returns Extracted phone number
 */
export const extractPhone = (contactInfo: string | null | undefined): string => {
  if (!contactInfo) {
    return '';
  }

  // Extract digits from the contact info
  const digits = contactInfo.replace(/\D/g, '');
  
  // Return the first sequence of 10-11 digits (Nigerian phone numbers)
  const match = digits.match(/(\d{10,11})/);
  
  return match ? match[1] : digits;
};

/**
 * Extract name from contact info string
 * @param contactInfo - Contact info string (e.g., "08012345678 (Mr. Ade)")
 * @returns Extracted name or empty string
 */
export const extractName = (contactInfo: string | null | undefined): string => {
  if (!contactInfo) {
    return '';
  }

  // Try to extract name in parentheses
  const nameMatch = contactInfo.match(/\(([^)]+)\)/);
  
  if (nameMatch) {
    return nameMatch[1].trim();
  }

  // If no parentheses, try to extract text after the number
  const textMatch = contactInfo.match(/\d+\s*(.+)/);
  
  if (textMatch) {
    return textMatch[1].trim();
  }

  return '';
};

/**
 * Format phone number for WhatsApp (add country code if missing)
 * @param phoneNumber - Phone number string
 * @returns Formatted WhatsApp number with country code
 */
export const formatWhatsAppNumber = (phoneNumber: string): string => {
  if (!phoneNumber) {
    return '';
  }

  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');

  // If number starts with 0, replace with 234 (Nigeria country code)
  if (digits.startsWith('0') && digits.length === 11) {
    return `234${digits.slice(1)}`;
  }

  // If number is 10 digits, add 234
  if (digits.length === 10) {
    return `234${digits}`;
  }

  // If number already has country code, return as is
  if (digits.startsWith('234') && digits.length >= 13) {
    return digits;
  }

  return digits;
};

/**
 * Format phone number for display
 * @param phoneNumber - Phone number string
 * @returns Formatted phone number (e.g., "080 1234 5678")
 */
export const formatPhoneDisplay = (phoneNumber: string): string => {
  if (!phoneNumber) {
    return '';
  }

  const digits = phoneNumber.replace(/\D/g, '');

  // Format Nigerian phone numbers
  if (digits.length === 11 && digits.startsWith('0')) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  // Format with country code
  if (digits.length === 13 && digits.startsWith('234')) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }

  return digits;
};

/**
 * Validate Nigerian phone number
 * @param phoneNumber - Phone number string
 * @returns Boolean indicating if phone number is valid
 */
export const isValidNigerianPhone = (phoneNumber: string): boolean => {
  if (!phoneNumber) {
    return false;
  }

  const digits = phoneNumber.replace(/\D/g, '');

  // Check for 11-digit Nigerian format (starting with 0)
  if (digits.length === 11 && digits.startsWith('0')) {
    // Valid prefixes: 070, 080, 081, 090, 091
    const validPrefixes = ['070', '080', '081', '090', '091'];
    const prefix = digits.slice(0, 3);
    return validPrefixes.includes(prefix);
  }

  // Check for 13-digit format with country code
  if (digits.length === 13 && digits.startsWith('234')) {
    const localPart = '0' + digits.slice(3);
    const validPrefixes = ['070', '080', '081', '090', '091'];
    const prefix = localPart.slice(0, 3);
    return validPrefixes.includes(prefix);
  }

  return false;
};

/**
 * Generate WhatsApp message link
 * @param phoneNumber - Phone number
 * @param message - Optional pre-filled message
 * @returns WhatsApp click-to-chat URL
 */
export const generateWhatsAppLink = (
  phoneNumber: string,
  message?: string
): string => {
  const formattedNumber = formatWhatsAppNumber(phoneNumber);
  
  if (!formattedNumber) {
    return '#';
  }

  const baseUrl = 'https://wa.me';
  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : '';
  
  return `${baseUrl}/${formattedNumber}${encodedMessage}`;
};

/**
 * Generate tel: link for phone calls
 * @param phoneNumber - Phone number
 * @returns tel: URL
 */
export const generateTelLink = (phoneNumber: string): string => {
  const digits = phoneNumber.replace(/\D/g, '');
  
  if (!digits) {
    return '#';
  }

  // Add + for international format if needed
  if (digits.startsWith('234')) {
    return `tel:+${digits}`;
  }

  return `tel:${digits}`;
};
