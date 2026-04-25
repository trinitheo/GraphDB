import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import PatientPortalNav from './components/PatientPortalNav';
import Dashboard from './components/Dashboard';
import Appointments from './components/Appointments';
import MedicalRecords from './components/MedicalRecords';
import Medications from './components/Medications';
import Messaging from './components/Messaging';
import Billing from './components/Billing';

const PatientPortalMFE: React.FC = () => {
    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full animate-fade-in">
            <PatientPortalNav />
            <main className="flex-1 overflow-y-auto">
                <ReactRouterDOM.Routes>
                    <ReactRouterDOM.Route index element={<Dashboard />} />
                    <ReactRouterDOM.Route path="appointments" element={<Appointments />} />
                    <ReactRouterDOM.Route path="records" element={<MedicalRecords />} />
                    <ReactRouterDOM.Route path="medications" element={<Medications />} />
                    <ReactRouterDOM.Route path="messages" element={<Messaging />} />
                    <ReactRouterDOM.Route path="billing" element={<Billing />} />
                    <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to="" replace />} />
                </ReactRouterDOM.Routes>
            </main>
        </div>
    );
};

export default PatientPortalMFE;