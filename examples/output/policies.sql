
-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all records
CREATE POLICY "authenticated_select_policy" ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert records
CREATE POLICY "authenticated_insert_policy" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Users can update their own records (assumes user_id column exists)
-- CREATE POLICY "user_update_own_policy" ON public.users
--   FOR UPDATE
--   TO authenticated
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own records (assumes user_id column exists)
-- CREATE POLICY "user_delete_own_policy" ON public.users
--   FOR DELETE
--   TO authenticated
--   USING (auth.uid() = user_id);
