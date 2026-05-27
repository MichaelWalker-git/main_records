import { CheckIcon } from '@heroicons/react/24/solid';

export interface StepItem {
  key: string;
  label: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className = '' }: StepperProps) {
  return (
    <nav aria-label="Progress" className={className} data-testid="stepper">
      <ol className="flex items-center">
        {steps.map((step, i) => {
          const isComplete = i < currentStep;
          const isCurrent = i === currentStep;
          const isLast = i === steps.length - 1;

          return (
            <li key={step.key} className={`flex items-center ${!isLast ? 'flex-1' : ''}`}>
              <div className="flex items-center gap-2">
                {isComplete ? (
                  <span className="w-7 h-7 rounded-full bg-navy-500 flex items-center justify-center flex-shrink-0">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </span>
                ) : isCurrent ? (
                  <span className="w-7 h-7 rounded-full border-2 border-navy-500 bg-navy-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-navy-600">{i + 1}</span>
                  </span>
                ) : (
                  <span className="w-7 h-7 rounded-full border-2 border-slate-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-slate-400">{i + 1}</span>
                  </span>
                )}
                <span className={`text-sm font-medium whitespace-nowrap ${
                  isComplete ? 'text-navy-600' : isCurrent ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div className={`flex-1 h-px mx-4 ${isComplete ? 'bg-navy-300' : 'bg-slate-200'}`} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
