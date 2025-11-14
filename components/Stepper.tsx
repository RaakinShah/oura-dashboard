import { Check } from 'lucide-react';
import { ReactNode } from 'react';

export interface Step {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * Stepper component for multi-step processes
 */
export function Stepper({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  className = '',
}: StepperProps) {
  const isClickable = !!onStepClick;

  if (orientation === 'vertical') {
    return (
      <div className={`space-y-4 ${className}`}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={step.id} className="flex gap-4">
              {/* Step Indicator */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={!isClickable}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    ${isCompleted ? 'bg-sage-600 text-white' : ''}
                    ${isCurrent ? 'bg-sage-100 text-sage-900 ring-2 ring-sage-600' : ''}
                    ${isUpcoming ? 'bg-stone-200 text-stone-500' : ''}
                    ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
                    transition-all
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    index + 1
                  )}
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-12 ${
                      isCompleted ? 'bg-sage-600' : 'bg-stone-200'
                    }`}
                  />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 pb-8">
                <h4 className={`font-semibold ${isCurrent ? 'text-sage-900' : 'text-stone-900'}`}>
                  {step.label}
                </h4>
                {step.description && (
                  <p className="text-sm text-stone-600 mt-1">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                {/* Step Indicator */}
                <button
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={!isClickable}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    ${isCompleted ? 'bg-sage-600 text-white' : ''}
                    ${isCurrent ? 'bg-sage-100 text-sage-900 ring-2 ring-sage-600' : ''}
                    ${isUpcoming ? 'bg-stone-200 text-stone-500' : ''}
                    ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
                    transition-all
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    index + 1
                  )}
                </button>

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${isCurrent ? 'text-sage-900' : 'text-stone-700'}`}>
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-stone-500 mt-0.5">{step.description}</p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 ${isCompleted ? 'bg-sage-600' : 'bg-stone-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
