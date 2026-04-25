import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import type { Patient, MedicalRecordEntry, Vitals } from './types';
import type { Api } from '../../api_contract/patient';
import { AISummaryGenerator } from '../AIFeaturesMFE';
import PatientNoteColumn from './components/medical/PatientNoteColumn';
import { 
    MedicationIcon, 
    Stethoscope, 
    Send, 
    FileText, 
    Sparkles, 
    TestsIcon, 
    ChevronDown, 
    MoreHorizontalIcon, 
    AlertTriangle,
    XIcon,
    WrenchIcon
} from '../../components/icons';
import PatientVitalsCard from './components/detail/PatientVitalsCard';
import CurrentMedicationsCard from './components/detail/CurrentMedicationsCard';
import FollowUpNoteModal from './components/modals/FollowUpNoteModal';
import ReferralModal from './components/modals/ReferralModal';
import ProcedureModal from './components/modals/ProcedureModal';
import UpdateVitalsModal from './components/modals/UpdateVitalsModal';
import Modal from './components/modals/Modal';
import { medicalRecordService } from '../PatientMFE/services/medicalRecordService';
import { usePatients } from '../PatientMFE/context/PatientContext';
import { useAuth } from '../PatientMFE/hooks/useAuth';

// Imports for Appointment workflow
import AppointmentDetailModal from '../AppointmentsMFE/components/AppointmentDetailModal';
import { appointmentService } from '../AppointmentsMFE/services/appointmentService';
import type { Appointment } from '../AppointmentsMFE/types';

// --- Reusable UI Components ---

const ErrorDisplay: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="p-6 text-center">
    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-red-600 mb-2">An Error Occurred</h3>
    <p className="text-slate-600 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="btn-neu text-sky-600"
      >
        Try Again
      </button>
    )}
  </div>
);

