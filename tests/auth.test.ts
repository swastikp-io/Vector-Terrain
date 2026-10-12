import { describe, it, expect, beforeEach } from 'vitest';
import {
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  getCurrentUser,
  getStoredUserSync,
} from '../src/lib/supabase';

// Provide globalThis.localStorage polyfill for Node.js test runner environment
if (typeof globalThis.localStorage === 'undefined') {
  const storage = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => (storage.has(key) ? storage.get(key)! : null),
    setItem: (key: string, val: string) => storage.set(key, String(val)),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
    key: (i: number) => Array.from(storage.keys())[i] || null,
    get length() {
      return storage.size;
    },
  } as Storage;
}

describe('Authentication & Access Control', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('unauthenticated user returns null from stored user sync and async getters', async () => {
    expect(getStoredUserSync()).toBeNull();
    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it('correctly reads stored user session from localStorage', () => {
    const mockUser = {
      id: 'usr_test_123',
      email: 'creator@domain.com',
      aud: 'authenticated',
    };
    localStorage.setItem(
      'sb-uiodenlabokhmckhrfzw-auth-token',
      JSON.stringify({ user: mockUser })
    );

    const storedUser = getStoredUserSync();
    expect(storedUser).not.toBeNull();
    expect(storedUser?.email).toBe('creator@domain.com');
  });

  it('correctly reads custom database table session from localStorage', () => {
    const mockCustomUser = {
      id: 'custom_usr_999',
      email: 'studio@generative.art',
      aud: 'authenticated',
      app_metadata: { provider: 'custom_table' },
    };
    localStorage.setItem('vp_custom_user', JSON.stringify(mockCustomUser));

    const storedUser = getStoredUserSync();
    expect(storedUser).not.toBeNull();
    expect(storedUser?.email).toBe('studio@generative.art');
  });

  it('returns appropriate error on invalid credentials without crashing', async () => {
    const result = await signInWithEmail('nonexistent@user.com', 'short');
    expect(result.user).toBeNull();
    expect(result.error).toBeTruthy();
  });

  it('rejects short passwords during sign-up attempt', async () => {
    const result = await signUpWithEmail('creator@domain.com', '123');
    expect(result.user).toBeNull();
    expect(result.error).toBeTruthy();
  });

  it('signOutUser cleans up session tokens from storage', async () => {
    localStorage.setItem(
      'sb-uiodenlabokhmckhrfzw-auth-token',
      JSON.stringify({ user: { id: 'usr_test' } })
    );
    localStorage.setItem('vp_demo_user', JSON.stringify({ id: 'demo' }));
    localStorage.setItem('vp_custom_user', JSON.stringify({ id: 'custom' }));

    const { error } = await signOutUser();
    expect(error).toBeNull();
    expect(localStorage.getItem('vp_demo_user')).toBeNull();
    expect(localStorage.getItem('vp_custom_user')).toBeNull();
  });
});
