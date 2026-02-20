import React from 'react';
import { Phone, MessageCircle, Lock, Coins, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { 
  extractPhone, 
  extractName, 
  generateTelLink, 
  generateWhatsAppLink 
} from '@/utils/phoneHelpers';

interface ContactUnlockerProps {
  listingId: string;
  status: 'available' | 'rented';
  isUnlocked: boolean;
  contactInfo: string | null;
  tokenBalance: number;
  onUnlock: () => void;
  isUnlocking: boolean;
  error: string | null;
}

type UnlockState = 'RENTED_DISABLED' | 'INSUFFICIENT_TOKENS' | 'LOCKED_READY' | 'UNLOCKED_REVEALED';

/**
 * Contact unlocking component with token-gated access
 * Implements 4-state machine: RENTED_DISABLED, INSUFFICIENT_TOKENS, LOCKED_READY, UNLOCKED_REVEALED
 */
const ContactUnlocker: React.FC<ContactUnlockerProps> = ({
  status,
  isUnlocked,
  contactInfo,
  tokenBalance,
  onUnlock,
  isUnlocking,
  error,
}) => {
  // Determine UI state
  const getUnlockState = (): UnlockState => {
    if (status === 'rented') return 'RENTED_DISABLED';
    if (isUnlocked) return 'UNLOCKED_REVEALED';
    if (tokenBalance === 0) return 'INSUFFICIENT_TOKENS';
    return 'LOCKED_READY';
  };

  const state = getUnlockState();

  // STATE 1: Property is rented
  if (state === 'RENTED_DISABLED') {
    return (
      <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-gray-700 font-semibold text-lg">
          This property is no longer available
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Contact information is hidden for rented properties
        </p>
      </div>
    );
  }

  // STATE 2: User has insufficient tokens
  if (state === 'INSUFFICIENT_TOKENS') {
    return (
      <div className="relative overflow-hidden rounded-xl">
        {/* Blurred placeholder */}
        <div className="bg-white border-2 border-yellow-300 rounded-xl p-6 blur-sm select-none pointer-events-none">
          <p className="text-2xl font-mono text-gray-800">080XXXXXXXX</p>
          <p className="text-gray-600 mt-1">Mr. ████</p>
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/80 to-black/70 rounded-xl p-6">
          <Coins className="w-12 h-12 text-yellow-400 mb-3" />
          <p className="text-white font-semibold mb-4 text-center text-lg">
            You need tokens to unlock this contact
          </p>
          <a
            href="/buy-tokens"
            className="px-8 py-3 bg-yellow-400 text-black font-bold rounded-lg 
                       hover:bg-yellow-500 active:scale-95 transition-all shadow-lg"
          >
            Get Tokens
          </a>
          <p className="text-white/80 text-sm mt-4">
            Your balance: <span className="font-semibold text-yellow-400">{tokenBalance} tokens</span>
          </p>
        </div>
      </div>
    );
  }

  // STATE 3: Ready to unlock (user has tokens)
  if (state === 'LOCKED_READY') {
    return (
      <div className="relative overflow-hidden rounded-xl">
        {/* Blurred placeholder */}
        <div className="bg-white border-2 border-yellow-400 rounded-xl p-6 blur-md select-none pointer-events-none">
          <p className="text-2xl font-mono text-gray-800">080XXXXXXXX</p>
          <p className="text-gray-600 mt-1">Mr. ████</p>
        </div>
        
        {/* Overlay with unlock button */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/80 to-black/60 rounded-xl px-6">
          <button
            onClick={onUnlock}
            disabled={isUnlocking}
            className="w-full max-w-sm h-14 bg-yellow-400 text-black font-bold rounded-xl 
                       hover:bg-yellow-500 active:scale-95 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                       flex items-center justify-center gap-3 shadow-lg
                       focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2"
            aria-label="Unlock agent contact information for 1 token"
          >
            {isUnlocking ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Unlocking...</span>
              </>
            ) : (
              <>
                <Coins className="w-5 h-5" />
                <span>Unlock Agent Contact (1 Token)</span>
              </>
            )}
          </button>
          
          <p className="text-white/90 text-sm mt-4">
            Your balance: <span className="font-semibold text-yellow-400">{tokenBalance} tokens</span>
          </p>

          {/* Error message */}
          {error && (
            <div className="mt-4 bg-red-500/90 text-white px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // STATE 4: Unlocked and revealed
  if (state === 'UNLOCKED_REVEALED') {
    const phoneNumber = extractPhone(contactInfo);
    const contactName = extractName(contactInfo);
    const whatsappLink = generateWhatsAppLink(phoneNumber, `Hello, I'm interested in your property listing on NaijaHostels.`);
    const telLink = generateTelLink(phoneNumber);

    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
        {/* Success indicator */}
        <div className="flex items-center gap-2 text-green-700 mb-4">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">Contact Unlocked</span>
        </div>
        
        {/* Contact info (large, readable) */}
        <div className="bg-white rounded-lg p-5 mb-5 shadow-sm">
          <p className="text-2xl font-semibold text-gray-900 font-mono tracking-wide">
            {phoneNumber || contactInfo}
          </p>
          {contactName && (
            <p className="text-gray-600 mt-1 font-medium">{contactName}</p>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-3">
          <a
            href={telLink}
            className="flex-1 h-12 bg-blue-600 text-white font-semibold rounded-lg
                       hover:bg-blue-700 transition flex items-center justify-center gap-2
                       focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
            aria-label="Call agent now"
          >
            <Phone className="w-5 h-5" />
            <span>Call Now</span>
          </a>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-12 bg-green-600 text-white font-semibold rounded-lg
                       hover:bg-green-700 transition flex items-center justify-center gap-2
                       focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2"
            aria-label="Contact agent on WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
            <span>WhatsApp</span>
          </a>
        </div>
        
        {/* Token usage notice */}
        <p className="text-gray-600 text-xs mt-4 text-center">
          You used 1 token to view this contact • <span className="font-medium text-green-700">{tokenBalance} tokens remaining</span>
        </p>
      </div>
    );
  }

  return null;
};

export default ContactUnlocker;
