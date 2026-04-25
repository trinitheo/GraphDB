import React, { useState, useEffect } from 'react';
import type { Patient } from '../../types';
import Modal from './Modal';
import FormInput from '../form/FormInput';
import FormSelect from '../form/FormSelect';
import { calculateAge } from '../../utils';
import CustomDatePicker from '../form/CustomDatePicker';

interface EditPatientInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedPatient: Patient) => void;
    patient: Patient;
}

const EditPatientInfoModal: React.FC<EditPatientInfoModalProps> = ({ isOpen, onClose, onSave, patient }) => {
    const [formData, setFormData] = useState<Patient>(patient);

    useEffect(() => {
        if (isOpen) {
            setFormData(patient);
        }
    }, [isOpen, patient]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDobChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            dob: value,
            age: calculateAge(value),
        }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    const footer = (
        <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="btn-neu">
                Cancel
            </button>
            <button
                type="button"
                onClick={handleSave}
                className="btn-neu text-sky-600"
            >
                Save Changes
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Patient Information" footer={footer}>
            <div className="space-y-4">
                <FormInput label="Full Name" name="name" value={formData.name || ''} onChange={handleChange} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomDatePicker label="Date of Birth" name="dob" value={formData.dob || ''} onChange={handleDobChange} />
                    <FormInput label="Age" name="age" value={formData.age} readOnly className="neu-sunken-sm" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect label="Gender" name="gender" value={formData.gender || ''} onChange={handleChange}>
                        <option value="">Select...</option>
                        <option value="Man">Man</option>
                        <option value="Woman">Woman</option>
                        <option value="Girl">Girl</option>
                        <option value="Boy">Boy</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Other">Other</option>
                    </FormSelect>
                    <FormSelect label="Sex" name="sex" value={formData.sex || ''} onChange={handleChange}>
                        <option value="">Select...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </FormSelect>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect label="Blood Type" name="bloodType" value={formData.bloodType || 'Unknown'} onChange={handleChange}>
                        <option value="Unknown">Unknown</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                    </FormSelect>
                </div>
                <FormInput label="Phone Number" name="phone" value={formData.phone || ''} onChange={handleChange} />
                <FormInput label="Email Address" name="email" type="email" value={formData.email || ''} onChange={handleChange} />
                <FormInput label="Address" name="address" value={formData.address || ''} onChange={handleChange} />
            </div>
        </Modal>
    );
};

export default EditPatientInfoModal;