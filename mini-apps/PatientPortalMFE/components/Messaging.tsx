import React from 'react';
import MessagingMFE from '../../MessagingMFE';

const Messaging: React.FC = () => {
    return (
        <div className="h-full">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Secure Messaging</h1>
            <div className="h-[calc(100vh-12rem)]">
                <MessagingMFE />
            </div>
        </div>
    );
};

export default Messaging;