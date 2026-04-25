import React from 'react';
import { useIntake } from '../../../context/IntakeContext';
import FormInput from '../../form/FormInput';
import FormTextArea from '../../form/FormTextArea';
import type { Api } from '../../../types';

const ExaminationStep: React.FC = () => {
    const { state, dispatch, validationErrors } = useIntake();
    const { examination } = state.formData;

    const handleVitalsChange = (field: keyof Api.V1.Vitals, value: any) => {
        dispatch({ type: 'UPDATE_VITALS', payload: { field, value } });
    };

    const handleSystemsChange = (field: string, value: any) => {
        dispatch({ type: 'UPDATE_NESTED_FIELD', payload: { step: 'examination', nestedKey: 'systems', field, value } });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Physical Examination</h2>
            <p className="text-sm text-slate-600">Record objective findings from the physical exam.</p>
            
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Vitals</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* FIX: Use correct property names from Vitals type */}
                    <FormInput label="Blood Pressure" value={examination.vitals.bloodPressure} onChange={(e) => handleVitalsChange('bloodPressure', e.target.value)} placeholder="e.g., 120/80" />
                    <FormInput label="Heart Rate" type="number" value={examination.vitals.heartRate} onChange={(e) => handleVitalsChange('heartRate', e.target.value)} placeholder="bpm" />
                    <FormInput label="Respiratory Rate" type="number" value={examination.vitals.respRate} onChange={(e) => handleVitalsChange('respRate', e.target.value)} placeholder="breaths/min" />
                    <FormInput label="Temperature" type="number" value={examination.vitals.temperature} onChange={(e) => handleVitalsChange('temperature', e.target.value)} placeholder="°C" />
                    <FormInput label="O2 Saturation" type="number" value={examination.vitals.spO2} onChange={(e) => handleVitalsChange('spO2', e.target.value)} placeholder="%" />
                </div>
            </div>

            <div>
                 <h3 className="text-lg font-semibold text-slate-800 mb-2">Findings</h3>
                 <div className="space-y-4">
                    {/* FIX: Use 'systems' object for all findings */}
                    <FormTextArea label="General Appearance" value={examination.systems.general} onChange={(e) => handleSystemsChange('general', e.target.value)} rows={2} />
                    <FormTextArea label="Neurological Exam" value={examination.systems.neurological} onChange={(e) => handleSystemsChange('neurological', e.target.value)} rows={2} />
                    <FormTextArea label="Cardiovascular Exam" value={examination.systems.cardiovascular} onChange={(e) => handleSystemsChange('cardiovascular', e.target.value)} rows={2} />
                    <FormTextArea label="Respiratory Exam" value={examination.systems.respiratory} onChange={(e) => handleSystemsChange('respiratory', e.target.value)} rows={2} />
                    <FormTextArea label="Abdominal Exam" value={examination.systems.abdominal} onChange={(e) => handleSystemsChange('abdominal', e.target.value)} rows={2} />
                 </div>
            </div>
        </div>
    );
};

export default ExaminationStep;