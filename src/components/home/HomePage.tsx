import React from 'react';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { EditorialSection } from './EditorialSection';
import { SystemsSection } from './SystemsSection';
import { InteractivePreview } from './InteractivePreview';
import { GallerySection } from './GallerySection';
import { ProcessSection } from './ProcessSection';
import { FinalCTA } from './FinalCTA';
import { Footer } from './Footer';
import { GeneratorMode, GeneratorConfig } from '../../engine/core/types';
import { User } from '@supabase/supabase-js';

interface HomePageProps {
  onOpenPlayground: (params?: {
    mode?: GeneratorMode;
    seed?: number;
    config?: GeneratorConfig;
  }) => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  user?: User | null;
  onSignOut?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenPlayground,
  onOpenAuth,
  user,
  onSignOut,
}) => {
  return (
    <div className="min-h-screen w-full bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* 1. Minimal Navigation Bar with Log In / Sign Up */}
      <Navbar
        onOpenPlayground={() => onOpenPlayground()}
        onOpenAuth={onOpenAuth}
        user={user}
        onSignOut={onSignOut}
      />

      <main>
        {/* 2. Hero Section with Generative Typography */}
        <HeroSection onOpenPlayground={() => onOpenPlayground()} />

        {/* 3. Inverted Philosophy Editorial Statement */}
        <EditorialSection onOpenPlayground={() => onOpenPlayground()} />

        {/* 4. Four Curated Generative Systems */}
        <SystemsSection
          onSelectSystem={(mode, seed) => onOpenPlayground({ mode, seed })}
        />

        {/* 5. Live Interactive Mini Playground */}
        <InteractivePreview
          onOpenFullPlayground={(overrides) => onOpenPlayground(overrides)}
        />

        {/* 6. Selected Outputs Computational Print Archive */}
        <GallerySection />

        {/* 7. Editorial Process: Define, Discover, Export */}
        <ProcessSection />

        {/* 8. Final Oversized CTA */}
        <FinalCTA onOpenPlayground={() => onOpenPlayground()} />
      </main>

      {/* 9. Minimal Technical Footer */}
      <Footer onOpenPlayground={() => onOpenPlayground()} />
    </div>
  );
};

export default HomePage;