// Copied from ClinicianDashboard for consistency
const QuickActionVertical: React.FC<{ icon: any, label: string, onClick: () => void, colorClass: string }> = ({ icon: Icon, label, onClick, colorClass }) => (
    <button 
        onClick={onClick}
        className={`w-24 lg:w-full aspect-square glass-btn rounded-2xl flex flex-col items-center justify-center gap-2 lg:gap-3 group relative overflow-hidden flex-shrink-0`}
    >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${colorClass}`}></div>
        <Icon className={`w-8 h-8 text-slate-600 group-hover:scale-110 transition-transform duration-300`} />
        <span className="text-xs font-bold text-slate-700 text-center px-1 leading-tight">{label}</span>
    </button>
);

type LogFilterType = 'All' | 'Notes' | 'Prescriptions' | 'Labs' | 'Procedures' | 'Referrals';
const FILTERS: LogFilterType[] = ['All', 'Notes', 'Prescriptions', 'Labs', 'Procedures', 'Referrals'];

interface ClinicalLogFiltersProps {
    activeFilter: LogFilterType;
    onFilterChange: (filter: LogFilterType) => void;
}

const ClinicalLogFilters: React.FC<ClinicalLogFiltersProps> = ({ activeFilter, onFilterChange }) => {
    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            {FILTERS.map(filter => (
                <button
                    key={filter}
                    onClick={() => onFilterChange(filter)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 border ${
                        activeFilter === filter
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    {filter}
                </button>
            ))}
        </div>
    );
};

interface MedicalRecordsViewProps {
    patient: Patient;
    records: MedicalRecordEntry[];
    isLoading: boolean;
    error?: string | null;
    onAddPrescriptionClick?: () => void;
    onRecordUpdate: () => void;
    onNavigateToMedications?: () => void;
    onPlaceNewOrderClick?: () => void;
}

export const MedicalRecordsView: React.FC<MedicalRecordsViewProps> = ({ patient, records, isLoading, error, onAddPrescriptionClick, onRecordUpdate, onNavigateToMedications, onPlaceNewOrderClick }) => {
    const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
    const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
    const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);
    const [isUpdateVitalsModalOpen, setIsUpdateVitalsModalOpen] = useState(false);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
    
    // State for finishing the visit
    const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
    
    const [activeFilter, setActiveFilter] = useState<LogFilterType>('All');
    const { addReferral, addVitalsRecord, addProcedure, addPendingDiagnoses } = usePatients();
    const { user } = useAuth();
    const navigate = useNavigate();
    const notesColumnRef = useRef<HTMLDivElement>(null);

    // Permissions
    const canWriteNote = user && ['Clinician', 'Nurse', 'AlliedHealthProfessional'].includes(user.role);
    const canPrescribe = user && user.role === 'Clinician';
    const canOrder = user && ['Clinician', 'Nurse', 'AlliedHealthProfessional'].includes(user.role);
    const canLogProcedure = user && ['Clinician', 'Nurse', 'AlliedHealthProfessional'].includes(user.role);
    const canCreateReferral = user && ['Clinician', 'Nurse', 'AlliedHealthProfessional'].includes(user.role);

    const filteredRecords = useMemo(() => {
        if (activeFilter === 'All') return records;
        return records.filter(record => {
            switch (activeFilter) {
                case 'Notes':
                    return record.type === 'Consultation' || record.type === 'AISummary';
                case 'Prescriptions':
                    return record.type === 'Prescription';
                case 'Labs':
                    return record.type === 'LabResult';
                case 'Procedures':
                    return record.type === 'Procedure';
                case 'Referrals':
                    return record.type === 'Referral';
                default:
                    return true;
            }
        });
    }, [records, activeFilter]);

    const handleSaveFollowUpNote = async (noteData: { subjective: string, objective: string, assessment: string, plan: string, pendingDiagnoses: Api.V1.SnomedConcept[] }) => {
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
        onRecordUpdate();

        // Check if there is an in-progress appointment for this patient to allow completion
        try {
            const allAppointments = await appointmentService.fetchAppointments();
            const inProgressAppt = allAppointments.find(a => 
                a.patientId === patient.id && 
                a.status === 'in_progress'
            );
            
            if (inProgressAppt) {
                setActiveAppointment(inProgressAppt);
            }
        } catch (e) {
            console.error("Failed to check for active appointment", e);
        }
    };

    const handleSaveReferral = async (referralData: Omit<Api.V1.Referral, 'id' | 'patientId' | 'date' | 'status'>) => {
        await addReferral(patient.id, referralData);
        setIsReferralModalOpen(false);
        onRecordUpdate();
    };

    const handleSaveProcedure = async (procedureData: Omit<Api.V1.Procedure, 'id'>) => {
        await addProcedure(patient.id, procedureData);
        setIsProcedureModalOpen(false);
        onRecordUpdate();
    };

    const handleSaveVitals = async (vitals: Vitals) => {
        await addVitalsRecord(patient.id, vitals);
        setIsUpdateVitalsModalOpen(false);
    };

    const handleAppointmentStatusUpdate = () => {
        // If the appointment was completed (or cancelled), close the modal
        // And typically navigate back to the dashboard as the visit is over.
        setActiveAppointment(null);
        navigate('/'); 
    };

    const ToolsList = () => (
        <>
            {canWriteNote && (
                <QuickActionVertical 
                    icon={FileText} 
                    label="Note" 
                    onClick={() => setIsFollowUpModalOpen(true)} 
                    colorClass="bg-blue-500" 
                />
            )}
            {canPrescribe && (
                <QuickActionVertical 
                    icon={MedicationIcon} 
                    label="Rx" 
                    onClick={onAddPrescriptionClick!} 
                    colorClass="bg-green-500" 
                />
            )}
            {canOrder && (
                <QuickActionVertical 
                    icon={TestsIcon} 
                    label="Labs" 
                    onClick={onPlaceNewOrderClick!} 
                    colorClass="bg-cyan-500" 
                />
            )}
            {canCreateReferral && (
                <QuickActionVertical 
                    icon={Send} 
                    label="Referral" 
                    onClick={() => setIsReferralModalOpen(true)} 
                    colorClass="bg-purple-500" 
                />
            )}
            {canLogProcedure && (
                <QuickActionVertical 
                    icon={Stethoscope} 
                    label="Procedure" 
                    onClick={() => setIsProcedureModalOpen(true)} 
                    colorClass="bg-orange-500" 
                />
            )}
            <QuickActionVertical 
                icon={Sparkles} 
                label="AI Summary" 
                onClick={() => setIsSummaryModalOpen(true)} 
                colorClass="bg-indigo-500" 
            />
        </>
    );
    
    return (
        <div className="flex flex-col lg:flex-row gap-6 lg:h-full lg:overflow-hidden">
            
            {/* ZONE A: CLINICAL LOG (~50%) */}
            <section className="lg:flex-[6] flex flex-col gap-4 min-w-0 lg:h-full h-auto">
                <div className="glass-panel-heavy flex-1 flex flex-col min-h-[500px] lg:min-h-0 overflow-hidden relative">
                    <div className="p-5 border-b border-white/40 bg-white/30 backdrop-blur-md sticky top-0 z-20">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-slate-600" />
                                Clinical Log
                            </h2>
                        </div>
                        <ClinicalLogFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
                            </div>
                        ) : error ? (
                            <ErrorDisplay message={error} onRetry={onRecordUpdate} />
                        ) : (
                             <PatientNoteColumn ref={notesColumnRef} patient={patient} records={filteredRecords} />
                        )}
                    </div>
                </div>
            </section>

            {/* ZONE B: PATIENT CONTEXT (~40%) */}
            <section className="lg:flex-[5] flex flex-col gap-6 lg:h-full h-auto min-w-[300px]">
                <div className="glass-panel-heavy flex-1 flex flex-col overflow-hidden min-h-[400px]">
                    <div className="p-5 border-b border-white/40 bg-white/30 backdrop-blur-md sticky top-0 z-20">
                        <h2 className="text-lg font-bold text-slate-800">Patient Context</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                        <PatientVitalsCard
                            vitals={patient.latestVitals}
                            onUpdateClick={() => setIsUpdateVitalsModalOpen(true)}
                        />
                        <CurrentMedicationsCard
                            medications={patient.medications}
                            onNavigateToMedications={onNavigateToMedications}
                        />
                    </div>
                </div>
            </section>

            {/* ZONE C: TOOLS (Fixed Sidebar) */}
            <section className="hidden lg:flex w-[110px] flex-col gap-4 h-full flex-shrink-0">
                <div className="glass-panel-heavy h-full flex flex-col items-center py-4 px-2 gap-3 overflow-y-auto custom-scrollbar">
                    <div className="mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest rotate-180 py-2" style={{writingMode: 'vertical-rl'}}>Actions</div>
                    <ToolsList />
                </div>
            </section>

            {/* --- PORTALS FOR MODALS & MOBILE TOOLS --- */}
            {createPortal(
                <>
                    {/* MOBILE FLOATING ACTION BUTTON */}
                    <button 
                        onClick={() => setIsToolsMenuOpen(true)}
                        aria-label="Actions"
                        className="
                        lg:hidden
                        fixed bottom-10 right-[20px] z-50
                        w-[60px] h-[60px]
                        rounded-full
                        bg-slate-900/90 backdrop-blur-md
                        text-white flex items-center justify-center
                        shadow-lg transition-transform
                        hover:scale-105 active:scale-95
                        "
                    >
                        <WrenchIcon className="w-7 h-7" />
                    </button>

                    {/* MOBILE TOOLS MENU OVERLAY */}
                    {isToolsMenuOpen && (
                        <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center sm:items-center">
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsToolsMenuOpen(false)}></div>
                            
                            <div className="relative bg-white/90 backdrop-blur-md w-full sm:w-auto sm:min-w-[320px] rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-slide-up sm:animate-fade-in">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <WrenchIcon className="w-5 h-5 text-slate-500" />
                                        Clinical Actions
                                    </h3>
                                    <button onClick={() => setIsToolsMenuOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                                        <XIcon className="w-5 h-5 text-slate-600" />
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4">
                                    <ToolsList />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- Modals --- */}
                    {user && (
                        <>
                            <FollowUpNoteModal
                                isOpen={isFollowUpModalOpen}
                                onClose={() => setIsFollowUpModalOpen(false)}
                                onSave={handleSaveFollowUpNote}
                                records={records}
                                userRole={user.role}
                            />
                            {/* Appointment Detail Modal triggered after saving a note if visit is active */}
                            {activeAppointment && (
                                <AppointmentDetailModal
                                    isOpen={!!activeAppointment}
                                    onClose={() => setActiveAppointment(null)}
                                    appointment={activeAppointment}
                                    currentUser={user}
                                    onRequestAction={() => {}}
                                    onAdminCancel={() => {}}
                                    onAdminEdit={() => {}}
                                    onStatusUpdate={handleAppointmentStatusUpdate}
                                />
                            )}
                        </>
                    )}
                    <ReferralModal
                        isOpen={isReferralModalOpen}
                        onClose={() => setIsReferralModalOpen(false)}
                        onSave={handleSaveReferral}
                        patient={patient}
                    />
                    <ProcedureModal
                        isOpen={isProcedureModalOpen}
                        onClose={() => setIsProcedureModalOpen(false)}
                        onSave={handleSaveProcedure}
                    />
                    {patient.latestVitals && (
                        <UpdateVitalsModal
                            isOpen={isUpdateVitalsModalOpen}
                            onClose={() => setIsUpdateVitalsModalOpen(false)}
                            onSave={handleSaveVitals}
                            initialVitals={patient.latestVitals}
                        />
                    )}
                    <Modal
                        isOpen={isSummaryModalOpen}
                        onClose={() => setIsSummaryModalOpen(false)}
                        title={`AI Summary for ${patient.name}`}
                    >
                        <AISummaryGenerator
                            notes={records.filter(r => r.type === 'Consultation')}
                            onSummaryAdded={() => {
                                setIsSummaryModalOpen(false);
                                onRecordUpdate();
                            }}
                        />
                    </Modal>
                </>,
                document.body
            )}
        </div>
    );
};