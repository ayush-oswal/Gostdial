'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-24 lg:py-32 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-600" />
          <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10" />

          {/* Animated orbs inside the CTA */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 px-8 py-16 sm:px-16 text-center">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="inline-flex p-3 rounded-2xl bg-white/20 mb-6"
            >
              <Zap size={28} className="text-white" />
            </motion.div>

            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
              Ready to Outsource
              <br />
              Your Awkward Conversations?
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
              No signup required. Just a robot, a phone number, and a complete abdication of personal responsibility.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-violet-700 font-bold text-sm hover:bg-white/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl"
              >
                Start Making Calls
                <ArrowRight size={17} />
              </Link>
            </div>

            <p className="mt-6 text-white/40 text-xs">
              * Results may vary. The robot is doing its best. Aren't we all.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
