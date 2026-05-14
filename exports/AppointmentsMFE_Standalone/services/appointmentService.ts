
import type { Appointment, AppointmentStatus } from '../types';
import type { Api } from '../external/appointment_contract';
import { authService } from '../external/services/authService';

export const appointmentService = {
  async fetchAppointments(): Promise<Appointment[]> {
    const query = `
      query {
        appointments {
          id
          patientId
          startTime
          endTime
          status
          providerId
          location
          reason
          createdBy
          createdAt
          updatedAt
          updatedBy
          changeReason
          attendanceDetails {
            checkInTime
            checkInMethod
            checkedInBy
            startedAt
            completedAt
            noShowMarkedAt
            noShowMarkedBy
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
    if (errors) throw new Error(errors[0].message || 'Failed to fetch appointments');
    return data.appointments;
  },

  async getAppointmentById(id: string): Promise<Appointment | undefined> {
    const query = `
      query GetAppointment($id: ID!) {
        appointment(id: $id) {
          id
          patientId
          startTime
          endTime
          status
          providerId
          location
          reason
          createdBy
          createdAt
          updatedAt
          updatedBy
          changeReason
          attendanceDetails {
            checkInTime
            checkInMethod
            checkedInBy
            startedAt
            completedAt
            noShowMarkedAt
            noShowMarkedBy
          }
        }
      }
    `;
    const res = await fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { id } })
    });
    if (!res.ok) return undefined;
    const { data } = await res.json();
    return data.appointment;
  },

  async addAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment> {
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not logged in.');
    }

    const query = `
      mutation AddAppointment($input: AddAppointmentInput!) {
        addAppointment(input: $input) {
          id
          patientId
          startTime
          endTime
          status
          providerId
          location
          reason
          createdBy
          createdAt
          updatedAt
          updatedBy
          changeReason
          attendanceDetails {
            checkInTime
            checkInMethod
            checkedInBy
            startedAt
            completedAt
            noShowMarkedAt
            noShowMarkedBy
          }
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
            patientId: appointmentData.patientId,
            startTime: appointmentData.startTime,
            endTime: appointmentData.endTime,
            providerId: appointmentData.providerId,
            location: appointmentData.location,
            reason: appointmentData.reason
          } 
        } 
      })
    });

    const { data, errors } = await res.json();
    if (errors) throw new Error(errors[0].message || 'Failed to add appointment');
    return data.addAppointment;
  },

  async updateAppointment(appointmentData: Appointment, actorId: string): Promise<Appointment> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not logged in.');
    }

    const query = `
      mutation UpdateAppointment($input: UpdateAppointmentInput!) {
        updateAppointment(input: $input) {
          id
          patientId
          startTime
          endTime
          status
          providerId
          location
          reason
          updatedBy
          changeReason
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
            id: appointmentData.id,
            startTime: appointmentData.startTime,
            endTime: appointmentData.endTime,
            providerId: appointmentData.providerId,
            location: appointmentData.location,
            reason: appointmentData.reason,
            changeReason: appointmentData.changeReason || 'Updated via UI'
          } 
        } 
      })
    });

    const { data, errors } = await res.json();
    if (errors) throw new Error(errors[0].message || 'Failed to update appointment');
    return data.updateAppointment;
  },

  async updateAppointmentStatus(appointmentId: string, status: AppointmentStatus, actorId: string, reason?: string, method?: Api.V1.CheckInMethod): Promise<Appointment> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not logged in.');
    }

    const query = `
      mutation UpdateAppointmentStatus($input: UpdateAppointmentStatusInput!) {
        updateAppointmentStatus(input: $input) {
          id
          status
          changeReason
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
            id: appointmentId,
            status,
            changeReason: reason
          } 
        } 
      })
    });

    const { data, errors } = await res.json();
    if (errors) throw new Error(errors[0].message || 'Failed to update appointment status');
    return data.updateAppointmentStatus;
  },

  async deleteAppointment(appointmentId: string): Promise<void> {
    const res = await fetch(`/api/appointments/${appointmentId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete appointment');
    }
  },
};
