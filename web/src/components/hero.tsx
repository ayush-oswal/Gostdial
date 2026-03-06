'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Phone, ChevronDown } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-slate-950">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-100 dark:opacity-100 pointer-events-none" />

      {/* Gradient orbs */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-radial from-violet-500/20 via-violet-500/5 to-transparent blur-3xl pointer-events-none"
        animate={{ x: [0, 30, -15, 0], y: [0, -40, 20, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-radial from-cyan-500/15 via-cyan-500/5 to-transparent blur-3xl pointer-events-none"
        animate={{ x: [0, -25, 15, 0], y: [0, 30, -20, 0], scale: [1, 1.05, 0.98, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
      <motion.div
        className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-gradient-radial from-purple-500/10 via-purple-500/3 to-transparent blur-2xl pointer-events-none"
        animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column */}
          <div>
            {/* Badge */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0.1}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800/60 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                </span>
                AI-Powered Voice Agent — Definitely Not Skynet
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.2}
              className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.05]"
            >
              Ghost
              <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent animate-gradient-x">
                Dial.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.35}
              className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg"
            >
              An AI that dials, talks, and vanishes — leaving behind only a transcript and mild confusion for whoever picked up.{' '}
              <span className="text-slate-900 dark:text-slate-200 font-medium">Completely above board.</span>
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.5}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50"
              >
                Open Command Center
                <ArrowRight size={16} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all duration-200"
              >
                How It (Barely) Works
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.65}
              className="mt-8 text-xs text-slate-400 dark:text-slate-600"
            >
              No signup. No credit card. No paper trail.
            </motion.p>
          </div>

          {/* Right column — animated phone illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hidden lg:flex items-center justify-center relative"
          >
            {/* Ripple rings */}
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-violet-500/20 dark:border-violet-400/20"
                style={{ width: 120 + i * 90, height: 120 + i * 90 }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 3.5, delay: i * 0.9, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}

            {/* Center icon */}
            <motion.div
              className="relative z-10 w-28 h-28 rounded-3xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-violet-500/40"
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Phone size={52} className="text-white" strokeWidth={1.5} />
            </motion.div>

            {/* Floating status pills */}
            <motion.div
              className="absolute top-8 right-8 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2"
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">PENDING</span>
            </motion.div>
            <motion.div
              className="absolute bottom-12 left-4 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2"
              animate={{ y: [4, -4, 4] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Call Sent ✓</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
      >
        <ChevronDown size={20} className="text-slate-400 dark:text-slate-600" />
      </motion.div>
    </section>
  );
}
