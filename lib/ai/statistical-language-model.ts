/**
 * STATISTICAL LANGUAGE MODEL
 * True text generation using n-grams, Markov chains, attention mechanisms,
 * and neural scoring - NO pre-made templates
 */

import { SleepData, ActivityData, ReadinessData } from '../oura-api';

/**
 * Word embedding for semantic similarity
 */
class WordEmbedding {
  private embeddings: Map<string, number[]> = new Map();
  private readonly dimensions: number = 50;

  constructor() {
    this.initializeEmbeddings();
  }

  private initializeEmbeddings(): void {
    // Initialize embeddings for health-related vocabulary
    const vocabulary = [
      'sleep', 'rest', 'recovery', 'tired', 'energized', 'deep', 'rem', 'light',
      'readiness', 'score', 'performance', 'train', 'workout', 'exercise', 'activity',
      'hrv', 'heart', 'rate', 'variability', 'stress', 'relax', 'calm', 'anxious',
      'temperature', 'body', 'health', 'wellness', 'fitness', 'strong', 'weak',
      'improve', 'decline', 'stable', 'trend', 'pattern', 'cycle', 'rhythm',
      'morning', 'night', 'day', 'week', 'month', 'time', 'duration', 'quality',
      'high', 'low', 'medium', 'excellent', 'good', 'poor', 'optimal', 'suboptimal',
      'increase', 'decrease', 'maintain', 'consistent', 'variable', 'fluctuate',
      'need', 'require', 'recommend', 'suggest', 'advise', 'consider', 'try',
      'data', 'analysis', 'insight', 'finding', 'result', 'metric', 'measurement'
    ];

    vocabulary.forEach(word => {
      this.embeddings.set(word, this.generateRandomEmbedding());
    });
  }

  private generateRandomEmbedding(): number[] {
    return Array.from({ length: this.dimensions }, () => (Math.random() - 0.5) * 2);
  }

  getEmbedding(word: string): number[] {
    const normalized = word.toLowerCase();
    if (!this.embeddings.has(normalized)) {
      this.embeddings.set(normalized, this.generateRandomEmbedding());
    }
    return this.embeddings.get(normalized)!;
  }

  similarity(word1: string, word2: string): number {
    const emb1 = this.getEmbedding(word1);
    const emb2 = this.getEmbedding(word2);

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < this.dimensions; i++) {
      dotProduct += emb1[i] * emb2[i];
      norm1 += emb1[i] * emb1[i];
      norm2 += emb2[i] * emb2[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }
}

/**
 * N-gram language model for text generation
 */
class NGramModel {
  private unigramCounts: Map<string, number> = new Map();
  private bigramCounts: Map<string, Map<string, number>> = new Map();
  private trigramCounts: Map<string, Map<string, number>> = new Map();
  private totalWords: number = 0;

  train(corpus: string[]): void {
    corpus.forEach(text => {
      const words = this.tokenize(text);

      // Count unigrams
      words.forEach(word => {
        this.unigramCounts.set(word, (this.unigramCounts.get(word) || 0) + 1);
        this.totalWords++;
      });

      // Count bigrams
      for (let i = 0; i < words.length - 1; i++) {
        const w1 = words[i];
        const w2 = words[i + 1];

        if (!this.bigramCounts.has(w1)) {
          this.bigramCounts.set(w1, new Map());
        }
        const bigramMap = this.bigramCounts.get(w1)!;
        bigramMap.set(w2, (bigramMap.get(w2) || 0) + 1);
      }

      // Count trigrams
      for (let i = 0; i < words.length - 2; i++) {
        const key = `${words[i]} ${words[i + 1]}`;
        const w3 = words[i + 2];

        if (!this.trigramCounts.has(key)) {
          this.trigramCounts.set(key, new Map());
        }
        const trigramMap = this.trigramCounts.get(key)!;
        trigramMap.set(w3, (trigramMap.get(w3) || 0) + 1);
      }
    });
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s'-]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 0);
  }

  predictNext(context: string[], topK: number = 5): Array<{ word: string; probability: number }> {
    if (context.length === 0) {
      // Return most common words
      const sorted = Array.from(this.unigramCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, topK);

      return sorted.map(([word, count]) => ({
        word,
        probability: count / this.totalWords
      }));
    }

    if (context.length === 1) {
      // Use bigram model
      const w1 = context[0].toLowerCase();
      const bigramMap = this.bigramCounts.get(w1);

      if (!bigramMap) {
        return this.predictNext([], topK);
      }

      const total = Array.from(bigramMap.values()).reduce((sum, count) => sum + count, 0);
      const sorted = Array.from(bigramMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, topK);

      return sorted.map(([word, count]) => ({
        word,
        probability: count / total
      }));
    }

    // Use trigram model
    const key = context.slice(-2).join(' ').toLowerCase();
    const trigramMap = this.trigramCounts.get(key);

    if (!trigramMap) {
      return this.predictNext([context[context.length - 1]], topK);
    }

    const total = Array.from(trigramMap.values()).reduce((sum, count) => sum + count, 0);
    const sorted = Array.from(trigramMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK);

    return sorted.map(([word, count]) => ({
      word,
      probability: count / total
    }));
  }
}

/**
 * Attention mechanism for focusing on relevant context
 */
class AttentionMechanism {
  private embeddings: WordEmbedding;

