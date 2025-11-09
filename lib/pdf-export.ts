import { jsPDF } from 'jspdf';
import { SleepData, ActivityData, ReadinessData } from '@/lib/oura-api';
import { AdvancedAIEngine } from './advanced-ai-engine';

interface PDFExportOptions {
  includeInsights?: boolean;
  includeCharts?: boolean;
  includeSummary?: boolean;
  dateRange?: { start: string; end: string };
}

export class PDFExporter {
  private doc: jsPDF;
  private yPosition: number;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;

  constructor() {
    this.doc = new jsPDF();
    this.yPosition = 20;
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
  }

  private checkPageBreak(requiredSpace: number = 30) {
    if (this.yPosition + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.yPosition = 20;
    }
  }

  private addTitle(text: string, fontSize: number = 20) {
    this.checkPageBreak(15);
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(text, this.margin, this.yPosition);
    this.yPosition += 10;
  }

  private addSubtitle(text: string, fontSize: number = 14) {
    this.checkPageBreak(10);
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(text, this.margin, this.yPosition);
    this.yPosition += 8;
  }

  private addText(text: string, fontSize: number = 10, indent: number = 0) {
    this.checkPageBreak(8);
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', 'normal');

    const maxWidth = this.pageWidth - 2 * this.margin - indent;
    const lines = this.doc.splitTextToSize(text, maxWidth);

    lines.forEach((line: string) => {
      this.checkPageBreak(6);
      this.doc.text(line, this.margin + indent, this.yPosition);
      this.yPosition += 6;
    });
  }

  private addBoldText(text: string, fontSize: number = 10, indent: number = 0) {
    this.checkPageBreak(8);
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(text, this.margin + indent, this.yPosition);
    this.yPosition += 7;
  }

