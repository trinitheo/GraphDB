import React, { useState } from 'react';
import type { MedicalHistoryForm } from '../../../types';
import FormInput from '../../form/FormInput';
import CustomDatePicker from '../../form/CustomDatePicker';

type SurgicalHistorySectionProps = {
    formData: MedicalHistoryForm['history'];
    dispatch: React.Dispatch<any>;
};

const SurgicalHistorySection: React.FC<SurgicalHistorySectionProps> = ({ formData, dispatch }) => {
    const [newItem, setNewItem] = useState({ procedure: '', date: '' });

    const handleAdd = () => {
        if (newItem.procedure.trim()) {
            dispatch({ type: 'ADD_ITEM', payload: { step: 'history', field: 'surgicalHistory', item: newItem } });
            setNewItem({ procedure: '', date: '' });
        }
    };

    const handleRemove = (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { step: 'history', field: 'surgicalHistory', itemId: id } });
    };

    return (
        <div className="space-y-4">
            {formData.surgicalHistory.map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-slate-100 rounded">
                    <span>{item.procedure} ({item.date || 'N/A'})</span>
                    <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700">&times;</button>
                </div>
            ))}
            <div className="flex gap-2 items-end">
                <FormInput label="Procedure" value={newItem.procedure} onChange={e => setNewItem({ ...newItem, procedure: e.target.value })} />
                <CustomDatePicker label="Date" value={newItem.date} onChange={value => setNewItem({ ...newItem, date: value })} />
                <button type="button" onClick={handleAdd} className="btn-neu h-10">+</button>
            </div>
        </div>
    );
};

export default SurgicalHistorySection;