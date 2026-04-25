import React from 'react';

export interface Step {
  id: number | string;
  name: string;
}

interface StepperSharedProps {
  steps: Step[];
  currentStep: number;
  onGoToStep: (step: number) => void;
  compact?: boolean; // allow slight variance for different layouts
}

export const StepperShared: React.FC<StepperSharedProps> = ({ steps, currentStep, onGoToStep, compact = false }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className={`flex flex-row space-x-2 overflow-x-auto p-2 scrollbar-autohide ${compact ? 'lg:flex-row' : 'lg:flex-col lg:space-y-4'}`}>
        {steps.map((step) => {
          const isCompleted = currentStep > Number(step.id);
          const isCurrent = currentStep === Number(step.id);

          return (
            <li key={String(step.id)} className="flex-shrink-0 lg:w-full">
              <button
                onClick={() => { if (isCompleted) onGoToStep(Number(step.id)); }}
                className={`group flex flex-col items-center w-24 p-1 text-center lg:flex-row lg:w-full lg:text-left lg:p-2 lg:rounded-lg transition-colors ${isCurrent ? 'bg-sky-50' : ''} ${isCompleted ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'}`}
              >
                <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors ${isCurrent ? 'bg-sky-600' : isCompleted ? 'bg-green-600' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
                  {isCompleted ? (
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 111.415-1.415L8.414 12.172l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium text-slate-700">{String(step.id)}</span>
                  )}
                </span>

                <span className="mt-2 lg:mt-0 lg:ml-4">
                  <span className={`text-sm font-medium ${isCurrent ? 'text-sky-700' : 'text-slate-700'}`}>{step.name}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default StepperShared;