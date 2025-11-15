/**
 * DATA EXPORT UTILITY
 * Export Oura Ring health data in formats optimized for Claude AI analysis
 */

import { SleepData, ActivityData, ReadinessData } from '../oura-api';
import { AIUserProfile } from './user-profiling-engine';

export interface ExportData {
  markdown: string;
  json: string;
  summary: string;
}

/**
 * Export health data for Claude AI analysis
 */
export class DataExporter {
  /**
   * Export all data in Claude-optimized format
   */
  static exportForClaude(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[],
    aiProfile?: AIUserProfile
  ): ExportData {
    const markdown = this.generateMarkdownExport(sleep, activity, readiness, aiProfile);
    const json = this.generateJSONExport(sleep, activity, readiness, aiProfile);
    const summary = this.generateExecutiveSummary(sleep, activity, readiness, aiProfile);

    return { markdown, json, summary };
  }

  /**
   * Generate comprehensive markdown export
   */
  private static generateMarkdownExport(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[],
    aiProfile?: AIUserProfile
  ): string {
    const now = new Date().toISOString().split('T')[0];

    let md = `# Oura Ring Health Data Export\n`;
    md += `**Export Date**: ${now}\n`;
    md += `**Data Range**: ${sleep.length} days of comprehensive health metrics\n\n`;

    md += `---\n\n`;

    // Executive Summary
    md += `## 📊 Executive Summary\n\n`;
    md += this.generateExecutiveSummary(sleep, activity, readiness, aiProfile);
    md += `\n\n---\n\n`;

    // AI Profile
    if (aiProfile) {
      md += `## 🧠 AI-Generated User Profile\n\n`;
      md += `### Health Archetype\n`;
      md += `- **Type**: ${aiProfile.archetype.type.replace('_', ' ').toUpperCase()}\n`;
      md += `- **Confidence**: ${(aiProfile.archetype.confidence * 100).toFixed(0)}%\n`;
      md += `- **Characteristics**: ${aiProfile.archetype.characteristics.join(', ')}\n\n`;

      md += `### Optimal Ranges (Learned from your top 25% performing days)\n`;
      md += `- **Sleep Duration**: ${aiProfile.optimalRanges.sleep.duration.min.toFixed(1)} - ${aiProfile.optimalRanges.sleep.duration.max.toFixed(1)} hours\n`;
      md += `- **Deep Sleep**: ${aiProfile.optimalRanges.sleep.deepSleep.min.toFixed(0)} - ${aiProfile.optimalRanges.sleep.deepSleep.max.toFixed(0)} minutes\n`;
      md += `- **REM Sleep**: ${aiProfile.optimalRanges.sleep.remSleep.min.toFixed(0)} - ${aiProfile.optimalRanges.sleep.remSleep.max.toFixed(0)} minutes\n`;
      md += `- **RHR**: ${aiProfile.optimalRanges.readiness.restingHR.min.toFixed(0)} - ${aiProfile.optimalRanges.readiness.restingHR.max.toFixed(0)} bpm\n`;
      md += `- **HRV**: ${aiProfile.optimalRanges.readiness.hrv.min.toFixed(0)} - ${aiProfile.optimalRanges.readiness.hrv.max.toFixed(0)} ms\n\n`;

      if (aiProfile.beliefs) {
        md += `### Bayesian Beliefs (Probabilistic Understanding)\n`;
        md += `- **Sleep Sensitivity**: ${(aiProfile.beliefs.sleepSensitive * 100).toFixed(0)}% - How much sleep quality affects your performance\n`;
        md += `- **Stress Sensitivity**: ${(aiProfile.beliefs.stressSensitive * 100).toFixed(0)}% - How stress impacts your recovery\n`;
        md += `- **Activity-Recovery Ratio**: ${(aiProfile.beliefs.activityRecoveryRatio * 100).toFixed(0)}% - Balance between exertion and recovery\n`;
        md += `- **Circadian Flexibility**: ${(aiProfile.beliefs.circadianFlexibility * 100).toFixed(0)}% - Consistency of sleep timing\n\n`;
      }

      if (aiProfile.patterns && aiProfile.patterns.length > 0) {
        md += `### Discovered Patterns\n`;
        aiProfile.patterns.forEach(pattern => {
          md += `- **${pattern.pattern}**: Frequency ${pattern.frequency.toFixed(1)}%, Strength ${(pattern.strength * 100).toFixed(0)}%, Predictability ${(pattern.predictability * 100).toFixed(0)}%\n`;
        });
        md += `\n`;
      }

      if (aiProfile.correlations && aiProfile.correlations.length > 0) {
        md += `### Key Correlations\n`;
        aiProfile.correlations.slice(0, 5).forEach(corr => {
          md += `- **${corr.metric1} ↔ ${corr.metric2}**: ${(corr.strength * 100).toFixed(0)}% correlation\n`;
        });
        md += `\n`;
      }

      md += `---\n\n`;
    }

    // Recent Trends
    md += `## 📈 Recent Trends (Last 7 Days)\n\n`;
    md += this.generateRecentTrendsTable(sleep, activity, readiness);
    md += `\n\n---\n\n`;

    // Detailed Sleep Data
    md += `## 😴 Sleep Data (Last 30 Days)\n\n`;
    md += this.generateSleepTable(sleep.slice(-30));
    md += `\n\n---\n\n`;

    // Activity Data
    md += `## 🏃 Activity Data (Last 30 Days)\n\n`;
    md += this.generateActivityTable(activity.slice(-30));
    md += `\n\n---\n\n`;

    // Readiness Data
    md += `## ⚡ Readiness Data (Last 30 Days)\n\n`;
    md += this.generateReadinessTable(readiness.slice(-30));
    md += `\n\n---\n\n`;

    // Statistical Analysis
    md += `## 📊 Statistical Analysis\n\n`;
    md += this.generateStatisticalAnalysis(sleep, activity, readiness);
    md += `\n\n---\n\n`;

    // Questions for Claude
    md += `## 💭 Analysis Request for Claude\n\n`;
    md += `Please analyze this health data and provide:\n\n`;
    md += `1. **Deep Insights**: What patterns or trends do you notice that I might have missed?\n`;
    md += `2. **Health Optimization**: Based on my data, what specific changes would have the biggest impact?\n`;
    md += `3. **Risk Assessment**: Are there any concerning patterns or early warning signs?\n`;
    md += `4. **Personalized Recommendations**: What would you recommend for my specific situation?\n`;
    md += `5. **Long-term Strategy**: How should I adjust my lifestyle for optimal health?\n\n`;

    return md;
  }

