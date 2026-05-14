import React from 'react';
import AppointmentsDashboard from './components/AppointmentsDashboard';

// Export for use in other MFEs (like PatientMFE)
export { AppointmentsDashboard };

// Default export is for the shell router
const AppointmentsMFE: React.FC = () => {
    return (
        <div className="animate-fade-in h-full">
            <AppointmentsDashboard />
        </div>
    );
};

export default AppointmentsMFE;
