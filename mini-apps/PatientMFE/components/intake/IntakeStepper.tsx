import React from 'react';
import { useIntake } from '../../context/IntakeContext';
import StepperShared, { Step } from '../../../../components/shared/StepperShared';

interface IntakeStepperProps {
    steps: { id: number, name: string }[];
}

const IntakeStepper: React.FC<IntakeStepperProps> = ({ steps }) => {
    const { state, dispatch } = useIntake();
    const { currentStep } = state;

    const handleGoToStep = (step: number) => {
        if (currentStep > step) {
            dispatch({ type: 'GO_TO_STEP', payload: step });
        }
    };
    
    // Map to the shared Step type
    const sharedSteps: Step[] = steps.map(s => ({ id: s.id, name: s.name }));

    return (
        <StepperShared
            steps={sharedSteps}
            currentStep={currentStep}
            onGoToStep={handleGoToStep}
        />
    );
};

export default IntakeStepper;