
import type { MedicalHistoryForm } from '../types';

export const validateDemographics = (data: MedicalHistoryForm['demographics']): string[] => {
    const errors: string[] = [];
    if (!data.firstName.trim()) errors.push('First Name is required.');
    if (!data.lastName.trim()) errors.push('Last Name is required.');
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Please enter a valid email address.');
    }
    return errors;
};

export const validateComplaint = (data: MedicalHistoryForm['complaint']): string[] => {
    const errors: string[] = [];
    if (data.symptoms.length === 0) errors.push('At least one symptom or reason for visit is required.');
    return errors;
};

export const validateAssessment = (data: MedicalHistoryForm['assessment']): string[] => {
    const errors: string[] = [];
    if (data.workingDiagnosis.length === 0) errors.push('At least one working diagnosis must be selected.');
    return errors;
}

// Add more validation functions for other steps as needed...

export const validateAllSteps = (formData: MedicalHistoryForm): Record<string, string[]> => {
    const errors: Record<string, string[]> = {};
    const demographicsErrors = validateDemographics(formData.demographics);
    if (demographicsErrors.length > 0) errors['Demographics'] = demographicsErrors;

    const complaintErrors = validateComplaint(formData.complaint);
    if (complaintErrors.length > 0) errors['Chief Complaint'] = complaintErrors;

    const assessmentErrors = validateAssessment(formData.assessment);
    if (assessmentErrors.length > 0) errors['Assessment'] = assessmentErrors;
    
    return errors;
};
