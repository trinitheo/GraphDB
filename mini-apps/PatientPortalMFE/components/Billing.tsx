import React from 'react';
// FIX: Add missing icon import
import { ReceiptRefundIcon } from '../../../components/icons';

const Billing: React.FC = () => {
    return (
        <div className="card-panel p-6 md:p-8 text-center">
            <ReceiptRefundIcon className="w-16 h-16 mx-auto text-slate-400" />
            <h2 className="text-3xl font-bold text-slate-900 mt-4 mb-2">Billing & Payments</h2>
            <p className="text-slate-600 max-w-md mx-auto">
                This feature is coming soon. You will be able to view statements, see your payment history, and make secure online payments.
            </p>
        </div>
    );
};

export default Billing;