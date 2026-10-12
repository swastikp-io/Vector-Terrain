import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { usePlaygroundStore } from './store/playgroundStore';
import { generateGeometry } from './engine/generators';
import { getPaletteById } from './store/palettes';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { ArtboardCanvas } from './components/canvas/ArtboardCanvas';

import { ExportModal } from './components/export/ExportModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { HomePage } from './components/home/HomePage';
import { AuthPage } from './components/auth/AuthPage';
import { GeneratorMode, GeneratorConfig } from './engine/core/types';
import {
  getCurrentUser,
  signOutUser,
  supabase,
  isSupabaseConfigured,
  getStoredUserSync,
} from './lib/supabase';
import { User } from '@supabase/supabase-js';

export const App: React.FC = () => {
  const {
    mode,
    configs,
    seed,
    paletteId,
    dimensions,
    undo,
    redo,
    rollSeed,
    toggleAnimation,
    setMode,
    setSeed,
    setConfigForMode,
  } = usePlaygroundStore();

  const [user, setUser] = useState<User | null>(() => getStoredUserSync());
  const [authLoading, setAuthLoading] = useState(true);
  const [authNotice, setAuthNotice] = useState<string | null>(() => {
    const initialUser = getStoredUserSync();
    if (window.location.hash === '#playground' && !initialUser) {
      return 'Authentication Required — Log in or sign up to enter the procedural playground.';
    }
    return null;
  });

  const [pendingPlaygroundParams, setPendingPlaygroundParams] = useState<{
    mode?: GeneratorMode;
    seed?: number;
    config?: GeneratorConfig;
  } | null>(null);

  // Navigation View State: 'home' | 'playground' | 'auth'
  // CRITICAL: Without logging in or signing up, user cannot enter the playground
  const [currentView, setCurrentView] = useState<'home' | 'playground' | 'auth'>(() => {
    const initialUser = getStoredUserSync();
    if (window.location.hash === '#playground') {
      return initialUser ? 'playground' : 'auth';
    }
    if (window.location.hash === '#auth') return 'auth';
    return 'home';
  });

  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>(() => {
    const initialUser = getStoredUserSync();
    if (window.location.hash === '#playground' && !initialUser) {
      return 'signup';
    }
    return 'login';
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportDefaultFormat, setExportDefaultFormat] = useState<'svg' | 'png' | 'pdf' | 'webm' | 'mp4'>('svg');

  // Initialize and subscribe to Supabase user authentication state
  useEffect(() => {
    let isMounted = true;

    getCurrentUser().then((u) => {
      if (!isMounted) return;
      setUser(u);
      setAuthLoading(false);

      // If user attempted to enter #playground directly without being authenticated, intercept to #auth
      if (!u && window.location.hash === '#playground') {
        setAuthNotice('Authentication Required — Log in or sign up to enter the procedural playground.');
        setAuthInitialMode('signup');
        setCurrentView('auth');
        window.location.hash = 'auth';
      }
    });

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        if (!currentUser) {
          // If signed out while in playground, bounce immediately to homepage
          setCurrentView((prev) => {
            if (prev === 'playground') {
              window.location.hash = '';
              return 'home';
            }
            return prev;
          });
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } else {
      return () => {
        isMounted = false;
      };
    }
  }, []);

  // Sync hash routing with view state and protect playground route
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#playground') {
        if (!user) {
          setAuthNotice('Authentication Required — Log in or sign up to enter the procedural playground.');
          setAuthInitialMode('signup');
          setCurrentView('auth');
          window.location.hash = 'auth';
        } else {
          setCurrentView('playground');
        }
      } else if (window.location.hash === '#auth') {
        setCurrentView('auth');
      } else if (!window.location.hash || window.location.hash.startsWith('#')) {
        if (window.location.hash !== '#playground' && window.location.hash !== '#auth') {
          setCurrentView('home');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user]);

  const handleOpenPlayground = useCallback(
    (params?: {
      mode?: GeneratorMode;
      seed?: number;
      config?: GeneratorConfig;
    }) => {
      // REQUIRE AUTHENTICATION: Without logging in or signing up, user cannot enter playground
      if (!user) {
        setPendingPlaygroundParams(params || null);
        setAuthNotice('Authentication Required — Log in or sign up to enter the procedural playground.');
        setAuthInitialMode('signup');
        setCurrentView('auth');
        window.location.hash = 'auth';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (params?.mode) {
        setMode(params.mode);
      }
      if (params?.seed !== undefined) {
        setSeed(params.seed);
      }
      if (params?.config && params?.mode) {
        setConfigForMode(params.mode, params.config);
      }
      setCurrentView('playground');
      window.location.hash = 'playground';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [user, setMode, setSeed, setConfigForMode]
  );

  const handleBackToHome = useCallback(() => {
    setCurrentView('home');
    setAuthNotice(null);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOpenAuth = useCallback((mode: 'login' | 'signup' = 'login') => {
    setAuthNotice(null);
    setPendingPlaygroundParams(null);
    setAuthInitialMode(mode);
    setCurrentView('auth');
    window.location.hash = 'auth';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAuthSuccess = useCallback(
    (authedUser: User) => {
      setUser(authedUser);
      setAuthNotice(null);

      // Restore and apply any system configuration the user selected before being prompted to log in
      if (pendingPlaygroundParams) {
        if (pendingPlaygroundParams.mode) {
          setMode(pendingPlaygroundParams.mode);
        }
        if (pendingPlaygroundParams.seed !== undefined) {
          setSeed(pendingPlaygroundParams.seed);
        }
        if (pendingPlaygroundParams.config && pendingPlaygroundParams.mode) {
          setConfigForMode(pendingPlaygroundParams.mode, pendingPlaygroundParams.config);
        }
        setPendingPlaygroundParams(null);
      }

      // Enter the playground now that authentication is successful
      setCurrentView('playground');
      window.location.hash = 'playground';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [pendingPlaygroundParams, setMode, setSeed, setConfigForMode]
  );

  const handleSignOut = useCallback(async () => {
    await signOutUser();
    setUser(null);
    setPendingPlaygroundParams(null);
    setAuthNotice(null);
    if (currentView === 'playground') {
      setCurrentView('home');
      window.location.hash = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentView]);

  const handleOpenExport = (format: 'svg' | 'png' | 'pdf' | 'webm' | 'mp4' = 'svg') => {
    setExportDefaultFormat(format);
    setExportModalOpen(true);
  };

  const activeConfig = configs[mode];
  const palette = useMemo(() => getPaletteById(paletteId), [paletteId]);

  // Generate static base vector geometry deterministically from configuration
  // Does NOT re-run on animation ticks or viewport pan/zoom, ensuring zero-lag UI!
  const geometry = useMemo(() => {
    return generateGeometry(
      activeConfig,
      seed,
      dimensions,
      palette,
      0
    );
  }, [activeConfig, seed, dimensions, palette]);

  // Global Keyboard Shortcuts (active only when in playground view)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (currentView !== 'playground') return;

      // Ignore if user is currently typing in an input or select
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement;

      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === ' ') {
        e.preventDefault();
        toggleAnimation();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        rollSeed();
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setExportModalOpen(true);
      } else if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        const modes = [
          'waveforms',
          'loops',
          'branches',
          'interference',
          'contours',
          'connections',
        ] as const;
        const targetMode = modes[parseInt(e.key, 10) - 1];
        if (targetMode) {
          setMode(targetMode);
        }
      }
    },
    [currentView, undo, redo, rollSeed, toggleAnimation, setMode]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (currentView === 'auth') {
    return (
      <AuthPage
        initialMode={authInitialMode}
        noticeMessage={authNotice}
        onSuccess={handleAuthSuccess}
        onBack={handleBackToHome}
      />
    );
  }

  if (currentView === 'home') {
    return (
      <HomePage
        onOpenPlayground={handleOpenPlayground}
        onOpenAuth={handleOpenAuth}
        user={user}
        onSignOut={handleSignOut}
      />
    );
  }

  // Absolute Safeguard: Without logging in or signing up, user cannot enter the playground
  if (!user) {
    if (authLoading) {
      return (
        <div className="min-h-screen w-full bg-white text-black flex flex-col items-center justify-center font-mono">
          <div className="w-8 h-8 border border-[#E5E5E5] bg-[#F7F7F7] flex items-center justify-center mb-4">
            <div className="w-2.5 h-2.5 bg-black animate-spin" />
          </div>
          <div className="text-xs tracking-widest uppercase text-[#666666]">
            Verifying Session...
          </div>
        </div>
      );
    }

    return (
      <AuthPage
        initialMode="signup"
        noticeMessage="Authentication Required — Log in or sign up to enter the procedural playground."
        onSuccess={handleAuthSuccess}
        onBack={handleBackToHome}
      />
    );
  }

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-white text-black font-sans antialiased">
      {/* Top Application Bar with Back to Home button and User Profile */}
      <TopBar
        onOpenExport={handleOpenExport}
        onBackToHome={handleBackToHome}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Main Studio Area */}
      <div className="flex flex-1 w-full overflow-hidden relative">
        <ErrorBoundary fallbackTitle="Canvas Engine Error">
          <ArtboardCanvas geometry={geometry} />
        </ErrorBoundary>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>



      {/* Export Pipeline Dialog */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        geometry={geometry}
        defaultFormat={exportDefaultFormat}
      />
    </div>
  );
};

export default App;
