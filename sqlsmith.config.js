export default {
  schema: 'public',
  namingStrategy: 'snake_case',
  timestamps: false,
  jsonForObjects: true,
  foreignKeyStrategy: 'inline',
  policyGeneration: false,
  supabaseDir: './supabase/migrations',
  typeOverrides: {},
};
