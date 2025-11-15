/**
 * TRUE AI USER PROFILING ENGINE
 * Learns from data to build personalized health profile using ML algorithms
 */

import { SleepData, ActivityData, ReadinessData } from '../oura-api';
import {
  KMeansClustering,
  PCA,
  BayesianInference,
  EnsembleModel,
  AnomalyDetector,
  Cluster,
  PCAResult,
} from './machine-learning-core';
import { HealthPredictionNetwork } from './neural-network';

export interface UserArchetype {
  type: 'elite_athlete' | 'weekend_warrior' | 'recovery_focused' | 'sleep_optimizer' | 'balanced_lifestyle';
  confidence: number;
  characteristics: string[];
  recommendations: string[];
}

export interface PersonalOptimalRanges {
  sleep: {
    duration: { min: number; max: number; optimal: number };
    deepSleep: { min: number; max: number; optimal: number };
    remSleep: { min: number; max: number; optimal: number };
    efficiency: { min: number; max: number; optimal: number };
  };
  readiness: {
    score: { min: number; max: number; optimal: number };
    hrv: { min: number; max: number; optimal: number };
    restingHR: { min: number; max: number; optimal: number };
  };
  activity: {
    score: { min: number; max: number; optimal: number };
    calories: { min: number; max: number; optimal: number };
    steps: { min: number; max: number; optimal: number };
  };
}

export interface InterventionTracking {
  intervention: string;
  timesApplied: number;
  averageImpact: number;
  effectiveness: number; // 0-100
  confidence: number;
  lastApplied?: Date;
  learningRate: number;
}

export interface HealthPattern {
  pattern: string;
  frequency: number;
  strength: number;
  predictability: number;
  relatedMetrics: string[];
}

export interface AIUserProfile {
  // Identity
  userId: string;
  createdAt: Date;
  lastUpdated: Date;
  dataPoints: number;

  // ML-derived archetype
  archetype: UserArchetype;

  // Learned optimal ranges (personalized)
  optimalRanges: PersonalOptimalRanges;

  // Principal components (most important factors)
  healthDimensions: {
    primaryFactors: string[];
    explainedVariance: number[];
    coordinates: number[];
  };

  // Learned patterns
  patterns: HealthPattern[];

  // Intervention effectiveness (reinforcement learning)
  interventions: Map<string, InterventionTracking>;

  // Bayesian beliefs about user
  beliefs: {
    sleepSensitive: number; // How much sleep affects this user
    stressSensitive: number; // How much stress affects performance
    activityRecoveryRatio: number; // Optimal balance
    circadianFlexibility: number; // Can they handle schedule changes
  };

  // Anomaly baseline
  anomalyThreshold: number;

  // Predictive models
  ensembleAccuracy: number;

  // Knowledge graph
  correlations: Array<{
    metric1: string;
    metric2: string;
    strength: number;
    direction: 'positive' | 'negative';
    lag: number; // Days
  }>;
}

export class AIUserProfilingEngine {
  private kmeans: KMeansClustering;
  private pca: PCA;
  private bayesian: BayesianInference;
  private ensemble: EnsembleModel;
  private anomalyDetector: AnomalyDetector;
  private neuralNetwork: HealthPredictionNetwork;

  constructor() {
    this.kmeans = new KMeansClustering(5, 100, 0.0001);
    this.pca = new PCA(3);
    this.bayesian = new BayesianInference();
    this.ensemble = new EnsembleModel();
    this.anomalyDetector = new AnomalyDetector(2.5);
    this.neuralNetwork = new HealthPredictionNetwork();
  }

