// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tojtvxinpqmymcaohvpb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvanR2eGlucHFteW1jYW9odnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NjAwNjksImV4cCI6MjA1MjQzNjA2OX0.tZvP9UumSuR4tuKuXbOCaeW_3ZmR-mLcfxlZafcF6p0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);