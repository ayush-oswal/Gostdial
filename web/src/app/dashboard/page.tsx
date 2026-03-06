'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Globe, Timer } from 'lucide-react';
import { CreateCallForm } from '@/components/create-call-form';
import { CallsTable } from '@/components/calls-table';
import { TIMEZONES, DEFAULT_TIMEZONE } from '@/lib/timezones';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-16">
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                <Bot size={16} className="text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-xs font-bold tracking-widest uppercase text-violet-600 dark:text-violet-400">
                Command Center
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Dispatch the{' '}
              <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                Ghost
              </span>
            </h1>
            <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl">
              Schedule calls, monitor their glorious fate, and pretend you were involved the whole time.
            </p>
          </div>

          {/* Timezone selector */}
          <div className="flex-shrink-0">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">
              <Globe size={12} />
              Timezone
            </label>
            <div className="relative">
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className={cn(
                  'appearance-none pl-3.5 pr-9 py-2.5 rounded-xl text-sm font-medium',
                  'bg-slate-50 dark:bg-slate-800/60',
                  'border border-slate-200 dark:border-slate-700',
                  'text-slate-900 dark:text-white',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 dark:focus:border-violet-500',
                  'transition-all duration-200 cursor-pointer min-w-[230px]',
                )}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              {/* Chevron icon */}
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Budget notice */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-6 relative overflow-hidden rounded-2xl"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-purple-500/10 to-cyan-500/10 dark:from-violet-600/15 dark:via-purple-500/15 dark:to-cyan-500/15" />
          <div className="absolute inset-0 border border-violet-200/60 dark:border-violet-700/40 rounded-2xl pointer-events-none" />

          {/* Animated shimmer line on top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-cyan-400 to-violet-500 animate-gradient-x" />

          <div className="relative flex items-center gap-5 px-5 py-4">
            {/* Icon block */}
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Timer size={18} className="text-white" />
              </div>
              <span className="text-[10px] font-black tracking-widest text-violet-500 dark:text-violet-400 uppercase">limit</span>
            </div>

            {/* Divider */}
            <div className="w-px self-stretch bg-violet-200 dark:bg-violet-800/60" />

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">
                  Budget Bulletin
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                  VERY IMPORTANT
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                Calls are capped at{' '}
                <span className="font-black text-violet-600 dark:text-violet-400">~1 minute</span>
                {' '}— that's 60 seconds. Enough to deliver a message, pitch a product, or end a situationship.{' '}
                <span className="text-slate-500 dark:text-slate-400 italic">
                  Not enough to fix your life, but we're working on the funding.
                </span>
              </p>
            </div>

            {/* Right side: big "60s" */}
            <div className="flex-shrink-0 hidden sm:flex flex-col items-center leading-none">
              <span className="text-4xl font-black bg-gradient-to-b from-violet-500 to-cyan-400 bg-clip-text text-transparent tabular-nums">60</span>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest -mt-0.5">seconds</span>
            </div>
          </div>
        </motion.div>

        {/* Create form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CreateCallForm timezone={timezone} onSuccess={() => setRefreshKey((k) => k + 1)} />
        </motion.div>

        {/* Calls table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mission Logs</h2>
            <span className="text-xs text-slate-400 dark:text-slate-600">Click any row for full details</span>
          </div>
          <CallsTable refreshKey={refreshKey} timezone={timezone} />
        </motion.div>
      </div>
    </div>
  );
}
