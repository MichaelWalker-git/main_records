import { CheckCircleIcon } from '@heroicons/react/24/solid';

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
            <div className="flex items-center">
              {step.status === 'completed' ? (
                <CheckCircleIcon className="w-6 h-6 text-green-500" aria-hidden="true" />
              ) : step.status === 'current' ? (
                <span className="w-6 h-6 rounded-full border-2 border-navy-500 bg-navy-500 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white" />
                </span>
              ) : (
                <span className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                </span>
              )}
              <span
                className={`ml-2 text-sm font-medium ${
                  step.status === 'current' ? 'text-navy-500' : step.status === 'completed' ? 'text-green-600' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${
                  step.status === 'completed' ? 'bg-green-500' : 'bg-slate-200'
                }`}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
