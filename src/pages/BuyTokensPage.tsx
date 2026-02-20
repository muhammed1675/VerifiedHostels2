import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Home, 
  Coins, 
  Check, 
  Loader2, 
  ArrowLeft,
  Sparkles,
  Zap,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  popular?: boolean;
  icon: React.ReactNode;
}

const tokenPackages: TokenPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    tokens: 5,
    price: 2500,
    icon: <Coins className="w-6 h-6" />,
  },
  {
    id: 'popular',
    name: 'Popular',
    tokens: 15,
    price: 6500,
    popular: true,
    icon: <Zap className="w-6 h-6" />,
  },
  {
    id: 'premium',
    name: 'Premium',
    tokens: 50,
    price: 20000,
    icon: <Crown className="w-6 h-6" />,
  },
];

const BuyTokensPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePurchase = async (pkg: TokenPackage) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setSelectedPackage(pkg.id);
    setLoading(true);

    try {
      const { data: currentData, error: fetchError } = await supabase
        .from('user_tokens')
        .select('token_balance')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const currentBalance = (currentData as unknown as { token_balance: number } | null)?.token_balance || 0;
      const newBalance = currentBalance + pkg.tokens;

      const upsertData = {
        user_id: user.id,
        token_balance: newBalance,
        updated_at: new Date().toISOString(),
      };
      
      const { error: updateError } = await supabase
        .from('user_tokens')
        .upsert(upsertData as any);

      if (updateError) throw updateError;

      setSuccess(true);
      toast.success(`Successfully purchased ${pkg.tokens} tokens!`);
    } catch (err) {
      console.error('Purchase error:', err);
      toast.error('Failed to complete purchase. Please try again.');
    } finally {
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-black" />
            </div>
            <span className="font-bold text-2xl text-gray-900">NaijaHostels</span>
          </Link>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your tokens have been added to your account. You can now unlock contact information for listings.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="flex-1"
                >
                  Browse Listings
                </Button>
                <Button
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                >
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-black" />
              </div>
              <span className="font-bold text-xl text-gray-900">NaijaHostels</span>
            </Link>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="py-8 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Buy Tokens</h1>
            <p className="text-gray-600 max-w-lg mx-auto text-sm sm:text-base">
              Purchase tokens to unlock contact information for verified listings. 
              Each unlock costs 1 token.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {tokenPackages.map((pkg) => (
              <Card 
                key={pkg.id}
                className={`relative overflow-hidden transition-all ${
                  pkg.popular 
                    ? 'border-yellow-400 ring-2 ring-yellow-400/20' 
                    : 'border-gray-200 hover:border-yellow-300'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    pkg.popular ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {pkg.icon}
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{pkg.name}</CardTitle>
                  <CardDescription>
                    {pkg.tokens} tokens
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-4">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                      ₦{pkg.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    ₦{Math.round(pkg.price / pkg.tokens)} per token
                  </p>
                  <Button
                    onClick={() => handlePurchase(pkg)}
                    disabled={loading}
                    className={`w-full ${
                      pkg.popular
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    {loading && selectedPackage === pkg.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Buy Now'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 sm:mt-12 bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
            <h3 className="font-semibold text-blue-900 mb-2">How tokens work</h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Each token unlocks one listing&apos;s contact information</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Tokens never expire - use them anytime</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>You won&apos;t be charged for rented properties</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>All listings are physically verified by our team</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BuyTokensPage;
