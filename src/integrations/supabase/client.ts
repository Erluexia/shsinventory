// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ezzwqjdwhwspnkdsmccx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6endxamR3aHdzcG5rZHNtY2N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1OTI1MTcsImV4cCI6MjA1NDE2ODUxN30.BDrxd0-y6yPWW2Ccy9elMD_90nZ5ttRTzt1NvK50UKY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);