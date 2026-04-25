import React from 'react';
import StepperShared, { Step } from '../../../../components/shared/StepperShared';

interface StepperProps {
  steps: { id: number, name: string }[];
  currentStep: number;
  onGoToStep: (step: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onGoToStep }) => {
  // Map to the shared Step type
  const sharedSteps: Step[] = steps.map(s => ({ id: s.id, name: s.name }));
  return <StepperShared steps={sharedSteps} currentStep={currentStep} onGoToStep={onGoToStep} />;
};

export default Stepper;