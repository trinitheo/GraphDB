

/**
 * Extracts dosage information from a full drug name string.
 * Example: "atorvastatin 10 MG Oral Tablet [Lipitor]" => "10 MG"
 * @param fullName The full medication name from RxNorm.
 * @returns The extracted dosage string or an empty string if not found.
 */
export const parseMedicationName = (fullName: string): { dose: string, route: string } => {
    let dose = '';
    let route = '';

    // Regex to find a number followed by a unit (like MG, MCG, ML, etc.)
    const doseMatch = fullName.match(/(\d+(\.\d+)?\s*(mcg|mg|g|ml|iu|unit|meq))/i);
    if (doseMatch) {
        dose = doseMatch[0].toUpperCase();
    }

    // Simple route parsing
    if (fullName.toLowerCase().includes('oral')) route = 'Oral';
    if (fullName.toLowerCase().includes('topical')) route = 'Topical';
    if (fullName.toLowerCase().includes('injection')) route = 'Injection';
    if (fullName.toLowerCase().includes('intravenous')) route = 'Intravenous';
    if (fullName.toLowerCase().includes('inhalation')) route = 'Inhalation';

    return { dose, route };
};