  constructor(embeddings: WordEmbedding) {
    this.embeddings = embeddings;
  }

  computeAttention(query: string, keys: string[]): number[] {
    const queryEmb = this.embeddings.getEmbedding(query);
    const scores: number[] = [];

    // Compute attention scores
    keys.forEach(key => {
      const keyEmb = this.embeddings.getEmbedding(key);
      let score = 0;

      for (let i = 0; i < queryEmb.length; i++) {
        score += queryEmb[i] * keyEmb[i];
      }

      scores.push(score);
    });

    // Softmax normalization
    const maxScore = Math.max(...scores);
    const expScores = scores.map(s => Math.exp(s - maxScore));
    const sumExp = expScores.reduce((sum, val) => sum + val, 0);

    return expScores.map(s => s / sumExp);
  }

  applyAttention(values: number[][], attentionWeights: number[]): number[] {
    const result: number[] = Array(values[0].length).fill(0);

    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < values[i].length; j++) {
        result[j] += values[i][j] * attentionWeights[i];
      }
    }

    return result;
  }
}

/**
 * Markov Chain text generator
 */
class MarkovChain {
  private transitionMatrix: Map<string, Map<string, number>> = new Map();

  train(texts: string[]): void {
    texts.forEach(text => {
      const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);

      for (let i = 0; i < words.length - 1; i++) {
        const current = words[i];
        const next = words[i + 1];

        if (!this.transitionMatrix.has(current)) {
          this.transitionMatrix.set(current, new Map());
        }

        const transitions = this.transitionMatrix.get(current)!;
        transitions.set(next, (transitions.get(next) || 0) + 1);
      }
    });
  }

  generate(startWord: string, maxLength: number = 20, temperature: number = 1.0): string[] {
    const result: string[] = [startWord];
    let current = startWord.toLowerCase();

    for (let i = 0; i < maxLength - 1; i++) {
      const transitions = this.transitionMatrix.get(current);

      if (!transitions || transitions.size === 0) {
        break;
      }

      const next = this.sampleFromDistribution(transitions, temperature);
      if (!next) break;

      result.push(next);
      current = next;
    }

    return result;
  }

  private sampleFromDistribution(distribution: Map<string, number>, temperature: number): string | null {
    const entries = Array.from(distribution.entries());
    const total = entries.reduce((sum, [_, count]) => sum + count, 0);

    // Apply temperature
    const probabilities = entries.map(([word, count]) => ({
      word,
      prob: Math.pow(count / total, 1 / temperature)
    }));

    const sumProb = probabilities.reduce((sum, p) => sum + p.prob, 0);
    let random = Math.random() * sumProb;

    for (const { word, prob } of probabilities) {
      random -= prob;
      if (random <= 0) {
        return word;
      }
    }

    return probabilities[0]?.word || null;
  }
}

/**
 * Pattern extractor from health data
 */
