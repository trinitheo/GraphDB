// utils/dashboard.ts
import type { UserRole } from '../mini-apps/types';

// Enhanced WelcomeScreen with role/time context
export const getRoleBasedDashboardConfig = (role: UserRole, timeOfDay: 'morning' | 'afternoon' | 'evening') => {
  const baseConfig: Partial<Record<UserRole, Record<typeof timeOfDay, string[]>>> = {
    Nurse: {
      morning: ['patient-prep', 'today-schedule', 'medication-review'],
      afternoon: ['patient-vitals', 'procedure-prep', 'lab-results'],
      evening: ['shift-handoff', 'documentation', 'tomorrow-prep']
    },
    Clinician: {
      morning: ['patient-rounds', 'consultations', 'test-results'],
      afternoon: ['procedures', 'follow-ups', 'referrals'],
      evening: ['charting', 'result-review', 'tomorrow-schedule']
    },
    'Practice Manager': {
      morning: ['staffing-overview', 'appointment-volume', 'billing-status'],
      afternoon: ['performance-metrics', 'supply-inventory', 'staff-scheduling'],
      evening: ['daily-report', 'compliance-check', 'tomorrow-planning']
    }
  };
  
  return baseConfig[role]?.[timeOfDay] || baseConfig[role]?.morning;
};

// Track and suggest frequently used app combinations
export const getUserWorkflowPatterns = (userId: string) => {
  // Would integrate with analytics in production
  const patterns = {
    'nurse-morning': ['Nurse Workflow', 'Patients', 'Medications'],
    'clinician-rounds': ['Patients', 'Medical Records', 'Test Ordering'],
    'admin-daily': ['Staff Scheduling', 'Appointments', 'User Management']
  };
  
  return patterns; // In real app, this would be dynamic
};
