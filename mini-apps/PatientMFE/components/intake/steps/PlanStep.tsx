import React from 'react';
import { useIntake } from '../../../context/IntakeContext';
import FormTextArea from '../../form/FormTextArea';
import FormInput from '../../form/FormInput';

const PlanStep: React.FC = () => {
    const { state, dispatch } = useIntake();
    const { plan } = state.formData;

    const handleArrayChange = (field: string, value: string) => {
        const items = value.split('\n').map(line => ({ id: `temp_${Math.random()}`, name: line, reason: '' }));
        dispatch({ type: 'UPDATE_FIELD', payload: { step: 'plan', field, value: items } });
    };
    
    const handleChange = (field: string, value: string) => {
         dispatch({ type: 'UPDATE_FIELD', payload: { step: 'plan', field, value } });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Plan</h2>
            <p className="text-sm text-slate-600">Outline the next steps for patient care. Enter one item per line for lists.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FIX: Align with MedicalHistoryForm type */}
                <FormTextArea
                    label="Investigations (Pending Orders)"
                    value={plan.pendingOrders.map(o => o.orderName).join('\n')}
                    onChange={(e) => handleArrayChange('pendingOrders', e.target.value)}
                    rows={5}
                    placeholder="e.g., CBC, Chest X-Ray"
                />
                 <FormTextArea
                    label="Treatment"
                    value={plan.treatments}
                    onChange={(e) => handleChange('treatments', e.target.value)}
                    rows={5}
                    placeholder="e.g., Start Amoxicillin 500mg, Advise rest"
                />
                 <FormTextArea
                    label="Referrals (Pending Referrals)"
                    value={plan.pendingReferrals.map(r => r.specialty).join('\n')}
                    onChange={(e) => handleArrayChange('pendingReferrals', e.target.value)}
                    rows={5}
                    placeholder="e.g., Refer to Cardiology for stress test"
                />
                
                <div className="space-y-4">
                     <FormTextArea
                        label="Follow-up Notes"
                        value={plan.followUp}
                        onChange={(e) => handleChange('followUp', e.target.value)}
                        rows={5}
                        placeholder="e.g., 2 weeks to review lab results"
                    />
                </div>
            </div>
        </div>
    );
};

export default PlanStep;