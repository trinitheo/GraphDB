import type React from 'react';

// Import API contract types and re-export them for local MFE use.
// This allows the MFE to be decoupled from the exact location of the contract.
import { Api } from '../../../api_contract/patient';
import type { Api as AppointmentApi } from '../../../api_contract/appointment';


// Re-export the API namespace to be used in other files.
export type { Api };
export type MedicalHistoryForm = Api.V1.MedicalHistoryForm;

export type Patient = Omit<Api.V1.Patient, 'age'> & { age: string };
export type Appointment = AppointmentApi.V1.Appointment;
export type Vitals = Api.V1.Vitals;
export type VitalsRecord = Api.V1.VitalsRecord;
export type Medication = Api.V1.Medication;
export type Allergy = Api.V1.Allergy;
export type MedicalCondition = Api.V1.MedicalCondition;
export type SnomedConcept = Api.V1.SnomedConcept;
export type PendingDiagnosis = Api.V1.PendingDiagnosis;

// Medical Record types
export type MedicalRecordEntry = Api.V1.MedicalRecordEntry;
export type Prescription = Api.V1.Prescription;
export type PrescriptionData = Api.V1.PrescriptionData;
export type Referral = Api.V1.Referral;
export type ReferralData = Api.V1.ReferralData;
export type ProcedureData = Api.V1.ProcedureData;
export type Procedure = Api.V1.Procedure;
export type AttachmentMeta = Api.V1.AttachmentMeta;
export type AddMedicalRecordEntryRequest = Api.V1.AddMedicalRecordEntryRequest;

// Order types
export type Order = Api.V1.Order;
export type LabOrder = Api.V1.LabOrder;
export type ImagingOrder = Api.V1.ImagingOrder;
export type SpecialTestOrder = Api.V1.SpecialTestOrder;
export type LabResultValue = Api.V1.LabResultValue;


// Re-export constants
export const VITAL_UNITS = Api.V1.VITAL_UNITS;


// --- MFE-specific types ---

// State for the reducer
export interface PatientState {
  list: Patient[];
  loading: boolean;
}

// Actions for the reducer
export type PatientAction =
  | { type: 'load_start' }
  | { type: 'load_success'; payload: Patient[] }
  | { type: 'update'; payload: Patient }
  | { type: 'add_patient'; payload: Patient }
  | { type: 'add_prescription', payload: { patientId: string, prescription: Api.V1.Prescription }};