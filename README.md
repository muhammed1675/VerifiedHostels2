# NaijaHostels - Verified Real Estate Listing Platform

A production-ready, high-trust marketplace UI for a Nigerian real estate platform specializing in verified student hostels and small apartments.

## Core Value Proposition

**Trust through physical verification of every listing.**

## Business Model

- Users browse listings freely (photos, prices, descriptions visible)
- Contact information is hidden by default
- Users spend 1 Token to unlock contact info
- Rented properties cannot be unlocked (prevent wasted tokens)

## Tech Stack

- **Framework:** React 18+ (Vite)
- **Backend:** Supabase (PostgreSQL + Auth + Storage + RLS)
- **Styling:** Tailwind CSS 3+ (Mobile-first)
- **State Management:** React Context (Auth)
- **Date Handling:** date-fns
- **Image Slider:** swiper/react v11+
- **Supabase Client:** @supabase/supabase-js v2+
- **Testing:** Vitest + React Testing Library
- **Language:** TypeScript

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd naijahostels
npm install
```

### 2. Environment Setup

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database Setup

1. Go to your Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/schema.sql`
3. Run the SQL to create all tables, indexes, RLS policies, and functions

### 4. Storage Setup

1. Go to Supabase Dashboard → Storage
2. Create a new public bucket named `listing-images`
3. Set up the storage policies (included in schema.sql)

### 5. Run the App

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Database Schema

### Tables

1. **listings** - Property listings
   - `id` (UUID, PK)
   - `title` (TEXT)
   - `price` (INTEGER) - Naira per year
   - `location` (TEXT)
   - `description` (TEXT)
   - `status` (TEXT) - 'available' | 'rented'
   - `last_verified` (TIMESTAMPTZ)
   - `contact_info` (TEXT) - Protected by RLS

2. **listing_images** - Property photos
   - `id` (UUID, PK)
   - `listing_id` (UUID, FK)
   - `image_url` (TEXT)
   - `display_order` (INTEGER)

3. **user_tokens** - Token balances
   - `id` (UUID, PK)
   - `user_id` (UUID, FK to auth.users)
   - `token_balance` (INTEGER)

4. **unlocked_listings** - Track unlocked contacts
   - `id` (UUID, PK)
   - `user_id` (UUID, FK)
   - `listing_id` (UUID, FK)
   - `unlocked_at` (TIMESTAMPTZ)

### Key Functions

- `unlock_listing(p_listing_id, p_user_id)` - Atomic unlock operation
- `initialize_user_tokens()` - Auto-create token record on signup

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **listings**: Anyone can view, contact_info hidden by default
- **listing_images**: Public read access
- **user_tokens**: Users can only view/update their own balance
- **unlocked_listings**: Users can only view their own unlocks

## Project Structure

```
src/
├── components/
│   ├── listing-details/     # Listing detail components
│   │   ├── ListingDetailsPage.tsx
│   │   ├── ImageSlider.tsx
│   │   ├── ContactUnlocker.tsx
│   │   ├── TrustBadge.tsx
│   │   ├── ListingHeader.tsx
│   │   └── __tests__/
│   ├── ui/                  # shadcn/ui components
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── hooks/
│   ├── useListingDetails.ts
│   ├── useTokenBalance.ts
│   └── useUnlockListing.ts
├── lib/
│   └── supabase.ts          # Supabase client
├── pages/
│   ├── HomePage.tsx
│   ├── ListingPage.tsx
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── BuyTokensPage.tsx
│   └── NotFoundPage.tsx
├── types/
│   ├── database.types.ts
│   └── listing.types.ts
├── utils/
│   ├── formatPrice.ts
│   ├── formatVerificationDate.ts
│   └── phoneHelpers.ts
└── App.tsx
```

## Component Architecture

### ListingDetailsPage
Main container that orchestrates all child components and manages data fetching.

### ImageSlider
Swiper-based image carousel with:
- Lazy loading
- Keyboard navigation
- Error handling for failed images
- Slide counter for large galleries

### ContactUnlocker
4-state machine component:
1. **RENTED_DISABLED** - Property is rented
2. **INSUFFICIENT_TOKENS** - User needs to buy tokens
3. **LOCKED_READY** - User can unlock with 1 token
4. **UNLOCKED_REVEALED** - Contact info visible with call/WhatsApp buttons

### TrustBadge
Displays verification status with:
- Relative time formatting
- Color-coded freshness indicator
- "TRUSTED" badge for recent verifications

## Custom Hooks

### useListingDetails(listingId)
Fetches listing data, images, and unlock status.

```typescript
const { listing, images, isUnlocked, loading, error, refetch } = useListingDetails(id);
```

### useTokenBalance()
Manages user's token balance with real-time updates.

```typescript
const { tokenBalance, loading, error, refetch } = useTokenBalance();
```

### useUnlockListing()
Handles the unlock mutation.

```typescript
const { unlockListing, isUnlocking, error, clearError } = useUnlockListing();
```

## Utility Functions

### formatPrice(price)
Formats price in Nigerian Naira: `₦450,000/yr`

### formatVerificationDate(dateString)
Returns relative time: `Verified 3 days ago`

### extractPhone(contactInfo)
Extracts phone number from contact string.

### formatWhatsAppNumber(phone)
Formats number for WhatsApp API with country code.

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Deployment

### Vercel
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy

### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

### Supabase Hosting
1. Build the project: `npm run build`
2. Deploy the `dist/` folder to Supabase Storage or Edge Functions

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@naijahostels.com or join our Slack channel.

---

Built with ❤️ for Nigerian students looking for verified housing.
