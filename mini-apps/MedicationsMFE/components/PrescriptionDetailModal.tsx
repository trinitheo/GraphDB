

import React, { useEffect, useState } from 'react';
import type { Api } from '../../../api_contract/patient';
import Modal from '../../MedicalRecordsMFE/components/modals/Modal';
import { authService, CurrentUser } from '../../PatientMFE/services/authService';
import { PrintIcon, ShareIcon } from '../../../components/icons';

interface PrescriptionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    prescription: Api.V1.Prescription;
    patient: Api.V1.Patient;
}

const PrescriptionDetailModal: React.FC<PrescriptionDetailModalProps> = ({ isOpen, onClose, prescription, patient }) => {
    const [clinician, setClinician] = useState<CurrentUser | null>(null);
    const showShare = 'share' in navigator;

    useEffect(() => {
        // FIX: authService.getCurrentUser() is synchronous and does not return a promise.
        const user = authService.getCurrentUser();
        setClinician(user);
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        const prescriptionText = [
            `Prescription for: ${patient.name}`,
            `Date: ${new Date(prescription.datePrescribed).toLocaleDateString()}`,
            `Medication: ${prescription.medicationName}`,
            `Dose: ${prescription.dose}`,
            `Directions: ${prescription.notes || 'As directed'}`,
            prescription.duration ? `Duration: ${prescription.duration}` : null,
            `Refills: ${prescription.refills}`,
            ``,
            `Prescribed by: ${clinician?.name}`,
            `CarePlus-Ai Clinic`,
            `123 Health St, Wellness City`,
            `(555) 123-4567`
        ].filter(Boolean).join('\n');

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Prescription for ${patient.name}`,
                    text: prescriptionText,
                });
            } catch (error) {
                console.error('Error sharing prescription:', error);
            }
        }
    };

    const footer = (
        <div className="flex justify-end gap-4">
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors">
                <PrintIcon className="h-5 w-5" /> Print
            </button>
            {showShare && (
                 <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-800 font-semibold rounded-lg hover:bg-sky-200 transition-colors">
                    <ShareIcon className="h-5 w-5" /> Share
                </button>
            )}
        </div>
    );
    
    if (!clinician) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Prescription Details" footer={footer}>
            <div className="printable-section p-4 font-serif text-black bg-white">
                <header className="flex justify-between items-start pb-4 border-b-2 border-black">
                    <div>
                        <h1 className="text-2xl font-bold">{clinician.name}</h1>
                        <p className="text-sm">{clinician.role}</p>
                        <p className="text-sm">CarePlus-Ai Clinic</p>
                    </div>
                    <div className="text-right text-sm">
                        <p>123 Health St, Wellness City</p>
                        <p>(555) 123-4567</p>
                    </div>
                </header>

                <section className="flex justify-between py-3 border-b border-black text-sm">
                    <div>
                        <p className="font-bold">Patient</p>
                        <p>{patient.name}</p>
                        <p>{patient.address}</p>
                    </div>
                    <div className="text-right">
                        <p><strong>DOB:</strong> {patient.dob}</p>
                        <p><strong>Date:</strong> {new Date(prescription.datePrescribed).toLocaleDateString()}</p>
                    </div>
                </section>

                <section className="py-8 min-h-[10rem]">
                    <div className="flex">
                        <p className="text-4xl font-bold mr-4">℞</p>
                        <div>
                            <p className="font-bold text-lg">{prescription.medicationName}</p>
                            <p className="mt-4">{prescription.notes}</p>
                        </div>
                    </div>
                </section>
                
                <section className="flex justify-between text-sm">
                    <div>
                        {prescription.duration && <p className="mt-1"><strong>Duration:</strong> {prescription.duration}</p>}
                    </div>
                     <div>
                        <p><strong>Refills:</strong> {prescription.refills}</p>
                    </div>
                </section>
                
                <footer className="mt-16 pt-4 border-t border-black flex justify-between items-center">
                    <p className="text-sm">Electronically signed by {clinician.name} on {new Date(prescription.datePrescribed).toLocaleString()}</p>
                    <p className="text-xs">Substitution Permitted</p>
                </footer>
            </div>
        </Modal>
    );
};

export default PrescriptionDetailModal;