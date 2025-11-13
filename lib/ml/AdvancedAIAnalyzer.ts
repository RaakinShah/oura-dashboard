/**
 * Advanced AI Analyzer - Integrates all ML models for comprehensive health analysis
 */

import { NeuralNetwork } from './NeuralNetwork';
import { TimeSeriesForecast, TimeSeriesData } from './TimeSeries';
import { KMeans, DBSCAN } from './Clustering';
import { LinearRegression, PolynomialRegression } from './Regression';
import { AnomalyDetector, TrendAnalyzer, PatternRecognizer, Pattern } from './PatternRecognition';

export interface HealthMetrics {
  sleep: {
    duration: number;
    deep: number;
    rem: number;
    efficiency: number;
    hrv: number;
  };
  activity: {
    steps: number;
    calories: number;
    met: number;
    intensity: number;
  };
  readiness: {
    score: number;
    temperature: number;
    restingHr: number;
  };
}

export interface Prediction {
  metric: string;
  predicted: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendStrength: number;
}

export interface Insight {
  type: 'pattern' | 'anomaly' | 'recommendation' | 'prediction';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  confidence: number;
  data?: any;
}

export class AdvancedAIAnalyzer {
  private sleepNN: NeuralNetwork;
  private activityNN: NeuralNetwork;
  private readinessNN: NeuralNetwork;
  private timeSeries: TimeSeriesForecast;
  private anomalyDetector: AnomalyDetector;
  private trendAnalyzer: TrendAnalyzer;
  private patternRecognizer: PatternRecognizer;
  private historicalData: HealthMetrics[] = [];

  constructor() {
    // Initialize neural networks for different metrics
    this.sleepNN = new NeuralNetwork({
      inputSize: 10,
      hiddenLayers: [20, 15, 10],
      outputSize: 5,
      learningRate: 0.01,
      activation: 'relu',
    });

    this.activityNN = new NeuralNetwork({
      inputSize: 8,
      hiddenLayers: [16, 12, 8],
      outputSize: 4,
      learningRate: 0.01,
      activation: 'relu',
    });

    this.readinessNN = new NeuralNetwork({
      inputSize: 12,
      hiddenLayers: [24, 18, 12],
      outputSize: 3,
      learningRate: 0.01,
      activation: 'sigmoid',
    });

    this.timeSeries = new TimeSeriesForecast(7); // Weekly seasonality
    this.anomalyDetector = new AnomalyDetector(2.5);
    this.trendAnalyzer = new TrendAnalyzer();
    this.patternRecognizer = new PatternRecognizer(0.75);

    this.initializePatterns();
  }

  private initializePatterns() {
    // Define common health patterns
    this.patternRecognizer.addPattern({
      id: 'excellent_sleep',
      features: [8.5, 1.5, 2.0, 0.95, 75],
      label: 'Excellent Sleep Pattern',
      confidence: 1.0,
    });

    this.patternRecognizer.addPattern({
      id: 'sleep_deprivation',
      features: [5.5, 0.5, 0.8, 0.75, 45],
      label: 'Sleep Deprivation Pattern',
      confidence: 1.0,
    });

    this.patternRecognizer.addPattern({
      id: 'overtraining',
      features: [12000, 800, 4.5, 8],
      label: 'Overtraining Pattern',
      confidence: 1.0,
    });

    this.patternRecognizer.addPattern({
      id: 'optimal_recovery',
      features: [85, 36.5, 55],
      label: 'Optimal Recovery Pattern',
      confidence: 1.0,
    });
  }

  addData(data: HealthMetrics) {
    this.historicalData.push(data);

    // Update time series with readiness scores
    this.timeSeries.addData([{
      timestamp: Date.now(),
      value: data.readiness.score,
    }]);

    // Train anomaly detector if we have enough data
    if (this.historicalData.length >= 30) {
      const features = this.historicalData.map(d => [
        d.sleep.duration,
        d.sleep.deep,
        d.sleep.rem,
        d.sleep.efficiency,
        d.activity.steps,
        d.activity.calories,
        d.readiness.score,
      ]);
      this.anomalyDetector.train(features);
    }
  }

