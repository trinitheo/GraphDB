
import React, { useState } from 'react';
import Modal from '../../MedicalRecordsMFE/components/modals/Modal';
import FormInput from '../../PatientMFE/components/form/FormInput';
import FormSelect from '../../PatientMFE/components/form/FormSelect';
import FormTextArea from '../../PatientMFE/components/form/FormTextArea';
import { useInventory } from '../context/InventoryContext';
import { TrashIcon, PlusIcon } from '../../../components/icons';
import type { InventoryKit } from '../types';

interface CreateKitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (kit: Omit<InventoryKit, 'id'>) => void;
}

const CreateKitModal: React.FC<CreateKitModalProps> = ({ isOpen, onClose, onSave }) => {
    const { items: inventoryItems } = useInventory();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    
    // Item builder state
    const [selectedItemId, setSelectedItemId] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [kitItems, setKitItems] = useState<{ itemId: string; quantity: number }[]>([]);

    const handleAddItem = () => {
        if (!selectedItemId || parseInt(quantity) <= 0) return;
        
        setKitItems(prev => {
            // Check if item already exists, if so update quantity
            const existingIdx = prev.findIndex(i => i.itemId === selectedItemId);
            if (existingIdx >= 0) {
                const updated = [...prev];
                updated[existingIdx].quantity += parseInt(quantity);
                return updated;
            }
            return [...prev, { itemId: selectedItemId, quantity: parseInt(quantity) }];
        });
        
        // Reset builder fields
        setSelectedItemId('');
        setQuantity('1');
    };

    const handleRemoveItem = (itemId: string) => {
        setKitItems(prev => prev.filter(i => i.itemId !== itemId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || kitItems.length === 0) return;

        onSave({
            name,
            description,
            items: kitItems
        });
        resetForm();
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setKitItems([]);
        setSelectedItemId('');
        setQuantity('1');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const footer = (
        <div className="flex justify-end gap-3">
            <button type="button" onClick={handleClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
            </button>
            <button 
                type="submit" 
                form="create-kit-form" 
                disabled={!name || kitItems.length === 0}
                className="px-4 py-2 bg-slate-950 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Create Kit
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Create New Kit" footer={footer} size="lg">
            <form id="create-kit-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <p className="text-sm text-slate-500 mb-4">Bundle commonly used items together for quick deployment</p>
                    <FormInput 
                        label="Kit Name *" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        required 
                        placeholder="e.g., IV Start Kit"
                    />
                </div>
                
                <FormTextArea 
                    label="Description" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    rows={2}
                    placeholder="Brief description of the kit's purpose" 
                />

                <div className="border-t border-slate-200 pt-6">
                    <h4 className="text-sm font-bold text-slate-900 mb-3">Kit Items</h4>
                    
                    <div className="flex gap-3 items-end mb-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex-1">
                            <FormSelect 
                                label="Select Item" 
                                value={selectedItemId} 
                                onChange={e => setSelectedItemId(e.target.value)}
                                className="bg-white"
                            >
                                <option value="">Choose item...</option>
                                {inventoryItems.map(item => (
                                    <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>
                                ))}
                            </FormSelect>
                        </div>
                        <div className="w-24">
                            <FormInput 
                                label="Qty" 
                                type="number" 
                                min="1" 
                                value={quantity} 
                                onChange={e => setQuantity(e.target.value)}
                                className="bg-white"
                            />
                        </div>
                        <button 
                            type="button" 
                            onClick={handleAddItem}
                            disabled={!selectedItemId}
                            className="h-[42px] px-4 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {kitItems.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden border-slate-200">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-slate-700">Item</th>
                                        <th className="px-4 py-3 font-semibold text-slate-700 text-right">Quantity</th>
                                        <th className="px-4 py-3 font-semibold text-slate-700 text-right w-16">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {kitItems.map((kitItem, idx) => {
                                        const itemDetails = inventoryItems.find(i => i.id === kitItem.itemId);
                                        return (
                                            <tr key={`${kitItem.itemId}-${idx}`} className="group bg-white hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-slate-800">{itemDetails?.name || 'Unknown Item'}</td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-600">{kitItem.quantity}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleRemoveItem(kitItem.itemId)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                            No items added to this kit yet.
                        </div>
                    )}
                </div>
            </form>
        </Modal>
    );
};

export default CreateKitModal;
