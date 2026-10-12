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
    <nav className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] text-black select-none transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: Geometric Mark & Product Name */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            className="flex items-center gap-2.5 group cursor-pointer"
            title="Vector Terrain"
          >
            {/* Custom procedural geometric symbol */}
            <div className="w-6 h-6 border border-[#E5E5E5] group-hover:border-black flex items-center justify-center relative transition-colors duration-200 bg-[#F7F7F7]">
              <div className="w-2.5 h-2.5 bg-black rounded-none rotate-45 group-hover:rotate-90 transition-transform duration-300" />
            </div>
            <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-black uppercase">
              VECTOR <span className="text-[#888888] font-normal">/</span> TERRAIN
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
                className="px-3 py-1.5 border border-[#E5E5E5] hover:border-black text-black font-mono text-xs uppercase tracking-wider transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-black hover:text-[#666666] font-mono text-xs uppercase tracking-wider transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
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
              className="px-2.5 py-1 border border-[#E5E5E5] text-black font-mono text-[11px] uppercase"
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
                className="px-2.5 py-1 bg-black text-white font-mono text-[11px] font-semibold uppercase"
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
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 py-3 bg-[#F7F7F7] border-b border-[#E5E5E5] flex flex-col gap-2.5 text-xs font-mono uppercase tracking-wider text-[#666666]">
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
    </nav>
  );
};
