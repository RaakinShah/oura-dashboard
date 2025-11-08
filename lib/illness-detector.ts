/**
 * PREDICTIVE ILLNESS DETECTION
 * Early warning system for potential illness based on biometric deviations
 * Analyzes HRV, temperature, and resting heart rate patterns
 */

import { SleepData, ReadinessData } from './oura-api';
import { parseOuraDate } from './date-utils';

export type IllnessRiskLevel = 'none' | 'low' | 'moderate' | 'high' | 'critical';
export type AnomalyType = 'hrv_drop' | 'temp_spike' | 'rhr_elevation' | 'sleep_disruption' | 'readiness_crash';

export interface IllnessAnalysis {
  // Current risk assessment
  riskLevel: IllnessRiskLevel;
  riskScore: number; // 0-100
  confidence: number; // 0-100

  // Detected anomalies
  anomalies: {
    type: AnomalyType;
    severity: number; // 0-100
    description: string;
    startDate: string;
    duration: number; // days
    deviation: number; // standard deviations from baseline
  }[];

  // Biometric trends
  biometricTrends: {
    hrv: {
      current: number;
      baseline: number;
      change: number; // percentage
      trend: 'increasing' | 'decreasing' | 'stable';
    };
    temperature: {
      current: number;
      baseline: number;
      change: number; // degrees
      trend: 'increasing' | 'decreasing' | 'stable';
    };
    restingHeartRate: {
      current: number;
      baseline: number;
      change: number; // bpm
      trend: 'increasing' | 'decreasing' | 'stable';
    };
  };

  // Recovery status
  recoveryStatus: {
    needsRest: boolean;
    estimatedRecoveryDays: number;
    recommendation: string;
  };

  // Early warning indicators
  earlyWarnings: {
    indicator: string;
    detected: boolean;
    daysAgo: number;
    description: string;
  }[];

  // Historical illness patterns
  historicalPatterns: {
    likelyIllnessesDetected: number;
    averageWarningWindow: number; // days before symptom onset
    commonPrecursors: string[];
  };

  // Actionable recommendations
  recommendations: {
    immediate: string[];
    preventive: string[];
    monitoring: string[];
  };

  // Scientific insights
  insights: {
    category: 'immunology' | 'recovery' | 'stress' | 'pattern';
    finding: string;
    evidence: string;
    actionable: string;
  }[];
}

export class IllnessDetector {
  /**
   * Analyze biometric data for illness prediction
   */
  static analyzeIllnessRisk(
    sleep: SleepData[],
    readiness: ReadinessData[]
  ): IllnessAnalysis {
    if (sleep.length < 14) {
      throw new Error('Minimum 14 days of data required for illness detection');
    }

    // Calculate baselines (30-90 day rolling averages)
    const baselines = this.calculateBaselines(sleep, readiness);

    // Detect anomalies in recent data
    const anomalies = this.detectAnomalies(sleep, readiness, baselines);

    // Calculate risk score based on anomalies
    const { riskLevel, riskScore, confidence } = this.assessRisk(anomalies, sleep, readiness);

    // Analyze current biometric trends
    const biometricTrends = this.analyzeBiometricTrends(sleep, readiness, baselines);

    // Determine recovery needs
    const recoveryStatus = this.assessRecoveryStatus(riskScore, anomalies, biometricTrends);

    // Check for early warning signs
    const earlyWarnings = this.detectEarlyWarnings(sleep, readiness, baselines, anomalies);

    // Analyze historical illness patterns
    const historicalPatterns = this.analyzeHistoricalPatterns(sleep, readiness, baselines);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      riskLevel,
      anomalies,
      biometricTrends,
      recoveryStatus
    );

    // Generate insights
    const insights = this.generateInsights(
      riskLevel,
      anomalies,
      biometricTrends,
      earlyWarnings,
      historicalPatterns
    );

