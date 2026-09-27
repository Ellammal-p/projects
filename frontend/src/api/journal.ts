import api from './axios';

export interface JournalEntryItem {
  id: number;
  title: string;
  content: string;
  sentiment_score: number;
  sentiment_label: string;
  created_at: string;
}

export const journalApi = {
  getEntries: async (): Promise<JournalEntryItem[]> => {
    const res = await api.get('/journal/');
    return res.data;
  },
  createEntry: async (data: { title: string; content: string }): Promise<JournalEntryItem> => {
    const res = await api.post('/journal/', data);
    return res.data;
  }
};

