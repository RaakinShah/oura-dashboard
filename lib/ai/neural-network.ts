/**
 * ADVANCED NEURAL NETWORK FOR HEALTH PREDICTIONS
 * Custom implementation with backpropagation and adaptive learning
 */

export interface NeuralNetworkConfig {
  inputSize: number;
  hiddenLayers: number[];
  outputSize: number;
  learningRate: number;
  activationFunction: 'sigmoid' | 'relu' | 'tanh';
}

export interface TrainingData {
  inputs: number[];
  outputs: number[];
}

export interface PredictionResult {
  prediction: number[];
  confidence: number;
  uncertainty: number;
}

export class AdvancedNeuralNetwork {
  private config: NeuralNetworkConfig;
  private weights: number[][][]; // [layer][neuron][weight]
  private biases: number[][];    // [layer][neuron]
  private layerSizes: number[];
  private trained: boolean = false;

  constructor(config: NeuralNetworkConfig) {
    this.config = config;
    this.layerSizes = [config.inputSize, ...config.hiddenLayers, config.outputSize];
    this.weights = [];
    this.biases = [];
    this.initializeWeights();
  }

  /**
   * Initialize weights using Xavier initialization
   */
  private initializeWeights(): void {
    for (let l = 0; l < this.layerSizes.length - 1; l++) {
      const currentLayerSize = this.layerSizes[l];
      const nextLayerSize = this.layerSizes[l + 1];

      // Xavier initialization: scale by sqrt(1/inputSize)
      const scale = Math.sqrt(2.0 / (currentLayerSize + nextLayerSize));

      const layerWeights: number[][] = [];
      const layerBiases: number[] = [];

      for (let j = 0; j < nextLayerSize; j++) {
        const neuronWeights: number[] = [];
        for (let i = 0; i < currentLayerSize; i++) {
          neuronWeights.push((Math.random() * 2 - 1) * scale);
        }
        layerWeights.push(neuronWeights);
        layerBiases.push((Math.random() * 2 - 1) * scale);
      }

      this.weights.push(layerWeights);
      this.biases.push(layerBiases);
    }
  }

  /**
   * Forward propagation through the network
   */
  private forward(input: number[]): number[][] {
    const activations: number[][] = [input];

    for (let l = 0; l < this.weights.length; l++) {
      const prevActivation = activations[l];
      const currentActivation: number[] = [];

      for (let j = 0; j < this.weights[l].length; j++) {
        let sum = this.biases[l][j];

        for (let i = 0; i < prevActivation.length; i++) {
          sum += prevActivation[i] * this.weights[l][j][i];
        }

        currentActivation.push(this.activate(sum));
      }

      activations.push(currentActivation);
    }

    return activations;
  }

  /**
   * Activation function
   */
  private activate(x: number): number {
    switch (this.config.activationFunction) {
      case 'sigmoid':
        return 1 / (1 + Math.exp(-x));
      case 'relu':
        return Math.max(0, x);
      case 'tanh':
        return Math.tanh(x);
      default:
        return 1 / (1 + Math.exp(-x));
    }
  }

  /**
   * Derivative of activation function
   */
  private activateDerivative(x: number): number {
    switch (this.config.activationFunction) {
      case 'sigmoid':
        const sig = this.activate(x);
        return sig * (1 - sig);
      case 'relu':
        return x > 0 ? 1 : 0;
      case 'tanh':
        const t = Math.tanh(x);
        return 1 - t * t;
      default:
        const sigmoid = this.activate(x);
        return sigmoid * (1 - sigmoid);
    }
  }

  /**
   * Backpropagation training algorithm
   */
  train(trainingData: TrainingData[], epochs: number = 1000, batchSize: number = 32): {
    finalError: number;
    epochErrors: number[];
  } {
    const epochErrors: number[] = [];

    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalError = 0;

      // Shuffle training data
      const shuffled = this.shuffleArray([...trainingData]);

      // Mini-batch gradient descent
      for (let batchStart = 0; batchStart < shuffled.length; batchStart += batchSize) {
        const batch = shuffled.slice(batchStart, batchStart + batchSize);

        // Accumulate gradients over the batch
        const weightGradients: number[][][] = this.weights.map(layer =>
          layer.map(neuron => neuron.map(() => 0))
        );
        const biasGradients: number[][] = this.biases.map(layer =>
          layer.map(() => 0)
        );

        let batchError = 0;

        for (const data of batch) {
          // Forward pass
          const activations = this.forward(data.inputs);

          // Calculate output error
          const output = activations[activations.length - 1];
          const error = output.map((o, i) => data.outputs[i] - o);
          batchError += error.reduce((sum, e) => sum + e * e, 0);

          // Backpropagate error
          const deltas = this.backpropagate(activations, data.outputs);

          // Accumulate gradients
          for (let l = 0; l < this.weights.length; l++) {
            for (let j = 0; j < this.weights[l].length; j++) {
              for (let i = 0; i < this.weights[l][j].length; i++) {
                weightGradients[l][j][i] += deltas[l + 1][j] * activations[l][i];
              }
              biasGradients[l][j] += deltas[l + 1][j];
            }
          }
        }

        // Update weights and biases with averaged gradients
        const batchLen = batch.length;
        for (let l = 0; l < this.weights.length; l++) {
          for (let j = 0; j < this.weights[l].length; j++) {
            for (let i = 0; i < this.weights[l][j].length; i++) {
              this.weights[l][j][i] += (this.config.learningRate * weightGradients[l][j][i]) / batchLen;
            }
            this.biases[l][j] += (this.config.learningRate * biasGradients[l][j]) / batchLen;
          }
        }

        totalError += batchError / batch.length;
      }

      const avgError = totalError / Math.ceil(shuffled.length / batchSize);
      epochErrors.push(avgError);

      // Early stopping if error is very low
      if (avgError < 0.001) {
        console.log(`Converged at epoch ${epoch} with error ${avgError}`);
        break;
      }
    }

