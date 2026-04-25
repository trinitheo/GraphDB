import React, { useState } from 'react';
import type { Widget, Patient } from '../types';
import WidgetWrapper from './widgets/WidgetWrapper';
import RadialProgressWidget from './widgets/RadialProgressWidget';
import TrendChartWidget from './widgets/TrendChartWidget';
import StatPillWidget from './widgets/StatPillWidget';

interface DashboardProps {
    patient: Patient | null | undefined;
    isManageMode: boolean;
    widgets: Widget[];
    setWidgets: (widgets: Widget[]) => void;
    setEditingWidgetId: (id: string | null) => void;
}

const getStorageKey = (patientId: string) => `dashboardWidgets_${patientId}`;

const Dashboard: React.FC<DashboardProps> = ({ patient, isManageMode, widgets, setWidgets, setEditingWidgetId }) => {
    const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);

    const saveWidgets = (newWidgets: Widget[]) => {
        setWidgets(newWidgets);
        if (patient) {
            localStorage.setItem(getStorageKey(patient.id), JSON.stringify(newWidgets));
        }
    };
    
    const handleRemoveWidget = (widgetId: string) => {
        saveWidgets(widgets.filter(w => w.id !== widgetId));
    };

    const handleUpdateWidgetSize = (widgetId: string) => {
        saveWidgets(widgets.map(w => w.id === widgetId ? { ...w, gridSpan: (w.gridSpan || 1) === 1 ? 2 : 1 } : w));
    };

    const handleDragStart = (widgetId: string) => setDraggedWidgetId(widgetId);
    const handleDragEnd = () => setDraggedWidgetId(null);

    const handleDrop = (targetWidgetId: string) => {
        if (!draggedWidgetId || draggedWidgetId === targetWidgetId) {
            setDraggedWidgetId(null);
            return;
        }
        const draggedIndex = widgets.findIndex(w => w.id === draggedWidgetId);
        const targetIndex = widgets.findIndex(w => w.id === targetWidgetId);
        if (draggedIndex === -1 || targetIndex === -1) return;

        const newWidgets = [...widgets];
        const [draggedItem] = newWidgets.splice(draggedIndex, 1);
        newWidgets.splice(targetIndex, 0, draggedItem);
        
        saveWidgets(newWidgets);
        setDraggedWidgetId(null);
    };

    const renderWidget = (widget: Widget) => {
        if (!patient) return null;
        
        let title = '';
        if ('title' in widget.config && widget.config.title) title = widget.config.title;
        else if ('testName' in widget.config) title = widget.config.testName;
        else if ('vitalKey' in widget.config) title = (widget.config as any).vitalKey;

        return (
            <WidgetWrapper
                key={widget.id}
                widgetId={widget.id}
                title={title}
                onRemove={() => handleRemoveWidget(widget.id)}
                gridSpan={widget.gridSpan}
                isManageMode={isManageMode}
                onUpdateSize={() => handleUpdateWidgetSize(widget.id)}
                onOpenSettings={() => setEditingWidgetId(widget.id)}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                isBeingDragged={draggedWidgetId === widget.id}
            >
                {widget.type === 'radial' && <RadialProgressWidget patient={patient} config={widget.config as any} />}
                {widget.type === 'trend' && <TrendChartWidget patient={patient} config={widget.config as any} />}
                {widget.type === 'stat' && <StatPillWidget patient={patient} config={widget.config as any} />}
            </WidgetWrapper>
        );
    };

    return (
        <>
            {!patient ? (
                 <div className="flex items-center justify-center h-full">
                    <div className="text-center p-8 text-slate-500">Select a patient to view dashboard.</div>
                 </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {widgets.map(renderWidget)}
                </div>
            )}
        </>
    );
};

export default Dashboard;
