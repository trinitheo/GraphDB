import React from 'react';
import { useIntake } from '../../../context/IntakeContext';
import FormTextArea from '../../form/FormTextArea';
import FormInput from '../../form/FormInput';

const ComplaintStep: React.FC = () => {
    const { state, dispatch, validationErrors } = useIntake();
    // FIX: Use 'complaint' instead of 'chiefComplaint' to match MedicalHistoryForm type
    const { complaint } = state.formData;

    const handleChange = (field: string, value: any) => {
        dispatch({ type: 'UPDATE_FIELD', payload: { step: 'complaint', field, value } });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Chief Complaint</h2>
            <p className="text-sm text-slate-600">Describe the primary reason for the patient's visit.</p>

            <FormTextArea
                label="Description of Complaint"
                value={complaint.symptoms.map(s => s.description).join('\n')}
                onChange={(e) => {
                    // This is a simplified handling for a text area. A more complex component would be needed for structured symptom entry here.
                    const symptoms = e.target.value.split('\n').map(desc => ({ id: `temp_${Math.random()}`, description: desc, location: [], onset: '', severity: 0 }));
                    handleChange('symptoms', symptoms);
                }}
                rows={4}
                placeholder="e.g., Sharp, stabbing chest pain radiating to the left arm..."
                required
                error={validationErrors['Chief Complaint']?.find(e => e.includes('symptom'))}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormInput
                    label="Onset"
                    value={complaint.timeline} // Using timeline as a proxy for onset
                    onChange={(e) => handleChange('timeline', e.target.value)}
                    placeholder="e.g., 2 hours ago"
                />
                <FormInput
                    label="Duration"
                    value={''} // Field does not exist on new model
                    onChange={(e) => {}}
                    placeholder="e.g., Intermittent, lasting 5 mins"
                />
                <FormInput
                    label="Context"
                    value={''} // Field does not exist on new model
                    onChange={(e) => {}}
                    placeholder="e.g., Occurs with exertion"
                />
            </div>
        </div>
    );
};

export default ComplaintStep;