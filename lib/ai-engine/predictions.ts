import { SleepData, ActivityData, ReadinessData } from '@/lib/oura-api';
import { HealthPrediction, IllnessPrediction, PersonalBaselines } from './types';
import { AdvancedStatistics } from './statistics';

/**
 * Predictive Analytics Module
 * Advanced forecasting and illness prediction
 */
export class PredictiveAnalytics {
  /**
   * Enhanced multi-factor prediction with confidence intervals
   */
  static forecastMetric(
    data: number[],
    days: number = 7,
    metric: 'sleep' | 'activity' | 'readiness' | 'overall'
  ): HealthPrediction {
    if (data.length < 7) {
      throw new Error('Need at least 7 days of data for forecasting');
    }

    // Perform trend analysis
    const xData = data.map((_, i) => i);
    const trend = AdvancedStatistics.linearRegression(xData, data);

    // Seasonal component (7-day cycle)
    const decomposition = AdvancedStatistics.seasonalDecomposition(data, 7);

    // Calculate volatility for confidence intervals
    const residualStdDev = Math.sqrt(
      decomposition.residual.reduce((sum, r) => sum + r * r, 0) / decomposition.residual.length
    );

    // Generate predictions
    const predictions = [];
    const lastIndex = data.length - 1;
    const lastValue = data[lastIndex];

    for (let day = 1; day <= days; day++) {
      const futureIndex = lastIndex + day;

      // Trend component
      const trendValue = trend.slope * futureIndex + trend.intercept;

      // Seasonal component (use modulo for cycling)
      const seasonalValue = decomposition.seasonal[futureIndex % 7];

      // Mean reversion factor (pull towards historical mean)
      const historicalMean = data.reduce((a, b) => a + b, 0) / data.length;
      const meanReversionFactor = 0.1 * (historicalMean - trendValue);

      // Combine components
      let predicted = trendValue + seasonalValue + meanReversionFactor;

      // Clamp to valid range [0, 100]
      predicted = Math.max(0, Math.min(100, predicted));

      // Confidence interval (wider for further predictions)
      const uncertaintyGrowth = 1 + (day * 0.15); // 15% per day
      const marginOfError = 1.96 * residualStdDev * uncertaintyGrowth;

      predictions.push({
        date: '', // Will be filled by caller
        predicted: Math.round(predicted),
        confidence: Math.max(0.4, 0.95 - day * 0.05), // Decreases with horizon
        range: {
          lower: Math.max(0, Math.round(predicted - marginOfError)),
          upper: Math.min(100, Math.round(predicted + marginOfError)),
        },
      });
    }

    // Calculate accuracy metrics (using last 7 days as validation)
    const validationLength = Math.min(7, Math.floor(data.length * 0.2));
    const validationActual = data.slice(-validationLength);
    const validationPredicted: number[] = [];

    for (let i = 0; i < validationLength; i++) {
      const idx = data.length - validationLength + i;
      const pred = trend.slope * idx + trend.intercept;
      validationPredicted.push(pred);
    }

    const errors = validationActual.map((actual, i) =>
      Math.abs(actual - validationPredicted[i])
    );
    const mae = errors.reduce((a, b) => a + b, 0) / errors.length;
    const mape =
      (errors.reduce((sum, err, i) => sum + err / validationActual[i], 0) / errors.length) * 100;
    const rmse = Math.sqrt(
      errors.reduce((sum, err) => sum + err * err, 0) / errors.length
    );

    // Scenarios (use residualStdDev for margin of error)
    const lastPrediction = predictions[predictions.length - 1].predicted;
    const lastMarginOfError = 1.96 * residualStdDev * (1 + days * 0.15);
    const scenarios = {
      best: Math.min(100, lastPrediction + lastMarginOfError),
      expected: lastPrediction,
      worst: Math.max(0, lastPrediction - lastMarginOfError),
    };

    return {
      metric,
      predictions,
      accuracy: { mae, mape, rmse },
      scenarios,
    };
  }