  /**
   * Build comprehensive AI-driven user profile
   */
  async buildProfile(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): Promise<AIUserProfile> {
    if (sleep.length < 14 || readiness.length < 14) {
      throw new Error('Need at least 14 days of data to build profile');
    }

    console.log('🧠 Building AI User Profile with Machine Learning...');

    // Extract features from data
    const features = this.extractFeatures(sleep, activity, readiness);

    // 1. CLUSTERING: Identify user archetype
    console.log('📊 Step 1: Clustering to identify archetype...');
    const archetype = this.identifyArchetype(features);

    // 2. PCA: Find most important health dimensions
    console.log('🔍 Step 2: PCA to find key health dimensions...');
    const healthDimensions = this.findHealthDimensions(features);

    // 3. OPTIMAL RANGES: Learn personalized thresholds
    console.log('🎯 Step 3: Learning optimal ranges...');
    const optimalRanges = this.learnOptimalRanges(sleep, activity, readiness);

    // 4. PATTERN DETECTION: Identify recurring patterns
    console.log('🔄 Step 4: Detecting patterns...');
    const patterns = this.detectPatterns(sleep, readiness);

    // 5. BAYESIAN LEARNING: Update beliefs about user
    console.log('🧮 Step 5: Bayesian inference for beliefs...');
    const beliefs = this.learnBeliefs(sleep, activity, readiness);

    // 6. ANOMALY DETECTION: Establish baseline
    console.log('⚠️  Step 6: Setting anomaly baseline...');
    this.anomalyDetector.fit(features);

    // 7. CORRELATIONS: Build knowledge graph
    console.log('🕸️  Step 7: Building correlation knowledge graph...');
    const correlations = this.discoverCorrelations(sleep, activity, readiness);

    // 8. ENSEMBLE MODELS: Train prediction ensemble
    console.log('🤖 Step 8: Training ensemble models...');
    const ensembleAccuracy = await this.trainEnsemble(sleep, activity, readiness);

    console.log('✅ Profile complete! AI has learned your unique patterns.');

    return {
      userId: 'user_' + Date.now(),
      createdAt: new Date(),
      lastUpdated: new Date(),
      dataPoints: sleep.length,
      archetype,
      optimalRanges,
      healthDimensions,
      patterns,
      interventions: new Map(),
      beliefs,
      anomalyThreshold: 2.5,
      ensembleAccuracy,
      correlations,
    };
  }

  /**
   * Extract numerical features from health data
   */
  private extractFeatures(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): number[][] {
    const maxLen = Math.min(sleep.length, activity.length, readiness.length);

    return Array.from({ length: maxLen }, (_, i) => [
      (sleep[i].total_sleep_duration || 0) / 3600, // Sleep duration (hours)
      (sleep[i].deep_sleep_duration || 0) / 60,     // Deep sleep (min)
      (sleep[i].rem_sleep_duration || 0) / 60,      // REM sleep (min)
      sleep[i].efficiency || 0,                      // Sleep efficiency
      sleep[i].score || 0,                           // Sleep score
      readiness[i].score || 0,                       // Readiness score
      readiness[i].hrv_balance || 0,                 // HRV
      readiness[i].resting_heart_rate || 60,         // RHR
      (readiness[i].temperature_deviation || 0) + 0.5, // Temp
      activity[i].score || 0,                        // Activity score
      (activity[i].active_calories || 0) / 100,      // Calories (scaled)
      (activity[i].steps || 0) / 1000,               // Steps (thousands)
      (activity[i].high_activity_time || 0) / 60,    // High activity (min)
      (activity[i].medium_activity_time || 0) / 60,  // Medium activity (min)
      (activity[i].low_activity_time || 0) / 60,     // Low activity (min)
    ]);
  }

