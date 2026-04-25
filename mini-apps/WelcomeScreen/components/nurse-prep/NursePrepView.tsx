import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import type { Patient, Appointment, Api } from '../../../PatientMFE/types';
import { usePatients } from '../../../PatientMFE/context/PatientContext';
import { useAuth } from '../../../PatientMFE/hooks/useAuth';
import { appointmentService } from '../../../AppointmentsMFE/services/appointmentService';
import { medicalRecordService } from '../../../PatientMFE/services/medicalRecordService';
import { useMedicalRecords } from '../../../MedicalRecordsMFE/hooks/useMedicalRecords';

// Import Modals
import FollowUpNoteModal from '../../../MedicalRecordsMFE/components/modals/FollowUpNoteModal';

// Import sub-components
import NursePrepHeader from './NursePrepHeader';
import ActionItemsSection from './ActionItemsSection';
import MedicationReconciliation from './MedicationReconciliation';
import RecentClinicalSummary from './RecentClinicalSummary';
import PrepChecklist from './PrepChecklist';

const NursePrepView: React.FC = () => {
    const { appointmentId } = ReactRouterDOM.useParams<{ appointmentId: string }>();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { getPatientById, addPendingDiagnoses } = usePatients();
    const { user } = useAuth();
    const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

    useEffect(() => {
        if (appointmentId) {
            setIsLoading(true);
            appointmentService.getAppointmentById(appointmentId).then(appt => {
                setAppointment(appt || null);
                setIsLoading(false);
            });
        }
    }, [appointmentId]);

    const patient = appointment ? getPatientById(appointment.patientId) : null;
    const { records, isLoading: recordsLoading, refetch: refetchRecords } = useMedicalRecords(patient?.id);

    const handleSaveFollowUpNote = async (noteData: { subjective: string, objective: string, assessment: string, plan: string, pendingDiagnoses: Api.V1.SnomedConcept[] }) => {
        if (!patient) return;

        const content = `S: Subjective\n${noteData.subjective}\n\nO: Objective\n${noteData.objective}\n\nA: Assessment\n${noteData.assessment}\n\nP: Plan\n${noteData.plan}`;
        
        const response = await medicalRecordService.addMedicalRecordEntry({
            patientId: patient.id,
            content: content,
            type: 'Consultation',
        });

        if (response.data?.newEntry && noteData.pendingDiagnoses.length > 0) {
            await addPendingDiagnoses(patient.id, noteData.pendingDiagnoses, response.data.newEntry.id);
        }
        
        setIsFollowUpModalOpen(false);
        refetchRecords();
    };


    if (isLoading || !patient || !user) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div></div>;
    }

    if (!appointment) {
        return <div className="card-panel p-6 text-center">Appointment not found.</div>;
    }
    
    return (
        <>
            <div className="space-y-6 animate-fade-in">
                <NursePrepHeader patient={patient} appointment={appointment} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <ActionItemsSection patient={patient} onAddNoteClick={() => setIsFollowUpModalOpen(true)} />
                        <MedicationReconciliation patient={patient} onReconciled={refetchRecords} />
                        <RecentClinicalSummary records={records} isLoading={recordsLoading} />
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <div className="sticky top-6">
                            <PrepChecklist patient={patient} onPrepComplete={refetchRecords} />
                        </div>
                    </div>
                </div>
            </div>

            <FollowUpNoteModal
                isOpen={isFollowUpModalOpen}
                onClose={() => setIsFollowUpModalOpen(false)}
                onSave={handleSaveFollowUpNote}
                records={records}
                userRole={user.role}
            />
        </>
    );
};

export default NursePrepView;