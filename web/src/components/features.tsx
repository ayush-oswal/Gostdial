'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Phone, FileText, Globe, Clock, Activity, ShieldAlert } from 'lucide-react';

const FEATURES = [
  {
    icon: Phone,
    title: 'Automated Outbound Calls',
    description: "Because picking up the phone yourself is a skill you clearly haven't needed since 2015.",
    color: 'text-violet-500',
    bg: 'bg-violet-100 dark:bg-violet-900/25',
    border: 'group-hover:border-violet-300 dark:group-hover:border-violet-700',
  },
  {
    icon: FileText,
    title: 'Full AI Transcription',
    description: "Every word, every sigh, every awkward pause — immortalized in exquisite, searchable detail.",
    color: 'text-cyan-500',
    bg: 'bg-cyan-100 dark:bg-cyan-900/25',
    border: 'group-hover:border-cyan-300 dark:group-hover:border-cyan-700',
  },
  {
    icon: Globe,
    title: 'Multi-language Support',
    description: "Disappoint people in over 50 languages. True global reach for your robot's awkward conversations.",
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/25',
    border: 'group-hover:border-blue-300 dark:group-hover:border-blue-700',
  },
  {
    icon: Clock,
    title: 'Precision Scheduling',
    description: "Set it for 3am and marvel at the life choices that led you here. We don't judge. Much.",
    color: 'text-amber-500',
    bg: 'bg-amber-100 dark:bg-amber-900/25',
    border: 'group-hover:border-amber-300 dark:group-hover:border-amber-700',
  },
  {
    icon: Activity,
    title: 'Real-time Monitoring',
    description: "Watch call statuses update in real time while you pretend you're in control of the situation.",
    color: 'text-green-500',
    bg: 'bg-green-100 dark:bg-green-900/25',
    border: 'group-hover:border-green-300 dark:group-hover:border-green-700',
  },
  {
    icon: ShieldAlert,
    title: 'Error Tracking',
    description: "When the robot fails, at least it has the dignity to tell you — which is more than you can say for most.",
    color: 'text-red-500',
    bg: 'bg-red-100 dark:bg-red-900/25',
    border: 'group-hover:border-red-300 dark:group-hover:border-red-700',
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-24 lg:py-32 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-violet-600 dark:text-violet-400 mb-4">
            Features
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            What Our Bot Does{' '}
            <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">
              Better Than You
            </span>
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            A comprehensive suite of capabilities your robot overlord needs. No feelings included.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={`group relative p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1 ${feature.border} cursor-default`}
            >
              <div className={`inline-flex p-2.5 rounded-xl ${feature.bg} mb-4`}>
                <feature.icon size={22} className={feature.color} strokeWidth={1.8} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover gradient overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/0 to-cyan-500/0 group-hover:from-violet-500/3 group-hover:to-cyan-500/3 transition-all duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