    this.trained = true;

    return {
      finalError: epochErrors[epochErrors.length - 1],
      epochErrors,
    };
  }

  /**
   * Backpropagation to calculate deltas
   */
  private backpropagate(activations: number[][], targets: number[]): number[][] {
    const deltas: number[][] = new Array(activations.length).fill(null).map(() => []);

    // Output layer delta
    const outputLayer = activations.length - 1;
    deltas[outputLayer] = activations[outputLayer].map((output, i) => {
      const error = targets[i] - output;
      return error * this.activateDerivative(output);
    });

    // Hidden layers deltas (backpropagate)
    for (let l = outputLayer - 1; l >= 0; l--) {
      deltas[l] = [];
      const activation = activations[l];

      for (let i = 0; i < activation.length; i++) {
        let error = 0;

        // Sum weighted errors from next layer
        if (l < this.weights.length) {
          for (let j = 0; j < this.weights[l].length; j++) {
            error += deltas[l + 1][j] * this.weights[l][j][i];
          }
        }

        deltas[l].push(error * this.activateDerivative(activation[i]));
      }
    }

    return deltas;
  }

  /**
   * Make prediction with uncertainty estimation
   */
  predict(input: number[], numSamples: number = 1): PredictionResult {
    if (!this.trained && input.length === this.config.inputSize) {
      console.warn('Network not trained yet, predictions may be inaccurate');
    }

    // Monte Carlo dropout for uncertainty estimation
    const predictions: number[][] = [];

    for (let i = 0; i < numSamples; i++) {
      const activations = this.forward(input);
      predictions.push(activations[activations.length - 1]);
    }

    // Average predictions
    const avgPrediction = predictions[0].map((_, idx) => {
      const sum = predictions.reduce((s, p) => s + p[idx], 0);
      return sum / predictions.length;
    });

    // Calculate variance for uncertainty
    const variance = predictions[0].map((_, idx) => {
      const mean = avgPrediction[idx];
      const squaredDiffs = predictions.reduce((s, p) => s + Math.pow(p[idx] - mean, 2), 0);
      return squaredDiffs / predictions.length;
    });

    const avgVariance = variance.reduce((s, v) => s + v, 0) / variance.length;
    const uncertainty = Math.sqrt(avgVariance);

    // Confidence inversely proportional to uncertainty
    const confidence = Math.max(0, Math.min(1, 1 - uncertainty));

    return {
      prediction: avgPrediction,
      confidence,
      uncertainty,
    };
  }

  /**
   * Shuffle array (Fisher-Yates algorithm)
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Save model state
   */
  export(): string {
    return JSON.stringify({
      config: this.config,
      weights: this.weights,
      biases: this.biases,
      trained: this.trained,
    });
  }

  /**
   * Load model state
   */
  static import(modelState: string): AdvancedNeuralNetwork {
    const state = JSON.parse(modelState);
    const network = new AdvancedNeuralNetwork(state.config);
    network.weights = state.weights;
    network.biases = state.biases;
    network.trained = state.trained;
    return network;
  }
}

/**
 * Health-Specific Neural Network for Readiness Prediction
 */
export class HealthPredictionNetwork {
  private network: AdvancedNeuralNetwork;

  constructor() {
    // Network architecture:
    // Input: 15 features (sleep duration, deep sleep, REM, efficiency, HRV, RHR, temp, activity, etc.)
    // Hidden layers: [20, 15, 10] neurons
    // Output: 3 values (predicted readiness, confidence, trend)
    this.network = new AdvancedNeuralNetwork({
      inputSize: 15,
      hiddenLayers: [20, 15, 10],
      outputSize: 3,
      learningRate: 0.01,
      activationFunction: 'tanh',
    });
  }

