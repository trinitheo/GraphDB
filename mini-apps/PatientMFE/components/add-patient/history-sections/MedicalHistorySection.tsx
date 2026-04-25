import React from 'react';
import type { MedicalHistoryForm, SnomedConcept } from '../../../types';
import SnomedSearchInput from '../../ui/SnomedSearchInput';

type MedicalHistorySectionProps = {
    formData: MedicalHistoryForm['history'];
    dispatch: React.Dispatch<any>;
};

const MedicalHistorySection: React.FC<MedicalHistorySectionProps> = ({ formData, dispatch }) => {

    const handleChange = (conditions: SnomedConcept[]) => {
        // Adapt SnomedConcept to MedicalCondition
        const medicalConditions = conditions.map(c => ({ id: c.code, condition: c.display }));
        dispatch({ type: 'UPDATE_FIELD', payload: { step: 'history', field: 'medicalHistory', value: medicalConditions } });
    };

    // Adapt MedicalCondition back to SnomedConcept for the input component
    const valueAsSnomed = formData.medicalHistory.map(c => ({ code: c.id, display: c.condition }));

    return (
        <div>
            <SnomedSearchInput
                value={valueAsSnomed}
                onChange={handleChange}
                placeholder="Search for past medical conditions..."
            />
        </div>
    );
};

export default MedicalHistorySection;