-- RLS Policy Template
-- Table: {{table}}

-- Enable Row Level Security
ALTER TABLE {{schema}}.{{table}} ENABLE ROW LEVEL SECURITY;

-- SELECT Policy
CREATE POLICY "{{table}}_select_policy" ON {{schema}}.{{table}}
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT Policy
CREATE POLICY "{{table}}_insert_policy" ON {{schema}}.{{table}}
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE Policy (assumes user_id column)
CREATE POLICY "{{table}}_update_policy" ON {{schema}}.{{table}}
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE Policy (assumes user_id column)
CREATE POLICY "{{table}}_delete_policy" ON {{schema}}.{{table}}
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
