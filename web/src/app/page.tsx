import { Hero } from '@/components/hero';
import { Stats } from '@/components/stats';
import { Features } from '@/components/features';
import { UseCases } from '@/components/use-cases';
import { HowItWorks } from '@/components/how-it-works';
import { CTA } from '@/components/cta';

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <Stats />
      <Features />
      <UseCases />
      <HowItWorks />
      <CTA />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 dark:text-slate-600">
            © 2026 <span className="font-semibold">GhostDial™</span> — Made with questionable ethics and too much caffeine.
          </p>
          <p className="text-xs text-slate-300 dark:text-slate-700 italic">
            No ghosts were harmed in the making of this product. Your recipients, however...
          </p>
        </div>
      </footer>
    </main>
  );
}
