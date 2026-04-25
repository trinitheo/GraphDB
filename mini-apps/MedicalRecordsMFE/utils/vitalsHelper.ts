import type { Vitals } from '../types';

const parseValue = (value: string | undefined): number | null => {
    if (value === undefined || value === null) return null;
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? null : parsed;
};

/**
 * Checks if a given vital sign value is outside the normal range.
 * @param key - The key of the vital sign (e.g., 'heartRate').
 * @param value - The string value of the vital sign.
 * @returns `true` if the vital is abnormal, otherwise `false`.
 */
export const isVitalAbnormal = (key: keyof Vitals, value: string): boolean => {
    const numValue = parseValue(value);
    
    // Some values like AVPU are strings and don't have a numeric abnormal state.
    // Also, if a numeric value can't be parsed, we don't flag it.
    if (numValue === null && key !== 'bloodPressure') return false;

    switch (key) {
        case 'heartRate':
            return numValue! < 60 || numValue! > 100;
        case 'bloodPressure':
            const parts = value.split('/');
            if (parts.length !== 2) return false;
            const systolic = parseInt(parts[0], 10);
            const diastolic = parseInt(parts[1], 10);
            if (isNaN(systolic) || isNaN(diastolic)) return false;
            return systolic >= 130 || diastolic >= 85 || systolic < 90;
        case 'temperature':
            return numValue! < 36.5 || numValue! > 37.5;
        case 'respRate':
            return numValue! < 12 || numValue! > 20;
        case 'spO2':
            return numValue! < 95;
        case 'hba1c':
            // Abnormal (warning/high) if pre-diabetic or higher
            return numValue! >= 5.7;
        case 'glucose':
            // Abnormal if hypoglycemic or hyperglycemic (fasting)
            return numValue! < 70 || numValue! > 100;
        case 'bmi':
            // Abnormal if underweight or overweight
            return numValue! < 18.5 || numValue! >= 25;
        case 'gcs':
             // Abnormal if not a perfect score
            return numValue !== 15;
        default:
            return false;
    }
};
