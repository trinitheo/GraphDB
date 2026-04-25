import React, { useState } from 'react';
import type { MedicalHistoryForm } from '../../../types';
import FormInput from '../../form/FormInput';
import FormSelect from '../../form/FormSelect';

type FamilyHistorySectionProps = {
    formData: MedicalHistoryForm['history'];
    dispatch: React.Dispatch<any>;
};

const FamilyHistorySection: React.FC<FamilyHistorySectionProps> = ({ formData, dispatch }) => {
    const [newItem, setNewItem] = useState({ relation: '', condition: '' });

    const handleAdd = () => {
        if (newItem.condition.trim() && newItem.relation) {
            dispatch({ type: 'ADD_ITEM', payload: { step: 'history', field: 'familyHistory', item: newItem } });
            setNewItem({ relation: '', condition: '' });
        }
    };

    const handleRemove = (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { step: 'history', field: 'familyHistory', itemId: id } });
    };

    return (
        <div className="space-y-4">
            {formData.familyHistory.map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-slate-100 rounded">
                    <span>{item.relation}: {item.condition}</span>
                    <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700">&times;</button>
                </div>
            ))}
            <div className="flex gap-2 items-end">
                <FormSelect label="Relation" value={newItem.relation} onChange={e => setNewItem({ ...newItem, relation: e.target.value })}>
                    <option value="">Select...</option>
                    <option>Mother</option>
                    <option>Father</option>
                    <option>Sister</option>
                    <option>Brother</option>
                    <option>Grandparent</option>
                    <option>Other</option>
                </FormSelect>
                <FormInput label="Condition" value={newItem.condition} onChange={e => setNewItem({ ...newItem, condition: e.target.value })} />
                <button type="button" onClick={handleAdd} className="btn-neu h-10">+</button>
            </div>
        </div>
    );
};

export default FamilyHistorySection;