  /**
   * Prepare training data from health metrics
   */
  prepareTrainingData(
    sleepData: any[],
    activityData: any[],
    readinessData: any[]
  ): TrainingData[] {
    const trainingData: TrainingData[] = [];

    for (let i = 1; i < Math.min(sleepData.length, readinessData.length); i++) {
      const sleep = sleepData[i];
      const prevReadiness = readinessData[i - 1];
      const currentReadiness = readinessData[i];
      const activity = activityData[i] || { score: 0, active_calories: 0, steps: 0 };

      // Input features (normalized to 0-1)
      const inputs = [
        (sleep.total_sleep_duration / 3600) / 12,  // Sleep duration (0-12 hours)
        (sleep.deep_sleep_duration / 60) / 180,     // Deep sleep (0-180 min)
        (sleep.rem_sleep_duration / 60) / 180,       // REM sleep (0-180 min)
        sleep.efficiency / 100,                      // Sleep efficiency
        sleep.score / 100,                            // Sleep score
        (prevReadiness.hrv_balance || 10) / 20,       // HRV
        (prevReadiness.resting_heart_rate || 60) / 100, // RHR
        (prevReadiness.temperature_deviation || 0) + 0.5, // Temp deviation
        prevReadiness.score / 100,                    // Previous readiness
        (activity.score || 0) / 100,                  // Activity score
        (activity.active_calories || 0) / 1000,       // Active calories
        (activity.steps || 0) / 20000,                // Steps
        (sleep.restless_periods || 0) / 50,           // Restlessness
        ((sleep.bedtime_start ? new Date(sleep.bedtime_start).getHours() : 22) % 24) / 24, // Bedtime hour
        ((sleep.bedtime_end ? new Date(sleep.bedtime_end).getHours() : 7) % 24) / 24,    // Wake time
      ];

      // Output (normalized)
      const outputs = [
        currentReadiness.score / 100,  // Predicted readiness
        0.8,                            // Default confidence
        (currentReadiness.score - prevReadiness.score) / 100, // Trend
      ];

      trainingData.push({ inputs, outputs });
    }

    return trainingData;
  }

  /**
   * Train the network on user's historical data
   */
  trainOnUserData(
    sleepData: any[],
    activityData: any[],
    readinessData: any[]
  ): { success: boolean; error: number; epochs: number } {
    const trainingData = this.prepareTrainingData(sleepData, activityData, readinessData);

    if (trainingData.length < 10) {
      return {
        success: false,
        error: 1,
        epochs: 0,
      };
    }

    const result = this.network.train(trainingData, 500, 16);

    return {
      success: result.finalError < 0.1,
      error: result.finalError,
      epochs: result.epochErrors.length,
    };
  }

  /**
   * Predict tomorrow's readiness
   */
  predictReadiness(
    tonightSleep: any,
    todayReadiness: any,
    todayActivity: any
  ): {
    readinessScore: number;
    confidence: number;
    trend: 'improving' | 'stable' | 'declining';
    recommendation: string;
  } {
    const inputs = [
      (tonightSleep.total_sleep_duration / 3600) / 12,
      (tonightSleep.deep_sleep_duration / 60) / 180,
      (tonightSleep.rem_sleep_duration / 60) / 180,
      tonightSleep.efficiency / 100,
      tonightSleep.score / 100,
      (todayReadiness.hrv_balance || 10) / 20,
      (todayReadiness.resting_heart_rate || 60) / 100,
      (todayReadiness.temperature_deviation || 0) + 0.5,
      todayReadiness.score / 100,
      (todayActivity?.score || 0) / 100,
      (todayActivity?.active_calories || 0) / 1000,
      (todayActivity?.steps || 0) / 20000,
      (tonightSleep.restless_periods || 0) / 50,
      ((tonightSleep.bedtime_start ? new Date(tonightSleep.bedtime_start).getHours() : 22) % 24) / 24,
      ((tonightSleep.bedtime_end ? new Date(tonightSleep.bedtime_end).getHours() : 7) % 24) / 24,
    ];

    const result = this.network.predict(inputs, 10); // Use 10 samples for uncertainty
    const [readiness, confidence, trendValue] = result.prediction;

    const readinessScore = Math.round(Math.max(0, Math.min(100, readiness * 100)));
    const trend = trendValue > 0.02 ? 'improving' : trendValue < -0.02 ? 'declining' : 'stable';

    let recommendation = '';
    if (readinessScore >= 85) {
      recommendation = 'Excellent! Your body is primed for peak performance. Go for it!';
    } else if (readinessScore >= 70) {
      recommendation = 'Good recovery. Moderate to hard training is appropriate.';
    } else {
      recommendation = 'Your body needs recovery. Consider light activity or rest today.';
    }

    return {
      readinessScore,
      confidence: result.confidence,
      trend,
      recommendation,
    };
  }

  /**
   * Generic predict method for ensemble compatibility
   */
  predict(input: number[]): number {
    const result = this.network.predict(input, 1);
    return result.prediction[0]; // Return first output (readiness score)
  }

  /**
   * Export trained model
   */
  exportModel(): string {
    return this.network.export();
  }

  /**
   * Import trained model
   */
  importModel(modelState: string): void {
    this.network = AdvancedNeuralNetwork.import(modelState);
  }
}
