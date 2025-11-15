/**
 * NATURAL LANGUAGE GENERATOR
 * Converts analytical insights into natural, conversational, Claude-like responses
 */

import { SleepData, ActivityData, ReadinessData } from '../oura-api';

/**
 * Natural Language Generator - Makes AI responses sound human
 */
export class NaturalLanguageGenerator {
  /**
   * Generate conversational opening based on context
   */
  static generateOpening(question: string, dataQuality: string): string {
    const lowerQ = question.toLowerCase();

    if (lowerQ.includes('tired') || lowerQ.includes('exhausted') || lowerQ.includes('fatigue')) {
      return "I can hear the frustration in your question - nobody likes feeling tired when they think they did everything right. Let me help you understand what's going on.";
    }

    if (lowerQ.includes('should i') || lowerQ.includes('can i')) {
      return "Good question! Let's look at what your body is telling us and figure out the best path forward.";
    }

    if (lowerQ.includes('why') && dataQuality === 'low') {
      return "Great question! I wish I had more data to give you a really detailed answer, but here's what I can tell you based on what we have:";
    }

    if (lowerQ.includes('analyze') || lowerQ.includes('assess')) {
      return "Absolutely! Let me dig into your data and give you a comprehensive picture of what's happening.";
    }

    return "Let me break this down for you.";
  }

  /**
   * Convert sleep score to natural language with context
   */
  static describeSleepQuality(score: number, context: { duration: number; efficiency: number; deepSleep: number }): string {
    const { duration, efficiency, deepSleep } = context;

    if (score >= 85) {
      const positives = [];
      if (duration >= 7.5) positives.push("got plenty of time in bed");
      if (efficiency >= 90) positives.push("slept soundly with minimal disruptions");
      if (deepSleep >= 90) positives.push("got excellent deep sleep for physical recovery");

      return `Your sleep last night was excellent (${score}/100). You ${positives.join(", and you ")}. This is the kind of sleep that sets you up for a great day.`;
    }

    if (score >= 70) {
      const issues = [];
      if (efficiency < 85) issues.push(`you spent about ${Math.round((100 - efficiency) * duration / 100 * 60)} minutes awake during the night`);
      if (deepSleep < 70) issues.push(`deep sleep was on the light side at ${Math.round(deepSleep)} minutes`);

      if (issues.length > 0) {
        return `Your sleep was decent (${score}/100), but there's room for improvement. The main issue: ${issues.join(" and ")}. Not terrible, but not optimal either.`;
      }
      return `Your sleep was solid (${score}/100) - not your best, but definitely acceptable. You got the job done.`;
    }

    const problems = [];
    if (duration < 6.5) problems.push(`you only got ${duration.toFixed(1)} hours, which is below what most people need`);
    if (efficiency < 80) problems.push(`sleep was fragmented - you were awake for ${Math.round((100 - efficiency) * duration / 100 * 60)} minutes during the night`);
    if (deepSleep < 60) problems.push(`deep sleep was insufficient at just ${Math.round(deepSleep)} minutes`);

    return `Your sleep last night was rough (${score}/100). Here's what happened: ${problems.join("; ")}. This explains why you might not be feeling your best today.`;
  }

  /**
   * Convert readiness score to natural language with empathy
   */
  static describeReadiness(score: number, trend: number, context: { hrv?: number; rhr: number; sleep: number }): string {
    const { hrv, rhr, sleep } = context;

    if (score >= 85) {
      const trendText = trend > 1 ? " and you're on an upward trajectory" : trend < -1 ? ", though you've been better recently" : "";
      return `You're in excellent shape today (${score}/100 readiness)${trendText}. Your body has recovered well and is ready for whatever you throw at it. This is a great day to push hard if you want to.`;
    }

    if (score >= 70) {
      if (sleep < 70) {
        return `You're in okay shape (${score}/100 readiness). Honestly, considering your sleep wasn't great (${sleep}/100), your body is doing pretty well to be at this level. You can still train today, just maybe dial back the intensity a bit.`;
      }
      return `You're at ${score}/100 readiness - solidly in the "good enough" zone. Not peak, but definitely functional. This is a day for moderate training or steady-state work rather than crushing PR attempts.`;
    }

    if (score >= 60) {
      const reasons = [];
      if (hrv && hrv < 40) reasons.push("HRV is suppressed (sign of stress or incomplete recovery)");
      if (rhr > 60) reasons.push(`resting heart rate is elevated at ${rhr} bpm`);
      if (sleep < 70) reasons.push("sleep quality was subpar");

      return `Your readiness is ${score}/100 - in the borderline zone. Your body is saying "I can do stuff, but I need you to be smart about it." ${reasons.length > 0 ? `The culprits: ${reasons.join(", ")}.` : ""} Listen to how you feel - if you feel better than the number suggests, trust that, but don't ignore warning signs.`;
    }

    return `Your readiness is low at ${score}/100. I'm not going to sugarcoat it - your body needs recovery more than it needs another workout. This isn't weakness, it's biology. Taking it easy today will make you stronger tomorrow. Promise.`;
  }