  /**
   * Generate executive summary
   */
  private static generateExecutiveSummary(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[],
    aiProfile?: AIUserProfile
  ): string {
    const avgSleep = sleep.slice(-7).reduce((sum, s) => sum + s.score, 0) / Math.min(7, sleep.length);
    const avgActivity = activity.slice(-7).reduce((sum, a) => sum + a.score, 0) / Math.min(7, activity.length);
    const avgReadiness = readiness.slice(-7).reduce((sum, r) => sum + r.score, 0) / Math.min(7, readiness.length);

    const avgSleepDuration = sleep.slice(-7).reduce((sum, s) => sum + (s.total_sleep_duration / 3600), 0) / Math.min(7, sleep.length);
    const avgDeepSleep = sleep.slice(-7).reduce((sum, s) => sum + (s.deep_sleep_duration / 60), 0) / Math.min(7, sleep.length);
    const avgREM = sleep.slice(-7).reduce((sum, s) => sum + (s.rem_sleep_duration / 60), 0) / Math.min(7, sleep.length);

    const validReadiness = readiness.slice(-7).filter(r => r.average_hrv && r.average_hrv > 0);
    const avgHRV = validReadiness.length > 0
      ? validReadiness.reduce((sum, r) => sum + (r.average_hrv || 0), 0) / validReadiness.length
      : 0;
    const avgRHR = readiness.slice(-7).reduce((sum, r) => sum + r.resting_heart_rate, 0) / Math.min(7, readiness.length);

    let summary = `### Current Status (Last 7 Days)\n\n`;

    summary += `**Overall Health Scores:**\n`;
    summary += `- Sleep Score: ${avgSleep.toFixed(0)}/100 ${this.getScoreEmoji(avgSleep)}\n`;
    summary += `- Activity Score: ${avgActivity.toFixed(0)}/100 ${this.getScoreEmoji(avgActivity)}\n`;
    summary += `- Readiness Score: ${avgReadiness.toFixed(0)}/100 ${this.getScoreEmoji(avgReadiness)}\n\n`;

    summary += `**Sleep Metrics:**\n`;
    summary += `- Average Duration: ${avgSleepDuration.toFixed(1)} hours\n`;
    summary += `- Deep Sleep: ${avgDeepSleep.toFixed(0)} minutes/night\n`;
    summary += `- REM Sleep: ${avgREM.toFixed(0)} minutes/night\n\n`;

    summary += `**Recovery Metrics:**\n`;
    if (avgHRV > 0) {
      summary += `- HRV: ${avgHRV.toFixed(0)} ms\n`;
    }
    summary += `- Resting Heart Rate: ${avgRHR.toFixed(0)} bpm\n\n`;

    // Overall assessment
    const overallScore = (avgSleep + avgActivity + avgReadiness) / 3;
    summary += `**Overall Assessment:** `;
    if (overallScore >= 85) {
      summary += `Excellent condition - you're optimizing well! 🌟\n`;
    } else if (overallScore >= 70) {
      summary += `Good condition with room for optimization 👍\n`;
    } else {
      summary += `Recovery needed - your body is signaling for more rest ⚠️\n`;
    }

    return summary;
  }

