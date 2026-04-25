import React from 'react';
import type { Vitals } from '../../../types';
// FIX: Import useIntake hook to manage state.
import { useIntake } from '../../../context/IntakeContext';
import FormTextArea from '../../form/FormTextArea';
import VitalsCard from '../../dashboard/VitalsCard';
import CollapsibleSection from '../CollapsibleSection';
import { useAuth } from '../../../hooks/useAuth';

// FIX: Component no longer needs props, uses useIntake hook instead.
const ExaminationStep: React.FC = () => {
    const { state, dispatch } = useIntake();
    const formData = state.formData.examination;
    const { user } = useAuth();
    
    const handleVitalsSave = (updatedVitals: Partial<Vitals>) => {
        Object.entries(updatedVitals).forEach(([field, value]) => {
            dispatch({ type: 'UPDATE_VITALS', payload: { field: field as keyof Vitals, value: value as string } });
        });
    };

    const handleSystemChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        dispatch({ type: 'UPDATE_NESTED_FIELD', payload: { step: 'examination', nestedKey: 'systems', field: name, value } });
    };
    
    const systemSections: { key: keyof typeof formData.systems, label: string, placeholder: string, role?: string }[] = [
        { key: 'general', label: 'General Appearance', placeholder: 'e.g., Well-developed, well-nourished, in no acute distress.' },
        { key: 'heent', label: 'HEENT', placeholder: 'e.g., Head is normocephalic and atraumatic. Pupils are equal, round, and reactive...' },
        { key: 'skin', label: 'Skin', placeholder: 'e.g., Warm, dry, and intact. No rashes or lesions.' },
        { key: 'cardiovascular', label: 'Cardiovascular', placeholder: 'e.g., Regular rate and rhythm, no murmurs, rubs, or gallops.' },
        { key: 'respiratory', label: 'Chest / Respiratory', placeholder: 'e.g., Clear to auscultation bilaterally, no wheezes, rales, or rhonchi.' },
        { key: 'abdominal', label: 'Abdominal', placeholder: 'e.g., Soft, non-tender, non-distended. Bowel sounds are normoactive.' },
        { key: 'musculoskeletal', label: 'Musculoskeletal', placeholder: 'e.g., Full range of motion in all extremities. No edema or tenderness.' },
        { key: 'neurological', label: 'Neurological', placeholder: 'e.g., Alert and oriented x3. Cranial nerves II-XII intact.' },
        { key: 'psychiatric', label: 'Psychiatric', placeholder: 'e.g., Mood and affect are appropriate. No suicidal or homicidal ideation.', role: 'Doctor' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Physical Examination</h2>
            <p className="text-sm text-slate-600">Record the patient's vital signs and physical findings.</p>
            
            <CollapsibleSection title="Vitals" defaultOpen={true} zIndex="z-20">
                <VitalsCard vitals={formData.vitals} isEditable={true} onSave={handleVitalsSave} />
            </CollapsibleSection>

            <CollapsibleSection title="Physical Examination Findings" defaultOpen={true} zIndex="z-10">
                <div className="space-y-4">
                    {systemSections.map(section => {
                        // Ensure the key exists in the form data before rendering
                        if (!(section.key in formData.systems)) {
                            return null;
                        }
                        // Role-based check
                        if (section.role && user?.role !== section.role) {
                            return null;
                        }
                        return (
                            <FormTextArea 
                                key={section.key}
                                label={section.label}
                                name={section.key}
                                value={formData.systems[section.key]}
                                onChange={handleSystemChange}
                                rows={2}
                                placeholder={section.placeholder}
                            />
                        );
                    })}
                </div>
            </CollapsibleSection>
        </div>
    );
};

export default ExaminationStep;