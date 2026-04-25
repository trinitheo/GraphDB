import React, { useState } from 'react';
import type { MedicalHistoryForm } from '../../../types';
import FormInput from '../../form/FormInput';

type MedicationsSectionProps = {
    formData: MedicalHistoryForm['history'];
    dispatch: React.Dispatch<any>;
};

const MedicationsSection: React.FC<MedicationsSectionProps> = ({ formData, dispatch }) => {
    const [newItem, setNewItem] = useState({ name: '', dose: '', route: '', frequency: '' });

    const handleAdd = () => {
        if (newItem.name.trim()) {
            dispatch({ type: 'ADD_ITEM', payload: { step: 'history', field: 'medications', item: newItem } });
            setNewItem({ name: '', dose: '', route: '', frequency: '' });
        }
    };

    const handleRemove = (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { step: 'history', field: 'medications', itemId: id } });
    };

    return (
        <div className="space-y-4">
            {formData.medications.map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-slate-100 rounded">
                    <span>{item.name} {item.dose}, {item.route}, {item.frequency}</span>
                    <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700">&times;</button>
                </div>
            ))}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                <FormInput label="Name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                <FormInput label="Dose" value={newItem.dose} onChange={e => setNewItem({ ...newItem, dose: e.target.value })} />
                <FormInput label="Route" value={newItem.route} onChange={e => setNewItem({ ...newItem, route: e.target.value })} />
                <FormInput label="Frequency" value={newItem.frequency} onChange={e => setNewItem({ ...newItem, frequency: e.target.value })} />
            </div>
             <button type="button" onClick={handleAdd} className="btn-neu w-full mt-2">+</button>
        </div>
    );
};

export default MedicationsSection;