import crypto from 'crypto';

export const calculateAge = (dob: string): string => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age.toString();
};

const BEN_CARTER_ID = 'pat_ben_carter_123';
const OLIVIA_RODRIGUEZ_ID = 'pat_olivia_rodriguez_456';
const ELEANOR_VANCE_ID = 'pat_eleanor_vance_789';

let patients: any[] = [
  {
    id: BEN_CARTER_ID,
    userId: 'usr_ben_carter_123',
    name: 'Benjamin Carter',
    age: '42',
    gender: 'Man',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
    archived: false,
    dob: '1982-05-20',
    sex: 'Male',
    address: '123 Wellness Way, Healthville, ST 12345',
    phone: '555-0101',
    email: 'b.carter@personal.com',
    bloodType: 'O+',
    lastVisit: '2024-07-28',
    occupation: 'Software Engineer',
    insuranceProvider: 'BlueCross Health',
    policyNumber: 'XG123456789',
    groupNumber: 'BC-GRP-987',
    nextOfKin: { name: 'Sarah Carter', relation: 'Spouse', phone: '555-0102' },
    latestVitals: {
      timestamp: '2024-07-28T09:15:00Z',
      heartRate: '74', bloodPressure: '135/85', temperature: '37.0', respRate: '16',
      spO2: '98', weight: '88.5', height: '178', bmi: '27.9', glucose: '98',
      hba1c: '6.8', gcs: '15/15', avpu: 'Alert',
    },
    vitalsHistory: [
      { id: 'vr-3', timestamp: '2024-07-28T09:15:00Z', authorId: 'U002', authorName: 'Robert Johnson', vitals: { heartRate: '74', bloodPressure: '135/85', temperature: '37.0', respRate: '16', spO2: '98', weight: '88.5', height: '178', bmi: '27.9', glucose: '98', hba1c: '6.8', gcs: '15/15', avpu: 'Alert' } },
      { id: 'vr-1', timestamp: '2024-05-10T10:00:00Z', authorId: 'U002', authorName: 'Robert Johnson', vitals: { heartRate: '78', bloodPressure: '135/85', temperature: '36.8', respRate: '16', spO2: '98', weight: '88', height: '178', bmi: '27.8', glucose: '110', hba1c: '6.2', gcs: '15/15', avpu: 'Alert' } },
      { id: 'vr-2', timestamp: '2023-11-05T09:30:00Z', authorId: 'U002', authorName: 'Robert Johnson', vitals: { heartRate: '82', bloodPressure: '138/88', temperature: '37.0', respRate: '18', spO2: '99', weight: '89', height: '178', bmi: '28.1', glucose: '115', hba1c: '6.4', gcs: '15/15', avpu: 'Alert' } }
    ],
    activeProblems: [
      { id: 'prob-1', condition: 'Hypertensive disease' },
      { id: 'prob-2', condition: 'Diabetes mellitus type 2' },
      { id: 'prob-bc-ibd', condition: 'Inflammatory Bowel Disease' },
    ],
    medications: [
      { id: 'med-1', prescriptionId: 'rx-1', name: 'lisinopril 10 MG Oral Tablet [Zestril]', rxcui: '206767', dose: '10 MG', route: 'Oral', frequency: 'Once daily', status: 'Active', startDate: '2023-01-15', prescriber: 'Dr. Evelyn Chen', notes: 'Take 1 tablet by mouth once daily.' },
      { id: 'med-2', prescriptionId: 'rx-2', name: 'linagliptin 2.5 MG / metformin hydrochloride 1000 MG Oral Tablet [Jentadueto]', rxcui: '1243026', dose: '2.5/1000 MG', route: 'Oral', frequency: 'Twice daily with meals', status: 'Active', startDate: '2023-01-15', prescriber: 'Dr. Evelyn Chen', notes: 'Take 1 tablet by mouth twice daily with meals.' },
      { id: 'med-bc-mtx', prescriptionId: 'rx-bc-mtx', name: 'Methotrexate 15mg Oral Tablet', rxcui: '198105', dose: '15mg', route: 'Oral', frequency: 'Once weekly', status: 'Active', startDate: '2014-01-01', prescriber: 'Dr. Evelyn Chen', notes: 'For treatment of IBD. Take with folic acid.' },
    ],
    allergies: [ { id: 'allergy-1', substance: 'Penicillin', reaction: 'Hives' } ],
    prescriptions: [
        { id: 'rx-1', medicationName: 'lisinopril 10 MG Oral Tablet [Zestril]', rxcui: '206767', dose: '10 MG', route: 'Oral', frequency: 'Once daily', refills: 3, datePrescribed: '2024-05-10T10:05:00Z', prescriber: 'Dr. Evelyn Chen', notes: 'Take 1 tablet by mouth once daily.', duration: '30 days' },
        { id: 'rx-2', medicationName: 'linagliptin 2.5 MG / metformin hydrochloride 1000 MG Oral Tablet [Jentadueto]', rxcui: '1243026', dose: '2.5/1000 MG', route: 'Oral', frequency: 'Twice daily with meals', refills: 3, datePrescribed: '2024-05-10T10:05:00Z', prescriber: 'Dr. Evelyn Chen', notes: 'Take 1 tablet by mouth twice daily with meals.' },
        { id: 'rx-bc-mtx', medicationName: 'Methotrexate 15mg Oral Tablet', rxcui: '198105', dose: '15mg', route: 'Oral', frequency: 'Once weekly', refills: 6, datePrescribed: '2024-05-10T10:05:00Z', prescriber: 'Dr. Evelyn Chen', notes: 'Take 1 tablet by mouth once weekly. Supplement with Folic Acid.', duration: '180 days' },
    ],
    orders: [
      {
        id: 'ord-cmp-1',
        patientId: BEN_CARTER_ID,
        orderDate: '2024-07-20T08:00:00Z',
        orderingPhysician: 'Dr. Evelyn Chen',
        reasonForRequest: 'Annual diabetic monitoring',
        status: 'Completed',
        orderType: 'Lab',
        tests: [{ testId: 'cmp', testName: 'Comprehensive Metabolic Panel (CMP)' }],
        urgency: 'Routine',
        fastingRequired: true,
        specimenType: 'blood',
        results: "Glucose|115|mg/dL|70 - 100|H\nCalcium|9.8|mg/dL|8.5 - 10.2|\nSodium|140|mEq/L|135 - 145|\nPotassium|4.1|mEq/L|3.5 - 5.0|\nChloride|102|mEq/L|98 - 107|\nBUN|18|mg/dL|7 - 20|\nCreatinine|1.1|mg/dL|0.6 - 1.2|\nALT|35|U/L|7 - 56|\nAST|28|U/L|10 - 40|\nALP|90|U/L|44 - 147|\nBilirubin|0.8|mg/dL|0.1 - 1.2|\nAlbumin|4.2|g/dL|3.5 - 5.5|\nTotal Protein|7.1|g/dL|6.0 - 8.3|",
        parsedResults: [
          { testName: "Glucose", value: "115", unit: "mg/dL", referenceRange: "70 - 100", isAbnormal: true, flag: "H" },
          { testName: "HbA1c", value: "7.1", unit: "%", referenceRange: "4.8 - 5.6", isAbnormal: true, flag: "H" }
        ]
      }
    ],
    procedures: [
        { id: 'proc-bc-br', name: 'Bowel Resection', date: '2018-06-15T00:00:00Z', practitioner: 'Dr. Michael Smith', notes: 'Partial colectomy for severe Crohn\'s disease.' }
    ],
    referrals: [],
    imagingStudies: [
      {
        id: 'img-1',
        modality: 'X-ray',
        bodyPart: 'Chest PA/Lateral',
        date: '2024-01-15T14:00:00Z',
        report: 'FINDINGS: Lungs are clear. Heart size is normal. No pleural effusion or pneumothorax. IMPRESSION: No acute cardiopulmonary process.',
      },
      {
        id: 'img-2',
        modality: 'CT',
        bodyPart: 'Abdomen/Pelvis w/ Contrast',
        date: '2023-08-22T11:30:00Z',
        report: 'FINDINGS: Liver, spleen, pancreas, and adrenal glands are unremarkable. No evidence of bowel obstruction or inflammatory change. Kidneys demonstrate symmetric enhancement. IMPRESSION: Unremarkable CT of the abdomen and pelvis.',
      }
    ]
  },
  {
    id: ELEANOR_VANCE_ID,
    userId: 'usr_eleanor_vance_789',
    name: 'Eleanor Vance',
    age: '68',
    gender: 'Woman',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    archived: false,
    dob: '1956-03-15',
    sex: 'Female',
    address: '789 Harmony Ave, Cadence Creek, ST 54321',
    phone: '555-0104',
    email: 'e.vance@personal.com',
    bloodType: 'A+',
    lastVisit: '2024-06-12',
    occupation: 'Retired Librarian',
    latestVitals: {
        timestamp: '2024-06-12T11:00:00Z',
        heartRate: '68', bloodPressure: '128/78', temperature: '36.9', respRate: '15',
        spO2: '99', weight: '70', height: '162', bmi: '26.7', glucose: '92',
        hba1c: '5.8', gcs: '15/15', avpu: 'Alert',
    },
    vitalsHistory: [
       { id: 'vr-ev-1', timestamp: '2024-06-12T11:00:00Z', authorId: 'U001', authorName: 'Dr. Evelyn Chen', vitals: { heartRate: '68', bloodPressure: '128/78', temperature: '36.9', respRate: '15', spO2: '99', weight: '70', height: '162', bmi: '26.7', glucose: '92', hba1c: '5.8', gcs: '15/15', avpu: 'Alert' } },
    ],
    activeProblems: [ { id: 'prob-4', condition: 'Osteoarthritis' } ],
    medications: [ { id: 'med-4', name: 'Acetaminophen', dose: '500mg', route: 'Oral', frequency: 'As needed for pain', status: 'Active', startDate: '2022-01-01', prescriber: 'Dr. Evelyn Chen', notes: 'Do not exceed 3000mg in 24 hours.' } ],
    allergies: [ { id: 'allergy-3', substance: 'Sulfa drugs', reaction: 'Rash' } ],
    prescriptions: [],
    orders: [],
    procedures: [],
    referrals: [],
  }
];