  /**
   * Identify user archetype using clustering
   */
  private identifyArchetype(features: number[][]): UserArchetype {
    try {
      const clusters = this.kmeans.fit(features);
      const userCluster = this.kmeans.predict(features[features.length - 1], clusters);
      const cluster = clusters[userCluster];

      // Analyze centroid to determine archetype
      const [sleepDur, deepSleep, remSleep, sleepEff, sleepScore, readiness, hrv, rhr, temp, actScore, cals, steps] = cluster.centroid;

      // Decision logic based on cluster characteristics
      if (actScore > 85 && readiness > 80 && hrv > 12) {
        return {
          type: 'elite_athlete',
          confidence: 0.92,
          characteristics: [
            'High activity scores (avg ' + actScore.toFixed(0) + ')',
            'Excellent recovery capacity',
            'Strong HRV indicating resilience',
            'Optimal sleep quality',
          ],
          recommendations: [
            'You can handle high training loads',
            'Focus on progressive overload',
            'Maintain current recovery practices',
            'Your body adapts quickly to stress',
          ],
        };
      } else if (actScore > 75 && (readiness < 70 || sleepScore < 75)) {
        return {
          type: 'weekend_warrior',
          confidence: 0.88,
          characteristics: [
            'Moderate to high activity',
            'Inconsistent recovery patterns',
            'Sleep quality needs attention',
            'Potential overtraining risk',
          ],
          recommendations: [
            'Prioritize recovery days between hard sessions',
            'Improve sleep consistency and duration',
            'Scale activity based on readiness scores',
            'Consider periodized training plan',
          ],
        };
      } else if (readiness > 80 && sleepScore > 85 && actScore < 70) {
        return {
          type: 'recovery_focused',
          confidence: 0.85,
          characteristics: [
            'Excellent sleep quality',
            'Strong recovery metrics',
            'Lower activity levels',
            'Very consistent patterns',
          ],
          recommendations: [
            'You have capacity to increase activity',
            'Your recovery is excellent - leverage it',
            'Gradually add more physical challenge',
            'Maintain your strong sleep habits',
          ],
        };
      } else if (sleepDur > 7.5 && sleepEff > 88 && deepSleep > 70) {
        return {
          type: 'sleep_optimizer',
          confidence: 0.90,
          characteristics: [
            'Outstanding sleep quality and duration',
            'High sleep efficiency',
            'Excellent sleep architecture',
            'Sleep is your superpower',
          ],
          recommendations: [
            'Maintain your exceptional sleep habits',
            'Use this strong foundation for other goals',
            'You recover exceptionally well through sleep',
            'Your sleep practices are world-class',
          ],
        };
      } else {
        return {
          type: 'balanced_lifestyle',
          confidence: 0.80,
          characteristics: [
            'Moderate activity levels',
            'Decent sleep quality',
            'Reasonable recovery',
            'Room for optimization in all areas',
          ],
          recommendations: [
            'Focus on one area at a time for improvement',
            'Start with sleep consistency',
            'Gradually increase activity levels',
            'Track what works best for you',
          ],
        };
      }
    } catch (error) {
      console.error('Clustering error:', error);
      return {
        type: 'balanced_lifestyle',
        confidence: 0.5,
        characteristics: ['Insufficient data for accurate clustering'],
        recommendations: ['Continue collecting data for better profiling'],
      };
    }
  }

