import React from 'react';
import { Shield, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';
import { 
  formatVerificationDate, 
  getVerificationStatusColor,
  isVerificationRecent 
} from '@/utils/formatVerificationDate';

interface TrustBadgeProps {
  lastVerified: string | null;
}

/**
 * Trust badge component showing verification status
 * Displays when the listing was last physically verified by the team
 */
const TrustBadge: React.FC<TrustBadgeProps> = ({ lastVerified }) => {
  const isVerified = !!lastVerified;
  const isRecent = isVerificationRecent(lastVerified, 7);
  const statusColor = getVerificationStatusColor(lastVerified);

  // Not verified state
  if (!isVerified) {
    return (
      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-gray-500" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-700">Not Verified Yet</p>
          <p className="text-sm text-gray-500">
            This listing is pending physical verification by our team
          </p>
        </div>
      </div>
    );
  }

  // Verified state
  return (
    <div className={`flex items-center gap-3 rounded-lg p-4 border ${
      isRecent 
        ? 'bg-green-50 border-green-200' 
        : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        isRecent ? 'bg-green-100' : 'bg-yellow-100'
      }`}>
        {isRecent ? (
          <ShieldCheck className={`w-5 h-5 ${statusColor}`} />
        ) : (
          <ShieldAlert className={`w-5 h-5 ${statusColor}`} />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className={`font-medium ${isRecent ? 'text-green-800' : 'text-yellow-800'}`}>
            {isRecent ? 'Verified Property' : 'Verification Expiring'}
          </p>
          {isRecent && (
            <span className="px-2 py-0.5 bg-green-200 text-green-800 text-xs font-semibold rounded-full">
              TRUSTED
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Clock className={`w-3.5 h-3.5 ${isRecent ? 'text-green-600' : 'text-yellow-600'}`} />
          <p className={`text-sm ${isRecent ? 'text-green-700' : 'text-yellow-700'}`}>
            {formatVerificationDate(lastVerified)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrustBadge;