  private addLine() {
    this.checkPageBreak(5);
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.yPosition, this.pageWidth - this.margin, this.yPosition);
    this.yPosition += 5;
  }

  private addSpace(space: number = 5) {
    this.yPosition += space;
  }

  private addMetricCard(
    label: string,
    value: string | number,
    color: [number, number, number] = [128, 92, 246]
  ) {
    this.checkPageBreak(25);

    // Draw card background
    this.doc.setFillColor(245, 245, 245);
    this.doc.roundedRect(this.margin, this.yPosition, 50, 20, 2, 2, 'F');

    // Add label
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(label, this.margin + 2, this.yPosition + 5);

    // Add value
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(color[0], color[1], color[2]);
    this.doc.text(String(value), this.margin + 2, this.yPosition + 14);

    // Reset color
    this.doc.setTextColor(0, 0, 0);
  }

  private addHeader() {
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(128, 92, 246);
    this.doc.text('Oura Health Report', this.margin, this.yPosition);

    this.yPosition += 8;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(
      `Generated on ${new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })}`,
      this.margin,
      this.yPosition
    );

    this.yPosition += 10;
    this.doc.setTextColor(0, 0, 0);
    this.addLine();
  }

  public exportInsightsReport(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[],
    options: PDFExportOptions = {}
  ): void {
    const {
      includeInsights = true,
      includeSummary = true,
    } = options;

    // Header
    this.addHeader();
    this.addSpace(5);

    // Summary Section
    if (includeSummary && sleep.length > 0 && activity.length > 0 && readiness.length > 0) {
      this.addTitle('Summary', 16);
      this.addSpace(3);

      const latestSleep = sleep[sleep.length - 1];
      const latestActivity = activity[activity.length - 1];
      const latestReadiness = readiness[readiness.length - 1];

      // Calculate averages
      const avgSleep = Math.round(sleep.reduce((sum, s) => sum + s.score, 0) / sleep.length);
      const avgActivity = Math.round(activity.reduce((sum, a) => sum + a.score, 0) / activity.length);
      const avgReadiness = Math.round(readiness.reduce((sum, r) => sum + r.score, 0) / readiness.length);

      this.addBoldText('Current Scores:', 11);
      this.addText(`Sleep: ${latestSleep.score}/100 | Activity: ${latestActivity.score}/100 | Readiness: ${latestReadiness.score}/100`);
      this.addSpace(3);

      this.addBoldText('Average Scores (Last 30 Days):', 11);
      this.addText(`Sleep: ${avgSleep}/100 | Activity: ${avgActivity}/100 | Readiness: ${avgReadiness}/100`);
      this.addSpace(3);

      this.addBoldText('Key Metrics:', 11);
      this.addText(`Total Sleep: ${(latestSleep.total_sleep_duration / 3600).toFixed(1)} hours`);
      this.addText(`Deep Sleep: ${Math.round(latestSleep.deep_sleep_duration / 60)} minutes`);
      this.addText(`REM Sleep: ${Math.round(latestSleep.rem_sleep_duration / 60)} minutes`);
      this.addText(`Active Calories: ${Math.round(latestActivity.active_calories)} kcal`);
      this.addText(`Steps: ${latestActivity.steps.toLocaleString()}`);
      this.addText(`Resting Heart Rate: ${latestReadiness.resting_heart_rate || 'N/A'} bpm`);
      this.addText(`HRV Balance: ${latestReadiness.hrv_balance || 'N/A'} ms`);

      this.addSpace(5);
      this.addLine();
    }

    // AI Insights Section
    if (includeInsights && sleep.length > 0 && activity.length > 0 && readiness.length > 0) {
      this.addSpace(5);
      this.addTitle('AI-Powered Insights', 16);
      this.addSpace(3);

      const deepInsights = AdvancedAIEngine.generateDeepInsights(sleep, activity, readiness);

      deepInsights.slice(0, 5).forEach((insight, index) => {
        this.addSubtitle(`${index + 1}. ${insight.title}`, 12);
        this.addText(`Severity: ${insight.severity.toUpperCase()} | Confidence: ${Math.round(insight.confidence)}%`);
        this.addSpace(2);

        this.addText(insight.narrative);
        this.addSpace(3);

        if (insight.actionPlan.immediate.length > 0) {
          this.addBoldText('Immediate Actions:');
          insight.actionPlan.immediate.forEach(action => {
            this.addText(`• ${action}`, 10, 5);
          });
          this.addSpace(2);
        }

        if (insight.actionPlan.shortTerm.length > 0) {
          this.addBoldText('Short-term Recommendations:');
          insight.actionPlan.shortTerm.forEach(action => {
            this.addText(`• ${action}`, 10, 5);
          });
          this.addSpace(2);
        }

        this.addSpace(3);
        if (index < deepInsights.slice(0, 5).length - 1) {
          this.addLine();
          this.addSpace(3);
        }
      });
    }

    // Pattern Recognition Section (Commented out due to type mismatches - can be re-enabled later)
    // if (sleep.length > 0 && activity.length > 0 && readiness.length > 0) {
    //   this.addSpace(5);
    //   this.addLine();
    //   this.addSpace(5);
    //   this.addTitle('Pattern Analysis', 16);
    //   this.addSpace(3);
    // }

    // Contextual Intelligence Section (Commented out due to type mismatches - can be re-enabled later)
    // if (sleep.length > 0 && activity.length > 0 && readiness.length > 0) {
    //   this.addSpace(5);
    //   this.addLine();
    //   this.addSpace(5);
    //   this.addTitle('Contextual Analysis', 16);
    //   this.addSpace(3);
    // }

    // Footer
    this.yPosition = this.pageHeight - 15;
    this.doc.setFontSize(8);
    this.doc.setTextColor(150, 150, 150);
    this.doc.text(
      'Generated by Oura Dashboard - Data-driven health insights',
      this.pageWidth / 2,
      this.yPosition,
      { align: 'center' }
    );

    // Save the PDF
    const fileName = `oura-health-report-${new Date().toISOString().split('T')[0]}.pdf`;
    this.doc.save(fileName);
  }

  public exportSleepReport(sleep: SleepData[]): void {
    this.addHeader();
    this.addSpace(5);
    this.addTitle('Sleep Report', 16);
    this.addSpace(5);

    if (sleep.length === 0) {
      this.addText('No sleep data available.');
      this.doc.save(`sleep-report-${new Date().toISOString().split('T')[0]}.pdf`);
      return;
    }

    const avgSleep = Math.round(sleep.reduce((sum, s) => sum + s.score, 0) / sleep.length);
    const avgDuration = sleep.reduce((sum, s) => sum + s.total_sleep_duration, 0) / sleep.length / 3600;
    const avgDeep = sleep.reduce((sum, s) => sum + s.deep_sleep_duration, 0) / sleep.length / 60;
    const avgREM = sleep.reduce((sum, s) => sum + s.rem_sleep_duration, 0) / sleep.length / 60;
    const avgEfficiency = Math.round(sleep.reduce((sum, s) => sum + s.efficiency, 0) / sleep.length);

    this.addSubtitle('Average Sleep Metrics', 12);
    this.addSpace(3);
    this.addText(`Sleep Score: ${avgSleep}/100`);
    this.addText(`Total Sleep Time: ${avgDuration.toFixed(1)} hours`);
    this.addText(`Deep Sleep: ${Math.round(avgDeep)} minutes`);
    this.addText(`REM Sleep: ${Math.round(avgREM)} minutes`);
    this.addText(`Sleep Efficiency: ${avgEfficiency}%`);

    this.addSpace(5);
    this.addLine();
    this.addSpace(5);

    this.addSubtitle('Recent Sleep Data', 12);
    this.addSpace(3);

    sleep.slice(-7).reverse().forEach(day => {
      this.addBoldText(new Date(day.day).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }));
      this.addText(`Score: ${day.score}/100`, 9, 5);
      this.addText(`Duration: ${(day.total_sleep_duration / 3600).toFixed(1)}h`, 9, 5);
      this.addText(`Deep: ${Math.round(day.deep_sleep_duration / 60)}m | REM: ${Math.round(day.rem_sleep_duration / 60)}m`, 9, 5);
      this.addSpace(3);
    });

    this.doc.save(`sleep-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }
}

// Convenience function for exporting insights
export const exportInsightsToPDF = (
  sleep: SleepData[],
  activity: ActivityData[],
  readiness: ReadinessData[],
  options?: PDFExportOptions
) => {
  const exporter = new PDFExporter();
  exporter.exportInsightsReport(sleep, activity, readiness, options);
};

// Convenience function for exporting sleep data
export const exportSleepToPDF = (sleep: SleepData[]) => {
  const exporter = new PDFExporter();
  exporter.exportSleepReport(sleep);
};
