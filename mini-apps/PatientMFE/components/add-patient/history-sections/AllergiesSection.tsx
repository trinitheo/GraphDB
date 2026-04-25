import React, { useState } from 'react';
import type { MedicalHistoryForm } from '../../../types';
import FormInput from '../../form/FormInput';

type AllergiesSectionProps = {
    formData: MedicalHistoryForm['history'];
    dispatch: React.Dispatch<any>;
};

const AllergiesSection: React.FC<AllergiesSectionProps> = ({ formData, dispatch }) => {
    const [newItem, setNewItem] = useState({ substance: '', reaction: '' });

    const handleAdd = () => {
        if (newItem.substance.trim()) {
            dispatch({ type: 'ADD_ITEM', payload: { step: 'history', field: 'allergies', item: newItem } });
            setNewItem({ substance: '', reaction: '' });
        }
    };

    const handleRemove = (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { step: 'history', field: 'allergies', itemId: id } });
    };

    return (
        <div className="space-y-4">
            {formData.allergies.map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-slate-100 rounded">
                    <span>{item.substance} (Reaction: {item.reaction || 'N/A'})</span>
                    <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700">&times;</button>
                </div>
            ))}
            <div className="flex gap-2 items-end">
                <FormInput label="Allergen" value={newItem.substance} onChange={e => setNewItem({ ...newItem, substance: e.target.value })} />
                <FormInput label="Reaction" value={newItem.reaction} onChange={e => setNewItem({ ...newItem, reaction: e.target.value })} />
                <button type="button" onClick={handleAdd} className="btn-neu h-10">+</button>
            </div>
        </div>
    );
};

export default AllergiesSection;