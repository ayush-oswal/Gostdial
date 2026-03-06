'use client';

import { motion } from 'framer-motion';
import { ListPlus, Bot, ClipboardList } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: ListPlus,
    title: 'Queue the Mission',
    description:
      "Enter the target's number, brief the AI on its objectives, and schedule the hit — err, call. Fill in the prompt like you're writing instructions to someone who has no concept of social cues.",
  },
  {
    step: '02',
    icon: Bot,
    title: 'The Robot Takes Over',
    description:
      "Your AI dials the number, conducts the conversation, and doesn't even need a coffee break. It has no feelings about this. None. It is fine.",
  },
  {
    step: '03',
    icon: ClipboardList,
    title: 'Review the Evidence',
    description:
      "Get the full transcript, check the recording, and pretend you supervised the whole thing. Sometimes it even works correctly — celebrate those moments.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-violet-600 dark:text-violet-400 mb-4">
            How It Works
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Simple Enough Even{' '}
            <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">
              You Can Do It
            </span>
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Three steps to full robotic autonomy. The robot requires no further instruction.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-violet-500/30 via-purple-500/30 to-cyan-500/30" />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Step number + icon */}
              <div className="relative mb-6">
                {/* Outer ring */}
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-violet-300 dark:border-violet-800 flex items-center justify-center animate-spin-slow">
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-violet-500/30">
                    <step.icon size={26} className="text-white" strokeWidth={1.8} />
                  </div>
                </div>
                {/* Step label */}
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center">
                  <span className="text-[10px] font-black text-white dark:text-slate-900">{step.step}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
