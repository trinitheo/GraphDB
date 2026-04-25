import React, { useMemo } from 'react';
import type { Patient, Vitals } from '../../types';
import type { StatWidgetConfig } from '../../types';
import { VITAL_UNITS } from '../../../PatientMFE/types';
import { HeartIcon, BloodPressureIcon } from '../../../../components/icons';

interface StatPillWidgetProps {
    patient: Patient;
    config: StatWidgetConfig;
}

const VitalIcons: { [key in keyof Vitals]?: React.FC<{className?: string}> } = {
    heartRate: HeartIcon,
    bloodPressure: BloodPressureIcon,
};

const StatPillWidget: React.FC<StatPillWidgetProps> = ({ patient, config }) => {
    const { vitalKey } = config;

    const vitalData = useMemo(() => {
        if (!patient.latestVitals || !(vitalKey in patient.latestVitals) || !patient.latestVitals[vitalKey]) {
            return { value: '--', unit: '' };
        }
        return {
            value: patient.latestVitals[vitalKey],
            unit: VITAL_UNITS[vitalKey as string] || '',
        };
    }, [patient, vitalKey]);

    const Icon = VitalIcons[vitalKey];

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-2">
            {Icon && (
                <Icon className="w-6 h-6 text-slate-500 mb-2" />
            )}
            
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{config.title}</p>
            
            <div className="flex items-baseline gap-1 mt-1">
                <p className="text-4xl font-bold text-slate-800">
                    {vitalData.value}
                </p>
                <p className="text-lg font-medium text-slate-500">
                    {vitalData.unit}
                </p>
            </div>
        </div>
    );
};

export default StatPillWidget;
