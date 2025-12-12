
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Using the key provided by the user. 
// Note: standard supabase-js often uses the anon key, but we'll try the publishable one if that's what they have.
// If it fails, we fall back to VITE_SUPABASE_ANON_KEY.
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
