
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessagingProvider, useMessaging } from './context/MessagingContext';
import { useAuth } from '../PatientMFE/hooks/useAuth';
import { HEALTHCARE_STAFF_ROLES, NON_HEALTHCARE_STAFF_ROLES } from '../../constants';
import HealthcareMessagingDashboard from './dashboards/HealthcareMessagingDashboard';
import NonHealthcareMessagingDashboard from './dashboards/NonHealthcareMessagingDashboard';
import PatientMessagingDashboard from './dashboards/PatientMessagingDashboard';

const MessagingController: React.FC<{ targetUserId?: string }> = ({ targetUserId }) => {
    const { user } = useAuth();
    const { allUsers, startConversation, activeConversationId } = useMessaging();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Priority 1: Direct prop from Patient Chart
        // Priority 2: Location state from navigation redirects
        const recipientId = targetUserId || location.state?.defaultRecipientId;

        if (recipientId && allUsers.length > 0 && !activeConversationId) {
            const recipient = allUsers.find(u => u.id === recipientId);
            if (recipient) {
                startConversation(recipient);
                // Clean up location state if it was used for navigation
                if (location.state?.defaultRecipientId) {
                    navigate(location.pathname, { replace: true, state: {} });
                }
            }
        }
    }, [targetUserId, location.state, allUsers, startConversation, navigate, activeConversationId, location.pathname]);

    if (!user) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    if (HEALTHCARE_STAFF_ROLES.includes(user.role)) {
        return <HealthcareMessagingDashboard />;
    }
    
    if (NON_HEALTHCARE_STAFF_ROLES.includes(user.role)) {
        return <NonHealthcareMessagingDashboard />;
    }

    if (user.role === 'Patient') {
        return <PatientMessagingDashboard />;
    }

    return <div className="card-panel p-6 text-slate-500">Messaging is not configured for your role.</div>;
};

const MessagingMFE = ({ targetUserId }: { targetUserId?: string }) => {
    return (
        <div className="animate-fade-in h-full">
            <MessagingProvider>
                <MessagingController targetUserId={targetUserId} />
            </MessagingProvider>
        </div>
    );
};

export default MessagingMFE;
