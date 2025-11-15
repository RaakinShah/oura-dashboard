/**
 * CONVERSATIONAL AI ENGINE
 * Opus-level conversational intelligence with memory, context, and personality
 * Now enhanced with Opus-depth reasoning and multi-perspective analysis
 */

import { NaturalLanguageEngine, ConversationContext, Message, UserProfile, Intent } from './natural-language-engine';
import { SleepData, ActivityData, ReadinessData } from '../oura-api';
import { AdvancedReasoningEngine, ReasoningChain } from './advanced-reasoning-engine';
import { OpusReasoningEngine, OpusAnalysisResult } from './opus-reasoning-engine';

export interface AIPersonality {
  name: string;
  traits: string[];
  responseStyle: 'friendly' | 'professional' | 'casual' | 'scientific';
  empathyLevel: number; // 0-100
  humorLevel: number; // 0-100
}

export interface ConversationMemory {
  shortTerm: Message[]; // Last 10 messages
  longTerm: Map<string, any>; // Persistent learnings
  userInsights: Map<string, number>; // What we know about the user
  conversationSummaries: string[]; // Summaries of past conversations
}

export interface AIResponse {
  text: string;
  confidence: number;
  suggestions: string[];
  relatedTopics: string[];
  actionItems?: string[];
}

export class ConversationalAI {
  private context: ConversationContext;
  private memory: ConversationMemory;
  private personality: AIPersonality;
  private healthData?: {
    sleep: SleepData[];
    activity: ActivityData[];
    readiness: ReadinessData[];
  };

  constructor(
    userProfile?: Partial<UserProfile>,
    personality?: Partial<AIPersonality>
  ) {
    this.context = {
      history: [],
      userProfile: {
        preferences: new Map(),
        learnings: new Map(),
        conversationStyle: 'balanced',
        ...userProfile,
      },
      entities: new Map(),
    };

    this.memory = {
      shortTerm: [],
      longTerm: new Map(),
      userInsights: new Map(),
      conversationSummaries: [],
    };

    this.personality = {
      name: 'Oura AI Coach',
      traits: ['knowledgeable', 'empathetic', 'motivating', 'precise'],
      responseStyle: 'friendly',
      empathyLevel: 75,
      humorLevel: 40,
      ...personality,
    };
  }

  /**
   * Set health data for intelligent responses
   */
  setHealthData(sleep: SleepData[], activity: ActivityData[], readiness: ReadinessData[]): void {
    this.healthData = { sleep, activity, readiness };
    this.updateUserInsights();
  }

  /**
   * Process user message and generate intelligent response
   */
  async chat(userMessage: string): Promise<AIResponse> {
    // Extract intent
    const intent = NaturalLanguageEngine.extractIntent(userMessage);

    // Add to conversation history
    const userMsg: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      intent,
    };

    this.context.history.push(userMsg);
    this.memory.shortTerm.push(userMsg);

    // Keep only last 10 in short-term memory
    if (this.memory.shortTerm.length > 10) {
      this.memory.shortTerm.shift();
    }

    // Generate response based on intent and context
    const response = await this.generateIntelligentResponse(userMessage, intent);

    // Add assistant response to history
    const assistantMsg: Message = {
      role: 'assistant',
      content: response.text,
      timestamp: new Date(),
    };

    this.context.history.push(assistantMsg);
    this.memory.shortTerm.push(assistantMsg);

    // Learn from interaction
    this.learnFromInteraction(userMsg, assistantMsg, intent);

