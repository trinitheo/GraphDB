
import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { patientService } from '../services/patientService';
import type { Patient, PatientState, PatientAction, MedicalHistoryForm } from '../types';
import type { Api } from '../../../api_contract/patient';

// Define the shape of the context
interface PatientContextType {
  state: PatientState;
  getPatientById: (id: string) => Patient | undefined;
  updatePatient: (p: Patient) => Promise<void>;
  addPatient: (formData: MedicalHistoryForm) => Promise<Patient | undefined>;
  addPrescription: (patientId: string, prescriptionData: Omit<Api.V1.Prescription, 'id'>) => Promise<void>;
  addReferral: (patientId: string, referralData: Omit<Api.V1.Referral, 'id' | 'patientId' | 'date' | 'status'>) => Promise<void>;
  addVitalsRecord: (patientId: string, vitals: Api.V1.Vitals) => Promise<void>;
  addProcedure: (patientId: string, procedureData: Omit<Api.V1.Procedure, 'id'>) => Promise<void>;
  confirmPendingDiagnosis: (patientId: string, pendingDiagnosisId: string) => Promise<void>;
  addPendingDiagnoses: (patientId: string, diagnoses: Api.V1.SnomedConcept[], noteId: string) => Promise<void>;
  discontinueMedication: (patientId: string, medicationId: string, medicationName: string) => Promise<void>;
  addOrder: (patientId: string, orderData: Omit<Api.V1.Order, 'id' | 'patientId' | 'orderDate' | 'status' | 'orderingPhysician'>) => Promise<void>;
  updateOrder: (patientId: string, order: Api.V1.Order) => Promise<void>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

// Custom hook to use the PatientContext
export const usePatients = (): PatientContextType => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
};

// Reducer function to manage state updates
const patientReducer = (state: PatientState, action: PatientAction): PatientState => {
  switch (action.type) {
    case 'load_start':
      return { ...state, loading: true };
    case 'load_success':
      return { ...state, loading: false, list: action.payload };
    case 'update':
      return {
        ...state,
        list: state.list.map(p => p.id === action.payload.id ? action.payload : p),
      };
    case 'add_patient':
        return {
            ...state,
            list: [action.payload, ...state.list],
        };
    case 'add_prescription': {
      const { patientId, prescription } = action.payload;
      return {
          ...state,
          list: state.list.map(p => {
              if (p.id === patientId) {
                  const newMedication: Api.V1.Medication = {
                      id: `med-${prescription.id}`,
                      prescriptionId: prescription.id,
                      name: prescription.medicationName,
                      dose: prescription.dose,
                      route: prescription.route,
                      frequency: prescription.frequency,
                      rxcui: prescription.rxcui,
                      status: 'Active',
                      startDate: prescription.datePrescribed,
                      prescriber: prescription.prescriber,
                      notes: prescription.notes,
                  };
                  // Return a new patient object with new arrays for immutability
                  return {
                      ...p,
                      prescriptions: [...(p.prescriptions || []), prescription],
                      medications: [...(p.medications || []), newMedication],
                  };
              }
              return p;
          })
      };
    }
    default:
      return state;
  }
};

const initialState: PatientState = {
  list: [],
  loading: true,
};

interface PatientProviderProps {
  children: React.ReactNode;
}

// Provider component that wraps the app
export const PatientProvider: React.FC<PatientProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(patientReducer, initialState);

  useEffect(() => {
    const loadPatients = async () => {
      dispatch({ type: 'load_start' });
      const response = await patientService.fetchPatients();
      if (response.data) {
        dispatch({ type: 'load_success', payload: response.data.patients });
      }
      // TODO: Handle response.error
    };
    loadPatients();
  }, []);

  const getPatientById = useCallback((id: string): Patient | undefined => {
    return state.list.find(p => p.id === id);
  }, [state.list]);

  const updatePatient = useCallback(async (p: Patient) => {
    const response = await patientService.updatePatient(p);
    if(response.data){
        dispatch({ type: 'update', payload: response.data.patient });
    }
    // TODO: Handle response.error
  }, []);

  const addPatient = useCallback(async (formData: MedicalHistoryForm): Promise<Patient | undefined> => {
    const response = await patientService.addPatient(formData);
    if(response.data){
        dispatch({ type: 'add_patient', payload: response.data.patient });
        return response.data.patient;
    }
    // TODO: Handle response.error
    return undefined;
  }, []);

  const addPrescription = useCallback(async (patientId: string, prescriptionData: Omit<Api.V1.Prescription, 'id'>) => {
    const response = await patientService.addPrescription(patientId, prescriptionData);
    if (response.data) {
        dispatch({ type: 'add_prescription', payload: { patientId, prescription: response.data.prescription }});
    }
    // TODO: Handle error
  }, []);

  const addReferral = useCallback(async (patientId: string, referralData: Omit<Api.V1.Referral, 'id' | 'patientId' | 'date' | 'status'>) => {
    const response = await patientService.addReferral(patientId, referralData);
    if (response.data) {
        dispatch({ type: 'update', payload: response.data.patient });
    }
    // TODO: Handle error
  }, []);

  const addVitalsRecord = useCallback(async (patientId: string, vitals: Api.V1.Vitals) => {
    const response = await patientService.addVitalsRecord(patientId, vitals);
    if (response.data) {
        dispatch({ type: 'update', payload: response.data.patient });
    }
  }, []);

  const addProcedure = useCallback(async (patientId: string, procedureData: Omit<Api.V1.Procedure, 'id'>) => {
    const response = await patientService.addProcedure(patientId, procedureData);
    if (response.data) {
        dispatch({ type: 'update', payload: response.data.patient });
    }
  }, []);

  const confirmPendingDiagnosis = useCallback(async (patientId: string, pendingDiagnosisId: string) => {
    const response = await patientService.confirmDiagnosis(patientId, pendingDiagnosisId);
    if (response.data) {
        dispatch({ type: 'update', payload: response.data.patient });
    }
  }, []);

  const addPendingDiagnoses = useCallback(async (patientId: string, diagnoses: Api.V1.SnomedConcept[], noteId: string) => {
    const response = await patientService.addPendingDiagnoses(patientId, diagnoses, noteId);
    if (response.data) {
        dispatch({ type: 'update', payload: response.data.patient });
    }
  }, []);

  const discontinueMedication = useCallback(async (patientId: string, medicationId: string, medicationName: string) => {
    const response = await patientService.discontinueMedication(patientId, medicationId, medicationName);
    if (response.data) {
        dispatch({ type: 'update', payload: response.data.patient });
    }
  }, []);

  const addOrder = useCallback(async (patientId: string, orderData: Omit<Api.V1.Order, 'id' | 'patientId' | 'orderDate' | 'status' | 'orderingPhysician'>) => {
    const response = await patientService.addOrder(patientId, orderData);
    if (response.data) {
        dispatch({ type: 'update', payload: response.data.patient });
    }
  }, []);

  const updateOrder = useCallback(async (patientId: string, order: Api.V1.Order) => {
    const response = await patientService.updateOrder(patientId, order);
    if (response.data) {
        dispatch({ type: 'update', payload: response.data.patient });
    }
  }, []);

  const value = {
    state,
    getPatientById,
    updatePatient,
    addPatient,
    addPrescription,
    addReferral,
    addVitalsRecord,
    addProcedure,
    confirmPendingDiagnosis,
    addPendingDiagnoses,
    discontinueMedication,
    addOrder,
    updateOrder,
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};