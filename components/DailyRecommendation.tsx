'use client';

import { Zap, Battery, Bed } from 'lucide-react';
import { DailyRecommendation as RecommendationType } from '@/lib/ai-analyzer';

interface Props {
  recommendation: RecommendationType;
}

export default function DailyRecommendation({ recommendation }: Props) {
  const getIcon = () => {
    switch (recommendation.type) {
      case 'optimal':
        return <Zap className="h-8 w-8" />;
      case 'moderate':
        return <Battery className="h-8 w-8" />;
      case 'light':
        return <Battery className="h-8 w-8" />;
      case 'rest':
        return <Bed className="h-8 w-8" />;
    }
  };

  const getGradient = () => {
    switch (recommendation.type) {
      case 'optimal':
        return 'from-green-400 via-emerald-500 to-teal-600';
      case 'moderate':
        return 'from-blue-400 via-cyan-500 to-sky-600';
      case 'light':
        return 'from-yellow-400 via-orange-400 to-amber-500';
      case 'rest':
        return 'from-red-400 via-rose-500 to-pink-600';
    }
  };

  const getBgColor = () => {
    switch (recommendation.type) {
      case 'optimal':
        return 'bg-green-50';
      case 'moderate':
        return 'bg-blue-50';
      case 'light':
        return 'bg-yellow-50';
      case 'rest':
        return 'bg-red-50';
    }
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${getGradient()} rounded-3xl p-8 shadow-xl`}>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            {getIcon()}
          </div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white backdrop-blur-sm">
            {Math.round(recommendation.confidence * 100)}% confident
          </span>
        </div>

        <h2 className="text-3xl font-bold text-white mb-3">
          {recommendation.title}
        </h2>

        <p className="text-white/90 text-lg mb-6">
          {recommendation.description}
        </p>

        <div className="space-y-2">
          <p className="text-white/70 text-sm font-medium">Based on:</p>
          {recommendation.factors.map((factor, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
              <p className="text-white/80 text-sm">{factor}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mb-32"></div>
      <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mt-20"></div>
    </div>
  );
}
