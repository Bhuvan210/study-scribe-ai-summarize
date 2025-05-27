
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://fylqbgxrwebjkzcqdvtb.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5bHFiZ3hyd2Viamt6Y3FkdnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2Nzg2MTMsImV4cCI6MjA2MTI1NDYxM30.R_geBvTGh6ZB9j_2mdzA29zZHcn6IrWT-Hq6iAVGWIw"

console.log("Supabase initialization:", {
  url: supabaseUrl ? "✓ URL provided" : "✗ URL missing",
  key: supabaseAnonKey ? "✓ Key provided" : "✗ Key missing"
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: supabaseAnonKey ? "***provided***" : "missing"
  });
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log("Supabase client created successfully");
