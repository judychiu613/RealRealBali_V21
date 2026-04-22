import { createClient } from '@supabase/supabase-js'

// 优先读取 Next.js 的 NEXT_PUBLIC_*；兼容本地脚本中仍使用 VITE_* 的 .env。
// Placeholder values prevent "supabaseUrl is required" crash when env vars are missing;
// Supabase API calls will fail with 401 rather than crashing the entire app.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Import the supabase client like this:
// For React:
// import { supabase } from "@/integrations/supabase/client";
// For React Native:
// import { supabase } from "@/src/integrations/supabase/client";
