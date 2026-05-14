
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
// FIX: Corrected import path.
import { usePatients } from '../../context/PatientContext';
// FIX: Corrected import path for types. This resolves the errors for Patient, MedicalRecordEntry, Api, Order, and Appointment.
import type { Patient, MedicalRecordEntry, Api, Order, Appointment } from '../../types';
import PatientInformation from './PatientInformation';
import PatientNav from './PatientNav';
// FIX: Corrected import path.
import { MedicalRecordsView } from '../../../MedicalRecordsMFE';
import type { OrderType } from '../../../TestOrderingMFE/types';
// FIX: Corrected import path.
import { MedicationsView, PrescriptionPadModal } from '../../../MedicationsMFE';
// FIX: Corrected import path.
import { ProceduresView } from '../../../ProceduresMFE';
// FIX: Corrected import path.
import { AppointmentsDashboard } from '../../../AppointmentsMFE';
// FIX: Corrected import path.
import { TestOrderingView, NewOrderModal } from '../../../TestOrderingMFE';
// FIX: Corrected import path.
import { NotesSummaryCard } from '../../../AIFeaturesMFE';
// FIX: Corrected import path.
import ClinicalTimelineCard from '../../../MedicalRecordsMFE/components/detail/ClinicalTimelineCard';
// FIX: Corrected import path.
import { medicalRecordService } from '../../services/medicalRecordService';
// FIX: Corrected import path.
import { authService } from '../../services/authService';
// FIX: Corrected import path.
import { appointmentService } from '../../../AppointmentsMFE/services/appointmentService';
// FIX: Corrected import path and added missing ChevronLeft icon.
import { ChevronLeft, ChevronRight } from '../../../../components/icons';
// FIX: Corrected import path.
import { useAuth } from '../../hooks/useAuth';

/**
 * Custom hook to manage data fetching and state for the patient detail view.
 * @param patientId The ID of the patient whose details are to be fetched.
 */
const usePatientDetails = (patientId?: string) => {
  const [records, setRecords] = useState<MedicalRecordEntry[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!patientId) return;
    
    setRecordsLoading(true);
    setRecordsError(null);
    
    try {
      const response = await medicalRecordService.getMedicalRecord(patientId);
      if (response.data) {
        const sortedRecords = response.data.entries.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setRecords(sortedRecords);
      }
    } catch (error) {
      setRecordsError('Failed to load medical records');
      console.error('Error fetching records:', error);
    } finally {
      setRecordsLoading(false);
    }
  }, [patientId]);

  const fetchAppointments = useCallback(async () => {
    setAppointmentsLoading(true);
    setAppointmentsError(null);
    
    try {
      const appointments = await appointmentService.fetchAppointments();
      setAllAppointments(appointments);
    } catch (error) {
      setAppointmentsError('Failed to load appointments');
      console.error('Error fetching appointments:', error);
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
    fetchAppointments();
  }, [fetchRecords, fetchAppointments]);

  const upcomingAppointments = useMemo(() => {
    if (!patientId) return [];
    const now = new Date();
    return allAppointments
      .filter(a => 
        a.patientId === patientId && 
        new Date(a.startTime) > now && 
        (a.status === 'confirmed' || a.status === 'scheduled')
      )
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [allAppointments, patientId]);
  
  return {
    records,
    recordsLoading,
    recordsError,
    appointmentsLoading,
    appointmentsError,
    upcomingAppointments,
    refetchRecords: fetchRecords,
    refetchAppointments: fetchAppointments,
  };
};

/**
 * Custom hook to manage modal state
 */
const useModals = () => {
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [initialOrderType, setInitialOrderType] = useState<OrderType | null>(null);

  return {
    isPrescriptionModalOpen,
    isNewOrderModalOpen,
    initialOrderType,
    openPrescriptionModal: () => setIsPrescriptionModalOpen(true),
    closePrescriptionModal: () => setIsPrescriptionModalOpen(false),
    openNewOrderModal: (type?: OrderType) => {
      setInitialOrderType(type || null);
      setIsNewOrderModalOpen(true);
    },
    closeNewOrderModal: () => {
      setIsNewOrderModalOpen(false);
      setInitialOrderType(null);
    },
  };
};

/**
 * Component to render the main "Patient" overview tab with enhanced layout
 */
const PatientOverview: React.FC<{ 
  patient: Patient; 
  records: MedicalRecordEntry[]; 
  upcomingAppointments: Appointment[];
}> = ({ patient, records, upcomingAppointments }) => {
  const notesToSummarize = useMemo(() => 
    records.filter(r => r.type === 'Consultation'),
    [records]
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar with Notes Summary - Hidden on mobile for better vertical flow */}
      <aside className="w-full lg:w-[300px] xl:w-[350px] lg:flex-shrink-0 lg:block hidden">
        <div className="sticky top-6">
          <NotesSummaryCard notes={notesToSummarize} />
        </div>
      </aside>
      
      {/* Main content area */}
      <main className="flex-1 space-y-6 min-w-0">
        <PatientInformation 
          patient={patient} 
          upcomingAppointments={upcomingAppointments} 
        />
        <div className="card-panel p-6">
          <ClinicalTimelineCard records={records} />
        </div>
        
        {/* Notes Summary for mobile - appears after timeline */}
        <div className="lg:hidden">
          <NotesSummaryCard notes={notesToSummarize} />
        </div>
      </main>
    </div>
  );
};

