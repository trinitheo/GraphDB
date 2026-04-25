import React from 'react';
import { useAuth } from '../../PatientMFE/hooks/useAuth';
import * as ReactRouterDOM from 'react-router-dom';
import OwnerDashboard from './dashboard/OwnerDashboard';
import ClinicianDashboard from './dashboard/ClinicianDashboard';
import NurseDashboard from './dashboard/NurseDashboard';
import AlliedHealthDashboard from './dashboard/AlliedHealthDashboard';
import PracticeManagerDashboard from './dashboard/PracticeManagerDashboard';
import BillingSpecialistDashboard from './dashboard/BillingSpecialistDashboard';

export const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading dashboard...</div>;
  }

  switch (user.role) {
    case 'Owner':
      return <OwnerDashboard />;
    case 'Practice Manager':
      return <PracticeManagerDashboard />;
    case 'Clinician':
      return <ClinicianDashboard />;
    case 'Nurse':
      return <NurseDashboard />;
    case 'AlliedHealthProfessional':
      return <AlliedHealthDashboard />;
    case 'Billing Specialist':
      return <BillingSpecialistDashboard />;
    case 'Patient':
      // Redirect patients to their dedicated portal
      return <ReactRouterDOM.Navigate to="/portal" replace />;
    default:
      return <div className="card-panel p-6">No dashboard available for your role.</div>;
  }
};