  /**
   * Generate recent trends table
   */
  private static generateRecentTrendsTable(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): string {
    let table = `| Date | Sleep Score | Duration | Deep | REM | Activity | Readiness | RHR |\n`;
    table += `|------|------------|----------|------|-----|----------|-----------|-----|\n`;

    const recent = Math.min(7, sleep.length);
    for (let i = sleep.length - recent; i < sleep.length; i++) {
      const s = sleep[i];
      const a = activity[i] || { score: 0 };
      const r = readiness[i] || { score: 0, resting_heart_rate: 0 };

      table += `| ${s.day} | ${s.score} | ${(s.total_sleep_duration / 3600).toFixed(1)}h | ${(s.deep_sleep_duration / 60).toFixed(0)}m | ${(s.rem_sleep_duration / 60).toFixed(0)}m | ${a.score} | ${r.score} | ${r.resting_heart_rate.toFixed(0)} |\n`;
    }

    return table;
  }

  /**
   * Generate sleep data table
   */
  private static generateSleepTable(sleep: SleepData[]): string {
    let table = `| Date | Score | Duration | Efficiency | Deep | REM | Light | Awake | Restless |\n`;
    table += `|------|-------|----------|------------|------|-----|-------|-------|----------|\n`;

    sleep.forEach(s => {
      table += `| ${s.day} | ${s.score} | ${(s.total_sleep_duration / 3600).toFixed(1)}h | ${s.efficiency}% | ${(s.deep_sleep_duration / 60).toFixed(0)}m | ${(s.rem_sleep_duration / 60).toFixed(0)}m | ${(s.light_sleep_duration / 60).toFixed(0)}m | ${(s.awake_time / 60).toFixed(0)}m | ${s.restless_periods} |\n`;
    });

    return table;
  }

  /**
   * Generate activity table
   */
  private static generateActivityTable(activity: ActivityData[]): string {
    let table = `| Date | Score | Steps | Calories | High Intensity | Medium | Low | Sedentary |\n`;
    table += `|------|-------|-------|----------|----------------|--------|-----|------------|\n`;

    activity.forEach(a => {
      table += `| ${a.day} | ${a.score} | ${a.steps.toLocaleString()} | ${a.active_calories} | ${(a.high_activity_time / 60).toFixed(0)}m | ${(a.medium_activity_time / 60).toFixed(0)}m | ${(a.low_activity_time / 60).toFixed(0)}m | ${(a.sedentary_time / 60).toFixed(0)}m |\n`;
    });

    return table;
  }

  /**
   * Generate readiness table
   */
  private static generateReadinessTable(readiness: ReadinessData[]): string {
    let table = `| Date | Score | RHR | HRV Balance | Temp Deviation | Temp Trend |\n`;
    table += `|------|-------|-----|-------------|----------------|------------|\n`;

    readiness.forEach(r => {
      table += `| ${r.day} | ${r.score} | ${r.resting_heart_rate.toFixed(0)} | ${r.hrv_balance} | ${r.temperature_deviation.toFixed(2)}°C | ${r.temperature_trend_deviation.toFixed(2)}°C |\n`;
    });

    return table;
  }

