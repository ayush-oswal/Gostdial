export type CallStatus = 'PENDING' | 'SENT' | 'ERROR';

export interface Call {
  id: number;
  to: string;
  prompt: string;
  humanNumber: string | null;
  transcription: string | null;
  recordingFile: string | null;
  callRecordingKey: string | null;
  language: string | null;
  status: CallStatus;
  scheduledTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse {
  total: number;
  page: number;
  pageSize: number;
  items: Call[];
}

export interface CreateCallPayload {
  to: string;
  prompt: string;
  scheduledTime: string;
  humanNumber?: string;
  language?: string;
  recordingFile?: string;
}