  /**
   * Generate empathetic explanation for "why" questions
   */
  static explainWhy(finding: string, evidence: any[], confidence: number): string {
    const evidenceText = evidence.map((e, i) => {
      if (typeof e === 'string') return e;
      return `${e.metric}: ${e.value}`;
    }).join(", ");

    const confidencePhrase = confidence > 0.85 ? "I'm pretty confident about this" :
                             confidence > 0.70 ? "This is my best assessment" :
                             "This is my educated guess, though there's some uncertainty";

    return `${finding}. ${confidencePhrase} based on what I'm seeing: ${evidenceText}. ${this.addNuance(confidence)}`;
  }

  /**
   * Add nuance based on confidence
   */
  private static addNuance(confidence: number): string {
    if (confidence < 0.70) {
      return "Keep in mind, health data tells part of the story - how you subjectively feel matters too.";
    }
    if (confidence < 0.85) {
      return "Of course, everyone's different, so take this as a strong indicator rather than absolute truth.";
    }
    return "";
  }

  /**
   * Generate analogies for complex concepts
   */
  static createAnalogy(concept: string, value: number): string {
    const analogies: { [key: string]: (v: number) => string } = {
      hrv: (v) => {
        if (v < 30) return "Think of HRV like a stress gauge. Right now, yours is in the red zone - your nervous system is maxed out, like a car engine revving too high for too long.";
        if (v < 50) return "HRV is like your body's shock absorber. Yours is functional but not optimal - you can handle bumps, but big jolts might throw you off.";
        return "HRV is like your body's shock absorber, and yours is working beautifully - you can handle whatever stress comes your way.";
      },

      efficiency: (v) => {
        const wastedTime = Math.round((100 - v) * 8 / 100 * 60);
        if (v < 80) return `Think of sleep efficiency like phone charging. You plugged in for 8 hours, but you only actually charged for about ${Math.round(v * 8 / 100)} hours. The rest? Phone was connected but not charging. That's ${wastedTime} minutes wasted.`;
        if (v < 90) return `Your sleep efficiency is like charging your phone - you plugged in for the full night, but lost maybe ${wastedTime} minutes to being awake. Pretty good, but room for improvement.`;
        return "Sleep efficiency is like charging efficiency - you plugged in for 8 hours and got nearly 8 hours of actual charge. Excellent.";
      },

      deepSleep: (v) => {
        if (v < 60) return `Deep sleep is when your body does physical repairs - muscle recovery, immune system boost, tissue regeneration. You got ${Math.round(v)} minutes. Optimal is 90+. It's like going to the mechanic but only giving them half the time they need - some repairs get done, but not all.`;
        if (v < 90) return `You got ${Math.round(v)} minutes of deep sleep. That's decent - enough to handle basic recovery, like getting your oil changed but skipping the full tune-up.`;
        return `You got ${Math.round(v)} minutes of deep sleep - that's excellent! Your body had time for a full overhaul: muscle repair, immune boost, the works.`;
      },
    };

    return analogies[concept]?.(value) || "";
  }

  /**
   * Generate conversational recommendations
   */
  static generateRecommendation(priority: 'critical' | 'high' | 'medium', action: string, why: string, expectedImpact: number): string {
    const urgency = {
      critical: "This is priority #1. If you only do one thing, make it this:",
      high: "This is really important and you should tackle it soon:",
      medium: "When you're ready to level up, focus on this:",
    };

    const impactPhrase = expectedImpact > 0.8 ? "This could be a game-changer" :
                         expectedImpact > 0.6 ? "You'll likely see real improvements" :
                         "This should help, though the impact might be moderate";

    return `${urgency[priority]} ${action}. Why? ${why}. ${impactPhrase} - we're talking a potential ${Math.round(expectedImpact * 100)}% improvement in that area.`;
  }

