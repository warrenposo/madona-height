import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qjhzsrqassyfgezowcqf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqaHpzcnFhc3N5Zmdlem93Y3FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MDQxODMsImV4cCI6MjA3NzM4MDE4M30.MyBOR9oE8YPlgZTQ6E9EKU1rzIey-NFX-8IrgAkpVY4';

export const supabase = createClient(supabaseUrl, supabaseKey);

