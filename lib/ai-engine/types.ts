import { SleepData, ActivityData, ReadinessData } from '@/lib/oura-api';

// ==================== CORE TYPES ====================

export interface HealthData {
  sleep: SleepData[];
  activity: ActivityData[];
  readiness: ReadinessData[];
}

export interface UserProfile {
  id: string;
  baselines: PersonalBaselines;
  chronotype?: 'early' | 'intermediate' | 'late';
  preferences: {
    notificationThreshold: 'all' | 'important' | 'critical';
    tonePreference: 'clinical' | 'friendly' | 'motivational';
  };
  historicalData: {
    totalDays: number;
    firstRecordDate: string;
    lastUpdate: string;
  };
}

export interface PersonalBaselines {
  sleep: {
    averageScore: number;
    optimalDuration: number; // in hours
    typicalBedtime: number; // hour of day
    typicalWakeTime: number; // hour of day
    efficiency: number;
  };
  activity: {
    averageScore: number;
    typicalSteps: number;
    typicalCalories: number;
  };
  readiness: {
    averageScore: number;
    restingHR: number;
    hrvRange: { min: number; max: number };
    temperatureDeviation: number;
  };
  volatility: {
    sleepConsistency: number;
    activityConsistency: number;
    readinessConsistency: number;
  };
}

// ==================== STATISTICAL TYPES ====================

export interface TimeSeriesPoint {
  date: string;
  value: number;
  predicted?: number;
  anomaly?: boolean;
  confidence?: number;
}

export interface StatisticalResult {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  percentile25: number;
  percentile75: number;
  iqr: number;
  skewness: number;
  kurtosis: number;
}

export interface TrendAnalysis {
  slope: number;
  intercept: number;
  rSquared: number;
  pValue: number;
  significant: boolean;
  direction: 'improving' | 'declining' | 'stable';
  strength: 'strong' | 'moderate' | 'weak';
  confidenceInterval: { lower: number; upper: number };
}

export interface CorrelationResult {
  coefficient: number;
  pValue: number;
  significant: boolean;
  strength: 'very_strong' | 'strong' | 'moderate' | 'weak' | 'negligible';
  interpretation: string;
}

export interface AnomalyDetectionResult {
  anomalies: Array<{
    date: string;
    value: number;
    zScore: number;
    severity: 'extreme' | 'moderate' | 'mild';
    type: 'high' | 'low';
  }>;
  totalAnomalies: number;
  anomalyRate: number;
}

// ==================== PATTERN TYPES ====================

export interface Pattern {
  type: 'cyclical' | 'cascading' | 'compensatory' | 'progressive' | 'deteriorating' | 'synergistic';
  confidence: number;
  description: string;
  evidence: Array<{
    metric: string;
    observation: string;
    significance: number;
  }>;
  implications: string[];
  recommendations: string[];
}

export interface CircadianAnalysis {
  chronotype: 'early' | 'intermediate' | 'late';
  confidence: number;
  averageSleepMidpoint: number; // hour of day
  consistencyScore: number;
  socialJetLag: number; // hours difference weekday vs weekend
  recommendations: string[];
}

export interface RecoveryAnalysis {
  currentState: 'recovered' | 'recovering' | 'strained' | 'exhausted';
  recoveryDebt: number; // days of deficit
  estimatedRecoveryTime: number; // days needed
  acuteWorkload: number;
  chronicWorkload: number;
  acuteChronicRatio: number;
  overtrainingRisk: 'high' | 'moderate' | 'low';
  recommendations: string[];
}

// ==================== PREDICTION TYPES ====================

export interface HealthPrediction {
  metric: 'sleep' | 'activity' | 'readiness' | 'overall';
  predictions: Array<{
    date: string;
    predicted: number;
    confidence: number;
    range: { lower: number; upper: number };
  }>;
  accuracy: {
    mae: number; // mean absolute error
    mape: number; // mean absolute percentage error
    rmse: number; // root mean squared error
  };
  scenarios: {
    best: number;
    expected: number;
    worst: number;
  };
}

export interface IllnessPrediction {
  riskLevel: 'high' | 'moderate' | 'low' | 'minimal';
  riskScore: number; // 0-100
  confidence: number;
  indicators: Array<{
    metric: string;
    deviation: number;
    contribution: number;
  }>;
  earlyWarningSignals: string[];
  recommendations: string[];
  timeline: '24h' | '48h' | '72h' | 'week';
}

// ==================== INSIGHT TYPES ====================

export interface AdvancedInsight {
  id: string;
  timestamp: string;
  category: 'sleep' | 'activity' | 'readiness' | 'recovery' | 'performance' | 'health_risk';
  priority: 'critical' | 'high' | 'medium' | 'low';

  title: string;
  summary: string;
  narrative: string;

  confidence: number;
  evidenceStrength: 'conclusive' | 'strong' | 'moderate' | 'preliminary';

  dataPoints: Array<{
    metric: string;
    value: number;
    baseline?: number;
    percentile?: number;
    trend?: 'up' | 'down' | 'stable';
  }>;

  patterns: Pattern[];
  predictions?: HealthPrediction;

  actionPlan: {
    immediate: string[];
    shortTerm: string[]; // next 3-7 days
    longTerm: string[]; // beyond 7 days
    priority: number;
  };

  expectedOutcome: string;
  timeframeToImprovement: string;

  relatedInsights?: string[]; // IDs of related insights
  scientificBasis?: string[];
}

export interface HolisticHealthReport {
  overallScore: number;
  timestamp: string;

  systemsHealth: {
    nervous: { score: number; status: string; concerns: string[] };
    cardiovascular: { score: number; status: string; concerns: string[] };
    metabolic: { score: number; status: string; concerns: string[] };
    recovery: { score: number; status: string; concerns: string[] };
    cognitive: { score: number; status: string; concerns: string[] };
  };

  keyFindings: AdvancedInsight[];
  priorityActions: string[];

  resilience: {
    score: number;
    interpretation: string;
    factors: Array<{ factor: string; impact: number }>;
  };

  optimization: {
    topOpportunity: string;
    potentialGain: string;
    effort: 'low' | 'medium' | 'high';
  };
}

// ==================== ML TYPES ====================

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc?: number;
  confusionMatrix?: number[][];
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  rank: number;
}

// ==================== ANALYSIS OPTIONS ====================

export interface AnalysisOptions {
  minDataPoints?: number;
  significanceLevel?: number; // for statistical tests, default 0.05
  anomalyThreshold?: number; // z-score threshold, default 2.5
  predictionHorizon?: number; // days ahead, default 7
  enableAdvancedModels?: boolean;
  enablePersonalization?: boolean;
  verboseNarrative?: boolean;
}
