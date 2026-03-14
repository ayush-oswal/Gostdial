'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, User, Globe, Clock, Calendar, FileAudio, MessageSquare, Hash } from 'lucide-react';
import { Call } from '@/lib/types';
import { formatDateTZ, cn } from '@/lib/utils';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  SENT:    { label: 'Sent',    color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' },
  ERROR:   { label: 'Error',   color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' },
};

interface Props {
  call: Call | null;
  timezone: string;
  onClose: () => void;
}

function Field({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
        <Icon size={12} />
        {label}
      </div>
      <div className="text-sm text-slate-800 dark:text-slate-200 font-medium">
        {value || <span className="text-slate-400 dark:text-slate-600 italic font-normal">Not provided</span>}
      </div>
    </div>
  );
}

export function CallModal({ call, timezone, onClose }: Props) {
  return (
    <AnimatePresence>
      {call && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-900/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-2xl">
                <div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">Call Details</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">#{call.id} — {call.to}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('px-3 py-1 rounded-full text-xs font-bold border', STATUS_CONFIG[call.status].color)}>
                    {STATUS_CONFIG[call.status].label}
                  </span>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-6">
                {/* Timezone note */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-lg px-3 py-2">
                  <Globe size={12} className="text-violet-500" />
                  Times shown in{' '}
                  <span className="font-semibold text-violet-500 dark:text-violet-400">{timezone}</span>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-5">
                  <Field icon={Hash}     label="Call ID"        value={String(call.id)} />
                  <Field icon={Phone}    label="Phone Number"   value={call.to} />
                  <Field icon={User}     label="Human Fallback" value={call.humanNumber} />
                  <Field icon={Globe}    label="Language"       value={call.language} />
                  <Field icon={Clock}    label="Scheduled Time" value={formatDateTZ(call.scheduledTime, timezone)} />
                  <Field icon={Calendar} label="Created At"     value={formatDateTZ(call.createdAt, timezone)} />
                  <Field icon={Calendar} label="Updated At"     value={formatDateTZ(call.updatedAt, timezone)} />
                </div>

                {/* Prompt */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                    <MessageSquare size={12} />
                    Prompt / Instructions
                  </div>
                  <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/15 border border-violet-100 dark:border-violet-900/50 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-mono text-[13px]">
                    {call.prompt}
                  </div>
                </div>

                {/* Call Recording */}
                {call.callRecordingKey && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                      <FileAudio size={12} />
                      Call Recording
                    </div>
                    <audio
                      controls
                      src={call.callRecordingKey}
                      className="w-full rounded-xl"
                    />
                  </div>
                )}

                {/* Transcription */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                    <MessageSquare size={12} />
                    Transcription
                  </div>
                  {call.transcription ? (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto font-mono text-[13px]">
                      {call.transcription}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-sm text-slate-400 dark:text-slate-600 italic text-center">
                      {call.status === 'PENDING'
                        ? "The robot hasn't called yet. Patience."
                        : call.status === 'ERROR'
                        ? 'The call failed before producing a transcript. Classic.'
                        : 'No transcript available.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
