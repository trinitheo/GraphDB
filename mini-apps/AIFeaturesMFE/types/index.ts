import type { Api } from '../../../api_contract/patient';

// FIX: Re-export the Api type namespace to make it available for other modules.
export type { Api };

export type MedicalRecordEntry = Api.V1.MedicalRecordEntry;
export type Symptom = Api.V1.Symptom;
export type DemographicsData = Api.V1.DemographicsData;
export type WomensHealth = Api.V1.WomensHealth;
export type Patient = Api.V1.Patient;
