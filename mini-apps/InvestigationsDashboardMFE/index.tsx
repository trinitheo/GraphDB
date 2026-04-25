import React, { useState, useEffect } from 'react';
import type { Widget, Patient, Order } from './types';
import Dashboard from './components/Dashboard';
import ImagesView from './components/ImagesView';
import InvestigationsNav from './components/InvestigationsNav';
import AddWidgetModal from './components/AddWidgetModal';
import WidgetSettingsModal from './components/widgets/settings/WidgetSettingsModal';
import { PlusIcon, EditIcon } from '../../components/icons';
import { usePatients } from '../PatientMFE/context/PatientContext';
import { NewOrderModal } from '../TestOrderingMFE';

const defaultWidgets: Widget[] = [
    { id: 'stat-hr', type: 'stat', config: { vitalKey: 'heartRate', title: 'Heart Rate' } },
    { id: 'stat-bp', type: 'stat', config: { vitalKey: 'bloodPressure', title: 'Blood Pressure' } },
    { id: 'radial-hba1c', type: 'radial', config: { testName: 'HbA1c' } },
    { id: 'trend-weight', type: 'trend', config: { vitalKey: 'weight' }, gridSpan: 2 },
    { id: 'radial-hba1c-2', type: 'radial', config: { testName: 'HbA1c' } },
    { id: 'radial-bun', type: 'radial', config: { testName: 'BUN' } },
];

const getStorageKey = (patientId: string | null) => `dashboardWidgets_${patientId}`;

const InvestigationsDashboardMFE: React.FC = () => {
    const [activeView, setActiveView] = useState('Dashboard');
    const { state: { list: patients, loading: patientsLoading }, addOrder } = usePatients();
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    
    // State lifted from Dashboard
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isManageMode, setIsManageMode] = useState(false);
    const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);
    const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

    useEffect(() => {
        if (patients.length > 0 && !selectedPatientId) {
            const firstPatient = patients.find(p => !p.archived) || patients[0];
            if (firstPatient) setSelectedPatientId(firstPatient.id);
        }
    }, [patients, selectedPatientId]);

    useEffect(() => {
        if (!selectedPatientId) return;
        const key = getStorageKey(selectedPatientId);
        const savedWidgets = localStorage.getItem(key);
        if (savedWidgets) {
            try { setWidgets(JSON.parse(savedWidgets)); } catch (e) { setWidgets(defaultWidgets); }
        } else {
            setWidgets(defaultWidgets);
        }
    }, [selectedPatientId]);
    
    const saveWidgets = (newWidgets: Widget[]) => {
        setWidgets(newWidgets);
        if (selectedPatientId) {
            localStorage.setItem(getStorageKey(selectedPatientId), JSON.stringify(newWidgets));
        }
    };

    const handleAddWidget = (type: Widget['type'], config: any) => {
        const newWidget: Widget = {
            id: `${type}-${Date.now()}`, type, config, gridSpan: type === 'trend' ? 2 : 1,
        };
        saveWidgets([...widgets, newWidget]);
    };
    
    const handleSaveWidgetSettings = (widgetId: string, newConfig: any) => {
        saveWidgets(widgets.map(w => w.id === widgetId ? { ...w, config: newConfig } : w));
        setEditingWidgetId(null);
    };

    const handleSaveOrder = async (orderData: Omit<Order, 'id' | 'patientId' | 'orderDate' | 'status' | 'orderingPhysician'>) => {
        if (!selectedPatient) return;
        await addOrder(selectedPatient.id, orderData);
        setIsNewOrderModalOpen(false);
    };

    const selectedPatient = patients.find(p => p.id === selectedPatientId);
    const widgetToEdit = widgets.find(w => w.id === editingWidgetId);

    const renderHeader = () => (
        <header className="card-panel p-4 flex-shrink-0 flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Investigations</h1>
            </div>
            {!patientsLoading && patients.length > 0 && (
                <div className="flex items-center gap-4">
                    <select
                        value={selectedPatientId || ''}
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                    >
                        {patients.filter(p => !p.archived).map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    {activeView === 'Dashboard' && (
                        <>
                            <button onClick={() => setIsAddModalOpen(true)} disabled={!selectedPatient} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
                               <PlusIcon className="w-5 h-5" /> Add Widget
                            </button>
                            <button onClick={() => setIsManageMode(prev => !prev)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors">
                               <EditIcon className="w-5 h-5" />
                               Manage
                            </button>
                        </>
                    )}
                    {activeView === 'Images' && (
                        <button 
                            onClick={() => setIsNewOrderModalOpen(true)} 
                            disabled={!selectedPatient} 
                            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                           <PlusIcon className="w-5 h-5" /> Order New Study
                        </button>
                    )}
                </div>
            )}
        </header>
    );

    const renderContent = () => {
        if (patientsLoading && !selectedPatient) {
            return (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-8 text-slate-500">Loading patient data...</div>
                </div>
            );
        }

        switch (activeView) {
            case 'Dashboard':
                return <Dashboard patient={selectedPatient} isManageMode={isManageMode} widgets={widgets} setWidgets={saveWidgets} setEditingWidgetId={setEditingWidgetId} />;
            case 'Images':
                return <ImagesView patient={selectedPatient} />;
            default:
                return null;
        }
    };

    return (
        <>
            <div className="animate-fade-in h-full flex flex-col lg:flex-row lg:gap-4">
                <InvestigationsNav activeView={activeView} onViewChange={setActiveView} />
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                    {renderHeader()}
                    <main className="flex-1 overflow-y-auto pr-2 pb-24 lg:pb-0">
                        {renderContent()}
                    </main>
                </div>
            </div>
            
            {selectedPatient && (
                 <AddWidgetModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddWidget={handleAddWidget} patient={selectedPatient} />
            )}
            {widgetToEdit && selectedPatient && (
                <WidgetSettingsModal isOpen={!!widgetToEdit} onClose={() => setEditingWidgetId(null)} onSave={handleSaveWidgetSettings} widget={widgetToEdit} patient={selectedPatient} />
            )}
            {selectedPatient && (
                <NewOrderModal
                    isOpen={isNewOrderModalOpen}
                    onClose={() => setIsNewOrderModalOpen(false)}
                    onSave={handleSaveOrder}
                    patient={selectedPatient}
                />
            )}
        </>
    );
};
export default InvestigationsDashboardMFE;
