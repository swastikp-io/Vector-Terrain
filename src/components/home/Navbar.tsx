import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface NavbarProps {
  onOpenPlayground?: () => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  user?: User | null;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  user,
  onSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="sticky top-3 sm:top-5 z-40 w-full px-4 sm:px-6 lg:px-8 pointer-events-none">
      <nav className="max-w-7xl mx-auto bg-white/75 backdrop-blur-xl rounded-none shadow-[0_8px_32px_rgba(0,0,0,0.06)] border-none text-black select-none transition-all pointer-events-auto px-5 sm:px-8 h-14 flex items-center justify-between">
        {/* Left: Product Name (Icon removed) */}
        <div className="flex items-center">
          <a
            href="#"
            className="flex items-center group cursor-pointer"
            title="Vector Terrain"
          >
            <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-black uppercase">
              VECTOR TERRAIN
            </span>
          </a>
        </div>

        {/* Center: Secondary Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-xs font-mono tracking-widest uppercase text-[#666666]">
          <a
            href="#systems"
            className="hover:text-black transition-colors py-1"
          >
            Systems
          </a>
          <a
            href="#statement"
            className="hover:text-black transition-colors py-1"
          >
            Philosophy
          </a>
          <a
            href="#experiment"
            className="hover:text-black transition-colors py-1"
          >
            Live Preview
          </a>
          <a
            href="#archive"
            className="hover:text-black transition-colors py-1"
          >
            Gallery
          </a>
          <a
            href="#process"
            className="hover:text-black transition-colors py-1"
          >
            Process
          </a>
        </div>

        {/* Right: Log In & Sign Up Auth Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#666666] max-w-[160px] truncate" title={user.email || ''}>
                {user.email}
              </span>
              <button
                onClick={onSignOut}
                className="px-3.5 py-1.5 bg-black/5 hover:bg-black/10 text-black font-mono text-xs uppercase tracking-wider rounded-none transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 text-black hover:text-[#666666] font-mono text-xs uppercase tracking-wider transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white font-mono text-xs font-semibold uppercase tracking-wider rounded-none transition-all shadow-sm"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex sm:hidden items-center gap-2">
          {user ? (
            <button
              onClick={onSignOut}
              className="px-2.5 py-1 bg-black/5 text-black font-mono text-[11px] uppercase rounded-none"
            >
              Sign Out
            </button>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="px-2 py-1 text-black font-mono text-[11px] uppercase"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-2.5 py-1 bg-black text-white font-mono text-[11px] font-semibold uppercase rounded-none"
              >
                Sign Up
              </button>
            </>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#666666] hover:text-black"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-2 max-w-7xl mx-auto px-6 py-4 bg-white/90 backdrop-blur-xl rounded-none shadow-xl flex flex-col gap-2.5 text-xs font-mono uppercase tracking-wider text-[#666666] pointer-events-auto">
          <a
            href="#systems"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-black py-1"
          >
            Systems
          </a>
          <a
            href="#statement"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-black py-1"
          >
            Philosophy
          </a>
          <a
            href="#experiment"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-black py-1"
          >
            Live Preview
          </a>
          <a
            href="#archive"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-black py-1"
          >
            Gallery
          </a>
          <a
            href="#process"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-black py-1"
          >
            Process
          </a>
        </div>
      )}
    </div>
  );
};