let medicalRecords: any[] = [
    { id: 'rec-1', patientId: BEN_CARTER_ID, authorId: 'U001', authorName: 'Dr. Evelyn Chen', authorRole: 'Clinician', timestamp: '2024-05-10T10:05:00Z', content: 'Follow-up for HTN and T2DM. BP slightly elevated. Continue current medications.', type: 'Consultation' },
    { id: 'rec-2', patientId: BEN_CARTER_ID, authorId: 'U001', authorName: 'Dr. Evelyn Chen', authorRole: 'Clinician', timestamp: '2024-05-10T10:06:00Z', content: 'Prescribed Lisinopril', type: 'Prescription', prescriptionData: { medication: 'Lisinopril', dose: '10mg', route: 'Oral', frequency: 'Once daily', refills: 3, duration: '30 days' } },
    { id: 'rec-bc-3', patientId: BEN_CARTER_ID, authorId: 'U001', authorName: 'Dr. Evelyn Chen', authorRole: 'Clinician', timestamp: '2024-05-10T10:07:00Z', content: 'Prescribed Methotrexate', type: 'Prescription', prescriptionData: { medication: 'Methotrexate', dose: '15mg', route: 'Oral', frequency: 'Once weekly', refills: 6, duration: '180 days' } },
    { id: 'rec-bc-2', patientId: BEN_CARTER_ID, authorId: 'U002', authorName: 'Robert Johnson', authorRole: 'Nurse', timestamp: '2024-07-28T09:15:00Z', content: 'Patient education provided regarding methotrexate side effects and importance of folic acid supplementation. Patient verbalized understanding.', type: 'Consultation' },
    { id: 'rec-bc-1', patientId: BEN_CARTER_ID, authorId: 'U001', authorName: 'Dr. Evelyn Chen', authorRole: 'Clinician', timestamp: '2024-07-28T09:20:00Z', content: 'Patient presents for routine follow-up for IBD. Reports stable symptoms on current methotrexate regimen. No signs of active flare. Will continue current management.', type: 'Consultation' },
];

