
import React, { useState } from 'react';
import Modal from '../../MedicalRecordsMFE/components/modals/Modal';
import FormInput from '../../PatientMFE/components/form/FormInput';
import FormTextArea from '../../PatientMFE/components/form/FormTextArea';
import { useInventory } from '../context/InventoryContext';
import type { InventoryItem } from '../types';

interface AdjustStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: InventoryItem;
}

const AdjustStockModal: React.FC<AdjustStockModalProps> = ({ isOpen, onClose, item }) => {
    const { adjustStock } = useInventory();
    const [adjustmentType, setAdjustmentType] = useState<'remove' | 'add'>('remove');
    const [quantity, setQuantity] = useState('1');
    const [patientName, setPatientName] = useState('');
    const [notes, setNotes] = useState('');

    const currentTotal = item.batches.reduce((acc, b) => acc + b.quantity, 0);
    
    const qtyNum = parseInt(quantity, 10) || 0;
    const newTotal = adjustmentType === 'add' ? currentTotal + qtyNum : currentTotal - qtyNum;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const change = adjustmentType === 'add' ? qtyNum : -qtyNum;
        const actionType = adjustmentType === 'add' ? 'Added' : 'Used';
        
        adjustStock(item.id, change, notes, patientName, actionType);
        onClose();
        resetForm();
    };

    const resetForm = () => {
        setAdjustmentType('remove');
        setQuantity('1');
        setPatientName('');
        setNotes('');
    };

    const footer = (
        <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
            </button>
            <button 
                type="submit" 
                form="adjust-stock-form" 
                disabled={adjustmentType === 'remove' && qtyNum > currentTotal}
                className="px-4 py-2 bg-slate-950 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {adjustmentType === 'remove' ? 'Remove Stock' : 'Add Stock'}
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Adjust Stock" footer={footer} size="md">
            <form id="adjust-stock-form" onSubmit={handleSubmit} className="space-y-6">
                <p className="text-slate-500 text-sm -mt-2">
                    Current quantity: <span className="font-bold text-slate-800">{currentTotal}</span> • {item.name}
                </p>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Adjustment Type</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="type" 
                                checked={adjustmentType === 'remove'} 
                                onChange={() => setAdjustmentType('remove')}
                                className="text-slate-900 focus:ring-slate-900"
                            />
                            <span className="text-sm text-slate-700">Remove from stock (usage)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="type" 
                                checked={adjustmentType === 'add'} 
                                onChange={() => setAdjustmentType('add')}
                                className="text-slate-900 focus:ring-slate-900"
                            />
                            <span className="text-sm text-slate-700">Add to stock (received)</span>
                        </label>
                    </div>
                </div>

                <div>
                    <FormInput
                        label="Quantity *"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                    />
                    <p className="text-xs text-slate-500 mt-1">Available: {currentTotal}</p>
                </div>

                {adjustmentType === 'remove' && (
                    <FormInput
                        label="Patient Name (Optional)"
                        value={patientName}
                        onChange={e => setPatientName(e.target.value)}
                        placeholder="Leave blank for general use"
                    />
                )}

                <FormTextArea
                    label="Notes"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Usage details or reason"
                />

                <div className="bg-slate-100 p-3 rounded-lg text-sm text-slate-700 font-medium">
                    New quantity after adjustment: {newTotal < 0 ? 0 : newTotal}
                </div>
            </form>
        </Modal>
    );
};

export default AdjustStockModal;
