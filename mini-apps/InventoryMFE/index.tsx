
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import InventoryDashboard from './components/InventoryDashboard';
import InventoryList from './components/InventoryList';
import KitManager from './components/KitManager';
import ExpiryManagement from './components/ExpiryManagement';
import UsageLogs from './components/UsageLogs';
import ReportsView from './components/ReportsView';
import AuditLogView from './components/AuditLogView';
import InventoryLayout from './components/InventoryLayout';
import { InventoryProvider } from './context/InventoryContext';

const InventoryMFE: React.FC = () => {
    return (
        <InventoryProvider>
            <InventoryLayout>
                <ReactRouterDOM.Routes>
                    <ReactRouterDOM.Route index element={<InventoryDashboard />} />
                    <ReactRouterDOM.Route path="list" element={<InventoryList />} />
                    <ReactRouterDOM.Route path="kits" element={<KitManager />} />
                    <ReactRouterDOM.Route path="expiry" element={<ExpiryManagement />} />
                    <ReactRouterDOM.Route path="usage" element={<UsageLogs />} />
                    <ReactRouterDOM.Route path="reports" element={<ReportsView />} />
                    <ReactRouterDOM.Route path="audit" element={<AuditLogView />} />
                    <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to="" replace />} />
                </ReactRouterDOM.Routes>
            </InventoryLayout>
        </InventoryProvider>
    );
};

export default InventoryMFE;
