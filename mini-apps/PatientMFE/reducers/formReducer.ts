import type { MedicalHistoryForm, Api, SnomedConcept } from '../types';

export interface FormState {
    currentStep: number;
    formData: MedicalHistoryForm;
}

export type FormAction =
    | { type: 'NEXT_STEP' }
    | { type: 'PREV_STEP' }
    | { type: 'GO_TO_STEP'; payload: number }
    | { type: 'UPDATE_FIELD'; payload: { step: keyof MedicalHistoryForm; field: string; value: any } }
    | { type: 'UPDATE_NESTED_FIELD'; payload: { step: keyof MedicalHistoryForm; nestedKey: string; field: string; value: any } }
    | { type: 'UPDATE_VITALS'; payload: { field: keyof Api.V1.Vitals; value: string } }
    | { type: 'ADD_ITEM'; payload: { step: keyof MedicalHistoryForm; field: string; item: any } }
    | { type: 'REMOVE_ITEM'; payload: { step: keyof MedicalHistoryForm; field: string; itemId: string } }
    | { type: 'ADD_DIAGNOSES'; payload: SnomedConcept[] }
    | { type: 'TOGGLE_WORKING_DIAGNOSIS'; payload: SnomedConcept }
    | { type: 'REMOVE_DIAGNOSIS'; payload: SnomedConcept }
    | { type: 'RESTORE_DRAFT', payload: MedicalHistoryForm };

export const initialState: FormState = {
    currentStep: 1,
    formData: {
        demographics: {
            firstName: '',
            middleName: '',
            lastName: '',
            dob: '', age: '', gender: '', sex: '',
            phone: '', email: '', address: '', bloodType: 'Unknown',
            insuranceProvider: '', policyNumber: '', groupNumber: '',
        },
        complaint: {
            symptoms: [],
            timeline: '',
        },
        history: {
            medicalHistory: [],
            surgicalHistory: [],
            allergies: [],
            hasAllergies: 'No',
            medications: [],
            familyHistory: [],
            socialHistory: {
                smokingStatus: '',
                alcoholConsumption: '',
                recreationalDrugUse: 'No',
                occupation: '',
                livingSituation: '',
                diet: '',
            },
            womensHealth: {
                lmp: '', periodsRegular: '', pregnancies: '', liveBirths: '', possibilityOfPregnancy: '',
                lastPapSmearDate: '', lastPapSmearResult: '', lastMammogramDate: '', lastMammogramResult: '',
            },
            reviewOfSystems: {
                general: [],
                skin: [],
                heent: [],
                cardiovascular: [],
                respiratory: [],
                gastrointestinal: [],
                genitourinary: [],
                musculoskeletal: [],
                neurological: [],
                endocrine: [],
                psychiatric: [],
            },
            historySummary: '',
        },
        examination: {
            vitals: {
                heartRate: '', bloodPressure: '', temperature: '', respRate: '', spO2: '',
                weight: '', height: '', bmi: '', glucose: '', hba1c: '', gcs: '', avpu: '',
            },
            systems: {
                general: '', heent: '', skin: '', cardiovascular: '', respiratory: '',
                abdominal: '', musculoskeletal: '', neurological: '', psychiatric: ''
            },
        },
        assessment: {
            differentialDiagnosis: [],
            workingDiagnosis: [],
        },
        plan: {
            treatments: '', followUp: '',
            pendingReferrals: [],
            pendingOrders: [],
        },
    },
};

export const formReducer = (state: FormState, action: FormAction): FormState => {
    switch (action.type) {
        case 'NEXT_STEP':
            return { ...state, currentStep: Math.min(state.currentStep + 1, 7) };
        case 'PREV_STEP':
            return { ...state, currentStep: Math.max(state.currentStep - 1, 1) };
        case 'GO_TO_STEP':
            return { ...state, currentStep: action.payload };
        case 'RESTORE_DRAFT':
            return { ...state, formData: action.payload };
        case 'UPDATE_FIELD': {
            const { step, field, value } = action.payload;
            return {
                ...state,
                formData: {
                    ...state.formData,
                    [step]: {
                        ...state.formData[step],
                        [field]: value,
                    },
                },
            };
        }
        case 'UPDATE_NESTED_FIELD': {
            const { step, nestedKey, field, value } = action.payload;
            return {
                ...state,
                formData: {
                    ...state.formData,
                    [step]: {
                        ...state.formData[step],
                        [nestedKey]: {
                            ...(state.formData[step] as any)[nestedKey],
                            [field]: value,
                        },
                    },
                },
            };
        }
        case 'UPDATE_VITALS': {
            const { field, value } = action.payload;
            return {
                ...state,
                formData: {
                    ...state.formData,
                    examination: {
                        ...state.formData.examination,
                        vitals: {
                            ...state.formData.examination.vitals,
                            [field]: value,
                        },
                    },
                },
            };
        }
        case 'ADD_ITEM': {
            const { step, field, item } = action.payload;
            const newItem = { ...item, id: `temp_${crypto.randomUUID()}` };
            const list = (state.formData[step] as any)[field] || [];
            return {
                ...state,
                formData: {
                    ...state.formData,
                    [step]: {
                        ...state.formData[step],
                        [field]: [...list, newItem],
                    },
                },
            };
        }
        case 'REMOVE_ITEM': {
            const { step, field, itemId } = action.payload;
            const list = (state.formData[step] as any)[field] || [];
            return {
                ...state,
                formData: {
                    ...state.formData,
                    [step]: {
                        ...state.formData[step],
                        [field]: list.filter((item: any) => item.id !== itemId),
                    },
                },
            };
        }
        case 'ADD_DIAGNOSES': {
            const existingCodes = new Set(state.formData.assessment.differentialDiagnosis.map((d) => d.code));
            const newItems = action.payload.filter((dx) => !existingCodes.has(dx.code));

            return {
                ...state,
                formData: {
                    ...state.formData,
                    assessment: {
                        ...state.formData.assessment,
                        differentialDiagnosis: [...state.formData.assessment.differentialDiagnosis, ...newItems],
                    }
                }
            };
        }
        case 'TOGGLE_WORKING_DIAGNOSIS': {
            const dx = action.payload;
            const exists = state.formData.assessment.workingDiagnosis.some((w) => w.code === dx.code);

            return {
                ...state,
                formData: {
                    ...state.formData,
                    assessment: {
                        ...state.formData.assessment,
                        workingDiagnosis: exists
                            ? state.formData.assessment.workingDiagnosis.filter((w) => w.code !== dx.code)
                            : [...state.formData.assessment.workingDiagnosis, dx],
                    }
                }
            };
        }
        case 'REMOVE_DIAGNOSIS': {
            const dx = action.payload;

            return {
                ...state,
                formData: {
                    ...state.formData,
                    assessment: {
                        ...state.formData.assessment,
                        differentialDiagnosis: state.formData.assessment.differentialDiagnosis.filter(
                            (d) => d.code !== dx.code
                        ),
                        workingDiagnosis: state.formData.assessment.workingDiagnosis.filter(
                            (w) => w.code !== dx.code
                        ),
                    }
                }
            };
        }
        default:
            return state;
    }
};