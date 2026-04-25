import type { Patient } from '../types';
import type { Api } from '../../../api_contract/patient';
import { authService } from './authService';

export const patientService = {
  async fetchPatients(): Promise<Api.V1.GetPatientsResponse> {
    const query = `
      query {
        patients {
          id
          userId
          name
          age
          gender
          avatar
          archived
          dob
          sex
          address
          phone
          email
          bloodType
          lastVisit
          occupation
          insuranceProvider
          policyNumber
          groupNumber
          latestVitals {
            timestamp
            heartRate
            bloodPressure
            temperature
            respRate
            spO2
            weight
            height
            bmi
            glucose
            hba1c
            gcs
            avpu
          }
          vitalsHistory {
            id
            timestamp
            authorId
            authorName
            vitals {
              heartRate
              bloodPressure
              temperature
              respRate
              spO2
              weight
              height
              bmi
              glucose
              hba1c
              gcs
              avpu
            }
          }
          activeProblems {
            id
            condition
          }
          medications {
            id
            prescriptionId
            name
            rxcui
            dose
            route
            frequency
            status
            startDate
            endDate
            prescriber
            notes
          }
          allergies {
            id
            substance
            reaction
          }
          prescriptions {
            id
            medicationName
            rxcui
            dose
            route
            frequency
            refills
            datePrescribed
            prescriber
            notes
            duration
          }
          orders {
            id
            patientId
            orderDate
            orderingPhysician
            reasonForRequest
            status
            orderType
            tests {
              testId
              testName
            }
            urgency
            fastingRequired
            specimenType
            results
            parsedResults {
              testName
              value
              unit
              referenceRange
              isAbnormal
              flag
            }
          }
          procedures {
            id
            name
            date
            practitioner
            notes
          }
          referrals {
            id
            patientId
            date
            status
            specialty
            toProvider
            reason
          }
          imagingStudies {
            id
            modality
            bodyPart
            date
            report
          }
        }
      }
    `;
    const res = await fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const { data, errors } = await res.json();
    if (errors) throw new Error(errors[0].message || 'Failed to fetch patients');
    return { data: { patients: data.patients } };
  },

  async updatePatient(p: Patient): Promise<Api.V1.UpdatePatientResponse> {
    const res = await fetch(`/api/patients/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient: p })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update patient');
    return { data: { patient: data } };
  },

  async addPatient(formData: Api.V1.MedicalHistoryForm): Promise<Api.V1.CreatePatientResponse> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not logged in.');
    }

    const query = `
      mutation AddPatient($input: AddPatientInput!) {
        addPatient(input: $input) {
          id
          name
        }
      }
    `;

    const res = await fetch('/graphql', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JSON.stringify(currentUser)}`
      },
      body: JSON.stringify({ 
        query, 
        variables: { 
          input: {
            name: formData.personalInfo.name,
            age: formData.personalInfo.age,
            gender: formData.personalInfo.gender,
            dob: formData.personalInfo.dob,
            sex: formData.personalInfo.sex,
            address: formData.personalInfo.address,
            phone: formData.personalInfo.phone,
            email: formData.personalInfo.email,
            socialHistory: JSON.stringify(formData.socialHistory),
            familyHistory: JSON.stringify(formData.familyHistory),
            surgicalHistory: JSON.stringify(formData.surgicalHistory),
            medicalHistory: JSON.stringify(formData.medicalHistory),
            complaint: JSON.stringify(formData.complaint),
            assessment: JSON.stringify(formData.assessment)
          } 
        } 
      })
    });

    const { data, errors } = await res.json();
    if (errors) throw new Error(errors[0].message || 'Failed to add patient');
    return { data: { patient: data.addPatient } };
  },

  async addPrescription(patientId: string, prescriptionData: Omit<Api.V1.Prescription, 'id'>): Promise<{ data: { prescription: Api.V1.Prescription } }> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not logged in.');
    }

    const query = `
      mutation AddPrescription($input: AddPrescriptionInput!) {
        addPrescription(input: $input) {
          id
          medicationName
          dose
          route
          frequency
          rxcui
          datePrescribed
          prescriber
          notes
          refills
          duration
        }
      }
    `;

    const res = await fetch('/graphql', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JSON.stringify(currentUser)}`
      },
      body: JSON.stringify({ 
        query, 
        variables: { 
          input: {
            patientId,
            ...prescriptionData
          } 
        } 
      })
    });

    const { data, errors } = await res.json();
    if (errors) throw new Error(errors[0].message || 'Failed to add prescription');
    return { data: { prescription: data.addPrescription } };
  },

  async addReferral(patientId: string, referralData: Omit<Api.V1.Referral, 'id' | 'patientId' | 'date' | 'status'>): Promise<{ data: { patient: Api.V1.Patient } }> {
    const currentUser = authService.getCurrentUser();
    const res = await fetch(`/api/patients/${patientId}/referrals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referralData, currentUser })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add referral');
    return { data: { patient: data } };
  },

  async addVitalsRecord(patientId: string, vitals: Api.V1.Vitals): Promise<{ data: { patient: Api.V1.Patient } }> {
    const currentUser = authService.getCurrentUser();
    const res = await fetch(`/api/patients/${patientId}/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vitals, currentUser })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add vitals');
    return { data: { patient: data } };
  },

  async addProcedure(patientId: string, procedureData: Omit<Api.V1.Procedure, 'id'>): Promise<{ data: { patient: Api.V1.Patient } }> {
    const currentUser = authService.getCurrentUser();
    const res = await fetch(`/api/patients/${patientId}/procedures`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ procedureData, currentUser })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add procedure');
    return { data: { patient: data } };
  },
  
  async discontinueMedication(patientId: string, medicationId: string, medicationName: string): Promise<{ data: { patient: Api.V1.Patient } }> {
    const currentUser = authService.getCurrentUser();
    const res = await fetch(`/api/patients/${patientId}/medications/${medicationId}/discontinue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicationName, currentUser })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to discontinue medication');
    return { data: { patient: data } };
  },

  async confirmDiagnosis(patientId: string, pendingDiagnosisId: string): Promise<{ data: { patient: Api.V1.Patient } }> {
    const currentUser = authService.getCurrentUser();
    const res = await fetch(`/api/patients/${patientId}/diagnoses/${pendingDiagnosisId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentUser })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to confirm diagnosis');
    return { data: { patient: data } };
  },

  async addPendingDiagnoses(patientId: string, diagnoses: Api.V1.SnomedConcept[], noteId: string): Promise<{ data: { patient: Api.V1.Patient } }> {
    const res = await fetch(`/api/patients/${patientId}/diagnoses/pending`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagnoses, noteId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add pending diagnoses');
    return { data: { patient: data } };
  },

  async addOrder(patientId: string, orderData: Omit<Api.V1.Order, 'id' | 'patientId' | 'orderDate' | 'status' | 'orderingPhysician'>): Promise<{ data: { patient: Api.V1.Patient } }> {
    const currentUser = authService.getCurrentUser();
    const res = await fetch(`/api/patients/${patientId}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderData, currentUser })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add order');
    return { data: { patient: data.updatedPatient } };
  },

  async updateOrder(patientId: string, order: Api.V1.Order): Promise<{ data: { patient: Api.V1.Patient } }> {
    const currentUser = authService.getCurrentUser();
    const res = await fetch(`/api/patients/${patientId}/orders/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order, currentUser })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update order');
    return { data: { patient: data } };
  },
};