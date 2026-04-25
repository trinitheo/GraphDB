import React from 'react';
import type { MedicalHistoryForm } from '../../../types';
import type { Api } from '../../../../../api_contract/patient';
import FormCheckbox from '../../form/FormCheckbox';

// Define ReviewOfSystems locally for type safety within the component
type ReviewOfSystems = Api.V1.ReviewOfSystems;

interface ReviewOfSystemsSectionProps {
    formData: MedicalHistoryForm['history'];
    dispatch: React.Dispatch<any>;
}

const ReviewOfSystemsSection: React.FC<ReviewOfSystemsSectionProps> = ({ formData, dispatch }) => {
    const handleRosChange = (category: keyof ReviewOfSystems, symptom: string, checked: boolean) => {
        const currentSymptoms = formData.reviewOfSystems[category];
        const newSymptoms = checked
            ? [...currentSymptoms, symptom]
            : currentSymptoms.filter(s => s !== symptom);

        dispatch({
            type: 'UPDATE_NESTED_FIELD',
            payload: {
                step: 'history',
                nestedKey: 'reviewOfSystems',
                field: category,
                value: newSymptoms
            }
        });
    };

    const rosCategories: { name: keyof ReviewOfSystems, label: string, symptoms: string[] }[] = [
        { name: 'general', label: 'General', symptoms: ['Fever', 'Chills', 'Fatigue', 'Unexplained Weight Loss/Gain'] },
        { name: 'skin', label: 'Skin', symptoms: ['Rash', 'Itching', 'Moles changing', 'New lumps'] },
        { name: 'heent', label: 'Head/Eyes/Ears/Nose/Throat (HEENT)', symptoms: ['Headaches', 'Vision changes', 'Earache', 'Hearing changes', 'Nasal congestion', 'Sore throat', 'Swallowing difficulty'] },
        { name: 'cardiovascular', label: 'Cardiovascular', symptoms: ['Chest pain', 'Shortness of breath with activity', 'Palpitations', 'Swelling in legs'] },
        { name: 'respiratory', label: 'Respiratory', symptoms: ['Cough', 'Wheezing', 'Shortness of breath', 'Sputum production'] },
        { name: 'gastrointestinal', label: 'Gastrointestinal', symptoms: ['Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Abdominal pain', 'Heartburn', 'Blood in stool'] },
        { name: 'genitourinary', label: 'Genitourinary', symptoms: ['Painful urination', 'Frequent urination', 'Blood in urine', 'Incontinence'] },
        { name: 'musculoskeletal', label: 'Musculoskeletal', symptoms: ['Joint pain', 'Muscle pain', 'Back pain', 'Stiffness', 'Swelling in joints'] },
        { name: 'neurological', label: 'Neurological', symptoms: ['Numbness', 'Tingling', 'Weakness', 'Dizziness', 'Fainting', 'Seizures', 'Tremors'] },
        { name: 'endocrine', label: 'Endocrine', symptoms: ['Increased thirst', 'Increased hunger', 'Frequent urination', 'Heat/cold intolerance'] },
        { name: 'psychiatric', label: 'Psychiatric', symptoms: ['Depression', 'Anxiety', 'Sleep problems', 'Mood changes'] },
    ];

    return (
        <div>
            <p className="text-sm text-slate-600 mb-4">Indicate any current or recent symptoms:</p>
            {rosCategories.map(category => (
                <div key={category.label} className="mt-4">
                    <h4 className="font-semibold text-slate-800">{category.label}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mt-2">
                        {category.symptoms.map(symptom => (
                            <FormCheckbox
                                key={symptom}
                                label={symptom}
                                checked={formData.reviewOfSystems[category.name].includes(symptom)}
                                onChange={(e) => handleRosChange(category.name, symptom, e.target.checked)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReviewOfSystemsSection;