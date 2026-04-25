
import React from 'react';
import type { MiniApp, UserRole } from './mini-apps/types';
import WelcomeScreen from './mini-apps/WelcomeScreen/components/nurse-prep/WelcomeScreen';
import PatientMFE from './mini-apps/PatientMFE/index';
import MedicalRecordsMFE from './mini-apps/MedicalRecordsMFE/index';
import AppointmentsMFE from './mini-apps/AppointmentsMFE/index';
import MessagingMFE from './mini-apps/MessagingMFE/index';
import UserManagementMFE from './mini-apps/UserManagementMFE/index';
import DataStandardsMFE from './mini-apps/DataStandardsMFE/index';
import TestOrderingMFE from './mini-apps/TestOrderingMFE/index';
import MedicationsMFE from './mini-apps/MedicationsMFE/index';
import ProceduresMFE from './mini-apps/ProceduresMFE/index';
import InvestigationsDashboardMFE from './mini-apps/InvestigationsDashboardMFE/index';
import PatientPortalMFE from './mini-apps/PatientPortalMFE';
import SchedulingMFE from './mini-apps/SchedulingMFE/index';
import MyScheduleMFE from './mini-apps/MyScheduleMFE/index';
import NurseWorkflowMFE from './mini-apps/NurseWorkflowMFE/index';
import InventoryMFE from './mini-apps/InventoryMFE/index';
import GraphNetworkMFE from './mini-apps/GraphNetworkMFE/index';
import { 
    PatientIcon, 
    InvestigationsIcon, 
    MedicalRecordsIcon, 
    AppointmentsIcon, 
    MessagingIcon, 
    MedicationIcon, 
    OrderFormIcon, 
    Stethoscope, 
    DataStandardsIcon, 
    UserManagementIcon,
    HomeIcon,
    CalendarIcon,
    User,
    PlusIcon,
    InventoryIcon,
    UsersIcon
} from './components/icons';


// Differentiate between healthcare and non-healthcare staff.
export const HEALTHCARE_STAFF_ROLES: UserRole[] = ['Clinician', 'Nurse', 'AlliedHealthProfessional'];
export const NON_HEALTHCARE_STAFF_ROLES: UserRole[] = ['Practice Manager', 'Owner', 'Billing Specialist'];
// A combined list for apps accessible to all staff members.
export const ALL_STAFF_ROLES: UserRole[] = [...HEALTHCARE_STAFF_ROLES, ...NON_HEALTHCARE_STAFF_ROLES];

// Admin roles have higher-level system management permissions.
const ADMIN_ROLES: UserRole[] = ['Owner', 'Practice Manager'];
// Patient-only role for the portal
const PATIENT_ROLE: UserRole[] = ['Patient'];


