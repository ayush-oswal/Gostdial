'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, RotateCcw, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUploadPresignedUrl } from '@/lib/api';
import { cn } from '@/lib/utils';

const MAX_DURATION = 60; // seconds

interface Props {
  onKeyChange: (key: string) => void;
}

type State = 'idle' | 'recording' | 'uploading' | 'done' | 'error';

export function AudioRecorder({ onKeyChange }: Props) {
  const [state, setState] = useState<State>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [uploadedKey, setUploadedKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await uploadBlob(blob);
      };

      recorder.start(100);
      setState('recording');
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= MAX_DURATION) {
            stopRecording();
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setErrorMsg('Microphone access denied. Please allow microphone and try again.');
      setState('error');
    }
  }

  async function uploadBlob(blob: Blob) {
    setState('uploading');
    try {
      const { url, key } = await getUploadPresignedUrl();

      const res = await fetch(url, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': 'audio/webm' },
      });

      if (!res.ok) throw new Error(`S3 upload failed (${res.status})`);

      setUploadedKey(key);
      onKeyChange(key);
      setState('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed');
      setState('error');
    }
  }

  function reset() {
    setState('idle');
    setElapsed(0);
    setErrorMsg('');
    setUploadedKey('');
    onKeyChange('');
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const progress = (elapsed / MAX_DURATION) * 100;

  return (
    <div
      className={cn(
        'w-full rounded-xl border px-4 py-3 transition-all duration-200',
        'bg-slate-50 dark:bg-slate-800/60',
        state === 'recording'
          ? 'border-red-400 dark:border-red-500'
          : state === 'done'
          ? 'border-green-400 dark:border-green-600'
          : state === 'error'
          ? 'border-red-300 dark:border-red-700'
          : 'border-slate-200 dark:border-slate-700',
      )}
    >
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            >
              <Mic size={13} />
              Record Audio
            </button>
            <span className="text-xs text-slate-400 dark:text-slate-500">Max 1 minute</span>
          </motion.div>
        )}

        {state === 'recording' && (
          <motion.div
            key="recording"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500 dark:text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Recording
              </span>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-300 ml-auto">
                {fmt(elapsed)} / {fmt(MAX_DURATION)}
              </span>
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-all hover:scale-105 active:scale-95"
              >
                <Square size={11} />
                Stop
              </button>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-red-500"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}

        {state === 'uploading' && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
          >
            <Loader2 size={14} className="animate-spin text-violet-500" />
            Uploading recording...
          </motion.div>
        )}

        {state === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <CheckCircle2 size={14} className="text-green-500 shrink-0" />
            <span className="text-xs text-slate-600 dark:text-slate-300 font-mono truncate flex-1">
              {uploadedKey}
            </span>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
            >
              <RotateCcw size={11} />
              Re-record
            </button>
          </motion.div>
        )}

        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <AlertCircle size={14} className="text-red-500 shrink-0" />
            <span className="text-xs text-red-600 dark:text-red-400 flex-1">{errorMsg}</span>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
            >
              <RotateCcw size={11} />
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
