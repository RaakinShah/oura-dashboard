/**
 * Pure TypeScript Neural Network Implementation
 * Multi-layer perceptron with backpropagation
 */

export interface NeuralNetworkConfig {
  inputSize: number;
  hiddenLayers: number[];
  outputSize: number;
  learningRate?: number;
  activation?: 'sigmoid' | 'tanh' | 'relu';
}

export class NeuralNetwork {
  private weights: number[][][];
  private biases: number[][];
  private config: Required<NeuralNetworkConfig>;

  constructor(config: NeuralNetworkConfig) {
    this.config = {
      ...config,
      learningRate: config.learningRate || 0.1,
      activation: config.activation || 'sigmoid',
    };

    this.weights = [];
    this.biases = [];
    this.initializeWeights();
  }

  private initializeWeights() {
    const layers = [
      this.config.inputSize,
      ...this.config.hiddenLayers,
      this.config.outputSize,
    ];

    for (let i = 0; i < layers.length - 1; i++) {
      const layerWeights: number[][] = [];
      const layerBiases: number[] = [];

      for (let j = 0; j < layers[i + 1]; j++) {
        const neuronWeights: number[] = [];
        for (let k = 0; k < layers[i]; k++) {
          neuronWeights.push(Math.random() * 2 - 1);
        }
        layerWeights.push(neuronWeights);
        layerBiases.push(Math.random() * 2 - 1);
      }

      this.weights.push(layerWeights);
      this.biases.push(layerBiases);
    }
  }

  private activate(x: number): number {
    switch (this.config.activation) {
      case 'sigmoid':
        return 1 / (1 + Math.exp(-x));
      case 'tanh':
        return Math.tanh(x);
      case 'relu':
        return Math.max(0, x);
      default:
        return x;
    }
  }

  private activateDerivative(x: number): number {
    switch (this.config.activation) {
      case 'sigmoid':
        const sig = this.activate(x);
        return sig * (1 - sig);
      case 'tanh':
        return 1 - Math.pow(Math.tanh(x), 2);
      case 'relu':
        return x > 0 ? 1 : 0;
      default:
        return 1;
    }
  }

  predict(input: number[]): number[] {
    let activations = input;

    for (let i = 0; i < this.weights.length; i++) {
      const nextActivations: number[] = [];

      for (let j = 0; j < this.weights[i].length; j++) {
        let sum = this.biases[i][j];

        for (let k = 0; k < activations.length; k++) {
          sum += activations[k] * this.weights[i][j][k];
        }

        nextActivations.push(this.activate(sum));
      }

      activations = nextActivations;
    }

    return activations;
  }

  train(inputs: number[][], targets: number[][], epochs: number = 1000): number[] {
    const losses: number[] = [];

    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;

      for (let i = 0; i < inputs.length; i++) {
        const loss = this.trainSingle(inputs[i], targets[i]);
        totalLoss += loss;
      }

      losses.push(totalLoss / inputs.length);

      if (epoch % 100 === 0) {
        console.log(`Epoch ${epoch}: Loss = ${losses[losses.length - 1]}`);
      }
    }

    return losses;
  }

  private trainSingle(input: number[], target: number[]): number {
    // Forward pass
    const layerOutputs: number[][] = [input];
    let activations = input;

    for (let i = 0; i < this.weights.length; i++) {
      const nextActivations: number[] = [];

      for (let j = 0; j < this.weights[i].length; j++) {
        let sum = this.biases[i][j];

        for (let k = 0; k < activations.length; k++) {
          sum += activations[k] * this.weights[i][j][k];
        }

        nextActivations.push(this.activate(sum));
      }

      activations = nextActivations;
      layerOutputs.push(activations);
    }

    // Calculate loss
    let loss = 0;
    for (let i = 0; i < target.length; i++) {
      loss += Math.pow(target[i] - activations[i], 2);
    }
    loss /= target.length;

    // Backward pass
    const deltas: number[][] = [];
    const outputErrors: number[] = [];

    for (let i = 0; i < target.length; i++) {
      outputErrors.push(activations[i] - target[i]);
    }
    deltas.push(outputErrors);

    // Backpropagate errors
    for (let i = this.weights.length - 1; i > 0; i--) {
      const errors: number[] = [];

      for (let j = 0; j < this.weights[i - 1].length; j++) {
        let error = 0;
        for (let k = 0; k < this.weights[i].length; k++) {
          error += deltas[0][k] * this.weights[i][k][j];
        }
        errors.push(error);
      }

      deltas.unshift(errors);
    }

    // Update weights and biases
    for (let i = 0; i < this.weights.length; i++) {
      for (let j = 0; j < this.weights[i].length; j++) {
        this.biases[i][j] -= this.config.learningRate * deltas[i][j];

        for (let k = 0; k < this.weights[i][j].length; k++) {
          this.weights[i][j][k] -=
            this.config.learningRate * deltas[i][j] * layerOutputs[i][k];
        }
      }
    }

    return loss;
  }

  save(): string {
    return JSON.stringify({
      config: this.config,
      weights: this.weights,
      biases: this.biases,
    });
  }

  load(data: string): void {
    const parsed = JSON.parse(data);
    this.config = parsed.config;
    this.weights = parsed.weights;
    this.biases = parsed.biases;
  }
}
