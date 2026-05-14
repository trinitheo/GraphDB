
export namespace Api {
  export namespace V1 {
    export type AppointmentStatus =
      | 'scheduled'
      | 'confirmed'
      | 'checked_in'
      | 'in_progress'
      | 'completed'
      | 'no_show'
      | 'cancelled'
      | 'change_requested'
      | 'cancel_requested';

    export type CheckInMethod = 'staff' | 'portal' | 'kiosk' | 'qr';

    export interface AttendanceDetails {
        checkInTime?: string; // ISO String
        checkInMethod?: CheckInMethod;
        checkedInBy?: string; // User ID
        startedAt?: string; // ISO String - When clinician entered room
        completedAt?: string; // ISO String - When visit ended
        noShowMarkedAt?: string;
        noShowMarkedBy?: string;
        room?: string;
    }

    export interface Appointment {
      id: string;
      patientId: string;
      providerId: string;
      location: string;
      startTime: string; // ISO String
      endTime: string; // ISO String
      status: AppointmentStatus;
      notes?: string;
      reason: string;
      createdBy: string;
      createdAt: string;
      updatedAt?: string;
      updatedBy?: string; // For audit trail
      changeReason?: string; // For change/cancel requests
      
      attendanceDetails?: AttendanceDetails;
      
      // Legacy fields kept for backward compatibility if needed, but mapped to attendanceDetails
      checkInTime?: string; 
      actualStartTime?: string; 
    }

    export interface AppointmentRequest {
      id: string;
      patientId: string;
      preferredProviderId?: string;
      preferredTimeRange?: { start: string; end: string };
      reason: string;
      status: 'pending' | 'approved' | 'declined';
      requestedAt: string;
      reviewedBy?: string;
      reviewedAt?: string;
    }
  }
}
