import React from 'react';
import { useIntake } from '../../../context/IntakeContext';
import FormTextArea from '../../form/FormTextArea';
import FormInput from '../../form/FormInput';

const AssessmentStep: React.FC = () => {
    const { state, dispatch, validationErrors } = useIntake();
    const { assessment } = state.formData;

    const handleArrayChange = (field: string, value: string) => {
        // FIX: Map strings from split result into SnomedConcept objects to match SnomedConcept[] type.
        const concepts = value.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => ({ id: `temp_${Math.random()}`, display: line, code: `custom_${Math.random()}` }));
        dispatch({ type: 'UPDATE_FIELD', payload: { step: 'assessment', field, value: concepts } });
    };
    
    const handleChange = (field: string, value: string) => {
        // FIX: Wrap the input string in a SnomedConcept object within an array to match SnomedConcept[] type.
        const concepts = value ? [{ id: `temp_${Math.random()}`, display: value, code: `custom_${Math.random()}` }] : [];
        dispatch({ type: 'UPDATE_FIELD', payload: { step: 'assessment', field, value: concepts } });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Assessment</h2>
            <p className="text-sm text-slate-600">Document the clinical assessment and diagnosis.</p>
            
            <FormInput
                label="Working Diagnosis"
                // FIX: workingDiagnosis is an array, so we map to display and join for the input value.
                value={assessment.workingDiagnosis.map(d => d.display).join(', ')}
                onChange={(e) => handleChange('workingDiagnosis', e.target.value)}
                required
                error={validationErrors.Assessment?.find(e => e.includes('working diagnosis'))}
            />
            
            <FormTextArea
                label="Differential Diagnosis"
                value={assessment.differentialDiagnosis.map(d => d.display).join('\n')}
                onChange={(e) => handleArrayChange('differentialDiagnosis', e.target.value)}
                rows={4}
                placeholder="Enter one diagnosis per line"
            />
            
            {/* FIX: Removed clinicalReasoning field as it does not exist on the new type */}
        </div>
    );
};

export default AssessmentStep;