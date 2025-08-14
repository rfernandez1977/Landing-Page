import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://grssshhjqtvdenpkaruk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyc3NzaGhqcXR2ZGVucGthcnVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjA1NzI2MiwiZXhwIjoyMDYxNjMzMjYyfQ.RceQbjVPRqaINd8wUD10vn55f45vdHeNuW3Qzbly2rw';

export const supabase = createClient(supabaseUrl, supabaseKey);