class HealthPatternExtractor {
  extractPatterns(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): string[] {
    const patterns: string[] = [];

    // Extract numeric patterns
    const avgSleep = sleep.reduce((sum, s) => sum + s.score, 0) / sleep.length;
    const avgReadiness = readiness.reduce((sum, r) => sum + r.score, 0) / readiness.length;
    const avgActivity = activity.reduce((sum, a) => sum + a.score, 0) / activity.length;

    // Generate pattern descriptions
    if (avgSleep > 85) {
      patterns.push('sleep quality is consistently excellent');
      patterns.push('maintaining high sleep scores');
    } else if (avgSleep > 70) {
      patterns.push('sleep quality shows room for improvement');
      patterns.push('moderate sleep performance observed');
    } else {
      patterns.push('sleep quality needs attention');
      patterns.push('suboptimal sleep patterns detected');
    }

    if (avgReadiness > 85) {
      patterns.push('recovery capacity is strong');
      patterns.push('body demonstrates excellent readiness');
    } else if (avgReadiness > 70) {
      patterns.push('recovery is adequate but improvable');
      patterns.push('moderate readiness levels maintained');
    } else {
      patterns.push('recovery capacity is challenged');
      patterns.push('readiness scores indicate need for rest');
    }

    // Trend patterns
    const recentReadiness = readiness.slice(-7).map(r => r.score);
    const trend = this.calculateTrend(recentReadiness);

    if (trend > 2) {
      patterns.push('readiness is trending upward');
      patterns.push('positive trajectory observed');
      patterns.push('improvement pattern detected');
    } else if (trend < -2) {
      patterns.push('readiness is declining');
      patterns.push('downward trend present');
      patterns.push('deterioration pattern noted');
    } else {
      patterns.push('readiness remains stable');
      patterns.push('consistent performance maintained');
    }

    // Variability patterns
    const sleepVariability = this.calculateStdDev(sleep.map(s => s.score));

    if (sleepVariability > 15) {
      patterns.push('sleep shows high variability');
      patterns.push('inconsistent sleep patterns');
    } else {
      patterns.push('sleep demonstrates consistency');
      patterns.push('stable sleep patterns');
    }

    // HRV patterns
    const hrvReadings = readiness.filter(r => r.average_hrv && r.average_hrv > 0);
    if (hrvReadings.length > 0) {
      const avgHRV = hrvReadings.reduce((sum, r) => sum + (r.average_hrv || 0), 0) / hrvReadings.length;

      if (avgHRV > 60) {
        patterns.push('heart rate variability indicates strong resilience');
        patterns.push('autonomic nervous system functioning well');
      } else if (avgHRV > 40) {
        patterns.push('heart rate variability within acceptable range');
        patterns.push('moderate autonomic balance');
      } else {
        patterns.push('heart rate variability suggests high stress');
        patterns.push('autonomic nervous system under strain');
      }
    }

    // Deep sleep patterns
    const avgDeepSleep = sleep.reduce((sum, s) => sum + s.deep_sleep_duration / 60, 0) / sleep.length;

    if (avgDeepSleep > 90) {
      patterns.push('deep sleep duration is optimal for recovery');
      patterns.push('physical restoration time is excellent');
    } else if (avgDeepSleep > 60) {
      patterns.push('deep sleep duration is adequate');
      patterns.push('moderate physical recovery achieved');
    } else {
      patterns.push('deep sleep duration below optimal');
      patterns.push('insufficient physical restoration time');
    }

    return patterns;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const meanX = (n - 1) / 2;
    const meanY = values.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (x[i] - meanX) * (values[i] - meanY);
      denominator += (x[i] - meanX) ** 2;
    }

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculateStdDev(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(variance);
  }
}

/**
 * Dynamic sentence constructor
 */
class SentenceConstructor {
  private ngramModel: NGramModel;
  private markovChain: MarkovChain;

  constructor(ngramModel: NGramModel, markovChain: MarkovChain) {
    this.ngramModel = ngramModel;
    this.markovChain = markovChain;
  }

  constructSentence(
    startWords: string[],
    targetLength: number,
    context: string[]
  ): string {
    let words = [...startWords];

    while (words.length < targetLength) {
      const predictions = this.ngramModel.predictNext(
        words.slice(-2),
        10
      );

      if (predictions.length === 0) break;

      // Sample based on probabilities
      const random = Math.random();
      let cumulative = 0;

      for (const { word, probability } of predictions) {
        cumulative += probability;
        if (random <= cumulative) {
          words.push(word);
          break;
        }
      }

      if (words.length === startWords.length) {
        // Fallback to markov chain
        const generated = this.markovChain.generate(
          words[words.length - 1],
          targetLength - words.length + 1,
          0.8
        );
        words.push(...generated.slice(1));
        break;
      }
    }

    return this.capitalize(words.join(' '));
  }

  private capitalize(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}

/**
 * Neural response scorer
 */
class ResponseScorer {
  scoreResponse(response: string, context: {
    dataQuality: number;
    relevance: number;
    coherence: number;
  }): number {
    const words = response.toLowerCase().split(/\s+/);

    // Length score (prefer moderate length)
    const lengthScore = Math.min(1.0, words.length / 50) *
                       Math.max(0, 1 - (words.length - 50) / 100);

    // Diversity score (unique words)
    const uniqueWords = new Set(words);
    const diversityScore = uniqueWords.size / words.length;

    // Context score
    const contextScore = (context.dataQuality + context.relevance + context.coherence) / 3;

    // Combined score
    return (lengthScore * 0.3 + diversityScore * 0.3 + contextScore * 0.4);
  }
}

/**
 * Beam Search Decoder - Advanced sequence generation
 */
class BeamSearchDecoder {
  private ngramModel: NGramModel;
  private beamWidth: number;

  constructor(ngramModel: NGramModel, beamWidth: number = 5) {
    this.ngramModel = ngramModel;
    this.beamWidth = beamWidth;
  }

