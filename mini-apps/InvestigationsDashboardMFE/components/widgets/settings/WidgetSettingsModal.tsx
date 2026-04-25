import React from 'react';
import Modal from '../../../../MedicalRecordsMFE/components/modals/Modal';
import type { Widget, Patient } from '../../../types';
import TrendChartSettingsForm from './TrendChartSettingsForm';
import RadialProgressSettingsForm from './RadialProgressSettingsForm';
import StatPillSettingsForm from './StatPillSettingsForm';

interface WidgetSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (widgetId: string, newConfig: any) => void;
    widget: Widget;
    patient: Patient;
}

const WidgetSettingsModal: React.FC<WidgetSettingsModalProps> = ({ isOpen, onClose, onSave, widget, patient }) => {

    const getTitle = () => {
        let widgetName = '';
        if (widget.type === 'trend') widgetName = 'Trend Chart';
        else if (widget.type === 'radial') widgetName = 'Lab Gauge';
        else if (widget.type === 'stat') widgetName = 'Single Stat';
        return `Settings: ${widgetName}`;
    };

    const handleSave = (newConfig: any) => {
        onSave(widget.id, newConfig);
    };

    const renderForm = () => {
        switch (widget.type) {
            case 'trend':
                return <TrendChartSettingsForm config={widget.config as any} onSave={handleSave} />;
            case 'radial':
                return <RadialProgressSettingsForm config={widget.config as any} onSave={handleSave} patient={patient} />;
            case 'stat':
                return <StatPillSettingsForm config={widget.config as any} onSave={handleSave} />;
            default:
                return <p>No settings available for this widget type.</p>;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="md">
            {renderForm()}
        </Modal>
    );
};

export default WidgetSettingsModal;
