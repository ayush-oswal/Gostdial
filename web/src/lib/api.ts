import type { Call, CreateCallPayload, PaginatedResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getCalls(params: {
  page?: number;
  pageSize?: number;
  status?: string;
}): Promise<PaginatedResponse> {
  const sp = new URLSearchParams();
  if (params.page !== undefined) sp.set('page', String(params.page));
  if (params.pageSize !== undefined) sp.set('pageSize', String(params.pageSize));
  if (params.status) sp.set('status', params.status);

  const res = await fetch(`${API_BASE}/calls?${sp.toString()}`, {
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Failed to fetch calls: ${res.statusText}`);
  return res.json();
}

export async function getUploadPresignedUrl(): Promise<{ url: string; fields: Record<string, string>; key: string; max_bytes: number }> {
  const res = await fetch(`${API_BASE}/upload/presigned-url`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail || 'Failed to get upload URL');
  }
  return res.json();
}

export async function createCall(payload: CreateCallPayload): Promise<Call> {
  const res = await fetch(`${API_BASE}/calls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail || `Failed to create call: ${res.statusText}`);
  }

  return res.json();
}
