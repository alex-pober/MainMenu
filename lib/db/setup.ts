import { supabase } from '../supabase';

export async function setupDatabase() {
  const { error } = await supabase.from('menus').select('id').limit(1);
  
  if (error?.code === '42P01') { // Table doesn't exist
    const schema = await fetch('/lib/db/schema.sql').then(res => res.text());
    const { error: setupError } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (setupError) {
      console.error('Error setting up database:', setupError);
    }
  }
}