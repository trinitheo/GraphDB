import React, { useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';
import type { Patient } from '../../types';
import type { TrendWidgetConfig } from '../../types';

interface TrendChartWidgetProps {
    patient: Patient;
    config: TrendWidgetConfig;
}

const TrendChartWidget: React.FC<TrendChartWidgetProps> = ({ patient, config }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);
    const { vitalKey, yMin, yMax } = config;

    const trendData = useMemo(() => {
        const vitalHistory = [...(patient.vitalsHistory || [])]
            .filter(v => v.vitals[vitalKey])
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        return {
            labels: vitalHistory.map(v => new Date(v.timestamp).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
            data: vitalHistory.map(v => parseFloat(v.vitals[vitalKey] as string)),
            label: vitalKey.toString(),
        };
    }, [patient, vitalKey]);

    useEffect(() => {
        if (!chartRef.current) return;

        const gridColor = 'rgba(0, 0, 0, 0.05)';
        const textColor = '#64748b'; // slate-500

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;
        
        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.labels,
                datasets: [{
                    label: trendData.label,
                    data: trendData.data,
                    fill: true,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: '#3b82f6', // sky-500
                    tension: 0.4,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#3b82f6',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { 
                        grid: { display: false }, 
                        ticks: { color: textColor, font: { size: 10 } } 
                    },
                    y: { 
                        grid: { color: gridColor }, 
                        ticks: { color: textColor, font: { size: 10 } },
                        min: yMin ? parseFloat(yMin) : undefined,
                        max: yMax ? parseFloat(yMax) : undefined,
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = null;
            }
        };
    }, [trendData, yMin, yMax]);

    return (
        <div className="relative h-full w-full">
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default TrendChartWidget;