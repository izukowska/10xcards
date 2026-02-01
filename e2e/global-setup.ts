import { chromium, FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * Global setup for Playwright tests
 * This runs once before all tests
 * Creates test user if it doesn't exist
 */
async function globalSetup(config: FullConfig) {
  console.log('🔧 Running global setup...');

  // Get Supabase credentials from environment
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;
  const testEmail = process.env.E2E_EMAIL || process.env.E2E_USERNAME;
  const testPassword = process.env.E2E_PASSWORD;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️  Supabase credentials not found in environment');
    return;
  }

  if (!testEmail || !testPassword) {
    console.warn('⚠️  Test user credentials not found in .env.test');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Try to sign in with test credentials
    console.log(`📧 Attempting to sign in test user: ${testEmail}`);
    
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError) {
      console.log('❌ Sign in failed, attempting to create test user...');
      
      // Try to create the test user
      const { error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (signUpError) {
        console.error('❌ Error creating test user:', signUpError.message);
        throw signUpError;
      }

      console.log('✅ Test user created successfully!');
      console.log('⚠️  Note: You may need to confirm the email in Supabase Dashboard if email confirmation is enabled');
    } else {
      console.log('✅ Test user authenticated successfully!');
    }

    // Sign out after verification
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error('❌ Global setup error:', error);
    // Don't fail the tests if setup fails - tests will handle auth errors
  }

  console.log('✅ Global setup completed\n');
}

export default globalSetup;