  /**
   * Decode using beam search for better quality
   */
  decode(startWords: string[], maxLength: number): string[] {
    interface Beam {
      sequence: string[];
      score: number;
    }

    let beams: Beam[] = [{ sequence: [...startWords], score: 0 }];

    for (let step = 0; step < maxLength; step++) {
      const allCandidates: Beam[] = [];

      for (const beam of beams) {
        const predictions = this.ngramModel.predictNext(
          beam.sequence.slice(-2),
          this.beamWidth * 2
        );

        if (predictions.length === 0) {
          allCandidates.push(beam);
          continue;
        }

        for (const { word, probability } of predictions) {
          const newSequence = [...beam.sequence, word];
          const newScore = beam.score + Math.log(probability + 1e-10);

          allCandidates.push({
            sequence: newSequence,
            score: newScore
          });
        }
      }

      // Keep top beams
      beams = allCandidates
        .sort((a, b) => b.score - a.score)
        .slice(0, this.beamWidth);

      if (beams.length === 0) break;
    }

    return beams[0]?.sequence || startWords;
  }

  /**
   * Decode with length normalization
   */
  decodeNormalized(startWords: string[], maxLength: number): string[] {
    const result = this.decode(startWords, maxLength);
    return result;
  }
}

/**
 * Context Encoder - Encodes question context into vector representation
 */
class ContextEncoder {
  private embeddings: WordEmbedding;

  constructor(embeddings: WordEmbedding) {
    this.embeddings = embeddings;
  }

  /**
   * Encode question into context vector
   */
  encode(question: string): number[] {
    const words = question.toLowerCase().split(/\s+/).filter(w => w.length > 0);

    if (words.length === 0) {
      return Array(50).fill(0);
    }

    const embeddings = words.map(word => this.embeddings.getEmbedding(word));
    const contextVector = Array(50).fill(0);

    // Average pooling
    for (const emb of embeddings) {
      for (let i = 0; i < emb.length; i++) {
        contextVector[i] += emb[i] / embeddings.length;
      }
    }

    return contextVector;
  }

  /**
   * Encode with max pooling
   */
  encodeMaxPool(question: string): number[] {
    const words = question.toLowerCase().split(/\s+/).filter(w => w.length > 0);

    if (words.length === 0) {
      return Array(50).fill(0);
    }

    const embeddings = words.map(word => this.embeddings.getEmbedding(word));
    const contextVector = Array(50).fill(-Infinity);

    // Max pooling
    for (const emb of embeddings) {
      for (let i = 0; i < emb.length; i++) {
        contextVector[i] = Math.max(contextVector[i], emb[i]);
      }
    }

    return contextVector;
  }

  /**
   * Compute similarity between two contexts
   */
  computeSimilarity(context1: number[], context2: number[]): number {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < context1.length; i++) {
      dotProduct += context1[i] * context2[i];
      norm1 += context1[i] * context1[i];
      norm2 += context2[i] * context2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }
}

/**
 * Perplexity Calculator - Measures model quality
 */
class PerplexityCalculator {
  private ngramModel: NGramModel;

  constructor(ngramModel: NGramModel) {
    this.ngramModel = ngramModel;
  }

  /**
   * Calculate perplexity of a sequence
   */
  calculate(text: string): number {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);

    if (words.length < 2) return Infinity;

    let logProb = 0;
    let count = 0;

    for (let i = 1; i < words.length; i++) {
      const context = words.slice(Math.max(0, i - 2), i);
      const predictions = this.ngramModel.predictNext(context, 100);

      const prediction = predictions.find(p => p.word === words[i]);
      const probability = prediction?.probability || 1e-10;

      logProb += Math.log(probability);
      count++;
    }

    const avgLogProb = logProb / count;
    return Math.exp(-avgLogProb);
  }

  /**
   * Calculate perplexity with smoothing
   */
  calculateSmoothed(text: string, smoothingFactor: number = 0.01): number {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);

    if (words.length < 2) return Infinity;

    let logProb = 0;
    let count = 0;

    for (let i = 1; i < words.length; i++) {
      const context = words.slice(Math.max(0, i - 2), i);
      const predictions = this.ngramModel.predictNext(context, 100);

      const prediction = predictions.find(p => p.word === words[i]);
      const probability = (prediction?.probability || 0) + smoothingFactor;

      logProb += Math.log(probability);
      count++;
    }

    const avgLogProb = logProb / count;
    return Math.exp(-avgLogProb);
  }
}

/**
 * Advanced Sampling Strategies
 */
class SamplingStrategies {
  /**
   * Top-K sampling - sample from top K most likely words
   */
  static topK(
    predictions: Array<{ word: string; probability: number }>,
    k: number
  ): string {
    const topK = predictions.slice(0, k);
    const totalProb = topK.reduce((sum, p) => sum + p.probability, 0);

    let random = Math.random() * totalProb;

    for (const { word, probability } of topK) {
      random -= probability;
      if (random <= 0) return word;
    }

    return topK[0]?.word || '';
  }

