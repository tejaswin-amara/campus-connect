import { Search, Sparkles } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { Aurora } from '../../../components/reactbits/backgrounds/Aurora';
import { BlurText } from '../../../components/reactbits/text/BlurText';
import { Input } from '../../../components/ui/Input';

export interface HeroBannerProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalListingsCount?: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  onSearchChange,
  totalListingsCount = 6,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcuts: Cmd+K, Ctrl+K, or / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.querySelector('dialog, [role="dialog"]')) return;

      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInputFocused = activeTag === 'input' || activeTag === 'textarea';

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border-subtle bg-surface-base/80 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-glass">
      {/* Deep GPU-accelerated ambient Aurora wave background */}
      <Aurora />

      <div className="relative z-10 max-w-3xl space-y-6">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3.5 py-1 text-xs font-semibold text-brand-primary shadow-glow-cyan backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="tracking-wide">CAMPUS CONNECT &bull; AUTONOMOUS CALENDAR 2026</span>
        </div>

        {/* Headline rendered via BlurText */}
        <div className="space-y-2">
          <BlurText
            text="Discover & Connect with Campus Intelligence"
            as="h1"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight"
          />
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Explore hackathons, collegiate symphonies, athletic championships, and deep-tech
            workshops. Real-time occupancy tracking, one-click registration, and instant calendar
            sync.
          </p>
        </div>

        {/* Search Bar with instant keyboard shortcuts */}
        <div className="pt-2 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by event title, venue, or keywords..."
              className="h-12 pl-11 pr-24 rounded-2xl border-border-strong bg-surface-overlay/80 text-sm placeholder:text-slate-400 shadow-xl backdrop-blur-md focus-visible:border-brand-primary focus-visible:ring-brand-primary/50"
              aria-label="Search events"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <kbd className="rounded border border-border-subtle bg-surface-base px-2 py-0.5 text-[10px] font-mono text-slate-400 shadow-sm">
                ⌘K
              </kbd>
              <kbd className="rounded border border-border-subtle bg-surface-base px-1.5 py-0.5 text-[10px] font-mono text-slate-400 shadow-sm">
                /
              </kbd>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Press <kbd className="font-mono text-slate-300">⌘K</kbd> to search instantly
            </span>
            <span className="font-mono tracking-tight tabular-nums">
              {totalListingsCount} listings indexed
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