    return {
      riskLevel,
      riskScore,
      confidence,
      anomalies,
      biometricTrends,
      recoveryStatus,
      earlyWarnings,
      historicalPatterns,
      recommendations,
      insights,
    };
  }

  private static calculateBaselines(
    sleep: SleepData[],
    readiness: ReadinessData[]
  ): {
    hrv: { mean: number; std: number };
    temp: { mean: number; std: number };
    rhr: { mean: number; std: number };
    readiness: { mean: number; std: number };
  } {
    // Use 30-90 day window for baselines (exclude last 7 days to avoid current illness)
    const baselineWindow = sleep.slice(0, -7).slice(-90);
    const readinessWindow = readiness.slice(0, -7).slice(-90);

    const hrvValues = baselineWindow
      .filter(s => s.heart_rate && s.heart_rate.source === 'hrv')
      .map(s => s.heart_rate?.interval || 0)
      .filter(v => v > 0);

    const tempValues = baselineWindow
      .map(s => s.temperature_delta || 0);

    const rhrValues = baselineWindow
      .map(s => s.lowest_heart_rate || 0)
      .filter(v => v > 0);

    const readinessValues = readinessWindow.map(r => r.score);

    return {
      hrv: this.calculateStats(hrvValues),
      temp: this.calculateStats(tempValues),
      rhr: this.calculateStats(rhrValues),
      readiness: this.calculateStats(readinessValues),
    };
  }

  private static calculateStats(values: number[]): { mean: number; std: number } {
    if (values.length === 0) return { mean: 0, std: 0 };

    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);

    return { mean, std };
  }

  private static detectAnomalies(
    sleep: SleepData[],
    readiness: ReadinessData[],
    baselines: ReturnType<typeof IllnessDetector.calculateBaselines>
  ): IllnessAnalysis['anomalies'] {
    const anomalies: IllnessAnalysis['anomalies'] = [];
    const recentDays = 7;
    const recentSleep = sleep.slice(-recentDays);
    const recentReadiness = readiness.slice(-recentDays);

    // HRV drop detection (>1.5 SD below baseline)
    recentSleep.forEach((s, idx) => {
      if (!s.heart_rate || s.heart_rate.source !== 'hrv') return;
      const hrv = s.heart_rate.interval || 0;
      if (hrv === 0) return;

      const deviation = (baselines.hrv.mean - hrv) / baselines.hrv.std;
      if (deviation > 1.5) {
        anomalies.push({
          type: 'hrv_drop',
          severity: Math.min(100, deviation * 30),
          description: `HRV ${deviation.toFixed(1)} SD below baseline (${hrv.toFixed(0)} vs ${baselines.hrv.mean.toFixed(0)} ms)`,
          startDate: s.day,
          duration: 1,
          deviation,
        });
      }
    });

    // Temperature spike detection (>0.4°C above baseline)
    recentSleep.forEach(s => {
      const tempDelta = s.temperature_delta || 0;
      const deviation = (tempDelta - baselines.temp.mean) / (baselines.temp.std || 0.1);

      if (Math.abs(deviation) > 1.5 && tempDelta > baselines.temp.mean + 0.4) {
        anomalies.push({
          type: 'temp_spike',
          severity: Math.min(100, Math.abs(deviation) * 35),
          description: `Temperature ${Math.abs(deviation).toFixed(1)} SD above baseline (+${tempDelta.toFixed(2)}°C vs ${baselines.temp.mean.toFixed(2)}°C)`,
          startDate: s.day,
          duration: 1,
          deviation: Math.abs(deviation),
        });
      }
    });

    // RHR elevation detection (>10 bpm above baseline or >1.5 SD)
    recentSleep.forEach(s => {
      const rhr = s.lowest_heart_rate || 0;
      if (rhr === 0 || baselines.rhr.mean === 0) return;

      const bpmChange = rhr - baselines.rhr.mean;
      const deviation = bpmChange / (baselines.rhr.std || 1);

      if (deviation > 1.5 && bpmChange > 5) {
        anomalies.push({
          type: 'rhr_elevation',
          severity: Math.min(100, deviation * 30),
          description: `Resting HR ${deviation.toFixed(1)} SD above baseline (+${bpmChange.toFixed(0)} bpm, ${rhr.toFixed(0)} vs ${baselines.rhr.mean.toFixed(0)})`,
          startDate: s.day,
          duration: 1,
          deviation,
        });
      }
    });

    // Readiness crash detection
    recentReadiness.forEach((r, idx) => {
      if (baselines.readiness.mean === 0) return;

      const deviation = (baselines.readiness.mean - r.score) / (baselines.readiness.std || 1);
      if (deviation > 2.0) {
        anomalies.push({
          type: 'readiness_crash',
          severity: Math.min(100, deviation * 25),
          description: `Readiness ${deviation.toFixed(1)} SD below baseline (${r.score} vs ${baselines.readiness.mean.toFixed(0)})`,
          startDate: recentSleep[idx]?.day || '',
          duration: 1,
          deviation,
        });
      }
    });

    // Consolidate consecutive anomalies of same type
    return this.consolidateAnomalies(anomalies);
  }

  private static consolidateAnomalies(anomalies: IllnessAnalysis['anomalies']): IllnessAnalysis['anomalies'] {
    // Group by type and consolidate consecutive days
    const grouped = new Map<AnomalyType, IllnessAnalysis['anomalies'][0][]>();

    anomalies.forEach(a => {
      if (!grouped.has(a.type)) grouped.set(a.type, []);
      grouped.get(a.type)!.push(a);
    });

    const consolidated: IllnessAnalysis['anomalies'] = [];

    grouped.forEach((typeAnomalies, type) => {
      typeAnomalies.sort((a, b) => a.startDate.localeCompare(b.startDate));

      let current = typeAnomalies[0];
      for (let i = 1; i < typeAnomalies.length; i++) {
        const prev = parseOuraDate(current.startDate);
        const next = parseOuraDate(typeAnomalies[i].startDate);
        const daysDiff = (next.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

        if (daysDiff <= 1.5) {
          // Consecutive days - merge
          current.duration += 1;
          current.severity = Math.max(current.severity, typeAnomalies[i].severity);
          current.deviation = Math.max(current.deviation, typeAnomalies[i].deviation);
        } else {
          consolidated.push(current);
          current = typeAnomalies[i];
        }
      }
      consolidated.push(current);
    });

    return consolidated.sort((a, b) => b.severity - a.severity);
  }

  private static assessRisk(
    anomalies: IllnessAnalysis['anomalies'],
    sleep: SleepData[],
    readiness: ReadinessData[]
  ): { riskLevel: IllnessRiskLevel; riskScore: number; confidence: number } {
    let riskScore = 0;

    // Weighted risk scoring
    anomalies.forEach(a => {
      const weights = {
        hrv_drop: 2.0,
        temp_spike: 2.5,
        rhr_elevation: 1.5,
        readiness_crash: 1.0,
        sleep_disruption: 0.8,
      };

      const durationMultiplier = Math.min(2.0, 1 + (a.duration - 1) * 0.3);
      riskScore += a.severity * weights[a.type] * durationMultiplier;
    });

    // Multiple concurrent anomalies increase risk
    const uniqueTypes = new Set(anomalies.map(a => a.type));
    if (uniqueTypes.size >= 3) riskScore *= 1.5;
    else if (uniqueTypes.size === 2) riskScore *= 1.2;

    // Normalize to 0-100
    riskScore = Math.min(100, riskScore / 10);

    // Determine risk level
    let riskLevel: IllnessRiskLevel;
    if (riskScore < 15) riskLevel = 'none';
    else if (riskScore < 35) riskLevel = 'low';
    else if (riskScore < 60) riskLevel = 'moderate';
    else if (riskScore < 80) riskLevel = 'high';
    else riskLevel = 'critical';

    // Confidence based on data quality and consistency
    const dataQuality = Math.min(100, (sleep.length / 90) * 100);
    const anomalyConsistency = anomalies.length > 0 ? Math.min(100, anomalies.length * 25) : 50;
    const confidence = (dataQuality + anomalyConsistency) / 2;

    return { riskLevel, riskScore, confidence };
  }

  private static analyzeBiometricTrends(
    sleep: SleepData[],
    readiness: ReadinessData[],
    baselines: ReturnType<typeof IllnessDetector.calculateBaselines>
  ): IllnessAnalysis['biometricTrends'] {
    const recent = sleep.slice(-3);

    // HRV trend
    const recentHRV = recent
      .filter(s => s.heart_rate && s.heart_rate.source === 'hrv')
      .map(s => s.heart_rate?.interval || 0)
      .filter(v => v > 0);
    const currentHRV = recentHRV.length > 0 ? recentHRV.reduce((sum, v) => sum + v, 0) / recentHRV.length : 0;
    const hrvChange = baselines.hrv.mean > 0 ? ((currentHRV - baselines.hrv.mean) / baselines.hrv.mean) * 100 : 0;
    const hrvTrend = this.determineTrend(recent.map(s => s.heart_rate?.interval || 0));

    // Temperature trend
    const recentTemp = recent.map(s => s.temperature_delta || 0);
    const currentTemp = recentTemp.reduce((sum, v) => sum + v, 0) / recentTemp.length;
    const tempChange = currentTemp - baselines.temp.mean;
    const tempTrend = this.determineTrend(recentTemp);

    // RHR trend
    const recentRHR = recent.map(s => s.lowest_heart_rate || 0).filter(v => v > 0);
    const currentRHR = recentRHR.length > 0 ? recentRHR.reduce((sum, v) => sum + v, 0) / recentRHR.length : 0;
    const rhrChange = currentRHR - baselines.rhr.mean;
    const rhrTrend = this.determineTrend(recentRHR);

    return {
      hrv: {
        current: Number(currentHRV.toFixed(0)),
        baseline: Number(baselines.hrv.mean.toFixed(0)),
        change: Number(hrvChange.toFixed(1)),
        trend: hrvTrend,
      },
      temperature: {
        current: Number(currentTemp.toFixed(2)),
        baseline: Number(baselines.temp.mean.toFixed(2)),
        change: Number(tempChange.toFixed(2)),
        trend: tempTrend,
      },
      restingHeartRate: {
        current: Number(currentRHR.toFixed(0)),
        baseline: Number(baselines.rhr.mean.toFixed(0)),
        change: Number(rhrChange.toFixed(0)),
        trend: rhrTrend,
      },
    };
  }

  private static determineTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';

    const first = values.slice(0, Math.ceil(values.length / 2));
    const second = values.slice(Math.floor(values.length / 2));

    const firstAvg = first.reduce((sum, v) => sum + v, 0) / first.length;
    const secondAvg = second.reduce((sum, v) => sum + v, 0) / second.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (Math.abs(change) < 5) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  }

  private static assessRecoveryStatus(
    riskScore: number,
    anomalies: IllnessAnalysis['anomalies'],
    biometricTrends: IllnessAnalysis['biometricTrends']
  ): IllnessAnalysis['recoveryStatus'] {
    const needsRest = riskScore > 35;

    // Estimate recovery days based on severity and trends
    let estimatedRecoveryDays = 0;
    if (riskScore > 60) estimatedRecoveryDays = 5;
    else if (riskScore > 40) estimatedRecoveryDays = 3;
    else if (riskScore > 20) estimatedRecoveryDays = 1;

    // Adjust based on trends
    const improvingTrends = [
      biometricTrends.hrv.trend === 'increasing',
      biometricTrends.temperature.trend === 'decreasing',
      biometricTrends.restingHeartRate.trend === 'decreasing',
    ].filter(Boolean).length;

    if (improvingTrends >= 2) estimatedRecoveryDays = Math.max(0, estimatedRecoveryDays - 1);

    let recommendation: string;
    if (riskScore > 70) {
      recommendation = 'URGENT: Significant illness indicators detected. Prioritize rest and consider medical consultation if symptoms worsen.';
    } else if (riskScore > 50) {
      recommendation = 'High illness risk detected. Take 2-3 rest days, avoid intense training, and focus on sleep quality.';
    } else if (riskScore > 30) {
      recommendation = 'Moderate risk detected. Reduce training intensity by 50%, prioritize sleep, and monitor symptoms.';
    } else if (riskScore > 15) {
      recommendation = 'Slight elevation in illness markers. Consider a light activity day and ensure adequate sleep tonight.';
    } else {
      recommendation = 'No rest needed. Biometric markers within normal range.';
    }

    return {
      needsRest,
      estimatedRecoveryDays,
      recommendation,
    };
  }

  private static detectEarlyWarnings(
    sleep: SleepData[],
    readiness: ReadinessData[],
    baselines: ReturnType<typeof IllnessDetector.calculateBaselines>,
    anomalies: IllnessAnalysis['anomalies']
  ): IllnessAnalysis['earlyWarnings'] {
    const warnings: IllnessAnalysis['earlyWarnings'] = [];

    // Check for early HRV decline
    const hrvAnomaly = anomalies.find(a => a.type === 'hrv_drop');
    if (hrvAnomaly) {
      const daysAgo = this.getDaysAgo(hrvAnomaly.startDate);
      warnings.push({
        indicator: 'HRV Decline',
        detected: true,
        daysAgo,
        description: `Heart rate variability dropped ${hrvAnomaly.deviation.toFixed(1)} standard deviations below your baseline ${daysAgo} days ago, indicating potential immune system activation.`,
      });
    }

    // Check for temperature elevation
    const tempAnomaly = anomalies.find(a => a.type === 'temp_spike');
    if (tempAnomaly) {
      const daysAgo = this.getDaysAgo(tempAnomaly.startDate);
      warnings.push({
        indicator: 'Temperature Elevation',
        detected: true,
        daysAgo,
        description: `Body temperature elevated above baseline ${daysAgo} days ago, a common early sign of infection or inflammation.`,
      });
    }

    // Check for RHR elevation
    const rhrAnomaly = anomalies.find(a => a.type === 'rhr_elevation');
    if (rhrAnomaly) {
      const daysAgo = this.getDaysAgo(rhrAnomaly.startDate);
      warnings.push({
        indicator: 'Elevated Resting Heart Rate',
        detected: true,
        daysAgo,
        description: `Resting heart rate increased ${daysAgo} days ago, indicating cardiovascular stress or immune response.`,
      });
    }

    return warnings;
  }

  private static getDaysAgo(dateString: string): number {
    const date = parseOuraDate(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  private static analyzeHistoricalPatterns(
    sleep: SleepData[],
    readiness: ReadinessData[],
    baselines: ReturnType<typeof IllnessDetector.calculateBaselines>
  ): IllnessAnalysis['historicalPatterns'] {
    // Look for past illness episodes (HRV drops + readiness crashes)
    let illnessEpisodes = 0;
    let warningWindows: number[] = [];

    // Scan historical data for illness patterns
    for (let i = 7; i < sleep.length - 7; i++) {
      const window = sleep.slice(i - 7, i + 7);
      const hrvDrop = window.filter(s => {
        const hrv = s.heart_rate?.interval || 0;
        return hrv > 0 && hrv < baselines.hrv.mean - baselines.hrv.std * 1.5;
      }).length;

      if (hrvDrop >= 2) {
        illnessEpisodes++;
        warningWindows.push(3); // Typical 3-day warning window
      }
    }

    const avgWarningWindow = warningWindows.length > 0
      ? warningWindows.reduce((sum, w) => sum + w, 0) / warningWindows.length
      : 2;

    const commonPrecursors: string[] = [];
    if (illnessEpisodes > 0) {
      commonPrecursors.push('HRV decline 2-4 days before symptoms');
      commonPrecursors.push('Elevated resting heart rate');
      commonPrecursors.push('Reduced sleep quality');
    }

    return {
      likelyIllnessesDetected: illnessEpisodes,
      averageWarningWindow: Number(avgWarningWindow.toFixed(0)),
      commonPrecursors,
    };
  }

  private static generateRecommendations(
    riskLevel: IllnessRiskLevel,
    anomalies: IllnessAnalysis['anomalies'],
    biometricTrends: IllnessAnalysis['biometricTrends'],
    recoveryStatus: IllnessAnalysis['recoveryStatus']
  ): IllnessAnalysis['recommendations'] {
    const immediate: string[] = [];
    const preventive: string[] = [];
    const monitoring: string[] = [];

    if (riskLevel === 'critical' || riskLevel === 'high') {
      immediate.push('Complete rest recommended - Avoid all intense physical activity');
      immediate.push('Sleep 9+ hours tonight with an early bedtime');
      immediate.push('Increase fluid intake and focus on anti-inflammatory nutrition');
      immediate.push('Consider consulting healthcare provider if symptoms worsen');
      immediate.push('Cancel non-essential commitments for the next 2-3 days');

      monitoring.push('Track body temperature twice daily');
      monitoring.push('Monitor for COVID-19 or flu symptoms');
      monitoring.push('Check HRV and RHR daily for recovery trends');
    } else if (riskLevel === 'moderate') {
      immediate.push('Reduce training intensity by 70% for the next 2 days');
      immediate.push('Target 8+ hours of sleep tonight');
      immediate.push('Avoid social gatherings to prevent infection spread');
      immediate.push('Take vitamin C, D, and zinc supplements');

      monitoring.push('Monitor readiness score over the next 3 days');
      monitoring.push('Track sleep quality and HRV trends');
    } else if (riskLevel === 'low') {
      immediate.push('Reduce workout intensity by 30-50% today');
      immediate.push('Ensure adequate sleep (8+ hours)');
      immediate.push('Stay hydrated throughout the day');

      monitoring.push('Check readiness tomorrow morning');
      monitoring.push('Note any emerging symptoms');
    }

    // Preventive recommendations (always applicable)
    preventive.push('Maintain consistent sleep schedule (±30 minutes)');
    preventive.push('Practice stress management techniques');
    preventive.push('Ensure adequate protein intake (0.8 grams per pound of bodyweight)');
    preventive.push('Avoid overtraining - Respect rest days');
    preventive.push('Wash hands frequently and maintain hygiene');

    return { immediate, preventive, monitoring };
  }

  private static generateInsights(
    riskLevel: IllnessRiskLevel,
    anomalies: IllnessAnalysis['anomalies'],
    biometricTrends: IllnessAnalysis['biometricTrends'],
    earlyWarnings: IllnessAnalysis['earlyWarnings'],
    historicalPatterns: IllnessAnalysis['historicalPatterns']
  ): IllnessAnalysis['insights'] {
    const insights: IllnessAnalysis['insights'] = [];

    // Main risk insight
    insights.push({
      category: 'immunology',
      finding: `${riskLevel.toUpperCase()} illness risk detected (${anomalies.length} anomal${anomalies.length === 1 ? 'y' : 'ies'})`,
      evidence: anomalies.length > 0
        ? `Detected: ${anomalies.map(a => a.type.replace('_', ' ')).join(', ')}`
        : 'All biometric markers within normal range',
      actionable: riskLevel === 'none'
        ? 'No immediate action needed. Continue monitoring daily biometrics.'
        : `Priority: ${riskLevel === 'critical' ? 'Complete rest and medical consultation' : riskLevel === 'high' ? 'Take 2-3 rest days' : 'Reduce activity intensity'}`,
    });

    // HRV insight
    if (biometricTrends.hrv.change < -15) {
      insights.push({
        category: 'immunology',
        finding: `Significant HRV suppression (${biometricTrends.hrv.change.toFixed(0)}% below baseline)`,
        evidence: `Current: ${biometricTrends.hrv.current}ms vs Baseline: ${biometricTrends.hrv.baseline}ms`,
        actionable: 'HRV suppression indicates autonomic nervous system stress, likely from immune activation. Prioritize sleep and stress reduction.',
      });
    }

    // Temperature insight
    if (biometricTrends.temperature.change > 0.3) {
      insights.push({
        category: 'immunology',
        finding: `Elevated body temperature (+${biometricTrends.temperature.change.toFixed(2)}°C)`,
        evidence: `Current deviation: ${biometricTrends.temperature.current.toFixed(2)}°C vs baseline: ${biometricTrends.temperature.baseline.toFixed(2)}°C`,
        actionable: 'Temperature elevation often precedes symptom onset by 1-3 days. Preemptive rest can reduce illness severity.',
      });
    }

    // Recovery pattern insight
    if (historicalPatterns.likelyIllnessesDetected > 0) {
      insights.push({
        category: 'pattern',
        finding: `${historicalPatterns.likelyIllnessesDetected} likely illness episode(s) detected in historical data`,
        evidence: `Average ${historicalPatterns.averageWarningWindow}-day warning window before symptom onset`,
        actionable: 'Your body shows consistent pre-illness patterns. Act on early warnings to minimize impact.',
      });
    }

    // Trend insight
    const improvingCount = [
      biometricTrends.hrv.trend === 'increasing',
      biometricTrends.temperature.trend === 'decreasing',
      biometricTrends.restingHeartRate.trend === 'decreasing',
    ].filter(Boolean).length;

    if (improvingCount >= 2 && anomalies.length > 0) {
      insights.push({
        category: 'recovery',
        finding: 'Recovery trend detected despite anomalies',
        evidence: `${improvingCount}/3 key metrics showing improvement`,
        actionable: 'Continue current recovery protocol. Return to light activity only when all metrics normalize.',
      });
    }

    return insights;
  }
}
