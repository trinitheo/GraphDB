import React, { useState, useMemo } from 'react';
import Modal from '../../MedicalRecordsMFE/components/modals/Modal';
import { usePatientInvestigations, TRENDABLE_VITALS, STAT_VITALS } from '../hooks/usePatientInvestigations';
import type { Patient, WidgetType } from '../types';
import { GaugeIcon, TrendIcon, StatIcon } from '../../../components/icons';

interface AddWidgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddWidget: (type: WidgetType, config: any) => void;
    patient: Patient;
}

const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ isOpen, onClose, onAddWidget, patient }) => {
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState<WidgetType | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { availableLabResults } = usePatientInvestigations(patient);

    const handleSelectType = (type: WidgetType) => {
        setSelectedType(type);
        setStep(2);
    };

    const handleAdd = (config: any) => {
        if (selectedType) {
            onAddWidget(selectedType, config);
        }
        handleClose();
    };
    
    const handleClose = () => {
        setStep(1);
        setSelectedType(null);
        setSearchTerm('');
        onClose();
    };

    const filteredLabResults = useMemo(() => {
        if (!searchTerm) return availableLabResults;
        return availableLabResults.filter(r => r.testName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [availableLabResults, searchTerm]);

    const filteredTrendVitals = useMemo(() => {
        if (!searchTerm) return TRENDABLE_VITALS;
        return TRENDABLE_VITALS.filter(v => v.label.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm]);

    const filteredStatVitals = useMemo(() => {
        if (!searchTerm) return STAT_VITALS;
        return STAT_VITALS.filter(v => v.label.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm]);


    const renderStepContent = () => {
        if (step === 1) {
            return (
                <div className="space-y-4">
                    <button 
                        onClick={() => handleSelectType('radial')} 
                        className="w-full flex items-start text-left p-4 rounded-lg transition-all border border-slate-200 hover:bg-sky-50 hover:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                        <div className="p-3 bg-sky-100 rounded-lg mr-4">
                            <GaugeIcon className="w-6 h-6 text-sky-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Lab Gauge</h3>
                            <p className="text-sm text-slate-500">Visualize a single lab result against its normal range.</p>
                        </div>
                    </button>
                    <button 
                        onClick={() => handleSelectType('trend')} 
                        className="w-full flex items-start text-left p-4 rounded-lg transition-all border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <div className="p-3 bg-emerald-100 rounded-lg mr-4">
                            <TrendIcon className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Trend Chart</h3>
                            <p className="text-sm text-slate-500">Track a vital sign or lab result over time.</p>
                        </div>
                    </button>
                    <button 
                        onClick={() => handleSelectType('stat')} 
                        className="w-full flex items-start text-left p-4 rounded-lg transition-all border border-slate-200 hover:bg-violet-50 hover:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                        <div className="p-3 bg-violet-100 rounded-lg mr-4">
                            <StatIcon className="w-6 h-6 text-violet-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Single Stat</h3>
                            <p className="text-sm text-slate-500">Display the latest value for a key metric.</p>
                        </div>
                    </button>
                </div>
            );
        }

        if (step === 2) {
            return (
                <div>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 mb-4 border rounded-md bg-white border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    <div className="max-h-64 overflow-y-auto scrollbar-autohide">
                        {selectedType === 'radial' && filteredLabResults.map(result => (
                            <button key={result.testName} onClick={() => handleAdd({ testName: result.testName })} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 rounded">
                                {result.testName}
                            </button>
                        ))}
                        {selectedType === 'trend' && filteredTrendVitals.map(vital => (
                            <button key={vital.key} onClick={() => handleAdd({ vitalKey: vital.key })} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 rounded">
                                {vital.label}
                            </button>
                        ))}
                        {selectedType === 'stat' && filteredStatVitals.map(vital => (
                            <button key={vital.key} onClick={() => handleAdd({ vitalKey: vital.key, title: vital.label })} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 rounded">
                                {vital.label}
                            </button>
                        ))}
                    </div>
                </div>
            );
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={step === 1 ? "Select Widget Type" : "Select Item"}
            size="md"
        >
            {renderStepContent()}
        </Modal>
    );
};

export default AddWidgetModal;