  /**
   * Generate statistical analysis
   */
  private static generateStatisticalAnalysis(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): string {
    let analysis = `### Sleep Statistics\n\n`;

    const sleepScores = sleep.map(s => s.score);
    const sleepDurations = sleep.map(s => s.total_sleep_duration / 3600);
    const deepSleep = sleep.map(s => s.deep_sleep_duration / 60);
    const remSleep = sleep.map(s => s.rem_sleep_duration / 60);

    analysis += `- **Average Sleep Score**: ${this.mean(sleepScores).toFixed(1)} ± ${this.std(sleepScores).toFixed(1)}\n`;
    analysis += `- **Average Duration**: ${this.mean(sleepDurations).toFixed(1)} ± ${this.std(sleepDurations).toFixed(1)} hours\n`;
    analysis += `- **Average Deep Sleep**: ${this.mean(deepSleep).toFixed(0)} ± ${this.std(deepSleep).toFixed(0)} minutes\n`;
    analysis += `- **Average REM Sleep**: ${this.mean(remSleep).toFixed(0)} ± ${this.std(remSleep).toFixed(0)} minutes\n\n`;

    analysis += `### Activity Statistics\n\n`;
    const activityScores = activity.map(a => a.score);
    const steps = activity.map(a => a.steps);

    analysis += `- **Average Activity Score**: ${this.mean(activityScores).toFixed(1)} ± ${this.std(activityScores).toFixed(1)}\n`;
    analysis += `- **Average Steps**: ${this.mean(steps).toFixed(0).toLocaleString()} ± ${this.std(steps).toFixed(0).toLocaleString()}\n\n`;

    analysis += `### Readiness Statistics\n\n`;
    const readinessScores = readiness.map(r => r.score);
    const rhr = readiness.map(r => r.resting_heart_rate);

    analysis += `- **Average Readiness Score**: ${this.mean(readinessScores).toFixed(1)} ± ${this.std(readinessScores).toFixed(1)}\n`;
    analysis += `- **Average RHR**: ${this.mean(rhr).toFixed(0)} ± ${this.std(rhr).toFixed(0)} bpm\n\n`;

    return analysis;
  }

  /**
   * Generate JSON export
   */
  private static generateJSONExport(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[],
    aiProfile?: AIUserProfile
  ): string {
    const exportData = {
      exportDate: new Date().toISOString(),
      dataRange: {
        sleepDays: sleep.length,
        activityDays: activity.length,
        readinessDays: readiness.length,
      },
      aiProfile,
      sleep: sleep.slice(-30),
      activity: activity.slice(-30),
      readiness: readiness.slice(-30),
      summary: {
        sleep: {
          avgScore: this.mean(sleep.slice(-7).map(s => s.score)),
          avgDuration: this.mean(sleep.slice(-7).map(s => s.total_sleep_duration / 3600)),
          avgDeepSleep: this.mean(sleep.slice(-7).map(s => s.deep_sleep_duration / 60)),
          avgREMSleep: this.mean(sleep.slice(-7).map(s => s.rem_sleep_duration / 60)),
        },
        activity: {
          avgScore: this.mean(activity.slice(-7).map(a => a.score)),
          avgSteps: this.mean(activity.slice(-7).map(a => a.steps)),
        },
        readiness: {
          avgScore: this.mean(readiness.slice(-7).map(r => r.score)),
          avgRHR: this.mean(readiness.slice(-7).map(r => r.resting_heart_rate)),
        },
      },
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Helper methods
  private static getScoreEmoji(score: number): string {
    if (score >= 85) return '🟢';
    if (score >= 70) return '🟡';
    return '🔴';
  }

  private static mean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private static std(values: number[]): number {
    if (values.length === 0) return 0;
    const avg = this.mean(values);
    const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
    return Math.sqrt(this.mean(squaredDiffs));
  }

  /**
   * Download exported data as file
   */
  static downloadExport(data: string, filename: string, type: 'markdown' | 'json' = 'markdown') {
    const mimeType = type === 'json' ? 'application/json' : 'text/markdown';
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Copy to clipboard
   */
  static async copyToClipboard(data: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(data);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
}