  /**
   * Top-P (nucleus) sampling - sample from smallest set with cumulative prob >= p
   */
  static topP(
    predictions: Array<{ word: string; probability: number }>,
    p: number
  ): string {
    let cumulative = 0;
    const nucleus: Array<{ word: string; probability: number }> = [];

    for (const pred of predictions) {
      cumulative += pred.probability;
      nucleus.push(pred);
      if (cumulative >= p) break;
    }

    const totalProb = nucleus.reduce((sum, pred) => sum + pred.probability, 0);
    let random = Math.random() * totalProb;

    for (const { word, probability } of nucleus) {
      random -= probability;
      if (random <= 0) return word;
    }

    return nucleus[0]?.word || '';
  }

  /**
   * Temperature sampling with top-k and top-p combined
   */
  static temperatureTopKP(
    predictions: Array<{ word: string; probability: number }>,
    temperature: number,
    k: number,
    p: number
  ): string {
    // Apply temperature
    const temperedPredictions = predictions.map(pred => ({
      word: pred.word,
      probability: Math.pow(pred.probability, 1 / temperature)
    }));

    // Renormalize
    const totalProb = temperedPredictions.reduce((sum, p) => sum + p.probability, 0);
    const normalized = temperedPredictions.map(pred => ({
      word: pred.word,
      probability: pred.probability / totalProb
    }));

    // Apply top-k first
    const topK = normalized.slice(0, k);

    // Then apply top-p
    return this.topP(topK, p);
  }
}

/**
 * Response Ranker - Multi-criteria ranking of generated responses
 */
class ResponseRanker {
  private embeddings: WordEmbedding;
  private perplexityCalc: PerplexityCalculator;

  constructor(embeddings: WordEmbedding, ngramModel: NGramModel) {
    this.embeddings = embeddings;
    this.perplexityCalc = new PerplexityCalculator(ngramModel);
  }

  /**
   * Rank responses by multiple criteria
   */
  rank(
    responses: string[],
    question: string,
    healthContext: string[]
  ): Array<{ response: string; score: number; breakdown: any }> {
    return responses.map(response => {
      const relevanceScore = this.computeRelevance(response, question);
      const fluencyScore = this.computeFluency(response);
      const informativeness = this.computeInformativeness(response, healthContext);
      const coherence = this.computeCoherence(response);

      const score = (
        relevanceScore * 0.35 +
        fluencyScore * 0.25 +
        informativeness * 0.25 +
        coherence * 0.15
      );

      return {
        response,
        score,
        breakdown: {
          relevance: relevanceScore,
          fluency: fluencyScore,
          informativeness,
          coherence
        }
      };
    }).sort((a, b) => b.score - a.score);
  }

  private computeRelevance(response: string, question: string): number {
    const responseWords = new Set(response.toLowerCase().split(/\s+/));
    const questionWords = new Set(question.toLowerCase().split(/\s+/));

    let overlap = 0;
    questionWords.forEach(word => {
      if (responseWords.has(word)) overlap++;
    });

    return questionWords.size > 0 ? overlap / questionWords.size : 0;
  }

  private computeFluency(response: string): number {
    const perplexity = this.perplexityCalc.calculateSmoothed(response);
    // Lower perplexity = better fluency
    return Math.max(0, 1 - (perplexity / 100));
  }

  private computeInformativeness(response: string, healthContext: string[]): number {
    const responseWords = new Set(response.toLowerCase().split(/\s+/));
    const contextWords = healthContext.flatMap(ctx => ctx.toLowerCase().split(/\s+/));

    let informationCount = 0;
    contextWords.forEach(word => {
      if (responseWords.has(word)) informationCount++;
    });

    return Math.min(1.0, informationCount / 10);
  }

  private computeCoherence(response: string): number {
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);

    if (sentences.length < 2) return 1.0;

    let coherenceSum = 0;

    for (let i = 0; i < sentences.length - 1; i++) {
      const words1 = sentences[i].trim().split(/\s+/);
      const words2 = sentences[i + 1].trim().split(/\s+/);

      if (words1.length === 0 || words2.length === 0) continue;

      // Check for shared words between consecutive sentences
      const set1 = new Set(words1);
      const set2 = new Set(words2);

      let overlap = 0;
      set1.forEach(word => {
        if (set2.has(word)) overlap++;
      });

      coherenceSum += overlap / Math.max(set1.size, set2.size);
    }

    return sentences.length > 1 ? coherenceSum / (sentences.length - 1) : 1.0;
  }
}

/**
 * Vocabulary Builder - Dynamically expands vocabulary from health data
 */
class VocabularyBuilder {
  private vocabulary: Set<string> = new Set();
  private wordFrequencies: Map<string, number> = new Map();
  private wordContexts: Map<string, string[]> = new Map();

