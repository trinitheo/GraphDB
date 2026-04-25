
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Appointment } from '../../../AppointmentsMFE/types';
import type { Patient } from '../../types';
import { usePatients } from '../../context/PatientContext';
import { Phone, Mail, MapPin, ChevronDown, ChevronUp, Pencil, Share2, CheckCircle, User, CalendarIcon, MessagingIcon } from '../../../../components/icons';
import UpcomingAppointments from './UpcomingAppointments';
import CareTeamCard from './CareTeamCard';
import EditPatientInfoModal from '../modals/EditPatientInfoModal';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../modals/Modal';
import MessagingMFE from '../../../MessagingMFE';

const ActionButton: React.FC<{
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    title: string;
    label: string;
    children: React.ReactNode;
}> = ({ onClick, title, label, children }) => (
    <div className="flex flex-col items-center gap-1">
        <button
            onClick={onClick}
            className="btn-icon-neu"
            title={title}
        >
            {children}
        </button>
        <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">{label}</span>
    </div>
);

const DataItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-slate-500 truncate">{label}</dt>
        <dd className="mt-1 text-sm text-slate-900 font-medium truncate">{value || 'N/A'}</dd>
    </div>
);

const InfoSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h4 className="text-sm font-semibold text-slate-600">{title}</h4>
        <div className="mt-2">{children}</div>
    </div>
);

const ContactItem: React.FC<{ icon: React.ReactNode; children: React.ReactNode; href?: string }> = ({ icon, children, href }) => (
    <div className="flex items-center gap-3">
        <span className="text-slate-500">{icon}</span>
        {href ? (
             <a href={href} className="text-sm text-slate-800 hover:text-sky-600 transition-colors">
                {children}
            </a>
        ) : (
            <span className="text-sm text-slate-800">{children}</span>
        )}
    </div>
);

interface PatientInformationProps {
    patient: Patient;
    upcomingAppointments: Appointment[];
}