  /**
   * Illness prediction using multiple physiological markers
   */
  static predictIllnessRisk(
    readiness: ReadinessData[],
    sleep: SleepData[],
    baselines: PersonalBaselines
  ): IllnessPrediction {
    if (readiness.length < 7) {
      return {
        riskLevel: 'minimal',
        riskScore: 10,
        confidence: 0.3,
        indicators: [],
        earlyWarningSignals: [],
        recommendations: ['More data needed for accurate illness prediction'],
        timeline: 'week',
      };
    }

    const indicators: IllnessPrediction['indicators'] = [];
    const earlyWarningSignals: string[] = [];
    let totalContribution = 0;

    // Recent data (last 3 days)
    const recentReadiness = readiness.slice(-3);
    const recentSleep = sleep.slice(-3);

    // 1. Resting Heart Rate elevation
    const recentRHR = recentReadiness.map(r => r.resting_heart_rate);
    const avgRecentRHR = recentRHR.reduce((a, b) => a + b, 0) / recentRHR.length;
    const rhrDeviation = ((avgRecentRHR - baselines.readiness.restingHR) / baselines.readiness.restingHR) * 100;

    if (rhrDeviation > 5) {
      const contribution = Math.min(30, rhrDeviation * 3);
      indicators.push({
        metric: 'Resting Heart Rate',
        deviation: rhrDeviation,
        contribution,
      });
      totalContribution += contribution;
      earlyWarningSignals.push(
        `Elevated resting HR: ${avgRecentRHR.toFixed(0)} bpm (+${rhrDeviation.toFixed(1)}% above baseline)`
      );
    }

    // 2. HRV decrease
    const recentHRV = recentReadiness
      .map(r => r.hrv_balance || 0)
      .filter(h => h > 0);

    if (recentHRV.length > 0 && baselines.readiness.hrvRange.max > 0) {
      const avgRecentHRV = recentHRV.reduce((a, b) => a + b, 0) / recentHRV.length;
      const hrvMidpoint = (baselines.readiness.hrvRange.min + baselines.readiness.hrvRange.max) / 2;
      const hrvDeviation = ((hrvMidpoint - avgRecentHRV) / hrvMidpoint) * 100;

      if (hrvDeviation > 10) {
        const contribution = Math.min(25, hrvDeviation * 2);
        indicators.push({
          metric: 'HRV Balance',
          deviation: -hrvDeviation,
          contribution,
        });
        totalContribution += contribution;
        earlyWarningSignals.push(
          `Reduced HRV: ${avgRecentHRV.toFixed(0)} (-${hrvDeviation.toFixed(1)}% below typical)`
        );
      }
    }

    // 3. Temperature deviation
    const recentTemp = recentReadiness.map(r => r.temperature_deviation || 0);
    const avgRecentTemp = recentTemp.reduce((a, b) => a + b, 0) / recentTemp.length;

    if (Math.abs(avgRecentTemp - baselines.readiness.temperatureDeviation) > 0.3) {
      const tempDeviation = avgRecentTemp - baselines.readiness.temperatureDeviation;
      const contribution = Math.min(25, Math.abs(tempDeviation) * 30);
      indicators.push({
        metric: 'Body Temperature',
        deviation: tempDeviation,
        contribution,
      });
      totalContribution += contribution;
      earlyWarningSignals.push(
        `Temperature deviation: ${tempDeviation > 0 ? '+' : ''}${tempDeviation.toFixed(2)}°C`
      );
    }

    // 4. Consecutive low readiness days
    const consecutiveLowDays = this.countConsecutiveLowDays(
      recentReadiness.map(r => r.score),
      baselines.readiness.averageScore - 10
    );

    if (consecutiveLowDays >= 2) {
      const contribution = consecutiveLowDays * 10;
      indicators.push({
        metric: 'Readiness Trend',
        deviation: -consecutiveLowDays * 5,
        contribution,
      });
      totalContribution += contribution;
      earlyWarningSignals.push(`${consecutiveLowDays} consecutive days of low readiness`);
    }

    // 5. Sleep disruption
    const recentSleepScores = recentSleep.map(s => s.score);
    const avgRecentSleep = recentSleepScores.reduce((a, b) => a + b, 0) / recentSleepScores.length;
    const sleepDeviation = ((baselines.sleep.averageScore - avgRecentSleep) / baselines.sleep.averageScore) * 100;

    if (sleepDeviation > 15) {
      const contribution = Math.min(20, sleepDeviation);
      indicators.push({
        metric: 'Sleep Quality',
        deviation: -sleepDeviation,
        contribution,
      });
      totalContribution += contribution;
      earlyWarningSignals.push(`Sleep quality declined ${sleepDeviation.toFixed(0)}% below normal`);
    }

    // Calculate risk score (0-100)
    const riskScore = Math.min(100, totalContribution);

    // Determine risk level and timeline
    let riskLevel: IllnessPrediction['riskLevel'];
    let timeline: IllnessPrediction['timeline'];

    if (riskScore >= 70) {
      riskLevel = 'high';
      timeline = '24h';
    } else if (riskScore >= 45) {
      riskLevel = 'moderate';
      timeline = '48h';
    } else if (riskScore >= 25) {
      riskLevel = 'low';
      timeline = '72h';
    } else {
      riskLevel = 'minimal';
      timeline = 'week';
    }

    // Confidence based on number of indicators
    const confidence = Math.min(0.9, 0.5 + indicators.length * 0.1);

    // Recommendations
    const recommendations: string[] = [];
    if (riskLevel === 'high' || riskLevel === 'moderate') {
      recommendations.push('Prioritize rest and recovery immediately');
      recommendations.push('Avoid intense exercise for 48-72 hours');
      recommendations.push('Increase sleep by 1-2 hours per night');
      recommendations.push('Stay hydrated and maintain good nutrition');
      recommendations.push('Monitor symptoms - consult healthcare provider if worsening');
    } else if (riskLevel === 'low') {
      recommendations.push('Maintain current recovery practices');
      recommendations.push('Ensure 7-9 hours of sleep tonight');
      recommendations.push('Consider reducing training intensity by 20-30%');
    } else {
      recommendations.push('Continue regular health habits');
      recommendations.push('Monitor readiness score daily');
    }

    return {
      riskLevel,
      riskScore: Math.round(riskScore),
      confidence,
      indicators,
      earlyWarningSignals,
      recommendations,
      timeline,
    };
  }

