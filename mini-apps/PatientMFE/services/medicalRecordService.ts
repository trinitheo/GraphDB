import { authService } from './authService';
import type { Api } from '../../../api_contract/patient';
import type { AddMedicalRecordEntryRequest, Patient } from '../types';

// FIX: The role 'Doctor' is not a valid UserRole. It has been changed to 'Clinician'.
const HEALTH_PROFESSIONAL_ROLES: Api.V1.MedicalRecordEntry['authorRole'][] = ['Clinician', 'Nurse', 'AlliedHealthProfessional'];

export const medicalRecordService = {
  async getMedicalRecord(patientId: string): Promise<Api.V1.GetMedicalRecordResponse> {
    console.log(`AUDIT: Fetching medical records for patient ${patientId}`);
    const query = `
      query GetPatientRecords($id: ID!) {
        patient(id: $id) {
          records {
            id
            patientId
            authorId
            authorName
            authorRole
            timestamp
            content
            type
          }
        }
      }
    `;
    const res = await fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { id: patientId } })
    });
    const { data, errors } = await res.json();
    if (errors) throw new Error(errors[0].message || 'Failed to fetch medical records');
    return { data: { entries: data.patient.records || [] } };
  },

  async addMedicalRecordEntry(request: AddMedicalRecordEntryRequest): Promise<Api.V1.AddMedicalRecordEntryResponse> {
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      console.error(`AUDIT: UNAUTHORIZED attempt to add medical record (no user logged in)`);
      return { 
          data: { newEntry: {} as any }, 
          error: { code: 'UNAUTHORIZED', message: 'User not logged in.'}
      };
    }

    const query = `
      mutation AddMedicalRecordEntry($input: AddMedicalRecordEntryInput!) {
        addMedicalRecordEntry(input: $input) {
          id
          patientId
          authorId
          authorName
          authorRole
          timestamp
          content
          type
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
            patientId: request.patientId,
            content: request.content,
            type: request.type
          } 
        } 
      })
    });

    const { data, errors } = await res.json();
    
    if (errors) {
      const error = errors[0];
      console.error(`AUDIT: GraphQL Error adding medical record:`, error.message);
      return { 
          data: { newEntry: {} as any }, 
          error: { code: error.extensions?.code || 'INTERNAL_SERVER_ERROR', message: error.message }
      };
    }

    const newEntry = data.addMedicalRecordEntry;
    console.log(`AUDIT: Medical record entry ${newEntry.id} added for patient ${request.patientId} by user ${currentUser.id}`);

    return { data: { newEntry } };
  },
};