import React, { useMemo } from 'react';
import type { Patient } from '../../types';
import type { RadialWidgetConfig } from '../../types';
import { usePatientInvestigations } from '../../hooks/usePatientInvestigations';
import { calculateProgress } from '../../utils/labCalculations';

interface RadialProgressWidgetProps {
    patient: Patient;
    config: RadialWidgetConfig;
}

const RadialProgressWidget: React.FC<RadialProgressWidgetProps> = ({ patient, config }) => {
    const { availableLabResults } = usePatientInvestigations(patient);
    
    const labResult = useMemo(() => {
        return availableLabResults.find(r => r.testName === config.testName);
    }, [availableLabResults, config.testName]);

    if (!labResult) {
        return (
            <div className="flex items-center justify-center h-full text-center text-sm text-slate-400 p-2">
                <div>
                    Data for<br/>
                    <strong className="text-slate-500">{config.testName}</strong>
                    <br/>not available.
                </div>
            </div>
        );
    }

    const { value, unit, referenceRange } = labResult;
    const { percentage, color } = calculateProgress(value, referenceRange, config.customRange);
    
    const sqSize = 150;
    const strokeWidth = 14;
    const radius = (sqSize - strokeWidth) / 2;
    const viewBox = `0 0 ${sqSize} ${sqSize}`;
    const dashArray = radius * Math.PI * 2;
    const dashOffset = dashArray - (dashArray * percentage) / 100;

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <svg width="100%" height="100%" viewBox={viewBox} className="max-w-[150px] max-h-[150px]">
                <circle
                    className="fill-none stroke-slate-200"
                    cx={sqSize / 2}
                    cy={sqSize / 2}
                    r={radius}
                    strokeWidth={`${strokeWidth}px`}
                />
                <circle
                    className="fill-none transition-all duration-1000 ease-out"
                    stroke={color}
                    cx={sqSize / 2}
                    cy={sqSize / 2}
                    r={radius}
                    strokeWidth={`${strokeWidth}px`}
                    transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
                    style={{
                        strokeDasharray: dashArray,
                        strokeDashoffset: dashOffset,
                        strokeLinecap: 'round'
                    }}
                />
                <text
                    x="50%"
                    y="50%"
                    dy="0.1em"
                    textAnchor="middle"
                    className="fill-current text-slate-800 text-2xl font-bold"
                >
                    {value}
                    <tspan className="text-lg font-semibold" dx="2">{unit}</tspan>
                </text>
                <text
                    x="50%"
                    y="50%"
                    dy="1.6em"
                    textAnchor="middle"
                    className="fill-current text-slate-500 text-xs"
                >
                    Ref: {config.customRange ? `${config.customRange.min} - ${config.customRange.max}` : referenceRange}
                </text>
            </svg>
        </div>
    );
};

export default RadialProgressWidget;