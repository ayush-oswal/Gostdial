import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatInTimeZone } from 'date-fns-tz';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTZ(date: string | Date, timezone: string) {
  return formatInTimeZone(new Date(date), timezone, 'MMM dd, yyyy HH:mm');
}

export function formatDateShortTZ(date: string | Date, timezone: string) {
  return formatInTimeZone(new Date(date), timezone, 'MMM dd, HH:mm');
}