export const MINI_APPS: MiniApp[] = [
  {
    path: '/',
    name: 'Dashboard',
    component: WelcomeScreen,
    icon: <HomeIcon className="w-5 h-5" />,
    roles: ALL_STAFF_ROLES,
    category: 'General',
    mobileConfig: { enabled: true },
  },
  {
    path: '/my-schedule',
    name: 'My Schedule',
    component: MyScheduleMFE,
    icon: <CalendarIcon className="w-5 h-5" />,
    roles: ALL_STAFF_ROLES,
    category: 'General',
    mobileConfig: { enabled: true },
  },
  {
    path: '/portal',
    name: 'My Health Portal',
    component: PatientPortalMFE,
    icon: <HomeIcon className="w-5 h-5 mr-3" />,
    roles: PATIENT_ROLE,
    category: 'General',
    mobileConfig: { enabled: true },
  },
  {
    path: '/patients',
    name: 'Patients',
    component: PatientMFE,
    icon: <PatientIcon className="w-5 h-5" />,
    roles: ALL_STAFF_ROLES,
    category: 'Clinical',
    mobileConfig: { enabled: true },
  },
  {
    path: '/appointments',
    name: 'Appointments',
    component: AppointmentsMFE,
    icon: <AppointmentsIcon className="w-5 h-5" />,
    roles: ALL_STAFF_ROLES,
    category: 'Clinical',
    mobileConfig: { enabled: true },
    quickActions: [
        {
            label: 'Book New',
            action: '/appointments', // The booking modal is on this page
            icon: <PlusIcon />,
            roles: ['Practice Manager', 'Owner', 'Clinician']
        }
    ]
  },
  {
    path: '/investigations',
    name: 'Investigations',
    component: InvestigationsDashboardMFE,
    icon: <InvestigationsIcon className="w-5 h-5" />,
    roles: ALL_STAFF_ROLES,
    category: 'Clinical',
    mobileConfig: { enabled: true },
  },
  {
    path: '/medical-records',
    name: 'Medical Records',
    component: MedicalRecordsMFE,
    icon: <MedicalRecordsIcon className="w-5 h-5" />,
    roles: ALL_STAFF_ROLES,
    category: 'Clinical',
    availableWhen: {
      patientSelected: true,
    }
  },
  {
    path: '/medications',
    name: 'Medications',
    component: MedicationsMFE,
    icon: <MedicationIcon className="w-5 h-5" />,
    roles: ALL_STAFF_ROLES,
    category: 'Clinical',
  },
  {
    path: '/test-ordering',
    name: 'Test Ordering',
    component: TestOrderingMFE,
    icon: <OrderFormIcon className="w-5 h-5" />,
    roles: ALL_STAFF_ROLES,
    category: 'Clinical',
  },
  {
    path: '/procedures',
    name: 'Procedures',
    component: ProceduresMFE,
    icon: <Stethoscope className="w-5 h-5" />,
    roles: ALL_STAFF_ROLES,
    category: 'Clinical',
  },
  {
    path: '/nurse-workflow',
    name: 'Nurse Workflow',
    component: NurseWorkflowMFE,
    icon: <Stethoscope className="w-5 h-5" />,
    roles: ['Nurse', 'Clinician'],
    category: 'Clinical',
    mobileConfig: { enabled: true },
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: InventoryMFE,
    icon: <InventoryIcon className="w-5 h-5" />,
    roles: ALL_STAFF_ROLES,
    category: 'Clinical',
    mobileConfig: { enabled: true },
  },
  {
    path: '/network',
    name: 'Care Network',
    component: GraphNetworkMFE,
    icon: <UsersIcon className="w-5 h-5" />,
    roles: ALL_STAFF_ROLES,
    category: 'Clinical',
    mobileConfig: { enabled: true },
  },
    {
    path: '/messaging',
    name: 'Messaging',
    component: MessagingMFE,
    icon: <MessagingIcon className="w-5 h-5" />,
    roles: ALL_STAFF_ROLES,
    category: 'General',
  },
  {
    path: '/scheduling',
    name: 'Staff Scheduling',
    component: SchedulingMFE,
    icon: <CalendarIcon className="w-5 h-5" />,
    roles: ADMIN_ROLES,
    category: 'Admin',
    mobileConfig: { enabled: true },
  },
  {
    path: '/users',
    name: 'User Management',
    component: UserManagementMFE,
    icon: <UserManagementIcon className="w-5 h-5" />,
    roles: ADMIN_ROLES,
    category: 'Admin',
  },
  {
    path: '/data-standards',
    name: 'Data Standards',
    component: DataStandardsMFE,
    icon: <DataStandardsIcon className="w-5 h-5" />,
    roles: ADMIN_ROLES,
    category: 'Admin',
  },
];

// Pre-defined workflow groups
export const WORKFLOW_GROUPS = {
  PATIENT_INTAKE: {
    name: 'New Patient Intake',
    apps: ['Patients', 'Medical Records', 'Test Ordering'],
    roles: ['Nurse', 'AlliedHealthProfessional'], // Excluded Clinician to merge into 'Clinical' category
    icon: <User className="w-5 h-5" />
  },
  DAILY_CLINICAL: {
    name: 'Clinical Rounds',
    apps: ['Patients', 'Medical Records', 'Medications', 'Procedures'],
    roles: ['Nurse', 'AlliedHealthProfessional'], // Excluded Clinician to merge into 'Clinical' category
    icon: <Stethoscope className="w-5 h-5" />
  },
  PRACTICE_MANAGEMENT: {
    name: 'Practice Management',
    apps: ['Appointments', 'Staff Scheduling', 'User Management'],
    roles: NON_HEALTHCARE_STAFF_ROLES,
    icon: <CalendarIcon className="w-5 h-5" />
  }
};


// Utility function for role-specific app filtering
export const getAppsForRole = (role: UserRole): MiniApp[] => {
  return MINI_APPS.filter(app => 
    app.roles && (app.roles.includes(role) || 
    (role === 'Patient' && app.roles.includes('Patient')))
  );
};

// Group apps by workflow context
export const getCategorizedApps = (role: UserRole) => {
  const apps = getAppsForRole(role);
  return {
    clinical: apps.filter(app => app.category === 'Clinical'),
    administrative: apps.filter(app => app.category === 'Admin'),
    general: apps.filter(app => app.category === 'General'),
  };
};