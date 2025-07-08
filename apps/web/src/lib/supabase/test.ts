export async function testSupabaseConnection() {
  try {
    // Only import and initialize Supabase client when actually needed
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase environment variables not found')
      return false
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection error:', error)
      return false
    }
    
    console.log('Supabase connection successful')
    return true
  } catch (error) {
    console.error('Supabase connection failed:', error)
    return false
  }
} 