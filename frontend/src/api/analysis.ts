import api from './axios';

export interface ModelMetricItem {
  model_name: string;
  accuracy: number;
  precision_weighted?: number;
  recall_weighted?: number;
  f1_weighted: number;
  f1_macro: number;
  roc_auc?: number;
  confusion_matrix?: number[][];
}

export interface ModelMetricsResponse {
  logistic_regression: ModelMetricItem;
  random_forest: ModelMetricItem;
  mlp: ModelMetricItem;
  lstm: ModelMetricItem;
  bert: ModelMetricItem;
  multimodal_fusion: ModelMetricItem;
}

export interface MultimodalAnalysisRequest {
  answers?: number[];
  journal_text?: string;
}

export interface MultimodalAnalysisResponse {
  id: number;
  risk_label: string;
  risk_class: number;
  confidence: number;
  description: string;
  signals: {
    phq9_contribution_pct: number;
    mood_trend_contribution_pct: number;
    journal_nlp_contribution_pct: number;
    phq9_total_score: number;
    recent_7day_mood_avg: number;
    mood_trajectory: string;
    journal_signal_intensity: number;
  };
  disclaimer: string;
  created_at: string;
}

export const analysisApi = {
  getBenchmarks: async (): Promise<ModelMetricsResponse> => {
    const res = await api.get('/models/benchmarks/');
    return res.data;
  },

  runAnalysis: async (data: MultimodalAnalysisRequest): Promise<MultimodalAnalysisResponse> => {
    const res = await api.post('/analyze/', data);
    return res.data;
  }
};
