

// FIX: Change to value import to allow access to VITAL_UNITS constant
import { Api } from '../../../api_contract/patient';

// FIX: Re-export the Api type namespace to make it available for other modules.
export type { Api };

export type Patient = Api.V1.Patient;
export type MedicalRecordEntry = Api.V1.MedicalRecordEntry;
export type Vitals = Api.V1.Vitals;
export type Medication = Api.V1.Medication;
export type Order = Api.V1.Order;

export type AddMedicalRecordEntryRequest = {
  patientId: string;
  content: string;
  type: MedicalRecordEntry['type'];
};

// Re-export constants for local MFE use
// FIX: Correctly re-export VITAL_UNITS from its nested namespace
export const VITAL_UNITS = Api.V1.VITAL_UNITS;