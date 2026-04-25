import React, { useState } from 'react';
// FIX: Import useIntake hook to manage state.
import { useIntake } from '../../../context/IntakeContext';
import FormTextArea from '../../form/FormTextArea';
import FormInput from '../../form/FormInput';
import CollapsibleSection from '../CollapsibleSection';

// FIX: Component no longer needs props, uses useIntake hook instead.
const PlanStep: React.FC = () => {
    const { state, dispatch } = useIntake();
    const { plan: formData } = state.formData;

    const [newReferral, setNewReferral] = useState({ specialty: '', reason: '' });
    const [newOrder, setNewOrder] = useState({ orderName: '', reason: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        dispatch({ type: 'UPDATE_FIELD', payload: { step: 'plan', field: e.target.name, value: e.target.value } });
    };

    const handleAddReferral = () => {
        if (newReferral.specialty && newReferral.reason) {
            dispatch({ type: 'ADD_ITEM', payload: { step: 'plan', field: 'pendingReferrals', item: newReferral }});
            setNewReferral({ specialty: '', reason: '' });
        }
    };

    const handleRemoveReferral = (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { step: 'plan', field: 'pendingReferrals', itemId: id }});
    };
    
    const handleAddOrder = () => {
        if (newOrder.orderName && newOrder.reason) {
            dispatch({ type: 'ADD_ITEM', payload: { step: 'plan', field: 'pendingOrders', item: newOrder }});
            setNewOrder({ orderName: '', reason: '' });
        }
    };
    
    const handleRemoveOrder = (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { step: 'plan', field: 'pendingOrders', itemId: id }});
    };

    return (
        <div className="space-y-6">
             <h2 className="text-xl font-bold text-slate-900">Plan</h2>
             <p className="text-sm text-slate-600">Outline the next steps for the patient's care.</p>

            <CollapsibleSection title="Treatment & Patient Education" defaultOpen={true}>
                <FormTextArea 
                    label="Treatment Plan"
                    name="treatments"
                    value={formData.treatments}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe any treatments, procedures, or patient education to be provided..."
                />
            </CollapsibleSection>
            
            <CollapsibleSection title="Referrals">
                <div className="space-y-2">
                    {formData.pendingReferrals.map(r => (
                        <div key={r.id} className="flex justify-between items-start p-2 bg-slate-100 rounded">
                            <div>
                                <p className="font-semibold">{r.specialty}</p>
                                <p className="text-sm text-slate-600">{r.reason}</p>
                            </div>
                            <button onClick={() => handleRemoveReferral(r.id)} className="text-red-500 hover:text-red-700 p-1">&times;</button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 items-end mt-2">
                    <FormInput label="Specialty" value={newReferral.specialty} onChange={e => setNewReferral({...newReferral, specialty: e.target.value})} placeholder="e.g., Cardiology" />
                    <FormInput label="Reason" value={newReferral.reason} onChange={e => setNewReferral({...newReferral, reason: e.target.value})} placeholder="e.g., Evaluate chest pain" />
                    <button type="button" onClick={handleAddReferral} className="btn-neu h-10">+</button>
                </div>
            </CollapsibleSection>

             <CollapsibleSection title="Test Orders">
                <div className="space-y-2">
                    {formData.pendingOrders.map(o => (
                        <div key={o.id} className="flex justify-between items-start p-2 bg-slate-100 rounded">
                             <div>
                                <p className="font-semibold">{o.orderName}</p>
                                <p className="text-sm text-slate-600">{o.reason}</p>
                            </div>
                            <button onClick={() => handleRemoveOrder(o.id)} className="text-red-500 hover:text-red-700 p-1">&times;</button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 items-end mt-2">
                    <FormInput label="Test/Panel Name" value={newOrder.orderName} onChange={e => setNewOrder({...newOrder, orderName: e.target.value})} placeholder="e.g., CBC with differential" />
                    <FormInput label="Reason" value={newOrder.reason} onChange={e => setNewOrder({...newOrder, reason: e.target.value})} placeholder="e.g., Screen for anemia" />
                    <button type="button" onClick={handleAddOrder} className="btn-neu h-10">+</button>
                </div>
            </CollapsibleSection>

             <CollapsibleSection title="Follow-up">
                 <FormTextArea 
                    label="Follow-up Instructions"
                    name="followUp"
                    value={formData.followUp}
                    onChange={handleChange}
                    rows={3}
                    placeholder="e.g., Return to clinic in 2 weeks for follow-up. Call if symptoms worsen."
                />
            </CollapsibleSection>

        </div>
    );
};

export default PlanStep;