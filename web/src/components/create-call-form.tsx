'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Loader2, CheckCircle2, AlertCircle, Zap, Globe, Lock } from 'lucide-react';
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import { createCall } from '@/lib/api';
import { cn } from '@/lib/utils';
import { AudioRecorder } from '@/components/audio-recorder';

interface Props {
  timezone: string;
  onSuccess: () => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

const inputClass = cn(
  'w-full px-3.5 py-2.5 rounded-xl text-sm',
  'bg-slate-50 dark:bg-slate-800/60',
  'border border-slate-200 dark:border-slate-700',
  'text-slate-900 dark:text-white',
  'placeholder-slate-400 dark:placeholder-slate-500',
  'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 dark:focus:border-violet-500',
  'transition-all duration-200',
);

function nowInTz(tz: string) {
  return formatInTimeZone(new Date(), tz, "yyyy-MM-dd'T'HH:mm");
}

export function CreateCallForm({ timezone, onSuccess }: Props) {
  const [open, setOpen] = useState(true);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState(() => ({
    to: '',
    language: 'English',
    scheduledTime: nowInTz(timezone),
    recordingFile: '',
    prompt: '',
  }));

  useEffect(() => {
    setForm((prev) => ({ ...prev, scheduledTime: nowInTz(timezone) }));
  }, [timezone]);

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      // The datetime-local value (e.g. "2024-03-15T14:30") is treated as being
      // in the selected timezone — convert it to UTC before sending.
      const utcDate = fromZonedTime(form.scheduledTime, timezone);

      await createCall({
        to: form.to,
        prompt: form.prompt,
        scheduledTime: utcDate.toISOString(),
        language: form.language,
        recordingFile: form.recordingFile || undefined,
      });

      setStatus('success');
      setForm({ to: '', language: 'English', scheduledTime: '', recordingFile: '', prompt: '' });
      onSuccess();
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setTimeout(() => setStatus('idle'), 4000);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30">
            <Zap size={16} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-slate-900 dark:text-white">Schedule a New Call</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Deploy your robot with a target and a mission
            </div>
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={18} className="text-slate-400" />
        </motion.div>
      </button>

      {/* Form body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="px-6 pb-6 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                {/* Phone number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 555 000 0000"
                    value={form.to}
                    onChange={(e) => set('to', e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Language */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Language
                  </label>
                  <div className={cn(inputClass, 'flex items-center gap-2 cursor-not-allowed opacity-60')}>
                    <Lock size={13} className="text-slate-400 shrink-0" />
                    <span>English</span>
                  </div>
                </div>

                {/* Scheduled time */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Scheduled Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={form.scheduledTime}
                    onChange={(e) => set('scheduledTime', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Timezone hint */}
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                <Globe size={11} />
                Scheduled time interpreted as{' '}
                <span className="font-semibold text-violet-500 dark:text-violet-400">{timezone}</span>
                {' '}— stored as UTC on the backend.
              </div>

              {/* Recording file */}
              <div className="flex flex-col gap-1.5 mt-4">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Recording (optional, max 1 min) Will be played when the call is answered or not answered (voicemail)
                </label>
                <AudioRecorder onKeyChange={(key) => set('recordingFile', key)} />
              </div>

              {/* Prompt */}
              <div className="flex flex-col gap-1.5 mt-4">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Prompt / Instructions <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="You are a helpful assistant calling on behalf of... (write this like you're briefing a robot with no social skills, which you are)"
                  value={form.prompt}
                  onChange={(e) => set('prompt', e.target.value)}
                  className={cn(inputClass, 'resize-none')}
                />
              </div>

              {/* Status messages */}
              <AnimatePresence>
                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3"
                  >
                    <CheckCircle2 size={16} />
                    Call queued. The robot has received its orders.
                  </motion.div>
                )}
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 flex items-center gap-2 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3"
                  >
                    <AlertCircle size={16} />
                    {errorMsg || 'The robot refused. Try again.'}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/25"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Zap size={15} />
                      Deploy Call
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
