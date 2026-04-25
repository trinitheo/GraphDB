
import React, { useState } from 'react';
import Modal from '../../MedicalRecordsMFE/components/modals/Modal';
import FormInput from '../../PatientMFE/components/form/FormInput';
import { useInventory } from '../context/InventoryContext';
import type { InventoryKit } from '../types';

interface UseKitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (patientName: string) => void;
    kit: InventoryKit;
}

const UseKitModal: React.FC<UseKitModalProps> = ({ isOpen, onClose, onConfirm, kit }) => {
    const [patientName, setPatientName] = useState('');
    const { items: inventoryItems } = useInventory();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(patientName);
        setPatientName('');
    };

    const footer = (
        <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
            </button>
            <button 
                type="submit" 
                form="use-kit-form" 
                className="px-4 py-2 bg-slate-950 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
                Confirm Use Kit
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Use Kit: ${kit.name}`} footer={footer} size="md">
            <form id="use-kit-form" onSubmit={handleSubmit} className="space-y-6">
                <p className="text-slate-500 -mt-2">This will deduct items from inventory</p>
                
                <FormInput
                    label="Patient Name (Optional)"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient name for tracking"
                />

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Items to be deducted:</h4>
                    <ul className="space-y-2">
                        {kit.items.map((kitItem, idx) => {
                            const itemDetails = inventoryItems.find(i => i.id === kitItem.itemId);
                            return (
                                <li key={idx} className="flex justify-between text-sm text-slate-700">
                                    <span>{itemDetails?.name || 'Unknown Item'}</span>
                                    <span className="font-mono text-slate-500">{kitItem.quantity}x</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-md">
                    This action will be logged and inventory will be updated immediately
                </div>
            </form>
        </Modal>
    );
};

export default UseKitModal;
