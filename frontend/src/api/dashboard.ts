import api from './axios';

export interface DashboardSummaryResponse {
  phq9_score: number;
  screening_band: string;
  mood_today: number | null;
  mood_7day_avg: number;
  recent_journals: Array<{
    id: number;
    title: string;
    content: string;
    sentiment_label: string;
    created_at: string;
  }>;
  recent_assessments: Array<{
    id: number;
    total_score: number;
    risk_category: string;
    created_at: string;
  }>;
  recent_predictions: Array<{
    id: number;
    risk_label: string;
    confidence: number;
    created_at: string;
  }>;
  disclaimer: string;
}

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummaryResponse> => {
    const res = await api.get('/dashboard/');
    return res.data;
  },
};
