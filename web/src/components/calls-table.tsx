'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, AlertTriangle, Inbox } from 'lucide-react';
import { getCalls } from '@/lib/api';
import { Call, CallStatus, PaginatedResponse } from '@/lib/types';
import { formatDateShortTZ, cn } from '@/lib/utils';
import { CallModal } from './call-modal';

const PAGE_SIZE = 10;

const TABS: { label: string; status: CallStatus }[] = [
  { label: 'Pending', status: 'PENDING' },
  { label: 'Sent', status: 'SENT' },
  { label: 'Error', status: 'ERROR' },
];

const STATUS_BADGE = {
  PENDING: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  SENT:    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  ERROR:   'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
};

const STATUS_DOT = {
  PENDING: 'bg-amber-400',
  SENT:    'bg-green-400',
  ERROR:   'bg-red-400',
};

const EMPTY_MESSAGES = {
  PENDING: { title: "Queue's clear.", sub: "Either you're really social, or really procrastinating. Add a call above." },
  SENT:    { title: 'Nothing dispatched yet.', sub: "The robots are waiting. Don't leave them idle — they get existential." },
  ERROR:   { title: 'Zero errors!', sub: "The robot is having a suspiciously good day. Check back later." },
};

interface Props {
  refreshKey: number;
  timezone: string;
}

export function CallsTable({ refreshKey, timezone }: Props) {
  const [activeTab, setActiveTab] = useState<CallStatus>('PENDING');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getCalls({ page, pageSize: PAGE_SIZE, status: activeTab });
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load calls');
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  // Reset to page 0 when tab changes
  useEffect(() => { setPage(0); }, [activeTab]);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <>
      <CallModal call={selectedCall} timezone={timezone} onClose={() => setSelectedCall(null)} />

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        {/* Tabs header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0 border-b border-slate-100 dark:border-slate-800">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.status}
                onClick={() => setActiveTab(tab.status)}
                className={cn(
                  'relative px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors',
                  activeTab === tab.status
                    ? 'text-violet-700 dark:text-violet-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300',
                )}
              >
                {tab.label}
                {activeTab === tab.status && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400 rounded-full"
                    transition={{ duration: 0.25 }}
                  />
                )}
              </button>
            ))}
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mb-2 disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Table area */}
        <div className="relative min-h-[280px]">
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
              >
                <Loader2 size={28} className="animate-spin text-violet-500" />
              </motion.div>
            )}
          </AnimatePresence>

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <AlertTriangle size={28} className="text-red-400" />
              <div className="text-sm font-medium text-red-600 dark:text-red-400">{error}</div>
              <button onClick={load} className="text-xs text-violet-600 dark:text-violet-400 hover:underline">
                Try again
              </button>
            </div>
          )}

          {!loading && !error && data && data.items.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-3"
            >
              <Inbox size={36} className="text-slate-300 dark:text-slate-700" />
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {EMPTY_MESSAGES[activeTab].title}
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-600 max-w-xs text-center">
                {EMPTY_MESSAGES[activeTab].sub}
              </div>
            </motion.div>
          )}

          {!error && data && data.items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    {['#', 'Phone', 'Language', 'Scheduled', 'Created', 'Status'].map((col) => (
                      <th
                        key={col}
                        className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {data.items.map((call, i) => (
                      <motion.tr
                        key={call.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.04 }}
                        onClick={() => setSelectedCall(call)}
                        className="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4 text-sm font-mono text-slate-400 dark:text-slate-500">
                          {call.id}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors whitespace-nowrap">
                          {call.to}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {call.language || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {formatDateShortTZ(call.scheduledTime, timezone)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-500 whitespace-nowrap">
                          {formatDateShortTZ(call.createdAt, timezone)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border', STATUS_BADGE[call.status])}>
                            <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_DOT[call.status])} />
                            {call.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && data.total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Showing{' '}
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, data.total)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-slate-600 dark:text-slate-300">{data.total}</span>{' '}
              calls
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 min-w-[60px] text-center">
                {page + 1} / {totalPages || 1}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || loading}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