const getPatient = (patientId: string): any | undefined => patients.find(p => p.id === patientId);

const updatePatient = (updatedPatient: any) => {
    patients = patients.map(p => p.id === updatedPatient.id ? updatedPatient : p);
};

const createRecord = (entry: any, currentUser: any): any => {
    const newRecord: any = {
        id: entry.id || `rec_${crypto.randomUUID()}`,
        authorId: currentUser?.id || 'U001',
        authorName: currentUser?.name || 'Dr. Evelyn Chen',
        authorRole: currentUser?.role || 'Clinician',
        timestamp: new Date().toISOString(),
        ...entry
    };
    medicalRecords.push(newRecord);
    return newRecord;
};

export const patientDb = {
    async getAllPatients(): Promise<any[]> {
        return [...patients];
    },

    async savePatient(patient: any): Promise<any> {
        updatePatient(patient);
        return patient;
    },
    
    async addPatient(formData: any, currentUser: any): Promise<any> {
        const { demographics, history, examination, assessment, plan, complaint } = formData;
        if (!currentUser) throw new Error("User not authenticated for patient creation");
        
        const meta = { createdBy: { ...currentUser, timestamp: new Date().toISOString() } };

        const fullName = `${demographics.firstName} ${demographics.lastName}`;
        const newPatient: any = {
            id: `pat_${fullName.toLowerCase().replace(/\s/g, '_')}_${crypto.randomUUID().slice(0, 3)}`,
            userId: `usr_${fullName.toLowerCase().replace(/\s/g, '_')}_${crypto.randomUUID().slice(0, 3)}`,
            name: fullName,
            age: calculateAge(demographics.dob),
            gender: demographics.gender,
            avatar: `https://picsum.photos/seed/${encodeURIComponent(fullName)}/200`,
            archived: false,
            dob: demographics.dob,
            sex: demographics.sex,
            address: demographics.address,
            phone: demographics.phone,
            email: demographics.email,
            bloodType: demographics.bloodType,
            occupation: history.socialHistory.occupation,
            latestVitals: {
                timestamp: meta.createdBy.timestamp,
                ...examination.vitals,
            },
            vitalsHistory: [{
                id: `vr_${crypto.randomUUID()}`,
                timestamp: meta.createdBy.timestamp,
                authorId: meta.createdBy.id,
                authorName: meta.createdBy.name,
                vitals: {
                    ...examination.vitals,
                },
            }],
            activeProblems: assessment.workingDiagnosis.map((wd: any) => ({
                id: `prob_${crypto.randomUUID()}`,
                condition: wd.display
            })),
            pendingDiagnoses: assessment.differentialDiagnosis
                .filter((d: any) => !assessment.workingDiagnosis.some((wd: any) => wd.code === d.code))
                .map((d: any) => ({
                    id: `pdx_${crypto.randomUUID()}`,
                    condition: d.display,
                    noteId: 'intake-note',
                    status: 'pending'
                })),
            medications: history.medications.map((m: any) => ({ 
                ...m,
                status: 'Active',
                prescriber: m.prescriber || 'From History',
            })),
            allergies: history.allergies,
            prescriptions: [],
            orders: [],
            procedures: [],
            referrals: [],
            imagingStudies: []
        };
        patients.unshift(newPatient);
        
        const intakeRecord: any = {
            id: 'intake-note',
            patientId: newPatient.id,
            type: 'Consultation',
            content: `Initial patient intake.\n\nChief Complaint: ${complaint.symptoms.map((s: any)=>s.description).join(', ')}\n\nWorking Diagnosis: ${assessment.workingDiagnosis.map((wd: any) => wd.display).join(', ') || 'N/A'}`,
            authorId: meta.createdBy.id,
            authorName: meta.createdBy.name,
            authorRole: meta.createdBy.role,
            timestamp: meta.createdBy.timestamp,
        };
        medicalRecords.push(intakeRecord);

        return newPatient;
    },

    async getRecordsForPatient(patientId: string): Promise<any[]> {
        return medicalRecords.filter(r => r.patientId === patientId);
    },

    async addMedicalRecord(entryData: any): Promise<{ newRecord: any, updatedPatient: any | null }> {
        const newRecord = { ...entryData, id: `rec_${crypto.randomUUID()}` };
        medicalRecords.push(newRecord);
        return { newRecord, updatedPatient: null };
    },

    async addPrescription(patientId: string, prescriptionData: any, currentUser: any): Promise<any> {
        const patient = getPatient(patientId);
        if (!patient) throw new Error('Patient not found');

        const newPrescription: any = { id: `rx_${crypto.randomUUID()}`, ...prescriptionData };
        const newMedication: any = {
            id: `med_${newPrescription.id}`,
            prescriptionId: newPrescription.id,
            name: newPrescription.medicationName,
            dose: newPrescription.dose,
            route: newPrescription.route,
            frequency: newPrescription.frequency,
            rxcui: newPrescription.rxcui,
            status: 'Active',
            startDate: newPrescription.datePrescribed,
            prescriber: newPrescription.prescriber,
            notes: newPrescription.notes,
        };

        patient.prescriptions = [...(patient.prescriptions || []), newPrescription];
        patient.medications = [...(patient.medications || []), newMedication];
        updatePatient(patient);
        
        createRecord({
            patientId,
            type: 'Prescription',
            content: `New prescription for ${newPrescription.medicationName}. SIG: ${newPrescription.notes}`,
            prescriptionData: {
                medication: newPrescription.medicationName,
                dose: newPrescription.dose,
                route: newPrescription.route,
                frequency: newPrescription.frequency,
                refills: newPrescription.refills,
                duration: newPrescription.duration,
            }
        }, currentUser);

        return newPrescription;
    },

    async addReferral(patientId: string, referralData: any, currentUser: any): Promise<any> {
        const patient = getPatient(patientId);
        if (!patient) throw new Error('Patient not found');

        const newReferral: any = {
            id: `ref_${crypto.randomUUID()}`,
            patientId,
            date: new Date().toISOString(),
            status: 'Pending',
            ...referralData,
        };

        patient.referrals = [...(patient.referrals || []), newReferral];
        updatePatient(patient);

        createRecord({
            patientId,
            type: 'Referral',
            content: `Referral to ${newReferral.specialty} (${newReferral.toProvider}) for: ${newReferral.reason}.`
        }, currentUser);

        return patient;
    },

    async addVitalsRecord(patientId: string, vitals: any, currentUser: any): Promise<any> {
        const patient = getPatient(patientId);
        if (!patient) throw new Error('Patient not found');
        
        if (!currentUser) throw new Error("User not authenticated for vitals record");

        const newVitalsRecord: any = {
            id: `vr_${crypto.randomUUID()}`,
            timestamp: new Date().toISOString(),
            authorId: currentUser.id,
            authorName: currentUser.name,
            vitals,
        };

        patient.latestVitals = { ...vitals, timestamp: newVitalsRecord.timestamp };
        patient.vitalsHistory = [newVitalsRecord, ...(patient.vitalsHistory || [])];
        updatePatient(patient);

        return patient;
    },

    async addProcedure(patientId: string, procedureData: any, currentUser: any): Promise<any> {
        const patient = getPatient(patientId);
        if (!patient) throw new Error('Patient not found');
        
        const newProcedure: any = { id: `proc_${crypto.randomUUID()}`, ...procedureData };
        patient.procedures = [...(patient.procedures || []), newProcedure];
        updatePatient(patient);
        
        createRecord({
            patientId,
            type: 'Procedure',
            content: `Procedure performed: ${newProcedure.name} on ${new Date(newProcedure.date).toLocaleDateString()}. Notes: ${newProcedure.notes || 'N/A'}`
        }, currentUser);

        return patient;
    },

    async discontinueMedication(patientId: string, medicationId: string, medicationName: string, currentUser: any): Promise<any> {
        const patient = getPatient(patientId);
        if (!patient) throw new Error('Patient not found');

        patient.medications = (patient.medications || []).map((med: any) =>
            med.id === medicationId ? { ...med, status: 'Discontinued', endDate: new Date().toISOString() } : med
        );
        updatePatient(patient);

        createRecord({
            patientId,
            type: 'Other',
            content: `Medication discontinued: ${medicationName}.`
        }, currentUser);

        return patient;
    },

    async confirmDiagnosis(patientId: string, pendingDiagnosisId: string, currentUser: any): Promise<any> {
        const patient = getPatient(patientId);
        if (!patient) throw new Error('Patient not found');

        const diagnosis = (patient.pendingDiagnoses || []).find((d: any) => d.id === pendingDiagnosisId);
        if (diagnosis) {
            patient.pendingDiagnoses = (patient.pendingDiagnoses || []).filter((d: any) => d.id !== pendingDiagnosisId);
            patient.activeProblems = [...(patient.activeProblems || []), { id: `prob_${crypto.randomUUID()}`, condition: diagnosis.condition }];
            updatePatient(patient);

            createRecord({
                patientId,
                type: 'Consultation',
                content: `Diagnosis confirmed: ${diagnosis.condition}. Moved from pending to active problems list.`
            }, currentUser);
        }
        return patient;
    },

    async addPendingDiagnoses(patientId: string, diagnoses: any[], noteId: string): Promise<any> {
        const patient = getPatient(patientId);
        if (!patient) throw new Error('Patient not found');
        if (diagnoses.length === 0) return patient;

        const newPendingDiagnoses: any[] = diagnoses.map(diag => ({
            id: `pdx_${crypto.randomUUID()}`,
            condition: diag.display,
            noteId: noteId,
            status: 'pending'
        }));

        patient.pendingDiagnoses = [...(patient.pendingDiagnoses || []), ...newPendingDiagnoses];
        updatePatient(patient);

        return patient;
    },

    async addOrder(patientId: string, orderData: any, currentUser: any): Promise<{ updatedPatient: any, newOrder: any }> {
        const patient = getPatient(patientId);
        if (!patient) throw new Error('Patient not found');

        const newOrder: any = {
            id: `ord_${crypto.randomUUID()}`,
            patientId,
            orderDate: new Date().toISOString(),
            status: 'Ordered',
            orderingPhysician: currentUser?.name || 'Dr. Evelyn Chen',
            ...orderData,
        };

        patient.orders = [newOrder, ...(patient.orders || [])];
        updatePatient(patient);

        createRecord({
            patientId,
            type: 'Other', // Or a new 'Order' type could be added
            content: `New ${newOrder.orderType} order placed. Reason: ${newOrder.reasonForRequest}`
        }, currentUser);

        return { updatedPatient: patient, newOrder };
    },

    async updateOrder(patientId: string, order: any, currentUser: any): Promise<any> {
        const patient = getPatient(patientId);
        if (!patient) throw new Error('Patient not found');

        patient.orders = (patient.orders || []).map((o: any) => o.id === order.id ? order : o);

        if (order.status === 'Completed' && order.orderType === 'Lab' && order.parsedResults) {
            const labOrder = order;
            const latestVitalsTimestamp = patient.latestVitals?.timestamp ? new Date(patient.latestVitals.timestamp) : new Date(0);
            const orderTimestamp = new Date(labOrder.orderDate);

            // Update patient blood type from lab result
            const bloodTypeResult = labOrder.parsedResults.find(
                (result: any) => result.testName === 'ABO Group and Rh Type'
            );
            if (bloodTypeResult?.value) {
                patient.bloodType = bloodTypeResult.value;
            }

            if (orderTimestamp > latestVitalsTimestamp) {
                const newVitalsFromLab: any = {};
                let updated = false;

                labOrder.parsedResults.forEach((result: any) => {
                    if (result.testName.toLowerCase() === 'glucose') {
                        newVitalsFromLab.glucose = result.value;
                        updated = true;
                    }
                    if (result.testName.toLowerCase() === 'hba1c') {
                        newVitalsFromLab.hba1c = result.value;
                        updated = true;
                    }
                });

                if (updated) {
                    const newVitalsForHistory: any = {
                        ...patient.latestVitals!,
                        ...newVitalsFromLab,
                    };

                    const newVitalsRecord: any = {
                        id: `vr_lab_${crypto.randomUUID()}`,
                        timestamp: labOrder.orderDate,
                        authorId: 'SYS_LAB',
                        authorName: 'Lab System',
                        vitals: newVitalsForHistory,
                    };

                    patient.vitalsHistory = [newVitalsRecord, ...(patient.vitalsHistory || [])];
                    patient.latestVitals = newVitalsForHistory;
                }
            }
            
            createRecord({
                patientId,
                type: 'LabResult',
                content: `Results received for order ${order.id}:\n${order.results}`
            }, currentUser);
        }
        
        updatePatient(patient);
        return patient;
    }
};
