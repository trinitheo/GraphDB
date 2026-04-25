export const calculateProgress = (
    valueStr: string,
    rangeStr: string,
    customRange?: { min: string, max: string }
): { percentage: number, color: string, status: 'Normal' | 'High' | 'Low' } => {
    
    const value = parseFloat(valueStr);
    
    let min: number, max: number;

    if (customRange && customRange.min && customRange.max) {
        min = parseFloat(customRange.min);
        max = parseFloat(customRange.max);
    } else {
        if (!rangeStr.includes('-')) {
             return { percentage: 0, color: '#94a3b8', status: 'Normal' };
        }
        [min, max] = rangeStr.split('-').map(s => parseFloat(s.trim()));
    }

    if (isNaN(value) || isNaN(min) || isNaN(max)) {
        return { percentage: 0, color: '#94a3b8', status: 'Normal' }; // Slate color for indeterminate
    }

    let percentage: number;
    let color: string;
    let status: 'Normal' | 'High' | 'Low';

    if (value >= min && value <= max) {
        // Normal range: scale from 25% to 75% of the bar for visual variation
        const normalizedValue = max - min === 0 ? 0.5 : ((value - min) / (max - min)) * 0.5 + 0.25;
        percentage = normalizedValue * 100;
        color = '#22c55e'; // Green
        status = 'Normal';
    } else if (value > max) {
        // High: scale from 75% to 100%
        const overflow = Math.min(value, max * 1.5); // Cap at 150% of max
        const normalizedValue = max === 0 ? 1 : ((overflow - max) / (max * 0.5)) * 0.25 + 0.75;
        percentage = Math.min(100, normalizedValue * 100);
        color = '#ef4444'; // Red
        status = 'High';
    } else { // value < min
        // Low: scale from 0% to 25%
        const underflow = Math.max(value, min * 0.5); // Cap at 50% of min
        const normalizedValue = min === 0 ? 0 : (underflow / min) * 0.25;
        percentage = Math.max(0, normalizedValue * 100);
        color = '#f59e0b'; // Amber/Yellow
        status = 'Low';
    }

    return { percentage, color, status };
};