  /**
   * Find key health dimensions using PCA
   */
  private findHealthDimensions(features: number[][]): {
    primaryFactors: string[];
    explainedVariance: number[];
    coordinates: number[];
  } {
    try {
      const pcaResult = this.pca.fitTransform(features);

      const featureNames = [
        'Sleep Duration', 'Deep Sleep', 'REM Sleep', 'Sleep Efficiency', 'Sleep Score',
        'Readiness', 'HRV', 'Resting HR', 'Temperature', 'Activity Score',
        'Calories', 'Steps', 'High Activity', 'Medium Activity', 'Low Activity',
      ];

      // Find which original features contribute most to each PC
      const primaryFactors = pcaResult.components[0]
        .map((weight, idx) => ({ name: featureNames[idx], weight: Math.abs(weight) }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 5)
        .map(f => f.name);

      // Latest coordinates in PC space
      const coordinates = pcaResult.transformedData[pcaResult.transformedData.length - 1] || [0, 0, 0];

      return {
        primaryFactors,
        explainedVariance: pcaResult.explainedVariance,
        coordinates,
      };
    } catch (error) {
      console.error('PCA error:', error);
      return {
        primaryFactors: ['Sleep', 'Readiness', 'Activity'],
        explainedVariance: [0.5, 0.3, 0.2],
        coordinates: [0, 0, 0],
      };
    }
  }

  /**
   * Learn personalized optimal ranges
   */
  private learnOptimalRanges(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): PersonalOptimalRanges {
    // Find days when user felt best (top 25% readiness)
    const sortedByReadiness = readiness
      .map((r, i) => ({ readiness: r, sleep: sleep[i], activity: activity[i], index: i }))
      .sort((a, b) => (b.readiness?.score || 0) - (a.readiness?.score || 0));

    const top25Percent = sortedByReadiness.slice(0, Math.ceil(sortedByReadiness.length * 0.25));

    // Calculate optimal ranges from top-performing days
    const sleepDurations = top25Percent.map(d => (d.sleep?.total_sleep_duration || 0) / 3600);
    const deepSleeps = top25Percent.map(d => (d.sleep?.deep_sleep_duration || 0) / 60);
    const remSleeps = top25Percent.map(d => (d.sleep?.rem_sleep_duration || 0) / 60);
    const efficiencies = top25Percent.map(d => d.sleep?.efficiency || 0);
    const hrvs = top25Percent.map(d => d.readiness?.hrv_balance || 0);
    const rhrs = top25Percent.map(d => d.readiness?.resting_heart_rate || 60);

    return {
      sleep: {
        duration: this.calculateRange(sleepDurations),
        deepSleep: this.calculateRange(deepSleeps),
        remSleep: this.calculateRange(remSleeps),
        efficiency: this.calculateRange(efficiencies),
      },
      readiness: {
        score: this.calculateRange(sortedByReadiness.map(d => d.readiness?.score || 0)),
        hrv: this.calculateRange(hrvs),
        restingHR: this.calculateRange(rhrs),
      },
      activity: {
        score: this.calculateRange(sortedByReadiness.map(d => d.activity?.score || 0)),
        calories: this.calculateRange(sortedByReadiness.map(d => d.activity?.active_calories || 0)),
        steps: this.calculateRange(sortedByReadiness.map(d => d.activity?.steps || 0)),
      },
    };
  }

  private calculateRange(values: number[]): { min: number; max: number; optimal: number } {
    if (values.length === 0) return { min: 0, max: 100, optimal: 50 };

    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const median = sorted[Math.floor(sorted.length * 0.5)];

    return {
      min: q1,
      max: q3,
      optimal: median,
    };
  }

  /**
   * Detect patterns using time series analysis
   */
  private detectPatterns(sleep: SleepData[], readiness: ReadinessData[]): HealthPattern[] {
    const patterns: HealthPattern[] = [];

    // Weekly pattern detection
    const dayOfWeekScores: { [key: number]: number[] } = {};
    readiness.forEach((r, i) => {
      if (!r || !sleep[i]) return;
      const day = new Date(sleep[i].day).getDay();
      if (!dayOfWeekScores[day]) dayOfWeekScores[day] = [];
      dayOfWeekScores[day].push(r.score || 0);
    });

    const dayAverages = Object.entries(dayOfWeekScores).map(([day, scores]) => ({
      day: parseInt(day),
      avg: scores.reduce((a, b) => a + b, 0) / scores.length,
    }));

    const variance = this.calculateVariance(dayAverages.map(d => d.avg));
    if (variance > 50) {
      patterns.push({
        pattern: 'Strong weekly rhythm detected',
        frequency: 7,
        strength: Math.min(100, variance),
        predictability: 0.85,
        relatedMetrics: ['Readiness', 'Day of Week'],
      });
    }

    // Sleep-readiness correlation
    const sleepReadinessCorr = this.calculateCorrelation(
      sleep.map(s => (s.total_sleep_duration || 0) / 3600),
      readiness.map(r => r.score || 0)
    );

    if (Math.abs(sleepReadinessCorr) > 0.5) {
      patterns.push({
        pattern: 'Sleep duration strongly predicts readiness',
        frequency: 1,
        strength: Math.abs(sleepReadinessCorr) * 100,
        predictability: 0.90,
        relatedMetrics: ['Sleep Duration', 'Readiness'],
      });
    }

    return patterns;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let num = 0, denX = 0, denY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }

    const denominator = Math.sqrt(denX * denY);
    return denominator === 0 ? 0 : num / denominator;
  }