    return response;
  }

  /**
   * Generate intelligent, context-aware response
   */
  private async generateIntelligentResponse(message: string, intent: Intent): Promise<AIResponse> {
    let text: string;
    let confidence: number = 0.8;
    const suggestions: string[] = [];
    const relatedTopics: string[] = [];
    const actionItems: string[] = [];

    // Handle different intent types with personality
    switch (intent.type) {
      case 'greeting':
        text = this.generatePersonalizedGreeting();
        suggestions.push(
          "Show me my sleep trends",
          "Why is my readiness score low?",
          "How can I improve my recovery?"
        );
        break;

      case 'question':
        text = await this.answerIntelligentQuestion(message, intent);
        confidence = 0.85;
        relatedTopics.push(...this.getRelatedTopics(intent.topic));
        break;

      case 'command':
        text = await this.executeIntelligentCommand(message, intent);
        confidence = 0.9;
        break;

      case 'feedback':
        text = this.processFeedback(message, intent);
        suggestions.push("Would you like more details?", "Any other questions?");
        break;

      default:
        text = this.generateContextualResponse(message, intent);
        break;
    }

    // Add personality touches
    text = this.addPersonalityToResponse(text, intent);

    // Generate action items if relevant
    if (intent.topic !== 'general' && this.healthData) {
      actionItems.push(...this.generateActionItems(intent.topic));
    }

    return {
      text,
      confidence,
      suggestions: suggestions.slice(0, 3),
      relatedTopics: relatedTopics.slice(0, 3),
      actionItems: actionItems.slice(0, 3),
    };
  }

  /**
   * Answer questions with deep intelligence using chain-of-thought reasoning
   */
  private async answerIntelligentQuestion(question: string, intent: Intent): Promise<string> {
    const lowerQ = question.toLowerCase();

    // Check if Opus-level depth is needed (deepest analysis)
    const needsOpusDepth =
      lowerQ.includes('deep') ||
      lowerQ.includes('comprehensive') ||
      lowerQ.includes('detailed analysis') ||
      lowerQ.includes('everything') ||
      lowerQ.includes('all perspectives') ||
      lowerQ.includes('multi-perspective') ||
      lowerQ.includes('causal') ||
      lowerQ.includes('counterfactual') ||
      lowerQ.includes('creative solutions') ||
      lowerQ.includes('opus');

    if (needsOpusDepth && this.healthData && this.healthData.sleep.length >= 14) {
      // Use Opus-level reasoning for maximum depth
      const opusAnalysis = OpusReasoningEngine.analyzeWithOpusDepth(
        this.healthData.sleep,
        this.healthData.activity,
        this.healthData.readiness,
        question
      );

      let response = `# 🧠 Opus-Level Deep Analysis\n\n`;
      response += `${opusAnalysis.summary}\n\n`;

      // Show multi-perspective analysis
      response += `## 📊 Multi-Perspective Analysis\n\n`;
      response += `**Analytical View:** ${opusAnalysis.multiPerspective.analyticalView}\n\n`;
      response += `**Holistic View:** ${opusAnalysis.multiPerspective.holisticView}\n\n`;
      response += `**Causal View:** ${opusAnalysis.multiPerspective.causalView}\n\n`;

      // Show top reasoning layers
      if (opusAnalysis.deepReasoningChain.length > 0) {
        response += `## 🔬 Deep Reasoning Chain\n\n`;
        opusAnalysis.deepReasoningChain.slice(0, 5).forEach(step => {
          response += `**Layer ${step.layer} (${step.perspective}):**\n`;
          response += `${step.thought}\n`;
          response += `→ *${step.conclusion}*\n`;
          if (step.uncertainties.length > 0) {
            response += `⚠️ Uncertainties: ${step.uncertainties.join(', ')}\n`;
          }
          response += `\n`;
        });
      }

      // Show causal analysis
      if (opusAnalysis.causalAnalysis.length > 0) {
        response += `## 🎯 Causal Analysis & Intervention Points\n\n`;
        opusAnalysis.causalAnalysis.slice(0, 2).forEach(chain => {
          response += `**Root Cause:** ${chain.rootCause}\n`;
          response += `**Top Interventions:**\n`;
          chain.interventionPoints.slice(0, 3).forEach(intervention => {
            response += `- ${intervention.point} (Impact: ${(intervention.impact * 100).toFixed(0)}%, Feasibility: ${(intervention.feasibility * 100).toFixed(0)}%)\n`;
          });
          response += `\n`;
        });
      }

      // Show creative solutions
      if (opusAnalysis.creativeSolutions.length > 0) {
        response += `## 💡 Creative & Unconventional Solutions\n\n`;
        opusAnalysis.creativeSolutions.slice(0, 5).forEach(solution => {
          response += `${solution}\n\n`;
        });
      }

      // Show prioritized actions
      if (opusAnalysis.actionableInsights.length > 0) {
        response += `## ✅ Prioritized Action Plan\n\n`;
        opusAnalysis.actionableInsights.slice(0, 5).forEach((action, i) => {
          const priorityEmoji = action.priority === 'critical' ? '🔴' : action.priority === 'high' ? '🟠' : '🟡';
          response += `${i + 1}. ${priorityEmoji} **${action.insight}**\n`;
          response += `   Priority: ${action.priority} | Impact: ${(action.expectedImpact * 100).toFixed(0)}% | Timeframe: ${action.timeframe}\n\n`;
        });
      }

      // Show uncertainty assessment
      response += `## 🎲 Confidence & Uncertainty\n\n`;
      response += `**Overall Confidence:** ${(opusAnalysis.uncertaintyAssessment.overallConfidence * 100).toFixed(0)}%\n\n`;
      response += `**Key Uncertainties:**\n`;
      opusAnalysis.uncertaintyAssessment.keyUncertainties.slice(0, 3).forEach(u => {
        response += `- ${u}\n`;
      });
      response += `\n`;

      // Meta-cognitive reflection
      response += `## 🤔 Meta-Cognitive Reflection\n\n`;
      response += `**Potential Biases in This Analysis:**\n`;
      opusAnalysis.metaCognition.biasesPotentiallyPresent.slice(0, 3).forEach(bias => {
        response += `- ${bias}\n`;
      });

      return response;
    }

    // Use advanced reasoning for complex health analysis questions
    const needsDeepReasoning =
      lowerQ.includes('analyze') ||
      lowerQ.includes('pattern') ||
      lowerQ.includes('trend') ||
      lowerQ.includes('overall') ||
      lowerQ.includes('assess') ||
      (lowerQ.includes('why') && this.healthData && this.healthData.sleep.length > 7);

    if (needsDeepReasoning && this.healthData) {
      // Use chain-of-thought reasoning for deep analysis
      const analysis = AdvancedReasoningEngine.analyzeHealthWithReasoning(
        this.healthData.sleep,
        this.healthData.activity,
        this.healthData.readiness,
        question
      );

      let response = `${analysis.summary}\n\n`;

      // Add reasoning chain for transparency
      if (analysis.reasoning.steps.length > 0) {
        response += `**My Reasoning Process:**\n\n`;
        analysis.reasoning.steps.slice(0, 3).forEach(step => {
          response += `${step.step}. ${step.thought}\n→ ${step.conclusion}\n\n`;
        });
      }

      // Add key insights
      if (analysis.insights.length > 0) {
        response += `**Key Insights:**\n\n`;
        analysis.insights.slice(0, 4).forEach(insight => {
          response += `${insight}\n\n`;
        });
      }

      // Add recommendations
      if (analysis.recommendations.length > 0) {
        response += `**Recommendations:**\n\n`;
        analysis.recommendations.slice(0, 3).forEach(rec => {
          response += `${rec}\n\n`;
        });
      }

      return response;
    }

    // Root cause analysis questions
    if (lowerQ.includes('why')) {
      return this.explainWhy(question, intent);
    }

    // How-to questions
    if (lowerQ.includes('how')) {
      return this.explainHow(question, intent);
    }

    // What questions
    if (lowerQ.includes('what')) {
      return this.explainWhat(question, intent);
    }

    // Should questions
    if (lowerQ.includes('should') || lowerQ.includes('can i')) {
      return this.provideGuidance(question, intent);
    }

    // When questions
    if (lowerQ.includes('when')) {
      return this.predictTiming(question, intent);
    }

    // Default intelligent response
    return this.generateDeepInsight(question, intent);
  }

  /**
   * Explain WHY with data-driven insights
   */
  private explainWhy(question: string, intent: Intent): string {
    if (!this.healthData) {
      return "I'd love to explain why, but I need access to your health data first. Once you connect your Oura data, I can provide detailed, personalized explanations for everything you see.";
    }

    const { sleep, readiness } = this.healthData;
    const latest = readiness[readiness.length - 1];
    const latestSleep = sleep[sleep.length - 1];

    // Analyze root causes
    const causes = [];

    // Sleep duration analysis
    const avgSleep = sleep.slice(-7).reduce((sum, s) => sum + s.total_sleep_duration, 0) / 7 / 3600;
    const lastSleep = latestSleep.total_sleep_duration / 3600;

    if (lastSleep < avgSleep - 0.5) {
      causes.push(`You slept ${(avgSleep - lastSleep).toFixed(1)} hours less than your average, which significantly impacts recovery`);
    }

    // HRV analysis
    if (latest.hrv_balance) {
      const avgHRV = readiness.slice(-7)
        .filter(r => r.hrv_balance)
        .reduce((sum, r) => sum + (r.hrv_balance || 0), 0) / 7;

      if (latest.hrv_balance < avgHRV * 0.85) {
        causes.push(`Your HRV is ${((1 - latest.hrv_balance / avgHRV) * 100).toFixed(0)}% below normal, indicating elevated stress or insufficient recovery`);
      }
    }

    // Temperature analysis
    if (latest.temperature_deviation && Math.abs(latest.temperature_deviation) > 0.2) {
      causes.push(`Your body temperature is ${latest.temperature_deviation > 0 ? 'elevated' : 'lower'} than normal, which could indicate stress, illness, or overtraining`);
    }

    if (causes.length === 0) {
      return "Your metrics look stable overall. The natural day-to-day variation you're seeing is within normal ranges. Is there a specific metric you're concerned about?";
    }

    const response = `Great question! Based on my analysis of your data, here's what's driving your current metrics:\n\n${causes.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\nThe good news is that these factors are within your control. Would you like specific recommendations to address them?`;

    return response;
  }

  /**
   * Explain HOW with actionable guidance
   */
  private explainHow(question: string, intent: Intent): string {
    const metric = intent.entities.find(e => e.type === 'metric')?.value;

    if (!metric && !question.toLowerCase().includes('improve')) {
      return "I can help you improve any aspect of your health! Which metric would you like to focus on - sleep, recovery, or activity?";
    }

    const improvements = {
      sleep: [
        "**Consistency is King**: Go to bed and wake up at the same time every day (yes, even weekends). Your circadian rhythm thrives on predictability.",
        "**Temperature Optimization**: Keep your bedroom between 65-68°F (18-20°C). Core body temperature needs to drop for deep sleep.",
        "**Light Management**: Dim lights 2-3 hours before bed. Blue light suppresses melatonin production.",
        "**Avoid Alcohol**: Even one drink can reduce deep sleep by 20-50%. If you drink, do it earlier in the evening.",
        "**Wind-Down Ritual**: Create a consistent pre-sleep routine. Your brain needs signals that it's time to rest.",
      ],
      readiness: [
        "**Sleep First**: Readiness is 60% driven by sleep quality. Optimize sleep and readiness follows.",
        "**Manage Training Load**: Balance hard days with recovery. The 'more is better' approach backfires.",
        "**Stress Management**: HRV is a stress indicator. Meditation, breathing exercises, and nature time help.",
        "**Listen to Your Body**: On low readiness days, do light movement instead of intense training.",
        "**Recovery Modalities**: Cold plunges, sauna, massage, and yoga all support parasympathetic activation.",
      ],
      activity: [
        "**Quality Over Quantity**: 3-4 focused workouts beat 7 mediocre ones every time.",
        "**Progressive Overload**: Gradually increase intensity. Jumping too fast leads to burnout.",
        "**Variety**: Mix cardio, strength, and mobility. Monotony increases injury risk.",
        "**Fuel Properly**: You can't out-train poor nutrition. Protein and whole foods matter.",
        "**Rest is Training**: Recovery days aren't lazy days - they're when adaptation happens.",
      ],
    };

    const guidance = improvements[metric as keyof typeof improvements] ||
      improvements.readiness;

    return `Here's how to improve your ${metric || 'overall health'}, based on both science and your personal data:\n\n${guidance.join('\n\n')}\n\nThe key is consistency. Pick 1-2 of these to implement this week, master them, then add more. Overwhelming yourself with too many changes usually backfires. Which one resonates most with you?`;
  }

  /**
   * Explain WHAT with clarity
   */
  private explainWhat(question: string, intent: Intent): string {
    if (!this.healthData) {
      return "I can explain any health metric you're curious about! Common questions include: What is HRV? What's a good readiness score? What do sleep stages mean? What's your specific question?";
    }

    const lowerQ = question.toLowerCase();

    if (lowerQ.includes('hrv')) {
      return "**Heart Rate Variability (HRV)** measures the variation in time between heartbeats. Higher HRV = more flexible nervous system = better stress resilience and recovery. It's your body's 'battery level' indicator.\n\nWhen you're well-rested and recovered, your HRV is high. When stressed or overtrained, it drops. Think of it as your body's way of telling you how ready it is for stress.";
    }

    if (lowerQ.includes('readiness')) {
      return "**Readiness Score** is Oura's assessment of how prepared your body is for the day. It combines:\n• Sleep quality and duration\n• Recovery (HRV, resting heart rate, temperature)\n• Previous day's activity balance\n\n85+ = Go hard, your body is ready\n70-84 = Moderate exertion is fine\n<70 = Prioritize recovery\n\nYour current readiness is YOUR body's signal, not a one-size-fits-all number.";
    }

    if (lowerQ.includes('sleep stage')) {
      return "Your sleep has 4 stages:\n\n**Light Sleep** (50-60%): Transition phase, memory consolidation begins\n\n**Deep Sleep** (15-25%): Physical recovery, immune boost, muscle repair, HGH release\n\n**REM Sleep** (20-25%): Emotional processing, creative insights, complex memory consolidation\n\n**Awake**: Brief periods are normal\n\nOptimal ratios matter more than hitting exact percentages. Your body knows what it needs.";
    }

    return this.provideGeneralExplanation(question, intent);
  }

  /**
   * Provide guidance and recommendations
   */
  private provideGuidance(question: string, intent: Intent): string {
    if (!this.healthData) {
      return "I can provide personalized guidance once you connect your health data. Generally though, listen to your body - if you're feeling fatigued, rest. If you're energized, train.";
    }

    const latest = this.healthData.readiness[this.healthData.readiness.length - 1];
    const score = latest.score;

    if (question.toLowerCase().includes('workout') || question.toLowerCase().includes('train') || question.toLowerCase().includes('exercise')) {
      if (score >= 85) {
        return `**Yes, you should workout today!** Your readiness score of ${score} indicates your body is well-recovered and primed for challenging activity. This is your window for:\n\n• High-intensity intervals\n• Heavy strength training  \n• Personal record attempts\n• Long endurance sessions\n\nJust remember: even on great days, listen to your body during the workout. Readiness predicts capacity, but real-time feel is the final arbiter.`;
      } else if (score >= 70) {
        return `**Moderate exercise is appropriate.** Your readiness of ${score} suggests moderate exertion is fine, but back off from max efforts. Consider:\n\n• Moderate intensity cardio (conversational pace)\n• Technique-focused strength work\n• Skill development without high load\n• Yoga or mobility work\n\nThis is about maintaining fitness, not building it. Save the hard pushes for higher readiness days.`;
      } else {
        return `**I'd recommend recovery today.** Your readiness score of ${score} indicates your body needs rest more than stress. Options:\n\n• Active recovery: Easy walk, gentle yoga, swimming\n• Complete rest: Sometimes doing nothing is doing something\n• Mobility and stretching\n• Meditation or breathwork\n\nPushing hard on low readiness days often leads to diminishing returns, increased injury risk, or prolonged fatigue. Trust the process - recovery is when you actually get stronger.`;
      }
    }

    return "I'm here to provide personalized guidance! Could you be more specific about what you're trying to decide? For example: 'Should I work out today?' or 'Should I take a rest day?'";
  }

  /**
   * Predict timing and trends
   */
  private predictTiming(question: string, intent: Intent): string {
    if (!this.healthData) {
      return "I can make predictions once you connect your health data. I'll analyze your patterns to forecast trends and optimal timing for activities.";
    }

    const { readiness } = this.healthData;
    const recent = readiness.slice(-7);
    const trend = this.calculateTrend(recent.map(r => r.score));

    if (question.toLowerCase().includes('recover') || question.toLowerCase().includes('better')) {
      if (trend > 0) {
        return `Good news! Your readiness is trending upward. Based on the current ${trend.toFixed(1)} point per day improvement, you should feel significantly better in 2-3 days. Keep doing what you're doing!`;
      } else {
        return `Your readiness needs attention. With focused recovery efforts - prioritizing sleep, reducing stress, and scaling back activity - you can typically see meaningful improvement in 3-5 days. The key is consistency.`;
      }
    }

    return "I can predict timing for various health outcomes. What specifically would you like to know about - recovery timing, peak performance windows, or trend predictions?";
  }

  /**
   * Generate deep insights
   */
  private generateDeepInsight(question: string, intent: Intent): string {
    if (!this.healthData) {
      return "I'd love to provide deep insights, but I need access to your health data first. Connect your Oura account and I'll analyze patterns, predict trends, and surface insights you'd never spot on your own.";
    }

    return "That's a fascinating question! Let me analyze your data and provide a comprehensive answer. Based on your patterns, I notice several interesting correlations that might address your question...";
  }

  /**
   * Execute intelligent commands
   */
  private async executeIntelligentCommand(command: string, intent: Intent): Promise<string> {
    const lowerCmd = command.toLowerCase();

    if (lowerCmd.includes('analyze') || lowerCmd.includes('show me')) {
      return this.performAnalysis(intent);
    }

    if (lowerCmd.includes('explain')) {
      return this.provideExplanation(intent);
    }

    if (lowerCmd.includes('recommend') || lowerCmd.includes('suggest')) {
      return this.generateRecommendations(intent);
    }

    return "I'm ready to help! I can analyze your data, explain patterns, make recommendations, and answer questions. What would you like me to do?";
  }

  /**
   * Add personality to responses
   */
  private addPersonalityToResponse(text: string, intent: Intent): string {
    // Add empathy for negative sentiment
    if (intent.sentiment < -0.3 && this.personality.empathyLevel > 50) {
      const empathyPhrases = [
        "I understand that's frustrating. ",
        "I hear you. ",
        "That's a valid concern. ",
      ];
      text = empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)] + text;
    }

    // Add encouragement for positive sentiment
    if (intent.sentiment > 0.3) {
      const encouragementPhrases = [
        "That's excellent! ",
        "Great to hear! ",
        "I love that! ",
      ];
      text = encouragementPhrases[Math.floor(Math.random() * encouragementPhrases.length)] + text;
    }

    // Add humor occasionally
    if (this.personality.humorLevel > 50 && Math.random() < 0.1) {
      const humorPhrases = [
        " (Your data doesn't lie, even when you want it to! 😉)",
        " (Science is cool, isn't it?)",
      ];
      text += humorPhrases[Math.floor(Math.random() * humorPhrases.length)];
    }

    return text;
  }

  /**
   * Generate personalized greeting
   */
  private generatePersonalizedGreeting(): string {
    const hour = new Date().getHours();
    let timeGreeting = '';

    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 17) timeGreeting = 'Good afternoon';
    else if (hour < 22) timeGreeting = 'Good evening';
    else timeGreeting = 'Hello';

    const userName = this.context.userProfile.name;
    const name = userName ? `, ${userName}` : '';

    if (this.healthData) {
      const latest = this.healthData.readiness[this.healthData.readiness.length - 1];
      if (latest.score >= 85) {
        return `${timeGreeting}${name}! Your readiness score of ${latest.score} looks great today. You're primed for peak performance. What would you like to know?`;
      } else if (latest.score < 65) {
        return `${timeGreeting}${name}. I notice your readiness is ${latest.score} today - your body could use some extra care. How can I help you optimize your recovery?`;
      }
    }

    return `${timeGreeting}${name}! I'm your AI health coach. I can analyze your data, answer questions, and provide personalized guidance. What would you like to know?`;
  }

  /**
   * Learn from interactions to improve over time
   */
  private learnFromInteraction(userMsg: Message, assistantMsg: Message, intent: Intent): void {
    // Track which topics the user asks about most
    const topic = intent.topic;
    const currentCount = this.memory.userInsights.get(topic) || 0;
    this.memory.userInsights.set(topic, currentCount + 1);

    // Learn user's preferred response style
    if (assistantMsg.content.length > 500) {
      const currentDetailPref = this.context.userProfile.preferences.get('detailed_responses') || 0;
      this.context.userProfile.preferences.set('detailed_responses', currentDetailPref + 1);
    }

    // Track sentiment patterns
    const currentSentiment = this.memory.longTerm.get('avg_user_sentiment') || 0;
    const newSentiment = (currentSentiment * 0.9) + (intent.sentiment * 0.1);
    this.memory.longTerm.set('avg_user_sentiment', newSentiment);
  }

  /**
   * Update insights about the user based on health data
   */
  private updateUserInsights(): void {
    if (!this.healthData) return;

    const { sleep, readiness } = this.healthData;

    // Optimal sleep duration
    const highScoreSleeps = sleep
      .filter(s => s.score >= 85)
      .map(s => s.total_sleep_duration / 3600);

    if (highScoreSleeps.length > 0) {
      const optimal = highScoreSleeps.reduce((sum, d) => sum + d, 0) / highScoreSleeps.length;
      this.memory.userInsights.set('optimal_sleep_duration', optimal);
    }

    // Average readiness
    const avgReadiness = readiness.reduce((sum, r) => sum + r.score, 0) / readiness.length;
    this.memory.userInsights.set('average_readiness', avgReadiness);
  }

  /**
   * Helper methods
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b);
    const sumY = values.reduce((a, b) => a + b);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private getRelatedTopics(topic: string): string[] {
    const related: { [key: string]: string[] } = {
      sleep: ['recovery', 'readiness', 'energy'],
      readiness: ['sleep', 'stress', 'activity'],
      activity: ['recovery', 'training load', 'readiness'],
      stress: ['HRV', 'recovery', 'sleep'],
    };

    return related[topic] || [];
  }

  private generateActionItems(topic: string): string[] {
    const actions: { [key: string]: string[] } = {
      sleep: ['Aim for consistent bedtime tonight', 'Avoid screens 1 hour before bed', 'Keep bedroom cool (65-68°F)'],
      readiness: ['Prioritize sleep tonight', 'Manage stress with meditation', 'Scale activity based on readiness'],
      activity: ['Match intensity to readiness', 'Include recovery days', 'Focus on quality over quantity'],
    };

    return actions[topic] || [];
  }

  private processFeedback(message: string, intent: Intent): string {
    return "Thank you for the feedback! I'm constantly learning to provide better insights for you. Is there anything else you'd like to know?";
  }

  private generateContextualResponse(message: string, intent: Intent): string {
    return NaturalLanguageEngine.generateResponse(message, this.context, this.healthData);
  }

  private performAnalysis(intent: Intent): string {
    return "I'm analyzing your data now... Based on your recent patterns, I see several interesting trends. Would you like me to focus on sleep, recovery, or performance patterns?";
  }

  private provideExplanation(intent: Intent): string {
    const metric = intent.entities.find(e => e.type === 'metric')?.value || 'your health data';
    return `Let me explain ${metric} in detail. It's one of the most important indicators of your overall health and performance...`;
  }

  private generateRecommendations(intent: Intent): string {
    if (!this.healthData) {
      return "I can provide personalized recommendations once you connect your health data!";
    }

    return "Based on your data, here are my top recommendations:\n\n1. Prioritize sleep consistency - aim for the same bedtime every night\n2. Match training intensity to readiness scores\n3. Implement stress management practices\n\nWould you like me to elaborate on any of these?";
  }

  private provideGeneralExplanation(question: string, intent: Intent): string {
    return "That's a great question! I can explain any health metric or concept you're curious about. The more specific you are, the more detailed my explanation can be. What would you like to understand better?";
  }

  /**
   * Get conversation history
   */
  getHistory(): Message[] {
    return this.context.history;
  }

  /**
   * Clear conversation (but keep learnings)
   */
  clearConversation(): void {
    this.context.history = [];
    this.memory.shortTerm = [];
  }

  /**
   * Export user profile and learnings
   */
  exportProfile(): { profile: UserProfile; insights: Record<string, any> } {
    return {
      profile: this.context.userProfile,
      insights: Object.fromEntries(this.memory.userInsights),
    };
  }
}
