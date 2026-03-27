import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wbuvsnamcrowwndfzuuv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndidXZzbmFtY3Jvd3duZGZ6dXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDkyMDQsImV4cCI6MjA5MDAyNTIwNH0.HGVzFQun2MQe5mkreLFObr8d6ggTV8WeFJ2PYi3aQg0';

export const supabase = createClient(supabaseUrl, supabaseKey);
