import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl !== 'https://your-project.supabase.co'
);

// Fallback dummy URL and key to prevent client constructor throw if env vars are not yet populated
const fallbackUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const fallbackKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key';

// Fix: Use global singleton pattern to eliminate "Multiple GoTrueClient instances detected" warning in Vite HMR
const globalObj = globalThis as unknown as { __supabaseClient?: SupabaseClient };

export const supabase: SupabaseClient =
  globalObj.__supabaseClient ??
  createClient(fallbackUrl, fallbackKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

globalObj.__supabaseClient = supabase;

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: string | null;
}

/**
 * Helper to check if a Supabase RPC error indicates the function does not exist
 */
function isRpcNotFoundError(error: any): boolean {
  if (!error) return false;
  const msg = String(error.message || '').toLowerCase();
  const code = String(error.code || '');
  return (
    code === '42883' ||
    code === 'PGRST202' ||
    msg.includes('could not find the function') ||
    msg.includes('schema cache') ||
    msg.includes('function does not exist')
  );
}

/**
 * Sign in user with email and password.
 * Uses ONLY the custom public.users table via `login_user` RPC.
 * Does NOT fall back to Supabase Auth to avoid session conflicts.
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
  const cleanEmail = email.toLowerCase().trim();

  if (!isSupabaseConfigured) {
    // Simulated demo session for offline/testing mode
    if (cleanEmail && password.length >= 6) {
      const mockUser: User = {
        id: 'demo-user-id',
        app_metadata: { provider: 'demo' },
        user_metadata: { email: cleanEmail },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: cleanEmail,
      } as User;
      localStorage.setItem('vp_demo_user', JSON.stringify(mockUser));
      return { user: mockUser, session: null, error: null };
    }
    return {
      user: null,
      session: null,
      error: 'Supabase credentials not configured in .env. Password must be at least 6 characters.',
    };
  }

  // --- Login via login_user RPC (public.users table) ---
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('login_user', {
      user_email: cleanEmail,
      user_password: password,
    });

    if (rpcError) {
      if (isRpcNotFoundError(rpcError)) {
        return {
          user: null,
          session: null,
          error: 'Database functions not set up. Please run the SQL script in your Supabase SQL Editor first.',
        };
      }
      return { user: null, session: null, error: rpcError.message };
    }

    if (rpcData) {
      // Handle JSON response: { success: boolean, user?: object, error?: string }
      if (typeof rpcData === 'object' && 'success' in rpcData) {
        if (rpcData.success && rpcData.user) {
          const customUser: User = {
            id: rpcData.user.id,
            email: rpcData.user.email || cleanEmail,
            aud: 'authenticated',
            created_at: rpcData.user.created_at || new Date().toISOString(),
            app_metadata: { provider: 'custom_table' },
            user_metadata: { email: rpcData.user.email || cleanEmail },
          } as User;
          localStorage.setItem('vp_custom_user', JSON.stringify(customUser));
          return { user: customUser, session: null, error: null };
        } else {
          return { user: null, session: null, error: rpcData.error || 'Invalid email or password.' };
        }
      }

      // Handle table row response (backwards compatibility)
      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      if (row && row.id) {
        const customUser: User = {
          id: row.id,
          email: row.email || cleanEmail,
          aud: 'authenticated',
          created_at: row.created_at || new Date().toISOString(),
          app_metadata: { provider: 'custom_table' },
          user_metadata: { email: row.email || cleanEmail },
        } as User;
        localStorage.setItem('vp_custom_user', JSON.stringify(customUser));
        return { user: customUser, session: null, error: null };
      }
    }

    return { user: null, session: null, error: 'Invalid email or password.' };
  } catch (err: any) {
    return { user: null, session: null, error: err.message || 'Authentication failed.' };
  }
}

/**
 * Register new user with email and password.
 * Uses ONLY the custom public.users table via `register_user` RPC.
 * Does NOT fall back to Supabase Auth to avoid ghost users in auth.users.
 */