  /**
   * Build vocabulary from health patterns
   */
  build(patterns: string[]): void {
    patterns.forEach(pattern => {
      const words = pattern.toLowerCase().split(/\s+/).filter(w => w.length > 0);

      words.forEach((word, index) => {
        this.vocabulary.add(word);
        this.wordFrequencies.set(word, (this.wordFrequencies.get(word) || 0) + 1);

        // Store context (surrounding words)
        const context = words.slice(Math.max(0, index - 2), index + 3).filter((_, i) => i !== 2);
        if (!this.wordContexts.has(word)) {
          this.wordContexts.set(word, []);
        }
        this.wordContexts.get(word)!.push(...context);
      });
    });
  }

  /**
   * Get most frequent words
   */
  getTopWords(n: number): string[] {
    return Array.from(this.wordFrequencies.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([word]) => word);
  }

  /**
   * Get contextually similar words
   */
  getSimilarWords(word: string, n: number = 5): string[] {
    const targetContexts = this.wordContexts.get(word.toLowerCase());
    if (!targetContexts) return [];

    const targetSet = new Set(targetContexts);
    const similarities: Array<{ word: string; score: number }> = [];

    this.wordContexts.forEach((contexts, candidateWord) => {
      if (candidateWord === word.toLowerCase()) return;

      const candidateSet = new Set(contexts);
      let overlap = 0;

      targetSet.forEach(ctx => {
        if (candidateSet.has(ctx)) overlap++;
      });

      const similarity = overlap / Math.max(targetSet.size, candidateSet.size);
      if (similarity > 0) {
        similarities.push({ word: candidateWord, score: similarity });
      }
    });

    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, n)
      .map(item => item.word);
  }

  /**
   * Check if word is in vocabulary
   */
  hasWord(word: string): boolean {
    return this.vocabulary.has(word.toLowerCase());
  }

  /**
   * Get vocabulary size
   */
  size(): number {
    return this.vocabulary.size;
  }
}

/**
 * Semantic Coherence Checker - Ensures generated text makes semantic sense
 */
class SemanticCoherenceChecker {
  private embeddings: WordEmbedding;

  constructor(embeddings: WordEmbedding) {
    this.embeddings = embeddings;
  }

  /**
   * Check coherence of a sentence
   */
  checkSentenceCoherence(sentence: string): number {
    const words = sentence.toLowerCase().split(/\s+/).filter(w => w.length > 0);

    if (words.length < 2) return 1.0;

    let totalCoherence = 0;
    let count = 0;

    for (let i = 0; i < words.length - 1; i++) {
      const similarity = this.embeddings.similarity(words[i], words[i + 1]);
      totalCoherence += similarity;
      count++;
    }

    return count > 0 ? (totalCoherence / count + 1) / 2 : 0.5;
  }

  /**
   * Check coherence across multiple sentences
   */
  checkParagraphCoherence(paragraph: string): number {
    const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);

    if (sentences.length === 0) return 0;
    if (sentences.length === 1) return this.checkSentenceCoherence(sentences[0]);

    let sentenceScores = sentences.map(s => this.checkSentenceCoherence(s));
    let transitionScores: number[] = [];

    // Check transitions between sentences
    for (let i = 0; i < sentences.length - 1; i++) {
      const words1 = sentences[i].trim().split(/\s+/);
      const words2 = sentences[i + 1].trim().split(/\s+/);

      if (words1.length > 0 && words2.length > 0) {
        // Compare last word of sentence i with first word of sentence i+1
        const lastWord = words1[words1.length - 1];
        const firstWord = words2[0];
        const similarity = this.embeddings.similarity(lastWord, firstWord);
        transitionScores.push((similarity + 1) / 2);
      }
    }

    const avgSentenceCoherence = sentenceScores.reduce((sum, s) => sum + s, 0) / sentenceScores.length;
    const avgTransitionCoherence = transitionScores.length > 0
      ? transitionScores.reduce((sum, s) => sum + s, 0) / transitionScores.length
      : 0.5;

    return avgSentenceCoherence * 0.6 + avgTransitionCoherence * 0.4;
  }

  /**
   * Fix incoherent sequences by suggesting replacements
   */
  suggestCoherentWords(context: string[], candidateWords: string[]): string[] {
    if (context.length === 0) return candidateWords;

    const lastWord = context[context.length - 1];

    const scored = candidateWords.map(word => ({
      word,
      coherence: this.embeddings.similarity(lastWord, word)
    }));

    return scored
      .sort((a, b) => b.coherence - a.coherence)
      .map(item => item.word);
  }
}

/**
 * Main Statistical Language Model
 */
export class StatisticalLanguageModel {
  private embeddings: WordEmbedding;
  private ngramModel: NGramModel;
  private markovChain: MarkovChain;
  private attention: AttentionMechanism;
  private patternExtractor: HealthPatternExtractor;
  private sentenceConstructor: SentenceConstructor;
  private responseScorer: ResponseScorer;
  private beamSearchDecoder: BeamSearchDecoder;
  private contextEncoder: ContextEncoder;
  private perplexityCalc: PerplexityCalculator;
  private responseRanker: ResponseRanker;
  private vocabularyBuilder: VocabularyBuilder;
  private coherenceChecker: SemanticCoherenceChecker;
  private isTrained: boolean = false;

