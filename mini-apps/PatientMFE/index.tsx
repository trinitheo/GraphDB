import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PatientListContainer from './components/PatientListContainer';
import PatientDetailView from './components/PatientDetailView';
import AddPatientFlow from './components/add-patient/AddPatientFlow';
import { useAuth } from './hooks/useAuth';

const PatientMFE: React.FC = () => {
  const { user } = useAuth();

  // For patients, restrict access to only their own chart and related views.
  if (user?.role === 'Patient' && user.patientId) {
    return (
      <Routes>
        {/* Redirect from the list view ('/patients') to the patient's own chart */}
        <Route index element={<Navigate to={user.patientId} replace />} />
        
        {/* The route for the patient's own detailed view */}
        <Route path=":patientId" element={<PatientDetailView />} />

        {/* Redirect any other attempts (like /patients/new) back to their chart */}
        <Route path="*" element={<Navigate to={user.patientId} replace />} />
      </Routes>
    );
  }


  // Original routes for staff members who need full access
  return (
      <Routes>
        <Route index element={<PatientListContainer />} />
        <Route path="new" element={<AddPatientFlow />} />
        <Route path=":patientId" element={<PatientDetailView />} />
      </Routes>
  );
};

export default PatientMFE;