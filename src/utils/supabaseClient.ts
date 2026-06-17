import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-supabase-project-id')) {
  console.warn(
    'Supabase credentials are not configured or are using placeholders. Please update your .env.local file with real keys.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
