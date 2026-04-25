
// api_contract/patient.ts

import type { UserRole } from './shared';

export namespace Api {
  export namespace V1 {
    // --- CORE ---
    export interface Entity {
      id: string;
    }

    // --- SHARED ---
    export interface SnomedConcept {
      code: string;
      display: string;
    }

    // --- VITALS ---
    export interface Vitals {
      timestamp?: string;
      heartRate: string;
      bloodPressure: string;
      temperature: string;
      respRate: string;
      spO2: string;
      weight: string;
      height: string;
      bmi: string;
      glucose: string;
      hba1c: string;
      gcs: string;
      avpu: '' | 'Alert' | 'Voice' | 'Pain' | 'Unresponsive';
    }

    export const VITAL_UNITS: { [key in keyof Vitals]?: string } = {
      heartRate: 'bpm',
      temperature: '°C',
      respRate: 'breaths/min',
      spO2: '%',
      weight: 'kg',
      height: 'cm',
      glucose: 'mg/dL',
      hba1c: '%',
    };

    export interface VitalsRecord extends Entity {
      timestamp: string;
      authorId: string;
      authorName: string;
      vitals: Vitals;
    }
    
    // --- PATIENT DATA ---
    export interface Allergy extends Entity {
      substance: string;
      reaction: string;
    }
    
    export interface MedicalCondition extends Entity {
        condition: string;
    }
    
    export interface Medication extends Entity {
      prescriptionId?: string;
      name: string;
      dose: string;
      route: string;
      frequency: string;
      rxcui?: string;
      status: 'Active' | 'Discontinued' | 'Inactive';
      startDate: string;
      endDate?: string;
      prescriber: string;
      notes?: string;
    }

    export interface Prescription extends Entity {
      medicationName: string;
      rxcui?: string;
      dose: string;
      route: string;
      frequency: string;
      refills: number;
      datePrescribed: string;
      prescriber: string;
      notes: string;
      duration?: string;
    }

    export interface Referral extends Entity {
      patientId: string;
      fromProvider: string;
      toProvider: string;
      specialty: string;
      reason: string;
      date: string;
      status: 'Pending' | 'Completed' | 'Cancelled';
      urgency: 'Routine' | 'Urgent' | 'STAT';
      notes?: string;
    }

    export interface Procedure extends Entity {
      name: string;
      date: string;
      practitioner: string;
      notes?: string;
      cptCode?: string;
    }

    export interface LabResultValue {
      testName: string;
      value: string;
      unit: string;
      referenceRange: string;
      isAbnormal: boolean;
      flag: 'H' | 'L' | '';
    }

    export type LabUrgency = 'Routine' | 'Urgent' | 'STAT';
    export type OrderStatus = 'Ordered' | 'In Progress' | 'Completed' | 'Cancelled';

    interface BaseOrder extends Entity {
      patientId: string;
      orderDate: string;
      orderingPhysician: string;
      reasonForRequest: string;
      status: OrderStatus;
    }

    export interface LabOrder extends BaseOrder {
      orderType: 'Lab';
      tests: { testId: string; testName: string }[];
      urgency: LabUrgency;
      fastingRequired?: boolean;
      specimenType?: string;
      results?: string;
      parsedResults?: LabResultValue[];
    }

    export interface ImagingOrder extends BaseOrder {
      orderType: 'Imaging';
      modality: string;
      bodyPart: string;
      contrast?: boolean;
      report?: string;
      urgency: 'Routine' | 'Urgent' | 'STAT';
      anesthesiaNeeded?: boolean;
      destination?: string; // e.g., 'In-house', 'External'
    }

    export interface SpecialTestOrder extends BaseOrder {
      orderType: 'SpecialTest';
      testName: string;
      details?: string;
      results?: string;
    }

    export type Order = LabOrder | ImagingOrder | SpecialTestOrder;
    
    export interface ImagingStudy extends Entity {
        modality: string;
        bodyPart: string;
        date: string;
        report: string;
        imageUrl?: string;
    }

    export interface PendingDiagnosis extends Entity {
      condition: string;
      noteId: string;
      status: 'pending' | 'confirmed' | 'ruled-out';
    }

    export interface Patient extends Entity {
      userId?: string;
      name: string;
      // FIX: Changed age to always be a string for consistency
      age: string;
      gender: string;
      avatar: string;
      archived: boolean;
      dob: string;
      sex?: 'Male' | 'Female';
      address: string;
      phone: string;
      email: string;
      bloodType?: string;
      lastVisit?: string;
      occupation?: string;
      nextOfKin?: { name: string; relation: string; phone: string };
      // New insurance fields
      insuranceProvider?: string;
      policyNumber?: string;
      groupNumber?: string;
      latestVitals?: Vitals;
      vitalsHistory?: VitalsRecord[];
      activeProblems?: MedicalCondition[];
      pendingDiagnoses?: PendingDiagnosis[];
      medications?: Medication[];
      allergies?: Allergy[];
      prescriptions?: Prescription[];
      orders?: Order[];
      procedures?: Procedure[];
      referrals?: Referral[];
      imagingStudies?: ImagingStudy[];
    }
    
