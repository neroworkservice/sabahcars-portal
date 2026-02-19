// Database types akan di-generate oleh Supabase CLI
// Jalankan: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
