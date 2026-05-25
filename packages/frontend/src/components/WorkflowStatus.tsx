import { CheckIcon } from '@heroicons/react/24/solid';

interface WorkflowStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'pending';
}

interface WorkflowStatusProps {
  steps: WorkflowStep[];
}

export function WorkflowStatus({ steps }: WorkflowStatusProps) {
  return (
    <nav aria-label="Workflow progress" data-testid="workflow-status">
      <ol className="flex items-center">
        {steps.map((step, index) => (
          <li key={step.id} className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
            <div className="flex items-center gap-2">
              {step.status === 'completed' ? (
                <span className="w-7 h-7 rounded-full bg-pine-500 flex items-center justify-center">
                  <CheckIcon className="w-4 h-4 text-white" aria-hidden="true" />
                </span>
              ) : step.status === 'current' ? (
                <span className="w-7 h-7 rounded-full border-2 border-navy-500 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-navy-500 animate-pulse" />
                </span>
              ) : (
                <span className="w-7 h-7 rounded-full border-2 border-slate-200 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                </span>
              )}
              <span
                className={`text-sm font-medium whitespace-nowrap ${
                  step.status === 'current' ? 'text-navy-600' : step.status === 'completed' ? 'text-pine-700' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-px mx-3 ${
                  step.status === 'completed' ? 'bg-pine-300' : 'bg-slate-200'
                }`}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}