  /**
   * Comprehensive analysis of current health state
   */
  analyze(currentMetrics: HealthMetrics): Insight[] {
    const insights: Insight[] = [];

    // Pattern recognition
    const sleepPattern = this.patternRecognizer.recognize([
      currentMetrics.sleep.duration,
      currentMetrics.sleep.deep,
      currentMetrics.sleep.rem,
      currentMetrics.sleep.efficiency,
      currentMetrics.sleep.hrv,
    ]);

    if (sleepPattern) {
      insights.push({
        type: 'pattern',
        severity: sleepPattern.label.includes('Excellent') ? 'low' : 'high',
        title: `${sleepPattern.label} Detected`,
        description: `Your sleep metrics match the "${sleepPattern.label}" with ${(sleepPattern.confidence * 100).toFixed(1)}% confidence.`,
        confidence: sleepPattern.confidence,
        data: sleepPattern,
      });
    }

    // Anomaly detection
    if (this.historicalData.length >= 30) {
      const features = [
        currentMetrics.sleep.duration,
        currentMetrics.sleep.deep,
        currentMetrics.sleep.rem,
        currentMetrics.sleep.efficiency,
        currentMetrics.activity.steps,
        currentMetrics.activity.calories,
        currentMetrics.readiness.score,
      ];

      const anomaly = this.anomalyDetector.detect(features);
      
      if (anomaly.isAnomaly) {
        const dimensionNames = ['Sleep Duration', 'Deep Sleep', 'REM Sleep', 
          'Sleep Efficiency', 'Steps', 'Calories', 'Readiness'];
        
        const affectedMetrics = anomaly.dimensions.map(i => dimensionNames[i]).join(', ');

        insights.push({
          type: 'anomaly',
          severity: anomaly.score > 3 ? 'high' : 'medium',
          title: 'Unusual Metrics Detected',
          description: `Anomalous values detected in: ${affectedMetrics}. Z-score: ${anomaly.score.toFixed(2)}`,
          confidence: Math.min(anomaly.score / 3, 1),
          data: anomaly,
        });
      }
    }

    // Trend analysis
    if (this.historicalData.length >= 7) {
      const recentReadiness = this.historicalData
        .slice(-14)
        .map(d => d.readiness.score);

      const trend = this.trendAnalyzer.detectTrend(recentReadiness);
      const strength = this.trendAnalyzer.trendStrength(recentReadiness);

      if (strength > 0.5) {
        insights.push({
          type: 'pattern',
          severity: trend === 'decreasing' ? 'high' : 'low',
          title: `${trend.charAt(0).toUpperCase() + trend.slice(1)} Readiness Trend`,
          description: `Your readiness score is ${trend} with ${(strength * 100).toFixed(0)}% consistency over the past 2 weeks.`,
          confidence: strength,
          data: { trend, strength },
        });
      }
    }

    // Predictions
    const predictions = this.predictNext7Days();
    
    if (predictions.length > 0) {
      const avgPredictedReadiness = predictions
        .map(p => p.predicted)
        .reduce((a, b) => a + b, 0) / predictions.length;

      const currentAvg = this.historicalData
        .slice(-7)
        .reduce((sum, d) => sum + d.readiness.score, 0) / 7;

      if (avgPredictedReadiness < currentAvg * 0.9) {
        insights.push({
          type: 'prediction',
          severity: 'medium',
          title: 'Declining Readiness Forecasted',
          description: `AI predicts your average readiness may drop to ${avgPredictedReadiness.toFixed(0)} over the next week.`,
          confidence: 0.75,
          data: predictions,
        });
      }
    }

    // Recommendations based on AI analysis
    insights.push(...this.generateRecommendations(currentMetrics));

    return insights.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Predict next 7 days
   */
  predictNext7Days(): Prediction[] {
    if (this.historicalData.length < 14) return [];

    const predictions: Prediction[] = [];

    // Predict readiness
    const readinessData = this.historicalData.map(d => d.readiness.score);
    const readinessForecast = this.timeSeries.holtWintersForecast(7);
    const readinessTrend = this.trendAnalyzer.detectTrend(readinessData.slice(-14));
    const readinessTrendStrength = this.trendAnalyzer.trendStrength(readinessData.slice(-14));

    for (let i = 0; i < 7; i++) {
      predictions.push({
        metric: `readiness_day_${i + 1}`,
        predicted: readinessForecast[i],
        confidence: Math.max(0.6, 1 - i * 0.05),
        trend: readinessTrend,
        trendStrength: readinessTrendStrength,
      });
    }

    return predictions;
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(metrics: HealthMetrics): Insight[] {
    const recommendations: Insight[] = [];

    // Sleep recommendations
    if (metrics.sleep.duration < 7) {
      recommendations.push({
        type: 'recommendation',
        severity: 'high',
        title: 'Increase Sleep Duration',
        description: `You're getting ${metrics.sleep.duration.toFixed(1)} hours of sleep. Aim for 7-9 hours for optimal recovery.`,
        confidence: 0.9,
      });
    }

    if (metrics.sleep.deep < 1.0) {
      recommendations.push({
        type: 'recommendation',
        severity: 'medium',
        title: 'Improve Deep Sleep Quality',
        description: 'Low deep sleep detected. Consider reducing caffeine intake and maintaining a consistent sleep schedule.',
        confidence: 0.8,
      });
    }

    // Activity recommendations
    if (metrics.activity.steps < 5000) {
      recommendations.push({
        type: 'recommendation',
        severity: 'medium',
        title: 'Increase Daily Activity',
        description: 'Current step count is below recommended levels. Try to reach 7,000-10,000 steps daily.',
        confidence: 0.85,
      });
    }

    // Recovery recommendations
    if (metrics.readiness.score < 70) {
      recommendations.push({
        type: 'recommendation',
        severity: 'high',
        title: 'Focus on Recovery',
        description: 'Low readiness score indicates your body needs recovery. Consider lighter activity today.',
        confidence: 0.9,
      });
    }

    return recommendations;
  }

  /**
   * Train models with historical data
   */
  trainModels() {
    if (this.historicalData.length < 30) {
      console.warn('Not enough data for training. Need at least 30 days.');
      return;
    }

    // Prepare training data for sleep prediction
    const sleepInputs: number[][] = [];
    const sleepTargets: number[][] = [];

    for (let i = 7; i < this.historicalData.length; i++) {
      const features = [];
      
      // Use past 7 days as features
      for (let j = 0; j < 7; j++) {
        const d = this.historicalData[i - 7 + j];
        features.push(d.sleep.duration, d.activity.steps / 1000);
      }

      sleepInputs.push(features);
      
      const target = this.historicalData[i].sleep;
      sleepTargets.push([
        target.duration,
        target.deep,
        target.rem,
        target.efficiency,
        target.hrv,
      ]);
    }

    // Train neural network
    this.sleepNN.train(sleepInputs, sleepTargets, 500);

    console.log('Models trained successfully');
  }

  /**
   * Get health score (0-100)
   */
  getHealthScore(metrics: HealthMetrics): number {
    let score = 0;

    // Sleep score (40% weight)
    const sleepScore = (
      Math.min(metrics.sleep.duration / 8, 1) * 0.4 +
      Math.min(metrics.sleep.deep / 1.5, 1) * 0.3 +
      Math.min(metrics.sleep.rem / 2, 1) * 0.2 +
      metrics.sleep.efficiency * 0.1
    ) * 40;

    // Activity score (30% weight)
    const activityScore = (
      Math.min(metrics.activity.steps / 10000, 1) * 0.5 +
      Math.min(metrics.activity.calories / 2500, 1) * 0.3 +
      Math.min(metrics.activity.met / 5, 1) * 0.2
    ) * 30;

    // Readiness score (30% weight)
    const readinessScore = metrics.readiness.score * 0.3;

    score = sleepScore + activityScore + readinessScore;

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * Export model state
   */
  exportModels(): string {
    return JSON.stringify({
      sleepNN: this.sleepNN.save(),
      activityNN: this.activityNN.save(),
      readinessNN: this.readinessNN.save(),
      historicalData: this.historicalData,
    });
  }

  /**
   * Import model state
   */
  importModels(data: string) {
    const parsed = JSON.parse(data);
    this.sleepNN.load(parsed.sleepNN);
    this.activityNN.load(parsed.activityNN);
    this.readinessNN.load(parsed.readinessNN);
    this.historicalData = parsed.historicalData;

    // Retrain anomaly detector with loaded data
    if (this.historicalData.length >= 30) {
      const features = this.historicalData.map(d => [
        d.sleep.duration,
        d.sleep.deep,
        d.sleep.rem,
        d.sleep.efficiency,
        d.activity.steps,
        d.activity.calories,
        d.readiness.score,
      ]);
      this.anomalyDetector.train(features);
    }
  }
}
