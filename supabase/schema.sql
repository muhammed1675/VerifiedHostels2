-- ============================================================
-- NAIJA HOSTELS - SUPABASE DATABASE SCHEMA
-- ============================================================
-- Run this in your Supabase SQL Editor to set up the complete database

-- ============================================================
-- 1. LISTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0), -- Naira per year
  location TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented')),
  last_verified TIMESTAMP WITH TIME ZONE,
  contact_info TEXT, -- SENSITIVE: Will be hidden by RLS
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. LISTING IMAGES TABLE (one-to-many relationship)
-- ============================================================
CREATE TABLE IF NOT EXISTS listing_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. USER TOKENS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS user_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_balance INTEGER NOT NULL DEFAULT 0 CHECK (token_balance >= 0),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- 4. UNLOCKED LISTINGS JUNCTION TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS unlocked_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id) -- One unlock per user per listing
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON listing_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_listings_user_id ON unlocked_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_listings_listing_id ON unlocked_listings(listing_id);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocked_listings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- LISTINGS TABLE POLICIES
-- ============================================================

-- Everyone can view basic listing info
CREATE POLICY "Anyone can view listings"
  ON listings FOR SELECT
  USING (true);

-- Only admins can insert/update/delete listings (customize as needed)
CREATE POLICY "Only authenticated users can create listings"
  ON listings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only listing owners can update listings"
  ON listings FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM user_tokens WHERE user_id = auth.uid()
  ));

-- ============================================================
-- LISTING IMAGES POLICIES
-- ============================================================

-- Everyone can view images
CREATE POLICY "Anyone can view listing images"
  ON listing_images FOR SELECT
  USING (true);

-- Authenticated users can insert images
CREATE POLICY "Authenticated users can insert images"
  ON listing_images FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- USER TOKENS POLICIES
-- ============================================================

-- Users can only see their own token balance
CREATE POLICY "Users can view own token balance"
  ON user_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only update their own token balance (via functions)
CREATE POLICY "Users can update own token balance"
  ON user_tokens FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own token record
CREATE POLICY "Users can insert own token record"
  ON user_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- UNLOCKED LISTINGS POLICIES
-- ============================================================

-- Users can only see their own unlocks
CREATE POLICY "Users can view own unlocked listings"
  ON unlocked_listings FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own unlocks (via function only)
CREATE POLICY "Users can unlock listings"
  ON unlocked_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- UNLOCK LISTING FUNCTION (SERVER-SIDE LOGIC)
-- ============================================================
-- This function handles the atomic unlock operation

CREATE OR REPLACE FUNCTION unlock_listing(
  p_listing_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Run with elevated privileges
AS $$
DECLARE
  v_token_balance INTEGER;
  v_listing_status TEXT;
  v_already_unlocked BOOLEAN;
  v_contact_info TEXT;
BEGIN
  -- 1. Check if listing exists and get status
  SELECT status INTO v_listing_status
  FROM listings
  WHERE id = p_listing_id;
  
  IF v_listing_status IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Listing not found');
  END IF;
  
  -- 2. Check if listing is rented
  IF v_listing_status = 'rented' THEN
    RETURN json_build_object('success', false, 'error', 'Property is already rented');
  END IF;
  
  -- 3. Check if already unlocked
  SELECT EXISTS(
    SELECT 1 FROM unlocked_listings
    WHERE user_id = p_user_id AND listing_id = p_listing_id
  ) INTO v_already_unlocked;
  
  IF v_already_unlocked THEN
    -- Return contact info without charging
    SELECT contact_info INTO v_contact_info
    FROM listings
    WHERE id = p_listing_id;
    
    RETURN json_build_object(
      'success', true,
      'already_unlocked', true,
      'contact_info', v_contact_info,
      'token_balance', (SELECT token_balance FROM user_tokens WHERE user_id = p_user_id)
    );
  END IF;
  
  -- 4. Check token balance
  SELECT token_balance INTO v_token_balance
  FROM user_tokens
  WHERE user_id = p_user_id;
  
  IF v_token_balance IS NULL THEN
    -- Create token record with 0 balance
    INSERT INTO user_tokens (user_id, token_balance)
    VALUES (p_user_id, 0);
    
    RETURN json_build_object('success', false, 'error', 'Insufficient tokens. Please purchase tokens.');
  END IF;
  
  IF v_token_balance < 1 THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient tokens. Please purchase tokens.');
  END IF;
  
  -- 5. ATOMIC TRANSACTION: Deduct token + Record unlock + Return contact
  UPDATE user_tokens
  SET token_balance = token_balance - 1,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  INSERT INTO unlocked_listings (user_id, listing_id)
  VALUES (p_user_id, p_listing_id);
  
  SELECT contact_info INTO v_contact_info
  FROM listings
  WHERE id = p_listing_id;
  
  -- 6. Return success response
  RETURN json_build_object(
    'success', true,
    'contact_info', v_contact_info,
    'token_balance', v_token_balance - 1,
    'message', 'Contact unlocked successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================================
-- HELPER FUNCTION: INITIALIZE USER TOKENS
-- ============================================================
-- Call this when a new user signs up

CREATE OR REPLACE FUNCTION initialize_user_tokens()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_tokens (user_id, token_balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to auto-create token record on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_tokens();

-- ============================================================
-- STORAGE BUCKET SETUP (Run in Supabase Dashboard SQL Editor)
-- ============================================================
-- Note: Storage buckets are typically created via the UI or API
-- This SQL creates the bucket if you have storage admin access

-- Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Anyone can view images
CREATE POLICY "Public can view listing images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

-- Storage policy: Authenticated users can upload
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-images' 
    AND auth.role() = 'authenticated'
  );

-- ============================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================

-- Insert sample listings (uncomment to use)
/*
INSERT INTO listings (title, price, location, description, status, last_verified, contact_info)
VALUES 
  ('Clean 1-Bedroom Self-con near UNILAG Back Gate', 450000, 'Akoka, Yaba', 'Tiled floor, running water (borehole), prepaid meter. Road is good and accessible. 24/7 security.', 'available', NOW() - INTERVAL '3 days', '08012345678 (Mr. Ade)'),
  ('Spacious Studio Apartment at Yaba Tech', 350000, 'Yaba, Lagos', 'Furnished studio with kitchenette. Close to campus. Good electricity supply.', 'available', NOW() - INTERVAL '1 week', '08087654321 (Mrs. Nkechi)'),
  ('2-Bedroom Flat at UNILAG Gate', 750000, 'Akoka, Yaba', 'Two bedrooms, one bathroom, spacious living room. Parking available.', 'rented', NOW() - INTERVAL '2 weeks', '08055551234 (Mr. Olu)');

-- Insert sample images (update listing_id after inserting listings)
-- INSERT INTO listing_images (listing_id, image_url, display_order) VALUES 
--   ('listing-uuid-here', 'https://your-project.supabase.co/storage/v1/object/public/listing-images/sample1.jpg', 0);
*/

-- ============================================================
-- END OF SCHEMA
-- ============================================================
