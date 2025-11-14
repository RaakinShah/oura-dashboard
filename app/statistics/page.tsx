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
import { TrendingUp, Brain, Target, Zap } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-stone-900 mb-2">
            📊 Advanced Statistics Laboratory
          </h1>
          <p className="text-lg text-stone-600">
            Enterprise-grade statistical analysis and interactive visualizations
          </p>
        </div>

        {/* Key Metrics */}
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
          gap={16}
          className="mb-8"
        />

        {/* Insights */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <InsightCard
            type="prediction"
            severity="high"
            title="Bayesian A/B Test Analysis"
            description={`The treatment shows a ${(bayesianTest.probabilityTreatmentBetter * 100).toFixed(1)}% probability of being better than control, with an expected lift of ${(bayesianTest.expectedLift * 100).toFixed(2)}%. Treatment posterior: α=${bayesianTest.treatmentPosterior.alpha.toFixed(1)}, β=${bayesianTest.treatmentPosterior.beta.toFixed(1)}`}
            confidence={bayesianTest.probabilityTreatmentBetter}
          />

          <InsightCard
            type="pattern"
            severity="medium"
            title="Monte Carlo Distribution Analysis"
            description={`Simulated 10,000 iterations with mean=${monteCarloResult.mean.toFixed(2)}, median=${monteCarloResult.median.toFixed(2)}, σ=${monteCarloResult.stdDev.toFixed(2)}. 95% CI: [${monteCarloResult.confidenceInterval.lower.toFixed(1)}, ${monteCarloResult.confidenceInterval.upper.toFixed(1)}]`}
            confidence={0.95}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs
          tabs={[
            {
              id: 'interactive',
              label: 'Interactive Charts',
              icon: <TrendingUp className="h-4 w-4" />,
              content: (
                <div className="space-y-8">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Interactive Time Series</h3>
                    <p className="text-sm text-stone-600 mb-4">
                      Zoom (scroll), pan (drag), and hover for details. Try interacting with the chart!
                    </p>
                    <InteractiveLineChart
                      data={sampleData}
                      width={900}
                      height={400}
                      color="#6366f1"
                      showTooltip={true}
                      showCrosshair={true}
                      enableZoom={true}
                      enablePan={true}
                      title="90-Day Health Score Trend"
                      xLabel="Days"
                      yLabel="Health Score"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-lg">
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

                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <CorrelationMatrix
                        data={correlationData}
                        labels={['Sleep', 'HRV', 'Readiness', 'Activity', 'Recovery']}
                        width={500}
                        height={500}
                        showValues={true}
                        colorScheme="diverging"
                        title="Health Metrics Correlation Matrix"
                      />
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
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Bayesian A/B Testing Results</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-3">Control Group</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700">Success Rate:</span>
                            <span className="font-semibold">85.0%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Posterior α:</span>
                            <span className="font-mono">{bayesianTest.controlPosterior.alpha.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Posterior β:</span>
                            <span className="font-mono">{bayesianTest.controlPosterior.beta.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Mean:</span>
                            <span className="font-mono">{(bayesianTest.controlPosterior.mean * 100).toFixed(2)}%</span>
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

                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-3">Treatment Group</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-green-700">Success Rate:</span>
                            <span className="font-semibold">92.0%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Posterior α:</span>
                            <span className="font-mono">{bayesianTest.treatmentPosterior.alpha.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Posterior β:</span>
                            <span className="font-mono">{bayesianTest.treatmentPosterior.beta.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Mean:</span>
                            <span className="font-mono">{(bayesianTest.treatmentPosterior.mean * 100).toFixed(2)}%</span>
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

                    <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-4">Decision Metrics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-purple-700 mb-1">Probability Treatment Better</div>
                          <div className="text-3xl font-bold text-purple-900">
                            {(bayesianTest.probabilityTreatmentBetter * 100).toFixed(2)}%
                          </div>
                          <div className="mt-2 h-2 bg-purple-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-600 transition-all duration-1000"
                              style={{ width: `${bayesianTest.probabilityTreatmentBetter * 100}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-purple-700 mb-1">Expected Lift</div>
                          <div className="text-3xl font-bold text-purple-900">
                            {(bayesianTest.expectedLift * 100).toFixed(2)}%
                          </div>
                          <div className="mt-2 text-xs text-purple-600">
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
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Monte Carlo Simulation (10,000 iterations)</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {[
                        { label: 'Mean', value: monteCarloResult.mean.toFixed(2) },
                        { label: 'Median', value: monteCarloResult.median.toFixed(2) },
                        { label: 'Std Dev', value: monteCarloResult.stdDev.toFixed(2) },
                        { label: 'Variance', value: monteCarloResult.variance.toFixed(2) },
                      ].map((stat) => (
                        <div key={stat.label} className="p-4 bg-stone-50 rounded-lg">
                          <div className="text-xs text-stone-600 mb-1">{stat.label}</div>
                          <div className="text-2xl font-bold text-stone-900">{stat.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">Percentiles</h4>
                      <div className="grid grid-cols-4 gap-3">
                        {[5, 25, 50, 75, 95].map((p) => (
                          <div key={p} className="text-center p-3 bg-indigo-50 rounded-lg">
                            <div className="text-xs text-indigo-600">P{p}</div>
                            <div className="text-lg font-bold text-indigo-900">
                              {monteCarloResult.percentiles[p].toFixed(1)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">95% Confidence Interval</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">Lower Bound:</span>
                        <span className="font-mono font-bold text-blue-900">
                          {monteCarloResult.confidenceInterval.lower.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-blue-700">Upper Bound:</span>
                        <span className="font-mono font-bold text-blue-900">
                          {monteCarloResult.confidenceInterval.upper.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-3 text-xs text-blue-600">
                        Range: {(monteCarloResult.confidenceInterval.upper - monteCarloResult.confidenceInterval.lower).toFixed(2)}
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
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Two-Sample T-Test Results</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-sm text-purple-700 mb-1">T-Statistic</div>
                        <div className="text-3xl font-bold text-purple-900">
                          {tTestResult.statistic.toFixed(3)}
                        </div>
                      </div>

                      <div className="p-4 bg-pink-50 rounded-lg">
                        <div className="text-sm text-pink-700 mb-1">P-Value</div>
                        <div className="text-3xl font-bold text-pink-900">
                          {tTestResult.pValue.toFixed(4)}
                        </div>
                        <div className="mt-2 text-xs text-pink-600">
                          {tTestResult.pValue < 0.05 ? '✅ p < 0.05' : '❌ p ≥ 0.05'}
                        </div>
                      </div>

                      <div className="p-4 bg-amber-50 rounded-lg">
                        <div className="text-sm text-amber-700 mb-1">Effect Size (Cohen's d)</div>
                        <div className="text-3xl font-bold text-amber-900">
                          {(tTestResult.effectSize || 0).toFixed(3)}
                        </div>
                        <div className="mt-2 text-xs text-amber-600">
                          {Math.abs(tTestResult.effectSize || 0) > 0.8
                            ? 'Large effect'
                            : Math.abs(tTestResult.effectSize || 0) > 0.5
                            ? 'Medium effect'
                            : 'Small effect'}
                        </div>
                      </div>
                    </div>

                    <div className={`p-6 rounded-lg ${tTestResult.reject ? 'bg-green-50' : 'bg-stone-50'}`}>
                      <h4 className="font-semibold mb-2">
                        {tTestResult.reject ? '✅ Reject Null Hypothesis' : '❌ Fail to Reject Null Hypothesis'}
                      </h4>
                      <p className="text-sm text-stone-700">
                        {tTestResult.reject
                          ? 'There is statistically significant evidence that the two groups have different means (α = 0.05).'
                          : 'There is insufficient evidence to conclude that the two groups have different means (α = 0.05).'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Available Statistical Tests</h3>
                    <ul className="space-y-2 text-sm">
                      <li>✓ One-sample, Two-sample, and Paired t-tests</li>
                      <li>✓ Chi-square test for independence</li>
                      <li>✓ One-way ANOVA with effect sizes</li>
                      <li>✓ Mann-Whitney U test (non-parametric)</li>
                      <li>✓ Kolmogorov-Smirnov test</li>
                      <li>✓ Effect size calculations (Cohen's d, Cramér's V, eta-squared)</li>
                    </ul>
                  </div>
                </div>
              ),
            },
          ]}
          variant="underline"
        />
      </div>
    </div>
  );
}
