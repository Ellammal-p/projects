import api from './axios';

export interface PHQ9Question {
  id: number;
  order: number;
  text: string;
}

export interface PHQ9Answer {
  question_number: number;
  question_text: string;
  selected_option: number;
}

export interface PHQ9Assessment {
  id: number;
  total_score: number;
  risk_category: string;
  ml_prediction: string;
  ml_confidence: number;
  created_at: string;
  answers: PHQ9Answer[];
}

export const phq9Api = {
  getQuestions: async (): Promise<PHQ9Question[]> => {
    const res = await api.get('/phq9/questions/');
    return res.data;
  },

  submitAssessment: async (answers: { question_number: number; selected_option: number }[]): Promise<PHQ9Assessment> => {
    const res = await api.post('/phq9/submit/', { answers });
    return res.data;
  },

  getHistory: async (): Promise<PHQ9Assessment[]> => {
    const res = await api.get('/phq9/history/');
    return res.data;
  },

  getDetail: async (id: number): Promise<PHQ9Assessment> => {
    const res = await api.get(`/phq9/${id}/`);
    return res.data;
  },
};