  /**
   * Performance trajectory forecasting
   */
  static predictPerformanceTrend(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): {
    trajectory: 'improving' | 'declining' | 'stable' | 'volatile';
    confidence: number;
    expectedPeakIn: number; // days
    sustainabilityScore: number; // 0-100
  } {
    if (sleep.length < 14) {
      return {
        trajectory: 'stable',
        confidence: 0.3,
        expectedPeakIn: 7,
        sustainabilityScore: 50,
      };
    }

    // Analyze trends across all metrics
    const sleepTrend = AdvancedStatistics.linearRegression(
      sleep.map((_, i) => i),
      sleep.map(s => s.score)
    );
    const activityTrend = AdvancedStatistics.linearRegression(
      activity.map((_, i) => i),
      activity.map(a => a.score)
    );
    const readinessTrend = AdvancedStatistics.linearRegression(
      readiness.map((_, i) => i),
      readiness.map(r => r.score)
    );

    // Combined slope (weighted: readiness 40%, sleep 35%, activity 25%)
    const combinedSlope =
      readinessTrend.slope * 0.4 + sleepTrend.slope * 0.35 + activityTrend.slope * 0.25;

    // Volatility assessment
    const recentScores = readiness.slice(-7).map(r => r.score);
    const volatility = AdvancedStatistics.coefficientOfVariation(recentScores);

    // Determine trajectory
    let trajectory: 'improving' | 'declining' | 'stable' | 'volatile';
    if (volatility > 15) {
      trajectory = 'volatile';
    } else if (combinedSlope > 0.5) {
      trajectory = 'improving';
    } else if (combinedSlope < -0.5) {
      trajectory = 'declining';
    } else {
      trajectory = 'stable';
    }

    // Confidence based on R² values
    const avgRSquared = (sleepTrend.rSquared + activityTrend.rSquared + readinessTrend.rSquared) / 3;
    const confidence = Math.max(0.5, Math.min(0.95, avgRSquared));

    // Predict peak (when will performance be optimal?)
    let expectedPeakIn = 7;
    if (trajectory === 'improving') {
      const currentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      const targetScore = 90;
      if (combinedSlope > 0) {
        expectedPeakIn = Math.max(1, Math.round((targetScore - currentAvg) / combinedSlope));
      }
    } else if (trajectory === 'declining') {
      expectedPeakIn = 0; // Already peaked
    }

    // Sustainability score (can this performance be maintained?)
    const workRecoveryBalance =
      (activity.slice(-7).reduce((sum, a) => sum + a.score, 0) / 7) /
      (readiness.slice(-7).reduce((sum, r) => sum + r.score, 0) / 7);

    const sustainabilityScore = Math.round(
      Math.max(0, Math.min(100, 100 - Math.abs(1 - workRecoveryBalance) * 100))
    );

    return {
      trajectory,
      confidence,
      expectedPeakIn: Math.min(14, expectedPeakIn),
      sustainabilityScore,
    };
  }

  // ==================== HELPERS ====================

  private static countConsecutiveLowDays(scores: number[], threshold: number): number {
    let count = 0;
    for (let i = scores.length - 1; i >= 0; i--) {
      if (scores[i] < threshold) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }
}
