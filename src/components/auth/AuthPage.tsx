import React, { useState } from 'react';
import { ArrowLeft, ArrowUpRight, Lock, Mail, AlertCircle, CheckCircle2, User as UserIcon } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, isSupabaseConfigured } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
  noticeMessage?: string | null;
  onSuccess: (user: User) => void;
  onBack: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  noticeMessage,
  onSuccess,
  onBack,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (mode === 'signup' && !fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { user, error } = await signInWithEmail(email, password);
        if (error) {
          setErrorMessage(error);
        } else if (user) {
          onSuccess(user);
        }
      } else {
        const { user, error } = await signUpWithEmail(email, password, fullName.trim());
        if (error) {
          setErrorMessage(error);
        } else if (user) {
          // If registered via custom database table, demo mode, or auto-confirmed email:
          const isCustomTable = user.app_metadata?.provider === 'custom_table';
          const isDemo = user.app_metadata?.provider === 'demo';

          if (isCustomTable || isDemo || !isSupabaseConfigured) {
            onSuccess(user);
          } else if (user.confirmed_at) {
            onSuccess(user);
          } else {
            setSuccessMessage(
              'Account created successfully! Check your email inbox to verify your account, or log in.'
            );
            setMode('login');
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-black font-sans flex flex-col justify-between selection:bg-black selection:text-white">
      {/* Top Header */}
      <header className="h-14 border-b border-[#E5E5E5] px-4 sm:px-8 flex items-center justify-between select-none">
        {/* Left: Product Name (Icon removed) */}
        <div className="flex items-center">
          <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider uppercase text-black">
            VECTOR TERRAIN
          </span>
        </div>

        {/* Right: Back to Homepage */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono text-[#666666] hover:text-black py-1 px-2.5 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Homepage</span>
        </button>
      </header>

      {/* Main Centered Auth Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md border border-[#E5E5E5] bg-[#FAFAFA] p-6 sm:p-10 shadow-sm">
          {/* Required Notice Banner */}
          {noticeMessage && (
            <div className="mb-6 p-4 bg-black text-white font-mono text-xs flex items-start gap-3 shadow-sm border border-black">
              <Lock size={15} className="text-white flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold uppercase tracking-wider block text-[11px] mb-1">
                  Access Restricted
                </span>
                <span className="text-[#E0E0E0] leading-relaxed text-xs">
                  {noticeMessage}
                </span>
              </div>
            </div>
          )}

          {/* Card Title & Description */}
          <div className="mb-8">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#666666] mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-black" />
              <span>{mode === 'login' ? 'EXISTING USER ACCESS' : 'NEW REGISTRATION'}</span>
            </div>
            <h1 className="text-3xl font-light font-display text-black mb-2">
              {mode === 'login' ? 'Log in to your account.' : 'Create an account.'}
            </h1>
            <p className="font-mono text-xs text-[#666666] leading-relaxed">
              {mode === 'login'
                ? 'Enter your credentials to enter the procedural playground.'
                : 'Sign up with email and password to enter the procedural playground.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#EEEEEE] border border-[#E5E5E5] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-mono uppercase font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#666666] hover:text-black'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-mono uppercase font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#666666] hover:text-black'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-3 bg-white border border-[#E5E5E5] text-black font-mono text-xs flex items-start gap-2.5">
              <AlertCircle size={15} className="text-black flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-6 p-3 bg-white border border-black text-black font-mono text-xs flex items-start gap-2.5">
              <CheckCircle2 size={15} className="text-black flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block font-mono text-xs uppercase text-[#666666] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Swastik Patel"
                    className="w-full bg-white border border-[#E5E5E5] focus:border-black focus:outline-none px-3.5 py-2.5 text-xs font-mono text-black placeholder:text-[#AAAAAA] transition-colors"
                  />
                  <UserIcon size={14} className="absolute right-3.5 top-3 text-[#AAAAAA] pointer-events-none" />
                </div>
              </div>
            )}

            <div>
              <label className="block font-mono text-xs uppercase text-[#666666] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="designer@domain.com"
                  className="w-full bg-white border border-[#E5E5E5] focus:border-black focus:outline-none px-3.5 py-2.5 text-xs font-mono text-black placeholder:text-[#AAAAAA] transition-colors"
                />
                <Mail size={14} className="absolute right-3.5 top-3 text-[#AAAAAA] pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-[#666666] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-[#E5E5E5] focus:border-black focus:outline-none px-3.5 py-2.5 text-xs font-mono text-black placeholder:text-[#AAAAAA] transition-colors"
                />
                <Lock size={14} className="absolute right-3.5 top-3 text-[#AAAAAA] pointer-events-none" />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block font-mono text-xs uppercase text-[#666666] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white border border-[#E5E5E5] focus:border-black focus:outline-none px-3.5 py-2.5 text-xs font-mono text-black placeholder:text-[#AAAAAA] transition-colors"
                  />
                  <Lock size={14} className="absolute right-3.5 top-3 text-[#AAAAAA] pointer-events-none" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-mono text-xs uppercase font-semibold tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <span>{loading ? 'Processing...' : mode === 'login' ? 'Log In' : 'Create Account'}</span>
              {!loading && <ArrowUpRight size={14} />}
            </button>
          </form>

          {/* Toggle mode helper footer */}
          <div className="mt-6 pt-5 border-t border-[#E5E5E5] flex items-center justify-between text-xs font-mono">
            <span className="text-[#888888]">
              {mode === 'login' ? 'No account yet?' : 'Already registered?'}
            </span>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-black font-semibold hover:underline"
            >
              {mode === 'login' ? 'Sign up here' : 'Log in here'}
            </button>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="h-12 border-t border-[#E5E5E5] px-4 sm:px-8 flex items-center justify-between font-mono text-[11px] text-[#888888] select-none">
        <div>VECTOR TERRAIN &copy; {new Date().getFullYear()}</div>
        <div>EMAIL &amp; PASSWORD ONLY</div>
      </footer>
    </div>
  );
};
