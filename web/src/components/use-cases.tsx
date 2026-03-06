'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type Tag = 'PRO' | 'CREATIVE' | 'QUESTIONABLE';

interface UseCase {
  emoji: string;
  title: string;
  description: string;
  tag: Tag;
}

const TAG_STYLES: Record<Tag, string> = {
  PRO:          'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  CREATIVE:     'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
  QUESTIONABLE: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
};

const TAG_LABELS: Record<Tag, string> = {
  PRO:          '💼 Legitimate',
  CREATIVE:     '🌀 Creative',
  QUESTIONABLE: '💀 Questionable',
};

const USE_CASES: UseCase[] = [
  {
    emoji: '🏢',
    title: 'Call Center Automation',
    description: 'Handle thousands of support calls without hiring 200 people who will quit in three months anyway.',
    tag: 'PRO',
  },
  {
    emoji: '🤝',
    title: 'Hiring Screening Calls',
    description: 'Let the AI do the first round interview. It won\'t have unconscious bias. It won\'t have any bias. It won\'t have feelings at all.',
    tag: 'PRO',
  },
  {
    emoji: '📅',
    title: 'Appointment Reminders',
    description: 'Remind patients, clients, and leads they have somewhere to be. They\'ll still be late. But now it\'s documented.',
    tag: 'PRO',
  },
  {
    emoji: '💸',
    title: 'Collections & Follow-ups',
    description: 'Politely remind people they owe you money. On repeat. Forever. Until they pay or change numbers.',
    tag: 'PRO',
  },
  {
    emoji: '🔒',
    title: 'She Blocked You',
    description: 'We\'re not saying this is why we built it. We\'re saying it\'s technically possible and we can\'t stop you.',
    tag: 'QUESTIONABLE',
  },
  {
    emoji: '🎂',
    title: 'Midnight Birthday Calls',
    description: 'Wish your friends happy birthday at the exact stroke of midnight while you\'re peacefully asleep, dreaming of better friends.',
    tag: 'CREATIVE',
  },
  {
    emoji: '📞',
    title: 'Prank Your Friends',
    description: 'Have the AI call Dave and tell him his extended car warranty is about to expire. Godspeed, Dave.',
    tag: 'QUESTIONABLE',
  },
  {
    emoji: '🏋️',
    title: 'Cancel the Gym',
    description: 'They force you to call to cancel — a policy designed by sociopaths. We make calling free. Checkmate, Planet Fitness.',
    tag: 'CREATIVE',
  },
  {
    emoji: '🏠',
    title: 'Landlord Harassment',
    description: 'Remind your landlord about that leaky tap from January without the anxiety spiral of hearing your own voice.',
    tag: 'CREATIVE',
  },
  {
    emoji: '🎭',
    title: 'Fake Emergency Escape',
    description: 'Schedule an "urgent work call" to fire yourself out of family dinners, bad dates, or any room you\'d rather not be in.',
    tag: 'QUESTIONABLE',
  },
  {
    emoji: '😴',
    title: 'Wake-up Calls',
    description: 'Have the AI call your friends awake in the morning with a personalized motivational speech they absolutely did not ask for.',
    tag: 'CREATIVE',
  },
  {
    emoji: '💔',
    title: 'The Breakup Proxy',
    description: 'We\'re not saying you should break up with someone via AI. We\'re saying the option exists and we slept fine writing this.',
    tag: 'QUESTIONABLE',
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export function UseCases() {
  return (
    <section className="py-24 lg:py-32 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-violet-600 dark:text-violet-400 mb-4">
            Use Cases
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            What People{' '}
            <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">
              Actually
            </span>{' '}
            Use This For
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            We designed it for enterprise. We see the analytics. We have questions.
          </p>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-14"
        >
          {(Object.keys(TAG_LABELS) as Tag[]).map((tag) => (
            <span key={tag} className={cn('px-3 py-1 rounded-full text-xs font-bold border', TAG_STYLES[tag])}>
              {TAG_LABELS[tag]}
            </span>
          ))}
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {USE_CASES.map((uc) => (
            <motion.div
              key={uc.title}
              variants={itemVariants}
              className="group relative p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3"
            >
              {/* Emoji */}
              <span className="text-3xl leading-none">{uc.emoji}</span>

              {/* Tag */}
              <span className={cn('self-start px-2 py-0.5 rounded-md text-[10px] font-bold border', TAG_STYLES[uc.tag])}>
                {TAG_LABELS[uc.tag]}
              </span>

              {/* Title */}
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{uc.title}</h3>

              {/* Description */}
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                {uc.description}
              </p>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/0 to-cyan-500/0 group-hover:from-violet-500/3 group-hover:to-cyan-500/3 transition-all duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-slate-400 dark:text-slate-600 mt-10 italic"
        >
          GhostDial does not endorse, encourage, or take responsibility for the Questionable category.
          <br />
          We just build the tools. You build the character.
        </motion.p>
      </div>
    </section>
  );
}
