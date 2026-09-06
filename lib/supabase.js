import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fzrxceancuplkkgjyvur.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6cnhjZWFuY3VwbGtrZ2p5dnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NjI2MzEsImV4cCI6MjEwNDIzODYzMX0.E0Xyx-U_v0E1MIAS-Zlcl5QbzcAuWFF35jiJAYLnIaQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