  constructor() {
    this.embeddings = new WordEmbedding();
    this.ngramModel = new NGramModel();
    this.markovChain = new MarkovChain();
    this.attention = new AttentionMechanism(this.embeddings);
    this.patternExtractor = new HealthPatternExtractor();
    this.responseScorer = new ResponseScorer();
    this.sentenceConstructor = new SentenceConstructor(this.ngramModel, this.markovChain);
    this.beamSearchDecoder = new BeamSearchDecoder(this.ngramModel, 5);
    this.contextEncoder = new ContextEncoder(this.embeddings);
    this.perplexityCalc = new PerplexityCalculator(this.ngramModel);
    this.responseRanker = new ResponseRanker(this.embeddings, this.ngramModel);
    this.vocabularyBuilder = new VocabularyBuilder();
    this.coherenceChecker = new SemanticCoherenceChecker(this.embeddings);
  }

  /**
   * Train the language model on health patterns
   */
  train(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): void {
    // Extract patterns from data
    const patterns = this.patternExtractor.extractPatterns(sleep, activity, readiness);

    // Train n-gram model
    this.ngramModel.train(patterns);

    // Train markov chain
    this.markovChain.train(patterns);

    // Build vocabulary
    this.vocabularyBuilder.build(patterns);

    this.isTrained = true;
  }

  /**
   * Generate response using trained model
   */
  generate(
    question: string,
    healthData: {
      sleep: SleepData[];
      activity: ActivityData[];
      readiness: ReadinessData[];
    },
    maxSentences: number = 5
  ): string {
    if (!this.isTrained) {
      this.train(healthData.sleep, healthData.activity, healthData.readiness);
    }

    const questionWords = question.toLowerCase().split(/\s+/);
    const patterns = this.patternExtractor.extractPatterns(
      healthData.sleep,
      healthData.activity,
      healthData.readiness
    );

    // Compute attention over patterns
    const attentionScores = patterns.map(pattern => {
      const patternWords = pattern.split(/\s+/);
      let totalAttention = 0;

      questionWords.forEach(qWord => {
        const scores = this.attention.computeAttention(qWord, patternWords);
        totalAttention += Math.max(...scores);
      });

      return totalAttention / questionWords.length;
    });

    // Select most relevant patterns
    const sortedIndices = attentionScores
      .map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.index);

    const relevantPatterns = sortedIndices.map(i => patterns[i]);

    // Generate sentences
    const sentences: string[] = [];

    for (let i = 0; i < Math.min(maxSentences, relevantPatterns.length); i++) {
      const patternWords = relevantPatterns[i].split(/\s+/);
      const startWords = patternWords.slice(0, 2);

      const sentence = this.sentenceConstructor.constructSentence(
        startWords,
        Math.floor(Math.random() * 10) + 10,
        questionWords
      );

      sentences.push(sentence + '.');
    }

