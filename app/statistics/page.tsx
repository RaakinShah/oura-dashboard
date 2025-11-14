'use client';

import { useState, useMemo } from 'react';
import { InteractiveLineChart } from '@/components/charts/InteractiveLineChart';
import { DistributionPlot } from '@/components/charts/DistributionPlot';
import { CorrelationMatrix } from '@/components/charts/CorrelationMatrix';
import { StatCard } from '@/components/ui/StatCard';
import { DataCard } from '@/components/ui/DataCard';
import { InsightCard } from '@/components/ui/InsightCard';
import { Tabs } from '@/components/ui/Tabs';
import { ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import { BayesianInference } from '@/lib/stats/BayesianInference';
import { MonteCarloSimulation } from '@/lib/stats/MonteCarloSimulation';
import { HypothesisTesting } from '@/lib/stats/HypothesisTesting';
import { TrendingUp, Brain, Target, Zap, LineChart } from 'lucide-react';

export default function StatisticsLabPage() {
  // Generate sample health data
  const sampleData = useMemo(() => {
    const days = 90;
    const data = [];

    for (let i = 0; i < days; i++) {
      data.push({
        x: i,
        y: 70 + Math.sin(i / 7) * 10 + Math.random() * 5,
        label: `Day ${i}`,
        metadata: {
          readiness: Math.floor(70 + Math.random() * 30),
          activity: Math.floor(200 + Math.random() * 200),
        },
      });
    }

    return data;
  }, []);

  // Generate distribution data
  const distributionData = useMemo(() => {
    const data = [];
    for (let i = 0; i < 1000; i++) {
      // Normal distribution around 75
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      data.push(75 + z * 10);
    }
    return data;
  }, []);

  // Generate correlation matrix data
  const correlationData = useMemo(() => {
    const n = 100;
    const data = [];

    for (let i = 0; i < n; i++) {
      const sleep = 6 + Math.random() * 3;
      const hrv = 40 + sleep * 5 + Math.random() * 10;
      const readiness = 50 + sleep * 6 + hrv * 0.3 + Math.random() * 10;
      const activity = 200 + Math.random() * 200;
      const recovery = 60 + sleep * 4 + Math.random() * 15;

      data.push([sleep, hrv, readiness, activity, recovery]);
    }

    return data;
  }, []);

  // Bayesian A/B Test Example
  const bayesianTest = useMemo(() => {
    const bayes = new BayesianInference();
    return bayes.abTest(
      850, 1000, // Control: 850 success out of 1000
      920, 1000, // Treatment: 920 success out of 1000
      { alpha: 1, beta: 1 }
    );
  }, []);

  // Monte Carlo Simulation Example
  const monteCarloResult = useMemo(() => {
    const mc = new MonteCarloSimulation(12345);

    // Simulate future readiness scores
    return mc.simulate(
      () => mc.normalSample(75, 10),
      { iterations: 10000, confidenceLevel: 0.95 }
    );
  }, []);

  // Hypothesis Testing Example
  const tTestResult = useMemo(() => {
    const ht = new HypothesisTesting();

    // Compare two groups
    const group1 = Array.from({ length: 50 }, () => 70 + Math.random() * 20);
    const group2 = Array.from({ length: 50 }, () => 75 + Math.random() * 20);

    return ht.twoSampleTTest(group1, group2, 0.05, true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <LineChart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-stone-900">
                Statistics Laboratory
              </h1>
              <p className="text-base text-stone-600 mt-1">
                Enterprise-grade statistical analysis and interactive visualizations
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">
            Live Statistical Metrics
          </h2>
          <ResponsiveGrid
            items={[
              {
                id: 'bayesian',
                content: (
                  <StatCard
                    label="Bayesian Confidence"
                    value={`${(bayesianTest.probabilityTreatmentBetter * 100).toFixed(1)}%`}
                    unit=""
                    prediction={{
                      value: `${(bayesianTest.expectedLift * 100).toFixed(1)}%`,
                      confidence: bayesianTest.probabilityTreatmentBetter,
                      trend: bayesianTest.expectedLift > 0 ? 'increasing' : 'decreasing',
                    }}
                    icon={<Brain className="h-6 w-6" />}
                    gradient
                  />
                ),
                span: { cols: 1 },
              },
              {
                id: 'montecarlo',
                content: (
                  <StatCard
                    label="Monte Carlo Mean"
                    value={monteCarloResult.mean.toFixed(1)}
                    unit="score"
                    prediction={{
                      value: monteCarloResult.percentiles[95].toFixed(1),
                      confidence: 0.95,
                      trend: 'stable',
                    }}
                    icon={<Target className="h-6 w-6" />}
                  />
                ),
                span: { cols: 1 },
              },
              {
                id: 'ttest',
                content: (
                  <DataCard
                    title="T-Test Result"
                    value={tTestResult.statistic.toFixed(3)}
                    subtitle={`p-value: ${tTestResult.pValue.toFixed(4)}`}
                    trend={{
                      value: ((tTestResult.effectSize || 0) * 100),
                      direction: tTestResult.reject ? 'up' : 'neutral',
                      label: tTestResult.reject ? 'Significant' : 'Not Significant',
                    }}
                    icon={<TrendingUp className="h-5 w-5" />}
                    variant={tTestResult.reject ? 'success' : 'default'}
                  />
                ),
                span: { cols: 1 },
              },
              {
                id: 'simulation',
                content: (
                  <DataCard
                    title="Simulation Range"
                    value={`${monteCarloResult.confidenceInterval.lower.toFixed(1)} - ${monteCarloResult.confidenceInterval.upper.toFixed(1)}`}
                    subtitle="95% Confidence Interval"
                    icon={<Zap className="h-5 w-5" />}
                    variant="info"
                  />
                ),
                span: { cols: 1 },
              },
            ]}
            columns={{ xs: 1, sm: 2, md: 2, lg: 4 }}
            gap={20}
            className="mb-10"
          />
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
          <Tabs
            tabs={[
              {
                id: 'interactive',
                label: 'Interactive Charts',
                icon: <TrendingUp className="h-4 w-4" />,
                content: (
                  <div className="space-y-10 p-8">
                    {/* Time Series Section */}
                    <div>
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-stone-900 mb-2">Interactive Time Series</h3>
                        <p className="text-stone-600">
                          Zoom (scroll), pan (drag), and hover for details. Try interacting with the chart!
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-100">
                        <InteractiveLineChart
                          data={sampleData}
                          width={900}
                          height={400}
                          color="#6366f1"
                          showTooltip={true}
                          showCrosshair={true}
                          enableZoom={true}
                          enablePan={true}
                          xLabel="Days"
                          yLabel="Health Score"
                        />
                      </div>
                    </div>

                    {/* Distribution & Correlation Section */}
                    <div>
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-stone-900 mb-2">Statistical Distributions</h3>
                        <p className="text-stone-600">
                          Distribution analysis with KDE, box plots, and correlation matrices
                        </p>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                          <DistributionPlot
                            data={distributionData}
                            width={500}
                            height={450}
                            bins={40}
                            showKDE={true}
                            showBoxPlot={true}
                            showStats={true}
                            color="#8b5cf6"
                            title="Readiness Score Distribution (N=1000)"
                          />
                        </div>

                        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100">
                          <CorrelationMatrix
                            data={correlationData}
                            labels={['Sleep', 'HRV', 'Readiness', 'Activity', 'Recovery']}
                            width={500}
                            height={500}
                            showValues={true}
                            colorScheme="diverging"
                            title="Health Metrics Correlation"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                id: 'bayesian',
                label: 'Bayesian Analysis',
                icon: <Brain className="h-4 w-4" />,
                content: (
                  <div className="space-y-8 p-8">
                    <div>
                      <h3 className="text-2xl font-bold text-stone-900 mb-6">Bayesian A/B Testing Results</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                          <h4 className="text-lg font-bold text-blue-900 mb-4">Control Group</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-blue-700 font-medium">Success Rate:</span>
                              <span className="font-bold text-lg">85.0%</span>
                            </div>
                            <div className="h-px bg-blue-200"></div>
                            <div className="flex justify-between">
                              <span className="text-blue-700">Posterior α:</span>
                              <span className="font-mono font-semibold">{bayesianTest.controlPosterior.alpha.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-700">Posterior β:</span>
                              <span className="font-mono font-semibold">{bayesianTest.controlPosterior.beta.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-700">Mean:</span>
                              <span className="font-mono font-semibold">{(bayesianTest.controlPosterior.mean * 100).toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-700">95% CI:</span>
                              <span className="font-mono text-xs">
                                [{(bayesianTest.controlPosterior.credibleInterval.lower * 100).toFixed(1)}%,
                                {(bayesianTest.controlPosterior.credibleInterval.upper * 100).toFixed(1)}%]
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                          <h4 className="text-lg font-bold text-green-900 mb-4">Treatment Group</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium">Success Rate:</span>
                              <span className="font-bold text-lg">92.0%</span>
                            </div>
                            <div className="h-px bg-green-200"></div>
                            <div className="flex justify-between">
                              <span className="text-green-700">Posterior α:</span>
                              <span className="font-mono font-semibold">{bayesianTest.treatmentPosterior.alpha.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700">Posterior β:</span>
                              <span className="font-mono font-semibold">{bayesianTest.treatmentPosterior.beta.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700">Mean:</span>
                              <span className="font-mono font-semibold">{(bayesianTest.treatmentPosterior.mean * 100).toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700">95% CI:</span>
                              <span className="font-mono text-xs">
                                [{(bayesianTest.treatmentPosterior.credibleInterval.lower * 100).toFixed(1)}%,
                                {(bayesianTest.treatmentPosterior.credibleInterval.upper * 100).toFixed(1)}%]
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-8 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 rounded-xl border border-purple-200">
                        <h4 className="text-lg font-bold text-purple-900 mb-6">Decision Metrics</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <div className="text-sm font-medium text-purple-700 mb-2">Probability Treatment Better</div>
                            <div className="text-4xl font-bold text-purple-900">
                              {(bayesianTest.probabilityTreatmentBetter * 100).toFixed(2)}%
                            </div>
                            <div className="mt-3 h-3 bg-purple-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-1000"
                                style={{ width: `${bayesianTest.probabilityTreatmentBetter * 100}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-purple-700 mb-2">Expected Lift</div>
                            <div className="text-4xl font-bold text-purple-900">
                              {(bayesianTest.expectedLift * 100).toFixed(2)}%
                            </div>
                            <div className="mt-3 text-sm font-medium text-purple-600">
                              {bayesianTest.probabilityTreatmentBetter > 0.95
                                ? '✅ Strong evidence for treatment'
                                : bayesianTest.probabilityTreatmentBetter > 0.80
                                ? '⚠️ Moderate evidence for treatment'
                                : '❌ Insufficient evidence'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                id: 'montecarlo',
                label: 'Monte Carlo',
                icon: <Target className="h-4 w-4" />,
                content: (
                  <div className="space-y-8 p-8">
                    <div>
                      <h3 className="text-2xl font-bold text-stone-900 mb-2">Monte Carlo Simulation</h3>
                      <p className="text-stone-600 mb-8">10,000 iterations with Normal distribution sampling</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        {[
                          { label: 'Mean', value: monteCarloResult.mean.toFixed(2), color: 'indigo' },
                          { label: 'Median', value: monteCarloResult.median.toFixed(2), color: 'purple' },
                          { label: 'Std Dev', value: monteCarloResult.stdDev.toFixed(2), color: 'pink' },
                          { label: 'Variance', value: monteCarloResult.variance.toFixed(2), color: 'rose' },
                        ].map((stat) => (
                          <div key={stat.label} className={`p-5 bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 rounded-xl border border-${stat.color}-200`}>
                            <div className="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-2">{stat.label}</div>
                            <div className="text-3xl font-bold text-stone-900">{stat.value}</div>
                          </div>
                        ))}
                      </div>

                      <div className="mb-8">
                        <h4 className="text-lg font-bold text-stone-900 mb-4">Percentiles</h4>
                        <div className="grid grid-cols-5 gap-4">
                          {[5, 25, 50, 75, 95].map((p, i) => (
                            <div key={p} className={`text-center p-4 bg-gradient-to-br ${i === 2 ? 'from-indigo-100 to-indigo-200 border-2 border-indigo-300' : 'from-indigo-50 to-indigo-100'} rounded-xl`}>
                              <div className="text-xs font-semibold text-indigo-700 mb-1">P{p}</div>
                              <div className="text-xl font-bold text-indigo-900">
                                {monteCarloResult.percentiles[p].toFixed(1)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 rounded-xl border border-blue-200">
                        <h4 className="text-lg font-bold text-blue-900 mb-4">95% Confidence Interval</h4>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-blue-700">Lower Bound:</span>
                          <span className="font-mono font-bold text-2xl text-blue-900">
                            {monteCarloResult.confidenceInterval.lower.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-blue-700">Upper Bound:</span>
                          <span className="font-mono font-bold text-2xl text-blue-900">
                            {monteCarloResult.confidenceInterval.upper.toFixed(2)}
                          </span>
                        </div>
                        <div className="h-px bg-blue-300 my-3"></div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-700">Range:</span>
                          <span className="font-semibold text-lg text-blue-900">
                            {(monteCarloResult.confidenceInterval.upper - monteCarloResult.confidenceInterval.lower).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                id: 'hypothesis',
                label: 'Hypothesis Tests',
                icon: <Zap className="h-4 w-4" />,
                content: (
                  <div className="space-y-8 p-8">
                    <div>
                      <h3 className="text-2xl font-bold text-stone-900 mb-6">Two-Sample T-Test Results</h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                          <div className="text-sm font-semibold text-purple-700 uppercase tracking-wide mb-2">T-Statistic</div>
                          <div className="text-4xl font-bold text-purple-900">
                            {tTestResult.statistic.toFixed(3)}
                          </div>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border border-pink-200">
                          <div className="text-sm font-semibold text-pink-700 uppercase tracking-wide mb-2">P-Value</div>
                          <div className="text-4xl font-bold text-pink-900">
                            {tTestResult.pValue.toFixed(4)}
                          </div>
                          <div className="mt-3 text-sm font-semibold text-pink-600">
                            {tTestResult.pValue < 0.05 ? '✅ p < 0.05' : '❌ p ≥ 0.05'}
                          </div>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                          <div className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-2">Effect Size</div>
                          <div className="text-4xl font-bold text-amber-900">
                            {(tTestResult.effectSize || 0).toFixed(3)}
                          </div>
                          <div className="mt-3 text-sm font-semibold text-amber-600">
                            {Math.abs(tTestResult.effectSize || 0) > 0.8
                              ? 'Large effect'
                              : Math.abs(tTestResult.effectSize || 0) > 0.5
                              ? 'Medium effect'
                              : 'Small effect'}
                          </div>
                        </div>
                      </div>

                      <div className={`p-6 rounded-xl ${tTestResult.reject ? 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200' : 'bg-gradient-to-br from-stone-50 to-stone-100 border border-stone-200'}`}>
                        <h4 className="text-lg font-bold mb-3">
                          {tTestResult.reject ? '✅ Reject Null Hypothesis' : '❌ Fail to Reject Null Hypothesis'}
                        </h4>
                        <p className="text-sm leading-relaxed">
                          {tTestResult.reject
                            ? 'There is statistically significant evidence that the two groups have different means (α = 0.05).'
                            : 'There is insufficient evidence to conclude that the two groups have different means (α = 0.05).'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-xl p-8 text-white shadow-xl">
                      <h3 className="text-2xl font-bold mb-6">Available Statistical Tests</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start gap-3">
                          <span className="text-xl">✓</span>
                          <span>One-sample, Two-sample, and Paired t-tests</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-xl">✓</span>
                          <span>Chi-square test for independence</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-xl">✓</span>
                          <span>One-way ANOVA with effect sizes</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-xl">✓</span>
                          <span>Mann-Whitney U test (non-parametric)</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-xl">✓</span>
                          <span>Kolmogorov-Smirnov test</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-xl">✓</span>
                          <span>Effect size calculations (Cohen's d, Cramér's V, eta-squared)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
            ]}
            variant="underline"
          />
        </div>
      </div>
    </div>
  );
}