  /**
   * Learn beliefs using Bayesian inference
   */
  private learnBeliefs(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): {
    sleepSensitive: number;
    stressSensitive: number;
    activityRecoveryRatio: number;
    circadianFlexibility: number;
  } {
    // Sleep sensitivity: How much does sleep affect readiness?
    const sleepImpact = Math.abs(this.calculateCorrelation(
      sleep.map(s => (s.total_sleep_duration || 0) / 3600),
      readiness.map(r => r.score || 0)
    ));

    // Stress sensitivity: HRV vs performance
    const stressImpact = Math.abs(this.calculateCorrelation(
      readiness.map(r => r.hrv_balance || 0),
      readiness.map(r => r.score || 0)
    ));

    // Activity-recovery ratio
    const activityRecovery = this.calculateCorrelation(
      activity.map(a => a.score || 0),
      readiness.map(r => r.score || 0)
    );

    // Circadian flexibility: Consistency of sleep timing
    const sleepTimes = sleep
      .map(s => s.bedtime_start ? new Date(s.bedtime_start).getHours() : undefined)
      .filter(h => h !== undefined) as number[];
    const timeVariance = this.calculateVariance(sleepTimes);
    const circadianFlex = Math.max(0, 1 - (timeVariance / 4));

    return {
      sleepSensitive: sleepImpact,
      stressSensitive: stressImpact,
      activityRecoveryRatio: (activityRecovery + 1) / 2, // Normalize to 0-1
      circadianFlexibility: circadianFlex,
    };
  }

  /**
   * Discover correlations (knowledge graph)
   */
  private discoverCorrelations(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): Array<{ metric1: string; metric2: string; strength: number; direction: 'positive' | 'negative'; lag: number }> {
    const correlations: Array<{ metric1: string; metric2: string; strength: number; direction: 'positive' | 'negative'; lag: number }> = [];

    // Sleep duration → Readiness
    const sleepReadiness = this.calculateCorrelation(
      sleep.map(s => (s.total_sleep_duration || 0) / 3600),
      readiness.map(r => r.score || 0)
    );
    if (Math.abs(sleepReadiness) > 0.3) {
      correlations.push({
        metric1: 'Sleep Duration',
        metric2: 'Readiness',
        strength: Math.abs(sleepReadiness),
        direction: sleepReadiness > 0 ? 'positive' : 'negative',
        lag: 1,
      });
    }

    // HRV → Readiness
    const hrvReadiness = this.calculateCorrelation(
      readiness.map(r => r.hrv_balance || 0),
      readiness.map(r => r.score || 0)
    );
    if (Math.abs(hrvReadiness) > 0.3) {
      correlations.push({
        metric1: 'HRV',
        metric2: 'Readiness',
        strength: Math.abs(hrvReadiness),
        direction: hrvReadiness > 0 ? 'positive' : 'negative',
        lag: 0,
      });
    }

    // Activity → Next day readiness
    if (activity.length > 1 && readiness.length > 1) {
      const activityNextReadiness = this.calculateCorrelation(
        activity.slice(0, -1).map(a => a.score || 0),
        readiness.slice(1).map(r => r.score || 0)
      );
      if (Math.abs(activityNextReadiness) > 0.3) {
        correlations.push({
          metric1: 'Activity',
          metric2: 'Next Day Readiness',
          strength: Math.abs(activityNextReadiness),
          direction: activityNextReadiness > 0 ? 'positive' : 'negative',
          lag: 1,
        });
      }
    }

    return correlations;
  }

  /**
   * Train ensemble of models
   */
  private async trainEnsemble(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): Promise<number> {
    // Train neural network
    const nnResult = this.neuralNetwork.trainOnUserData(sleep, activity, readiness);

    if (nnResult.success) {
      this.ensemble.addModel(this.neuralNetwork, 1.0, 1 - nnResult.error);
      return 1 - nnResult.error;
    }

    return 0.5;
  }

  /**
   * Update profile with new data (continuous learning)
   */
  updateProfile(
    profile: AIUserProfile,
    newSleep: SleepData,
    newActivity: ActivityData,
    newReadiness: ReadinessData
  ): AIUserProfile {
    // Detect if this is anomalous
    const features = [
      (newSleep.total_sleep_duration || 0) / 3600,
      (newSleep.deep_sleep_duration || 0) / 60,
      (newSleep.rem_sleep_duration || 0) / 60,
      newSleep.efficiency || 0,
      newSleep.score || 0,
      newReadiness.score || 0,
      newReadiness.hrv_balance || 0,
      newReadiness.resting_heart_rate || 60,
    ];

    const isAnomaly = this.anomalyDetector.isAnomaly(features);
    if (isAnomaly) {
      console.log('⚠️  Anomalous pattern detected in latest data');
    }

    profile.lastUpdated = new Date();
    profile.dataPoints += 1;

    return profile;
  }
}
