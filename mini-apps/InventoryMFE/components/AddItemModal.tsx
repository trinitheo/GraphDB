
import React, { useState } from 'react';
import Modal from '../../MedicalRecordsMFE/components/modals/Modal';
import FormInput from '../../PatientMFE/components/form/FormInput';
import FormSelect from '../../PatientMFE/components/form/FormSelect';
import FormCheckbox from '../../PatientMFE/components/form/FormCheckbox';
import CustomDatePicker from '../../PatientMFE/components/form/CustomDatePicker';
import type { InventoryItem, InventoryCategory, InventoryBatch } from '../types';

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Omit<InventoryItem, 'id'>) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState<InventoryCategory>('Supply');
    const [description, setDescription] = useState('');
    const [supplier, setSupplier] = useState('');
    const [unit, setUnit] = useState('');
    const [unitCost, setUnitCost] = useState('');
    const [minLevel, setMinLevel] = useState('');
    const [reorderLevel, setReorderLevel] = useState('');
    const [isControlled, setIsControlled] = useState(false);
    const [controlledSchedule, setControlledSchedule] = useState('');

    // Initial Batch State
    const [lotNumber, setLotNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [quantity, setQuantity] = useState('');
    const [location, setLocation] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Construct the item object
        const batches: InventoryBatch[] = [];
        
        // If initial stock details are provided, create the first batch
        if (quantity && lotNumber && expiryDate) {
            batches.push({
                id: `batch-${Date.now()}`,
                itemId: '', // Will be set by context
                lotNumber,
                expiryDate,
                quantity: parseInt(quantity, 10),
                location: location || 'Main Storage'
            });
        }

        const newItem: Omit<InventoryItem, 'id'> = {
            name,
            category,
            description,
            unit,
            minLevel: parseInt(minLevel, 10) || 0,
            reorderLevel: parseInt(reorderLevel, 10) || 0,
            unitCost: parseFloat(unitCost) || 0,
            supplier,
            isControlled,
            controlledSchedule: isControlled ? (controlledSchedule as any) : undefined,
            batches
        };

        onSave(newItem);
        resetForm();
    };

    const resetForm = () => {
        setName('');
        setCategory('Supply');
        setDescription('');
        setSupplier('');
        setUnit('');
        setUnitCost('');
        setMinLevel('');
        setReorderLevel('');
        setIsControlled(false);
        setControlledSchedule('');
        setLotNumber('');
        setExpiryDate('');
        setQuantity('');
        setLocation('');
    };

    const footer = (
        <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-neu">Cancel</button>
            <button type="submit" form="add-item-form" className="btn-neu bg-slate-900 text-white hover:bg-slate-800">Save Item</button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Inventory Item" footer={footer} size="2xl">
            <form id="add-item-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Basic Info Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">Item Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="Item Name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., Amoxicillin 500mg" />
                        <FormSelect label="Category" value={category} onChange={e => setCategory(e.target.value as InventoryCategory)}>
                            <option value="Medication">Medication</option>
                            <option value="Supply">Supply</option>
                            <option value="Equipment">Equipment</option>
                            <option value="Implant">Implant</option>
                            <option value="Syringe">Syringe</option>
                            <option value="IV Supply">IV Supply</option>
                        </FormSelect>
                    </div>
                    <FormInput label="Description / Specification" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., 500mg Capsules, 100 count bottle" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="Supplier" value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="e.g., McKesson" />
                        <FormInput label="Unit of Measure" value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g., Box, Vial, Each" required />
                    </div>
                </div>

                {/* Stock & Cost Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">Stock & Cost</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput label="Unit Cost ($)" type="number" step="0.01" value={unitCost} onChange={e => setUnitCost(e.target.value)} />
                        <FormInput label="Min Level" type="number" value={minLevel} onChange={e => setMinLevel(e.target.value)} placeholder="Alert level" />
                        <FormInput label="Reorder Level" type="number" value={reorderLevel} onChange={e => setReorderLevel(e.target.value)} placeholder="Target stock" />
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <FormCheckbox 
                            label="Controlled Substance" 
                            checked={isControlled} 
                            onChange={e => setIsControlled(e.target.checked)} 
                        />
                        {isControlled && (
                            <div className="mt-4 animate-fade-in">
                                <FormSelect label="Schedule" value={controlledSchedule} onChange={e => setControlledSchedule(e.target.value)} required>
                                    <option value="">Select Schedule...</option>
                                    <option value="II">Schedule II</option>
                                    <option value="III">Schedule III</option>
                                    <option value="IV">Schedule IV</option>
                                    <option value="V">Schedule V</option>
                                </FormSelect>
                            </div>
                        )}
                    </div>
                </div>

                {/* Initial Stock Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">Initial Stock (Optional)</h3>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="Lot Number" value={lotNumber} onChange={e => setLotNumber(e.target.value)} />
                            <CustomDatePicker label="Expiry Date" value={expiryDate} onChange={setExpiryDate} />
                            <FormInput label="Quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
                            <FormInput label="Location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Cabinet A2" />
                        </div>
                    </div>
                </div>

            </form>
        </Modal>
    );
};

export default AddItemModal;