export async function signUpWithEmail(email: string, password: string): Promise<AuthResponse> {
  const cleanEmail = email.toLowerCase().trim();

  if (!isSupabaseConfigured) {
    // Simulated demo sign-up
    if (cleanEmail && password.length >= 6) {
      const mockUser: User = {
        id: 'demo-user-id',
        app_metadata: { provider: 'demo' },
        user_metadata: { email: cleanEmail },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: cleanEmail,
      } as User;
      localStorage.setItem('vp_demo_user', JSON.stringify(mockUser));
      return { user: mockUser, session: null, error: null };
    }
    return {
      user: null,
      session: null,
      error: 'Supabase credentials not configured in .env. Password must be at least 6 characters.',
    };
  }

  // --- Register via register_user RPC (public.users table only) ---
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('register_user', {
      user_email: cleanEmail,
      user_password: password,
    });

    if (rpcError) {
      if (isRpcNotFoundError(rpcError)) {
        return {
          user: null,
          session: null,
          error: 'Database functions not set up. Please run the SQL script in your Supabase SQL Editor first.',
        };
      }
      return { user: null, session: null, error: rpcError.message };
    }

    if (rpcData) {
      // Handle JSON response: { success: boolean, user?: object, error?: string }
      if (typeof rpcData === 'object' && 'success' in rpcData) {
        if (rpcData.success && rpcData.user) {
          const customUser: User = {
            id: rpcData.user.id,
            email: rpcData.user.email || cleanEmail,
            aud: 'authenticated',
            created_at: rpcData.user.created_at || new Date().toISOString(),
            app_metadata: { provider: 'custom_table' },
            user_metadata: { email: rpcData.user.email || cleanEmail },
          } as User;
          localStorage.setItem('vp_custom_user', JSON.stringify(customUser));
          return { user: customUser, session: null, error: null };
        } else {
          return { user: null, session: null, error: rpcData.error || 'Registration failed.' };
        }
      }

      // Handle table row response (backwards compatibility)
      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      if (row && row.id) {
        const customUser: User = {
          id: row.id,
          email: row.email || cleanEmail,
          aud: 'authenticated',
          created_at: row.created_at || new Date().toISOString(),
          app_metadata: { provider: 'custom_table' },
          user_metadata: { email: row.email || cleanEmail },
        } as User;
        localStorage.setItem('vp_custom_user', JSON.stringify(customUser));
        return { user: customUser, session: null, error: null };
      }
    }

    return { user: null, session: null, error: 'Registration failed. Please try again.' };
  } catch (err: any) {
    return { user: null, session: null, error: err.message || 'An unexpected error occurred during registration.' };
  }
}

/**
 * Sign out current user (clears custom table session and Supabase Auth session)
 */
export async function signOutUser(): Promise<{ error: string | null }> {
  localStorage.removeItem('vp_custom_user');
  localStorage.removeItem('vp_demo_user');

  if (!isSupabaseConfigured) {
    return { error: null };
  }

  try {
    const { error } = await supabase.auth.signOut();
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err.message || 'Error signing out.' };
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  // Check custom database table user session
  try {
    const custom = localStorage.getItem('vp_custom_user');
    if (custom) {
      return JSON.parse(custom);
    }
  } catch {
    // ignore
  }

  if (!isSupabaseConfigured) {
    const demo = localStorage.getItem('vp_demo_user');
    if (demo) {
      try {
        return JSON.parse(demo);
      } catch {
        return null;
      }
    }
    return null;
  }

  try {
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

/**
 * Fast synchronous check for persisted session in localStorage to avoid layout flashes
 */
export function getStoredUserSync(): User | null {
  try {
    // Check custom database table user session
    const custom = localStorage.getItem('vp_custom_user');
    if (custom) {
      return JSON.parse(custom);
    }

    if (!isSupabaseConfigured) {
      const demo = localStorage.getItem('vp_demo_user');
      if (demo) {
        return JSON.parse(demo);
      }
      return null;
    }

    // Check standard Supabase token
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.includes('-auth-token')) && key.endsWith('-auth-token')) {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed?.user) return parsed.user;
        }
      }
    }
  } catch {
    // Return null on storage read errors
  }
  return null;
}