    // --- MEDICAL RECORDS ---
    export interface PrescriptionData {
      medication: string;
      dose: string;
      route: string;
      frequency: string;
      refills: number;
      duration?: string;
    }
    export interface ReferralData {
      referredTo: string;
      specialty: string;
      reason: string;
    }
    export interface ProcedureData {
      name: string;
      cptCode?: string;
      notes?: string;
    }
    export interface AttachmentMeta extends Entity {
      fileName: string;
      fileType: string;
      url: string;
    }
    export interface MedicalRecordEntry extends Entity {
      patientId: string;
      authorId: string;
      authorName: string;
      authorRole: UserRole;
      timestamp: string;
      content: string;
      type: 'Consultation' | 'Prescription' | 'Referral' | 'Procedure' | 'LabResult' | 'ImagingResult' | 'AISummary' | 'Other';
      prescriptionData?: PrescriptionData;
      referralData?: ReferralData;
      procedureData?: ProcedureData;
      attachments?: AttachmentMeta[];
    }
    
    // --- NEW PATIENT INTAKE FORM ---
    export interface DemographicsData {
      firstName: string;
      middleName: string;
      lastName: string;
      dob: string;
      // FIX: Changed age to always be a string for consistency
      age: string;
      gender: string;
      sex: 'Male' | 'Female' | '';
      phone: string;
      email: string;
      address: string;
      bloodType?: string;
      // New insurance fields
      insuranceProvider: string;
      policyNumber: string;
      groupNumber: string;
    }

    export interface Symptom extends Entity {
      description: string;
      location: string[];
      onset: string;
      severity: number;
    }
    
    export interface Complaint {
      symptoms: Symptom[];
      timeline: string;
    }
    
    export interface SurgicalHistoryItem extends Entity {
        procedure: string;
        date: string;
    }

    export interface FamilyHistoryItem extends Entity {
        relation: string;
        condition: string;
    }

    export interface SocialHistory {
        smokingStatus: string;
        alcoholConsumption: string;
        recreationalDrugUse: 'Yes' | 'No';
        occupation: string;
        livingSituation: string;
        diet: string;
    }

    export interface WomensHealth {
        lmp: string;
        periodsRegular: 'Yes' | 'No' | '';
        pregnancies: number | string;
        liveBirths: number | string;
        possibilityOfPregnancy: 'Yes' | 'No' | 'Unsure' | '';
        lastPapSmearDate?: string;
        lastPapSmearResult?: string;
        lastMammogramDate?: string;
        lastMammogramResult?: string;
    }

    export interface ReviewOfSystems {
        general: string[];
        skin: string[];
        heent: string[];
        cardiovascular: string[];
        respiratory: string[];
        gastrointestinal: string[];
        genitourinary: string[];
        musculoskeletal: string[];
        neurological: string[];
        endocrine: string[];
        psychiatric: string[];
    }

    export interface HistoryData {
      medicalHistory: MedicalCondition[];
      surgicalHistory: SurgicalHistoryItem[];
      allergies: Allergy[];
      hasAllergies: 'Yes' | 'No' | '';
      medications: (Omit<Medication, 'id'> & {id: string})[];
      familyHistory: FamilyHistoryItem[];
      socialHistory: SocialHistory;
      womensHealth: WomensHealth;
      reviewOfSystems: ReviewOfSystems;
      historySummary: string;
    }
    
    export interface Examination {
      vitals: Vitals;
      systems: {
        general: string;
        heent: string;
        skin: string;
        cardiovascular: string;
        respiratory: string;
        abdominal: string;
        musculoskeletal: string;
        neurological: string;
        psychiatric: string;
      };
    }

    export interface Assessment {
      differentialDiagnosis: SnomedConcept[];
      workingDiagnosis: SnomedConcept[];
    }

    export interface Plan {
      treatments: string;
      followUp: string;
      // New fields for pending items
      pendingReferrals: { id: string; specialty: string; reason: string }[];
      pendingOrders: { id: string; orderName: string; reason: string }[];
    }

    export interface MedicalHistoryForm {
      demographics: DemographicsData;
      complaint: Complaint;
      history: HistoryData;
      examination: Examination;
      assessment: Assessment;
      plan: Plan;
    }

    // --- API REQUEST/RESPONSE ---
    export interface GetPatientsResponse {
      data: { patients: Patient[] };
    }
    export interface CreatePatientResponse {
      data: { patient: Patient };
    }
    export interface UpdatePatientResponse {
      data: { patient: Patient };
    }
    export interface GetMedicalRecordResponse {
      data: { entries: MedicalRecordEntry[] };
    }
    export interface AddMedicalRecordEntryRequest {
      patientId: string;
      content: string;
      type: MedicalRecordEntry['type'];
    }
    export interface AddMedicalRecordEntryResponse {
      data: {
        newEntry: MedicalRecordEntry;
        updatedPatient?: Patient | null;
      };
      error?: { code: string; message: string };
    }

    // Drug suggestions from RxNorm
    export interface DrugSuggestion {
        rxcui: string;
        name: string;
    }
  }
}
