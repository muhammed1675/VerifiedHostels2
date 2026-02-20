import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/utils/formatPrice';
import { formatVerificationDate } from '@/utils/formatVerificationDate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  MapPin, 
  Shield, 
  User, 
  LogOut, 
  Coins,
  Home,
  Loader2,
  Filter,
  LayoutDashboard
} from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string | null;
  status: 'available' | 'rented';
  last_verified: string | null;
  contact_info: string | null;
  created_at: string;
  updated_at: string;
  listing_images?: { image_url: string }[];
}

const HomePage = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tokenBalance, setTokenBalance] = useState(0);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('listings')
          .select(`
            *,
            listing_images (image_url)
          `)
          .eq('status', 'available')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setListings((data as Listing[]) || []);
      } catch (err) {
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_tokens')
          .select('token_balance')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        const tokenData = data as unknown as { token_balance: number } | null;
        setTokenBalance(tokenData?.token_balance || 0);
      } catch (err) {
        console.error('Error fetching token balance:', err);
      }
    };

    fetchTokenBalance();
  }, [user]);

  const filteredListings = listings.filter(listing => 
    listing.status === 'available' && (
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-black" />
              </div>
              <span className="font-bold text-xl text-gray-900">NaijaHostels</span>
            </Link>

            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by location or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {user ? (
                <>
                  {isAdmin && (
                    <Link 
                      to="/admin"
                      className="hidden sm:flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-purple-200 transition"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin
                    </Link>
                  )}
                  <Link 
                    to="/buy-tokens"
                    className="flex items-center gap-1.5 sm:gap-2 bg-yellow-100 text-yellow-800 px-2 sm:px-3 py-1.5 rounded-full text-sm font-medium hover:bg-yellow-200 transition"
                  >
                    <Coins className="w-4 h-4" />
                    <span className="hidden sm:inline">{tokenBalance} tokens</span>
                    <span className="sm:hidden">{tokenBalance}</span>
                  </Link>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="hidden lg:block text-sm text-gray-700 max-w-[100px] truncate">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-gray-600 p-2"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/login')}
                  >
                    Log in
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate('/signup')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by location or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-r from-yellow-500 to-yellow-400 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-4">
            Find Verified Student Housing in Nigeria
          </h1>
          <p className="text-base sm:text-lg text-black/80 max-w-2xl mx-auto mb-6">
            Browse physically verified hostels and apartments near major universities. 
            Every listing is checked by our team.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full">
              <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-black" />
              <span className="text-black font-medium text-sm sm:text-base">100% Verified</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full">
              <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-black" />
              <span className="text-black font-medium text-sm sm:text-base">Major Campuses</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Available Properties
            </h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-16">
              <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No listings found</p>
              <p className="text-gray-500 text-sm mt-1">
                {searchQuery ? 'Try a different search term' : 'Check back later for new listings'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredListings.map((listing) => (
                <Link
                  key={listing.id}
                  to={`/listing/${listing.id}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                    {listing.listing_images && listing.listing_images.length > 0 ? (
                      <img
                        src={listing.listing_images[0].image_url}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <Home className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {formatPrice(listing.price)}
                    </div>
                    {listing.last_verified && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Verified
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-yellow-600 transition text-sm sm:text-base">
                      {listing.title}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="line-clamp-1">{listing.location}</span>
                    </div>
                    {listing.last_verified && (
                      <p className="text-xs text-green-600">
                        {formatVerificationDate(listing.last_verified)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-black" />
                </div>
                <span className="font-bold text-xl">NaijaHostels</span>
              </div>
              <p className="text-gray-400 text-sm">
                Nigeria&apos;s most trusted platform for verified student housing.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-white transition">Browse Listings</Link></li>
                <li><Link to="/buy-tokens" className="hover:text-white transition">Buy Tokens</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-gray-400 text-sm">
                support@naijahostels.com
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} NaijaHostels. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
