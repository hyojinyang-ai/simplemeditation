import { createClient } from '@supabase/supabase-js';

const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID?.trim();
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || (projectId ? `https://${projectId}.supabase.co` : undefined);
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
