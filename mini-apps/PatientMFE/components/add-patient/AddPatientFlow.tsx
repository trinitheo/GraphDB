
import React from 'react';
// FIX: Using namespace import for react-router-dom to address module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { IntakeProvider, useIntake } from '../../context/IntakeContext';
import IntakeStepper from '../intake/IntakeStepper';
// FIX: Corrected import paths to point to the correct 'add-patient/steps' directory.
import DemographicsStep from './steps/DemographicsStep';
import ComplaintStep from './steps/ComplaintStep';
import HistoryStep from './steps/HistoryStep';
import ExaminationStep from './steps/ExaminationStep';
import AssessmentStep from './steps/AssessmentStep';
import PlanStep from './steps/PlanStep';
import ReviewStep from './steps/ReviewStep';

const STEPS = [
    { id: 1, name: 'Demographics' },
    { id: 2, name: 'Complaint' },
    { id: 3, name: 'History' },
    { id: 4, name: 'Examination' },
    { id: 5, name: 'Assessment' },
    { id: 6, name: 'Plan' },
    { id: 7, name: 'Review & Submit' },
];

const AddPatientFlowContent: React.FC = () => {
    const { state, dispatch, saveStatus, handleSave } = useIntake();
    const navigate = ReactRouterDOM.useNavigate();

    const handleNext = () => dispatch({ type: 'NEXT_STEP' });
    const handleBack = () => dispatch({ type: 'PREV_STEP' });
    const handleGoToStep = (step: number) => dispatch({ type: 'GO_TO_STEP', payload: step });

    const getSaveButtonText = () => {
        switch (saveStatus) {
            case 'saving': return 'Saving...';
            case 'success': return 'Saved! Redirecting...';
            case 'error': return 'Error - Try Again';
            default: return 'Save Patient';
        }
    };
    
    // FIX: Removed props from step components as they now use the useIntake hook.
    const renderStep = () => {
        switch (state.currentStep) {
            case 1: return <DemographicsStep />;
            case 2: return <ComplaintStep />;
            case 3: return <HistoryStep />;
            case 4: return <ExaminationStep />;
            case 5: return <AssessmentStep />;
            case 6: return <PlanStep />;
            case 7: return <ReviewStep onEdit={handleGoToStep} />;
            default: return null;
        }
    };

    return (
        <div className="card-panel p-4 md:p-6 animate-fade-in">
            <div className="flex flex-col lg:flex-row gap-4">
                <aside className="lg:w-1/4">
                    <IntakeStepper steps={STEPS} />
                </aside>
                
                <main className="lg:w-3/4">
                    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                        {renderStep()}
                        
                        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-between gap-4">
                            <button 
                                onClick={handleBack} 
                                disabled={state.currentStep === 1 || saveStatus === 'saving'}
                                className="btn-neu flex-1 sm:flex-initial"
                            >
                                Back
                            </button>
                            
                            {state.currentStep < STEPS.length ? (
                                <button 
                                    onClick={handleNext} 
                                    className="btn-neu text-sky-600 flex-1 sm:flex-initial min-w-[120px]"
                                >
                                    Next
                                </button>
                            ) : (
                                <button 
                                    onClick={handleSave} 
                                    disabled={saveStatus === 'saving' || saveStatus === 'success'}
                                    className={`btn-neu flex-1 sm:flex-initial min-w-[160px] ${
                                        saveStatus === 'error' ? 'text-red-600' : 
                                        saveStatus === 'success' ? 'text-green-600' : 'text-green-600'
                                    }`}
                                >
                                    {getSaveButtonText()}
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};


const AddPatientFlow: React.FC = () => {
    const navigate = ReactRouterDOM.useNavigate();
    return (
        <IntakeProvider navigate={navigate}>
            <AddPatientFlowContent />
        </IntakeProvider>
    );
}

export default AddPatientFlow;