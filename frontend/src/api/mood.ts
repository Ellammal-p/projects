import api from './axios';

export interface MoodEntry {
  id: number;
  user: number;
  mood_score: number;
  mood_display: string;
  note: string;
  created_at: string;
}

export interface MoodDistributionItem {
  score: number;
  label: string;
  count: number;
}

export interface MoodStats {
  total_entries: number;
  today_entry: MoodEntry | null;
  avg_overall: number | null;
  avg_7days: number | null;
  avg_30days: number | null;
  history_7days: MoodEntry[];
  history_30days: MoodEntry[];
  mood_distribution: MoodDistributionItem[];
}

export interface CreateMoodEntryInput {
  mood_score: number;
  note?: string;
}

export interface UpdateMoodEntryInput {
  mood_score?: number;
  note?: string;
}

export const moodApi = {
  getEntries: async (): Promise<MoodEntry[]> => {
    const response = await api.get('/mood/');
    return response.data;
  },

  getStats: async (): Promise<MoodStats> => {
    const response = await api.get('/mood/stats/');
    return response.data;
  },

  createEntry: async (data: CreateMoodEntryInput): Promise<MoodEntry> => {
    const response = await api.post('/mood/', data);
    return response.data;
  },

  updateEntry: async (id: number, data: UpdateMoodEntryInput): Promise<MoodEntry> => {
    const response = await api.patch(`/mood/${id}/`, data);
    return response.data;
  },

  deleteEntry: async (id: number): Promise<void> => {
    await api.delete(`/mood/${id}/`);
  },
};
