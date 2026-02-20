import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/utils/formatPrice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { 
  Home, 
  Plus, 
  Edit2, 
  Trash2, 
  LogOut, 
  LayoutDashboard,
  MapPin,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

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
  listing_images?: { id: string; image_url: string }[];
}

interface ListingFormData {
  title: string;
  price: string;
  location: string;
  description: string;
  contact_info: string;
  status: 'available' | 'rented';
}

const AdminDashboard = () => {
  const { user, signOut, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageUrls, setImageUrls] = useState('');

  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    price: '',
    location: '',
    description: '',
    contact_info: '',
    status: 'available',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (!authLoading && user && !isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/');
      return;
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchListings();
    }
  }, [user, isAdmin]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          listing_images (id, image_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings((data as Listing[]) || []);
    } catch (err) {
      console.error('Error fetching listings:', err);
      toast.error('Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      price: '',
      location: '',
      description: '',
      contact_info: '',
      status: 'available',
    });
    setImageUrls('');
    setEditingListing(null);
  };

  const handleEdit = (listing: Listing) => {
    setEditingListing(listing);
    setFormData({
      title: listing.title,
      price: listing.price.toString(),
      location: listing.location,
      description: listing.description || '',
      contact_info: listing.contact_info || '',
      status: listing.status,
    });
    setImageUrls(listing.listing_images?.map(img => img.image_url).join('\n') || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Listing deleted successfully');
      fetchListings();
    } catch (err) {
      console.error('Error deleting listing:', err);
      toast.error('Failed to delete listing');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const listingData = {
        title: formData.title,
        price: parseInt(formData.price) || 0,
        location: formData.location,
        description: formData.description,
        contact_info: formData.contact_info,
        status: formData.status,
        last_verified: new Date().toISOString(),
      };

      let listingId: string;

      if (editingListing) {
        const { error } = await supabase
          .from('listings')
          .update(listingData as never)
          .eq('id', editingListing.id);

        if (error) throw error;
        listingId = editingListing.id;
        toast.success('Listing updated successfully');
      } else {
        const { data, error } = await supabase
          .from('listings')
          .insert(listingData as never)
          .select('id')
          .single();

        if (error) throw error;
        listingId = (data as unknown as { id: string }).id;
        toast.success('Listing created successfully');
      }

      const urls = imageUrls.split('\n').map(url => url.trim()).filter(url => url);
      
      if (urls.length > 0) {
        if (editingListing) {
          await supabase
            .from('listing_images')
            .delete()
            .eq('listing_id', listingId);
        }

        const imageInserts = urls.map((url, index) => ({
          listing_id: listingId,
          image_url: url,
          display_order: index,
        }));

        const { error: imageError } = await supabase
          .from('listing_images')
          .insert(imageInserts as any);

        if (imageError) throw imageError;
      }

      resetForm();
      setIsDialogOpen(false);
      fetchListings();
    } catch (err) {
      console.error('Error saving listing:', err);
      toast.error('Failed to save listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-black" />
                </div>
                <span className="font-bold text-xl text-gray-900 hidden sm:block">NaijaHostels</span>
              </Link>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <div className="flex items-center gap-2 text-purple-700">
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-semibold">Admin</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to Site</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-600"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage property listings</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Listing
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingListing ? 'Edit Listing' : 'Add New Listing'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., 1-Bedroom Self-con near UNILAG"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₦/year) *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="450000"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Akoka, Yaba"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_info">Contact Info *</Label>
                    <Input
                      id="contact_info"
                      value={formData.contact_info}
                      onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                      placeholder="e.g., 08012345678 (Mr. Ade)"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Property details, amenities, etc."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="images">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Image URLs (one per line)
                      </div>
                    </Label>
                    <Textarea
                      id="images"
                      value={imageUrls}
                      onChange={(e) => setImageUrls(e.target.value)}
                      placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="available"
                          checked={formData.status === 'available'}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' })}
                          className="w-4 h-4 text-purple-600"
                        />
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Available
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="rented"
                          checked={formData.status === 'rented'}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as 'rented' })}
                          className="w-4 h-4 text-purple-600"
                        />
                        <span className="flex items-center gap-1">
                          <XCircle className="w-4 h-4 text-red-500" />
                          Rented
                        </span>
                      </label>
                    </div>
                  </div>

                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <DialogClose asChild>
                      <Button type="button" variant="outline" className="w-full sm:w-auto">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button 
                      type="submit" 
                      className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>{editingListing ? 'Update' : 'Create'} Listing</>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Location</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {listings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            {listing.listing_images && listing.listing_images.length > 0 ? (
                              <img 
                                src={listing.listing_images[0].image_url} 
                                alt="" 
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Home className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate max-w-[150px] sm:max-w-[200px]">{listing.title}</p>
                            <p className="text-sm text-gray-500 sm:hidden truncate max-w-[150px]">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {listing.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{listing.location}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="font-medium text-gray-900">{formatPrice(listing.price)}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          listing.status === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {listing.status === 'available' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(listing)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(listing.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {listings.length === 0 && (
              <div className="text-center py-12">
                <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No listings yet</p>
                <p className="text-gray-500 text-sm mt-1">Click &quot;Add New Listing&quot; to create one</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