/**
 * Loading component with consistent styling
 */
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500"></div>
  </div>
);

/**
 * Error display component
 */
const ErrorDisplay: React.FC<{ 
  message: string; 
  onRetry?: () => void;
}> = ({ message, onRetry }) => (
  <div className="p-6 card-panel text-center">
    <div className="text-red-500 text-lg font-semibold mb-2">Error</div>
    <p className="text-slate-600 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

const PatientDetailView: React.FC = () => {
  const { patientId } = ReactRouterDOM.useParams<{ patientId: string }>();
  const { user } = useAuth();
  const [searchParams] = ReactRouterDOM.useSearchParams();
  
  const { 
    getPatientById, 
    state: { loading: patientsLoading }, 
    addPrescription, 
    addOrder 
  } = usePatients();
  
  const { 
    records, 
    recordsLoading, 
    recordsError,
    appointmentsLoading, 
    appointmentsError,
    upcomingAppointments, 
    refetchRecords,
    refetchAppointments
  } = usePatientDetails(patientId);

  const {
    isPrescriptionModalOpen,
    isNewOrderModalOpen,
    openPrescriptionModal,
    closePrescriptionModal,
    openNewOrderModal,
    closeNewOrderModal,
  } = useModals();

  const [activeView, setActiveView] = useState('Patient');

  // Security check: If the logged-in user is a patient, ensure they can only access their own chart.
  if (user?.role === 'Patient' && user.patientId !== patientId) {
    return <ReactRouterDOM.Navigate to="/" replace />;
  }
  
  // Set active view from URL query param on initial load
  useEffect(() => {
    const viewFromUrl = searchParams.get('view');
    if (viewFromUrl) {
      setActiveView(viewFromUrl.replace('+', ' '));
    }
  }, [searchParams]);

  const patient = useMemo(() => 
    patientId ? getPatientById(patientId) : undefined, 
    [patientId, getPatientById]
  );

  const handleSavePrescription = async (prescriptionData: Omit<Api.V1.Prescription, 'id' | 'datePrescribed' | 'prescriber'>) => {
    if (!patient) return;
    
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) throw new Error('User not authenticated');

      const fullPrescriptionData: Omit<Api.V1.Prescription, 'id'> = {
        ...prescriptionData,
        datePrescribed: new Date().toISOString(),
        prescriber: currentUser.name,
      };
      
      await addPrescription(patient.id, fullPrescriptionData);
      closePrescriptionModal();
      refetchRecords(); // Refresh records to show new prescription in timeline
    } catch (error) {
      console.error('Error saving prescription:', error);
      // In a real app, you might want to show a toast notification here
    }
  };
  
  const handleSaveOrder = async (orderData: Omit<Order, 'id' | 'patientId' | 'orderDate' | 'status' | 'orderingPhysician'>) => {
    if (!patient) return;
    
    try {
      await addOrder(patient.id, orderData);
      closeNewOrderModal();
      setActiveView('Tests'); // Navigate to Tests view after successful order
      refetchRecords(); // Refresh records to show new order in timeline
    } catch (error) {
      console.error('Error saving order:', error);
      // In a real app, you might want to show a toast notification here
    }
  };

  const handleViewChange = useCallback((view: string) => {
    setActiveView(view);
  }, []);

  const loading = patientsLoading || recordsLoading || appointmentsLoading;
  const hasErrors = recordsError || appointmentsError;

  if (loading && !patient) {
    return <LoadingSpinner />;
  }

  if (!patientsLoading && !patient) {
    return (
      <div className="p-10 text-center card-panel">
        <h2 className="text-2xl font-bold text-slate-900">Patient not found</h2>
        <p className="text-slate-600">The patient you are looking for does not exist.</p>
        <ReactRouterDOM.Link 
          to="/patients" 
          className="mt-4 inline-flex items-center text-sky-600 hover:underline font-semibold"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to All Patients
        </ReactRouterDOM.Link>
      </div>
    );
  }

  if (!patient) return null;
    
  const renderViewContent = () => {
    if (hasErrors && activeView === 'Patient') {
      return (
        <div className="space-y-4">
          {recordsError && <ErrorDisplay message={recordsError} onRetry={refetchRecords} />}
          {appointmentsError && <ErrorDisplay message={appointmentsError} onRetry={refetchAppointments} />}
        </div>
      );
    }

    switch(activeView) {
      case 'Patient':
        return (
          <PatientOverview 
            patient={patient} 
            records={records} 
            upcomingAppointments={upcomingAppointments} 
          />
        );
      case 'Medical Records':
        return (
          <MedicalRecordsView 
            patient={patient}
            records={records}
            isLoading={recordsLoading}
            error={recordsError}
            onAddPrescriptionClick={openPrescriptionModal}
            onRecordUpdate={refetchRecords}
            onNavigateToMedications={() => setActiveView('Medications')}
            onPlaceNewOrderClick={openNewOrderModal}
          />
        );
      case 'Medications':
        return <MedicationsView patient={patient} onAddPrescriptionClick={openPrescriptionModal} />;
      case 'Tests':
        return <TestOrderingView patient={patient} onRecordUpdate={refetchRecords} />;
      case 'Procedures':
        return <ProceduresView patient={patient} />;
      case 'Appointments':
        return <AppointmentsDashboard filterPatientId={patient.id} />;
      default:
        return (
          <div className="text-slate-600 p-8 card-panel text-center">
            <h3 className="text-lg font-semibold mb-2">{activeView}</h3>
            <p>This view is under construction.</p>
          </div>
        );
    }
  };

  return (
    <div className="animate-fade-in h-full flex flex-col">
      {/* Enhanced header with breadcrumb and back button options */}
      <header className="flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm">
            <ReactRouterDOM.Link 
              to="/patients" 
              className="inline-flex items-center text-sky-600 hover:underline font-semibold md:hidden"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back
            </ReactRouterDOM.Link>
            <div className="hidden md:flex items-center">
              <ReactRouterDOM.Link to="/patients" className="text-sky-600 hover:underline">
                Patients
              </ReactRouterDOM.Link>
              <ChevronRight className="h-4 w-4 text-slate-400 mx-2" />
              <span className="font-semibold text-slate-700">{patient.name}</span>
            </div>
          </div>
        </div>
        
        <PatientNav activeView={activeView} onViewChange={handleViewChange} />
      </header>
      
      {/* Main content area */}
      <main className="flex-1 mt-6 overflow-y-auto scrollbar-autohide pb-24 lg:pb-0">
        {renderViewContent()}
      </main>
      
      {/* Modals */}
      <PrescriptionPadModal
        isOpen={isPrescriptionModalOpen}
        onClose={closePrescriptionModal}
        onSave={handleSavePrescription}
        patient={patient}
      />
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={closeNewOrderModal}
        onSave={handleSaveOrder}
        patient={patient}
        initialType={initialOrderType}
      />
    </div>
  );
};

export default PatientDetailView;
