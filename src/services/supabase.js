import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vbhkipanrxzonoezwdqp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaGtpcGFucnh6b25vZXp3ZHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjc3OTgsImV4cCI6MjA4ODgwMzc5OH0.2oC-l30sWUk2834W1pGjEj7LmGwGrzk0ipOWlfvD-NU";

export const supabase = createClient(supabaseUrl, supabaseKey);