  /**
   * Generate conversational trend analysis
   */
  static describeTrend(metric: string, values: number[], timeframe: string): string {
    if (values.length < 3) return `Not enough data to see a clear trend in ${metric} yet.`;

    const trend = this.calculateSimpleTrend(values);
    const latest = values[values.length - 1];
    const earliest = values[0];
    const change = latest - earliest;
    const percentChange = (change / earliest) * 100;

    if (Math.abs(trend) < 0.5) {
      return `Your ${metric} has been pretty stable over the ${timeframe} - hovering around ${latest.toFixed(0)}. Consistency is good, though it also means there's no dramatic improvement or decline happening.`;
    }

    if (trend > 0.5) {
      const goodMetrics = ['readiness', 'sleep score', 'hrv', 'sleep efficiency'];
      const isGood = goodMetrics.some(m => metric.toLowerCase().includes(m));

      if (isGood) {
        return `Great news! Your ${metric} is trending upward over the ${timeframe} - you've gone from ${earliest.toFixed(0)} to ${latest.toFixed(0)} (${percentChange > 0 ? '+' : ''}${percentChange.toFixed(0)}% change). Whatever you're doing, it's working. Keep it up!`;
      } else {
        return `Heads up: your ${metric} is trending up (${earliest.toFixed(0)} → ${latest.toFixed(0)}), which might not be ideal. Worth investigating what changed ${timeframe}.`;
      }
    }

    const goodMetrics = ['readiness', 'sleep score', 'hrv', 'sleep efficiency'];
    const isGood = goodMetrics.some(m => metric.toLowerCase().includes(m));

    if (isGood) {
      return `Your ${metric} is trending downward (${earliest.toFixed(0)} → ${latest.toFixed(0)}, ${percentChange.toFixed(0)}% drop). This isn't a crisis, but it's a signal worth paying attention to. Something's changed over the ${timeframe} - stress, training load, sleep habits?`;
    } else {
      return `Good news! Your ${metric} is coming down (${earliest.toFixed(0)} → ${latest.toFixed(0)}), which is actually a positive sign. The trend is your friend here.`;
    }
  }

  /**
   * Create personalized closing based on context
   */
  static generateClosing(overallSentiment: 'positive' | 'neutral' | 'concerning', hasActionItems: boolean): string {
    if (overallSentiment === 'positive') {
      return hasActionItems
        ? "You're in a good spot. Keep doing what you're doing, and consider the tweaks above to go from good to great. You've got this! 💪"
        : "You're crushing it! Keep up the great work. 🌟";
    }

    if (overallSentiment === 'concerning') {
      return hasActionItems
        ? "I know it might feel discouraging to see these numbers, but here's the thing: you have clear, actionable steps to improve. Progress isn't linear - rough patches happen. Focus on the basics above, and you'll bounce back. Trust the process. 🎯"
        : "Things are a bit challenging right now, but this is temporary. Your body is incredibly adaptable. Give it what it needs (rest, good sleep, stress management), and you'll recover. Be patient with yourself.";
    }

    return hasActionItems
      ? "Hope this gives you clarity on what's happening and where to focus. Small, consistent improvements add up to big changes over time. 📈"
      : "Let me know if you want me to dive deeper into any particular area!";
  }

  /**
   * Convert correlation to natural language
   */
  static describeCorrelation(metric1: string, metric2: string, strength: number): string {
    if (strength > 0.7) {
      return `There's a strong connection between your ${metric1} and ${metric2} (${Math.round(strength * 100)}% correlation). When one changes, the other tends to follow. This is a key relationship to understand.`;
    }
    if (strength > 0.4) {
      return `I'm seeing a moderate connection between ${metric1} and ${metric2} (${Math.round(strength * 100)}% correlation). They influence each other, though other factors play a role too.`;
    }
    if (strength > 0.2) {
      return `There's a weak link between ${metric1} and ${metric2} (${Math.round(strength * 100)}% correlation). They might be related, but the connection isn't strong enough to be your primary focus.`;
    }
    return `${metric1} and ${metric2} don't show much correlation in your data (only ${Math.round(strength * 100)}%). They seem to operate pretty independently for you.`;
  }

  // Helper methods
  private static calculateSimpleTrend(values: number[]): number {
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
}
