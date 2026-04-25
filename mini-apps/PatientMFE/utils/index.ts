/**
 * Parses a numerical value from a string, ignoring non-numeric characters.
 * @param value - The string value, which may contain units (e.g., "80 kg").
 * @returns The parsed number or null if parsing fails.
 */
export const parseVitalValue = (value: string | number | undefined): number | null => {
    if (value === undefined || value === null) return null;
    const stringValue = String(value);
    const parsed = parseFloat(stringValue.replace(/[^0-9.-]+/g, ""));
    return isNaN(parsed) ? null : parsed;
};


/**
 * Calculates Body Mass Index (BMI).
 * @param heightCm - Height in centimeters.
 * @param weightKg - Weight in kilograms.
 * @returns BMI as a string with one decimal place, or an empty string if inputs are invalid.
 */
export const calculateBmi = (heightCm: string, weightKg: string): string => {
    const heightM = parseVitalValue(heightCm);
    const weight = parseVitalValue(weightKg);

    if (heightM && weight && heightM > 0 && weight > 0) {
        const heightInMeters = heightM / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        return bmi.toFixed(1);
    }
    
    return '';
};

/**
 * Calculates age from a date of birth string.
 * @param dob - Date of birth in 'YYYY-MM-DD' format.
 * @returns The calculated age as a string, or 'Not set' if invalid.
 */
export const calculateAge = (dob: string): string => {
    if (!dob) return 'Not set';
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return 'Not set';
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= 0 ? age.toString() : 'Not set';
};