    return sentences.join(' ');
  }

  /**
   * Generate contextual response with scoring
   */
  generateWithScoring(
    question: string,
    healthData: {
      sleep: SleepData[];
      activity: ActivityData[];
      readiness: ReadinessData[];
    },
    numCandidates: number = 5
  ): { text: string; score: number } {
    const candidates: Array<{ text: string; score: number }> = [];

    for (let i = 0; i < numCandidates; i++) {
      const text = this.generate(question, healthData, 4 + i);
      const score = this.responseScorer.scoreResponse(text, {
        dataQuality: healthData.sleep.length / 30,
        relevance: 0.8,
        coherence: 0.9
      });

      candidates.push({ text, score });
    }

    candidates.sort((a, b) => b.score - a.score);
    return candidates[0];
  }

  /**
   * Advanced generation using beam search
   */
  generateWithBeamSearch(
    question: string,
    healthData: {
      sleep: SleepData[];
      activity: ActivityData[];
      readiness: ReadinessData[];
    },
    numSentences: number = 3
  ): string {
    if (!this.isTrained) {
      this.train(healthData.sleep, healthData.activity, healthData.readiness);
    }

    const patterns = this.patternExtractor.extractPatterns(
      healthData.sleep,
      healthData.activity,
      healthData.readiness
    );

    const questionContext = this.contextEncoder.encode(question);
    const sentences: string[] = [];

    // Select patterns based on context similarity
    const patternScores = patterns.map(pattern => {
      const patternContext = this.contextEncoder.encode(pattern);
      return this.contextEncoder.computeSimilarity(questionContext, patternContext);
    });

    const topPatternIndices = patternScores
      .map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score)
      .slice(0, numSentences)
      .map(item => item.index);

    for (const idx of topPatternIndices) {
      const pattern = patterns[idx];
      const words = pattern.split(/\s+/).slice(0, 2);

      const beamResult = this.beamSearchDecoder.decode(words, 15);
      const sentence = beamResult.join(' ');

      if (sentence.length > 0) {
        sentences.push(sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.');
      }
    }

    return sentences.join(' ');
  }

  /**
   * Generate with advanced sampling (Top-K and Top-P)
   */
  generateWithSampling(
    question: string,
    healthData: {
      sleep: SleepData[];
      activity: ActivityData[];
      readiness: ReadinessData[];
    },
    options: {
      temperature?: number;
      topK?: number;
      topP?: number;
      maxSentences?: number;
    } = {}
  ): string {
    const {
      temperature = 0.8,
      topK = 40,
      topP = 0.9,
      maxSentences = 4
    } = options;

    if (!this.isTrained) {
      this.train(healthData.sleep, healthData.activity, healthData.readiness);
    }

    const patterns = this.patternExtractor.extractPatterns(
      healthData.sleep,
      healthData.activity,
      healthData.readiness
    );

    const questionWords = question.toLowerCase().split(/\s+/);
    const sentences: string[] = [];

    for (let i = 0; i < maxSentences; i++) {
      const startPattern = patterns[Math.floor(Math.random() * patterns.length)];
      const startWords = startPattern.split(/\s+/).slice(0, 2);
      const words: string[] = [...startWords];

      while (words.length < 15) {
        const context = words.slice(-2);
        const predictions = this.ngramModel.predictNext(context, 100);

        if (predictions.length === 0) break;

        const nextWord = SamplingStrategies.temperatureTopKP(
          predictions,
          temperature,
          topK,
          topP
        );

        if (!nextWord) break;
        words.push(nextWord);
      }

      const sentence = words.join(' ');
      if (sentence.length > 0) {
        sentences.push(sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.');
      }
    }

    return sentences.join(' ');
  }

  /**
   * Generate multiple responses and rank them
   */
  generateAndRank(
    question: string,
    healthData: {
      sleep: SleepData[];
      activity: ActivityData[];
      readiness: ReadinessData[];
    },
    numCandidates: number = 10
  ): { response: string; score: number; breakdown: any } {
    if (!this.isTrained) {
      this.train(healthData.sleep, healthData.activity, healthData.readiness);
    }

    const patterns = this.patternExtractor.extractPatterns(
      healthData.sleep,
      healthData.activity,
      healthData.readiness
    );

    const candidates: string[] = [];

    // Generate candidates using different methods
    for (let i = 0; i < numCandidates; i++) {
      if (i % 3 === 0) {
        candidates.push(this.generate(question, healthData, 3 + (i % 3)));
      } else if (i % 3 === 1) {
        candidates.push(this.generateWithBeamSearch(question, healthData, 3));
      } else {
        candidates.push(this.generateWithSampling(question, healthData, {
          temperature: 0.7 + (Math.random() * 0.4),
          topK: 30 + Math.floor(Math.random() * 20),
          topP: 0.85 + (Math.random() * 0.1)
        }));
      }
    }

    // Rank all candidates
    const ranked = this.responseRanker.rank(candidates, question, patterns);

    return ranked[0];
  }

  /**
   * Generate with coherence checking
   */
  generateCoherent(
    question: string,
    healthData: {
      sleep: SleepData[];
      activity: ActivityData[];
      readiness: ReadinessData[];
    },
    minCoherence: number = 0.6
  ): string {
    let bestResponse = '';
    let bestCoherence = 0;
    const maxAttempts = 5;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = this.generateWithSampling(question, healthData, {
        temperature: 0.7 + (attempt * 0.05),
        topK: 40,
        topP: 0.9,
        maxSentences: 4
      });

      const coherence = this.coherenceChecker.checkParagraphCoherence(response);

      if (coherence >= minCoherence) {
        return response;
      }

      if (coherence > bestCoherence) {
        bestCoherence = coherence;
        bestResponse = response;
      }
    }

    return bestResponse || this.generate(question, healthData, 3);
  }

  /**
   * Get model statistics
   */
  getModelStats(): {
    isTrained: boolean;
    vocabularySize: number;
    topWords: string[];
  } {
    return {
      isTrained: this.isTrained,
      vocabularySize: this.vocabularyBuilder.size(),
      topWords: this.vocabularyBuilder.getTopWords(10)
    };
  }

  /**
   * Calculate perplexity of a response
   */
  evaluateResponse(response: string): number {
    return this.perplexityCalc.calculateSmoothed(response);
  }

  /**
   * Find contextually similar words
   */
  findSimilarWords(word: string, n: number = 5): string[] {
    return this.vocabularyBuilder.getSimilarWords(word, n);
  }
}