const PatientInformation: React.FC<PatientInformationProps> = ({ patient, upcomingAppointments }) => {
    const { confirmPendingDiagnosis, updatePatient } = usePatients();
    const [isMoreInfoVisible, setIsMoreInfoVisible] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMessagingModalOpen, setIsMessagingModalOpen] = useState(false);
    const { user } = useAuth();
    
    const handleConfirmDiagnosis = (pendingDiagnosisId: string) => {
        confirmPendingDiagnosis(patient.id, pendingDiagnosisId);
    };

    const handleSavePatientInfo = (updatedPatient: Patient) => {
        updatePatient(updatedPatient);
        setIsEditModalOpen(false);
    };

    const handleOpenMessaging = () => {
        setIsMessagingModalOpen(true);
    };
    
    const handleShare = async () => {
        const shareData = {
            title: `Patient Summary: ${patient.name}`,
            text: `
Patient: ${patient.name}
ID: ${patient.id}
Age: ${patient.age}, Gender: ${patient.gender}
DOB: ${patient.dob}
Contact: ${patient.phone} | ${patient.email}
            `.trim(),
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                alert('Share feature is not supported in your browser.');
            }
        } catch (error) {
            console.error('Error sharing patient information:', error);
        }
    };

    return (
        <>
            <div className="card-panel p-6 sm:p-8">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3 text-slate-800">
                        <User size={24} className="text-slate-500" />
                        <h3 className="text-xl font-bold">Patient Information</h3>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6">
                        {user?.role !== 'Patient' && patient.userId && (
                            <ActionButton onClick={handleOpenMessaging} title="Send Secure Message" label="Message">
                                <MessagingIcon size={20} className="text-sky-600" />
                            </ActionButton>
                        )}
                        <ActionButton onClick={handleShare} title="Data Exchange (FHIR)" label="Share">
                            <Share2 size={20} />
                        </ActionButton>
                        <ActionButton onClick={() => setIsEditModalOpen(true)} title="Edit Patient Information" label="Edit">
                            <Pencil size={20} />
                        </ActionButton>
                        <div className="text-sm font-semibold text-sky-800 bg-sky-50 px-4 py-2 rounded-lg ml-2">
                            {patient.id}
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                    {/* --- Top Section --- */}
                    <div className="flex flex-col sm:flex-row gap-6">
                        <img 
                            src={patient.avatar} 
                            alt={`Photo of ${patient.name}`} 
                            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover shadow-md border-4 border-white flex-shrink-0 mx-auto sm:mx-0"
                        />
                        <div className="text-center sm:text-left flex-1">
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">{patient.name}</h2>
                            <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                                <DataItem label="Age" value={patient.age} />
                                <DataItem label="Gender" value={patient.gender} />
                                <DataItem label="Blood Type" value={patient.bloodType} />
                                <DataItem label="Sex" value={patient.sex} />
                                <DataItem label="Last Visit" value={patient.lastVisit} />
                            </dl>
                        </div>
                    </div>

                    {/* --- Main Content Grid --- */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-200 pt-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <InfoSection title="Allergies">
                                <div className="flex flex-wrap gap-2">
                                    {patient.allergies && patient.allergies.length > 0 ? patient.allergies.map(allergy => (
                                        <span key={allergy.id} className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                                            {allergy.substance}
                                        </span>
                                    )) : <p className="text-sm text-slate-500 italic">No known allergies.</p>}
                                </div>
                            </InfoSection>

                            <InfoSection title="Ongoing Conditions">
                                <div className="flex flex-wrap gap-2">
                                     {patient.activeProblems && patient.activeProblems.length > 0 ? patient.activeProblems.map(problem => (
                                        <span key={problem.id} className="px-3 py-1 text-xs font-medium rounded-full bg-sky-100 text-sky-700">
                                            {problem.condition}
                                        </span>
                                    )) : <p className="text-sm text-slate-500 italic">No ongoing conditions listed.</p>}
                                </div>
                            </InfoSection>

                             <InfoSection title="Pending Diagnoses">
                                {patient.pendingDiagnoses && patient.pendingDiagnoses.length > 0 ? (
                                    <div className="space-y-2">
                                        {patient.pendingDiagnoses.map(diag => (
                                            <div key={diag.id} className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                                                <p className="text-sm text-amber-800 font-medium">{diag.condition}</p>
                                                <button onClick={() => handleConfirmDiagnosis(diag.id)} className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                                                    <CheckCircle size={14} /> Confirm
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-sm text-slate-500 italic">No pending diagnoses.</p>}
                            </InfoSection>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <CareTeamCard patientId={patient.id} />
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <UpcomingAppointments appointments={upcomingAppointments} patientId={patient.id} />
                            </div>
                        </div>
                    </div>

                    {/* --- Additional Info Section --- */}
                    <div className="border-t border-slate-200 mt-8">
                        <button onClick={() => setIsMoreInfoVisible(!isMoreInfoVisible)} className="w-full flex justify-between items-center py-4 text-left font-semibold text-slate-600">
                            <span>Additional Information</span>
                            {isMoreInfoVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        {isMoreInfoVisible && (
                             <div className="pb-4 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 animate-fade-in">
                                <ContactItem icon={<Phone size={16} />} href={`tel:${patient.phone}`}>{patient.phone}</ContactItem>
                                <ContactItem icon={<Mail size={16} />} href={`mailto:${patient.email}`}>{patient.email}</ContactItem>
                                <div className="md:col-span-2">
                                    <ContactItem icon={<MapPin size={16} />}>{patient.address}</ContactItem>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Communication Overlays */}
            <Modal
                isOpen={isMessagingModalOpen}
                onClose={() => setIsMessagingModalOpen(false)}
                title={`Secure Chat: ${patient.name}`}
                size="4xl"
            >
                <div className="h-[600px] -m-8 overflow-hidden rounded-b-[32px]">
                    <MessagingMFE targetUserId={patient.userId} />
                </div>
            </Modal>

            <EditPatientInfoModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSavePatientInfo}
                patient={patient}
            />
        </>
    );
};

export default PatientInformation;
