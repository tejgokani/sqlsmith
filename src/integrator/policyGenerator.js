/**
 * Generate Supabase RLS policy templates
 */

export function generatePolicyTemplates(tableName, config = {}) {
  const schema = config.schema || 'public';
  const policies = [];

  // SELECT policy for authenticated users
  policies.push(`
-- Enable RLS
ALTER TABLE ${schema}.${tableName} ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select
CREATE POLICY "allow_select_authenticated" ON ${schema}.${tableName}
  FOR SELECT
  TO authenticated
  USING (true);
`);

  // INSERT policy
  policies.push(`
-- Allow authenticated users to insert
CREATE POLICY "allow_insert_authenticated" ON ${schema}.${tableName}
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
`);

  // UPDATE policy
  policies.push(`
-- Allow users to update their own records
CREATE POLICY "allow_update_own" ON ${schema}.${tableName}
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
`);

  // DELETE policy
  policies.push(`
-- Allow users to delete their own records
CREATE POLICY "allow_delete_own" ON ${schema}.${tableName}
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
`);

  return policies.join('\n');
}

export function generateBasicPolicies(tableName, config = {}) {
  const schema = config.schema || 'public';

  return `
-- Enable Row Level Security
ALTER TABLE ${schema}.${tableName} ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all records
CREATE POLICY "authenticated_select_policy" ON ${schema}.${tableName}
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert records
CREATE POLICY "authenticated_insert_policy" ON ${schema}.${tableName}
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Users can update their own records (assumes user_id column exists)
-- CREATE POLICY "user_update_own_policy" ON ${schema}.${tableName}
--   FOR UPDATE
--   TO authenticated
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own records (assumes user_id column exists)
-- CREATE POLICY "user_delete_own_policy" ON ${schema}.${tableName}
--   FOR DELETE
--   TO authenticated
--   USING (auth.uid() = user_id);
`;
}
