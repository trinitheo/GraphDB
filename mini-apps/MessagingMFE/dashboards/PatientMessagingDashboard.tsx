import React from 'react';
import ContactList from '../components/shared/ContactList';
import ChatWindow from '../components/shared/ChatWindow';

const PatientMessagingDashboard: React.FC = () => {
    return (
        <div className="card-panel h-full flex flex-col md:flex-row gap-0 md:gap-4 md:p-4 overflow-hidden">
            <aside className="w-full md:w-1/3 lg:w-1/4 border-r border-slate-200">
                <ContactList />
            </aside>
            <main className="flex-1 min-w-0 h-full">
                <ChatWindow />
            </main>
        </div>
    );
};

export default PatientMessagingDashboard;