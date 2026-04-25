import { ApolloServer } from '@apollo/server';
import { GraphQLError } from 'graphql';
import { patientDb } from './patientDb.js';
import { appointmentDb } from './appointmentDb.js';
import { getPatientNetwork, getProfessionalPatients, getAllNodesByType } from './graphDb.js';

export interface MyContext {
  user?: {
    id: string;
    name: string;
    role: string;
    patientId?: string;
    avatar?: string;
  };
}

const typeDefs = `#graphql
  type Vitals {
    timestamp: String
    heartRate: String
    bloodPressure: String
    temperature: String
    respRate: String
    spO2: String
    weight: String
    height: String
    bmi: String
    glucose: String
    hba1c: String
    gcs: String
    avpu: String
  }

  type VitalsRecord {
    id: ID!
    timestamp: String
    authorId: String
    authorName: String
    vitals: Vitals
  }

  type Problem {
    id: ID!
    condition: String
  }

  type Medication {
    id: ID!
    prescriptionId: String
    name: String
    rxcui: String
    dose: String
    route: String
    frequency: String
    status: String
    startDate: String
    endDate: String
    prescriber: String
    notes: String
  }

  type Allergy {
    id: ID!
    substance: String
    reaction: String
  }

  type Prescription {
    id: ID!
    medicationName: String
    rxcui: String
    dose: String
    route: String
    frequency: String
    refills: Int
    datePrescribed: String
    prescriber: String
    notes: String
    duration: String
  }

  type OrderTest {
    testId: String
    testName: String
  }

  type OrderResult {
    testName: String
    value: String
    unit: String
    referenceRange: String
    isAbnormal: Boolean
    flag: String
  }

  type Order {
    id: ID!
    patientId: String
    orderDate: String
    orderingPhysician: String
    reasonForRequest: String
    status: String
    orderType: String
    tests: [OrderTest]
    urgency: String
    fastingRequired: Boolean
    specimenType: String
    results: String
    parsedResults: [OrderResult]
  }

  type Procedure {
    id: ID!
    name: String
    date: String
    practitioner: String
    notes: String
  }

  type Referral {
    id: ID!
    patientId: String
    date: String
    status: String
    specialty: String
    toProvider: String
    reason: String
  }

  type ImagingStudy {
    id: ID!
    modality: String
    bodyPart: String
    date: String
    report: String
  }

  type PatientRelationship {
    patient: Patient
    type: String
    details: String
  }

  type Professional {
    id: ID!
    name: String
    role: String
    type: String
    patients: [PatientRelationship]
  }

  type CareTeamMember {
    professional: Professional
    type: String
    details: String # JSON stringified details
  }

  type MedicalRecordEntry {
    id: ID!
    patientId: String
    authorId: String
    authorName: String
    authorRole: String
    timestamp: String
    content: String
    type: String
  }

  type Patient {
    id: ID!
    userId: String
    name: String
    age: String
    gender: String
    avatar: String
    archived: Boolean
    dob: String
    sex: String
    address: String
    phone: String
    email: String
    bloodType: String
    lastVisit: String
    occupation: String
    insuranceProvider: String
    policyNumber: String
    groupNumber: String
    latestVitals: Vitals
    vitalsHistory: [VitalsRecord]
    activeProblems: [Problem]
    medications: [Medication]
    allergies: [Allergy]
    prescriptions: [Prescription]
    orders: [Order]
    procedures: [Procedure]
    referrals: [Referral]
    imagingStudies: [ImagingStudy]
    records: [MedicalRecordEntry]
    
    # Graph DB stitched fields
    careTeam: [CareTeamMember]
  }

  type AppointmentAttendance {
    checkInTime: String
    checkInMethod: String
    checkedInBy: String
    startedAt: String
    completedAt: String
    noShowMarkedAt: String
    noShowMarkedBy: String
  }

  type Appointment {
    id: ID!
    patientId: String
    startTime: String
    endTime: String
    status: String
    providerId: String
    location: String
    reason: String
    createdBy: String
    createdAt: String
    updatedAt: String
    updatedBy: String
    changeReason: String
    attendanceDetails: AppointmentAttendance
    
    # Stitched field
    patient: Patient
  }

  type Query {
    patients: [Patient]
    patient(id: ID!): Patient
    appointments: [Appointment]
    appointment(id: ID!): Appointment
    professionals: [Professional]
  }

  input AddMedicalRecordEntryInput {
    patientId: String!
    content: String!
    type: String!
  }

  input AddAppointmentInput {
    patientId: String!
    startTime: String!
    endTime: String!
    providerId: String!
    location: String!
    reason: String!
  }

  input AddPatientInput {
    name: String!
    age: String!
    gender: String!
    dob: String!
    sex: String!
    address: String!
    phone: String!
    email: String!
    socialHistory: String!
    familyHistory: String!
    surgicalHistory: String!
    medicalHistory: String!
    complaint: String!
    assessment: String!
  }

  input AddPrescriptionInput {
    patientId: String!
    medicationName: String!
    dose: String!
    route: String!
    frequency: String!
    rxcui: String
    datePrescribed: String!
    prescriber: String!
    notes: String
    refills: Int
    duration: String
  }

  input AddOrderInput {
    patientId: String!
    orderType: String!
    priority: String!
    reasonForRequest: String!
    instructions: String
  }

  input UpdateOrderInput {
    patientId: String!
    orderId: String!
    status: String!
    results: String
    parsedResults: String
  }

  input UpdateAppointmentInput {
    id: ID!
    startTime: String!
    endTime: String!
    providerId: String!
    location: String!
    reason: String!
    changeReason: String!
  }

  input UpdateAppointmentStatusInput {
    id: ID!
    status: String!
    changeReason: String
  }

  input UpdateAppointmentAttendanceInput {
    id: ID!
    checkInTime: String
    checkInMethod: String
    startedAt: String
    completedAt: String
    noShowMarkedAt: String
  }

  type Mutation {
    addMedicalRecordEntry(input: AddMedicalRecordEntryInput!): MedicalRecordEntry
    addAppointment(input: AddAppointmentInput!): Appointment
    addPatient(input: AddPatientInput!): Patient
    addPrescription(input: AddPrescriptionInput!): Prescription
    addOrder(input: AddOrderInput!): Order
    updateOrder(input: UpdateOrderInput!): Order
    updateAppointment(input: UpdateAppointmentInput!): Appointment
    updateAppointmentStatus(input: UpdateAppointmentStatusInput!): Appointment
    updateAppointmentAttendance(input: UpdateAppointmentAttendanceInput!): Appointment
  }
`;

const resolvers = {
  Query: {
    patients: async () => {
      return await patientDb.getAllPatients();
    },
    patient: async (_: any, { id }: { id: string }) => {
      const patients = await patientDb.getAllPatients();
      return patients.find(p => p.id === id);
    },
    appointments: async () => {
      return await appointmentDb.getAllAppointments();
    },
    appointment: async (_: any, { id }: { id: string }) => {
      return await appointmentDb.getAppointmentById(id);
    },
    professionals: () => {
      return getAllNodesByType('Professional');
    }
  },
  Mutation: {
    addMedicalRecordEntry: async (_: any, { input }: any, context: MyContext) => {
      if (!context.user) {
        throw new GraphQLError('User not logged in.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const HEALTH_PROFESSIONAL_ROLES = ['Clinician', 'Nurse', 'AlliedHealthProfessional'];
      if (!HEALTH_PROFESSIONAL_ROLES.includes(context.user.role)) {
        throw new GraphQLError('User does not have permission to add medical records.', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const newEntryData = {
        patientId: input.patientId,
        authorId: context.user.id,
        authorName: context.user.name,
        authorRole: context.user.role as any,
        timestamp: new Date().toISOString(),
        content: input.content,
        type: input.type,
      };

      const result = await patientDb.addMedicalRecord(newEntryData);
      return result.newRecord;
    },
    addAppointment: async (_: any, { input }: any, context: MyContext) => {
      if (!context.user) {
        throw new GraphQLError('User not logged in.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const appointmentData = {
        ...input,
        status: 'Scheduled',
        createdBy: context.user.id,
      };

      return await appointmentDb.addAppointment(appointmentData);
    },
    addPatient: async (_: any, { input }: any, context: MyContext) => {
      if (!context.user) {
        throw new GraphQLError('User not logged in.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      
      const parsedInput = {
        ...input,
        socialHistory: JSON.parse(input.socialHistory),
        familyHistory: JSON.parse(input.familyHistory),
        surgicalHistory: JSON.parse(input.surgicalHistory),
        medicalHistory: JSON.parse(input.medicalHistory),
        complaint: JSON.parse(input.complaint),
        assessment: JSON.parse(input.assessment)
      };

      return await patientDb.addPatient(parsedInput, context.user);
    },
    addPrescription: async (_: any, { input }: any, context: MyContext) => {
      if (!context.user) {
        throw new GraphQLError('User not logged in.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return await patientDb.addPrescription(input.patientId, input, context.user);
    },
    addOrder: async (_: any, { input }: any, context: MyContext) => {
      if (!context.user) {
        throw new GraphQLError('User not logged in.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      const { updatedPatient, newOrder } = await patientDb.addOrder(input.patientId, input, context.user);
      return newOrder;
    },
    updateOrder: async (_: any, { input }: any, context: MyContext) => {
      if (!context.user) {
        throw new GraphQLError('User not logged in.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      
      const parsedInput = {
        ...input,
        id: input.orderId,
        parsedResults: input.parsedResults ? JSON.parse(input.parsedResults) : undefined
      };
      
      const updatedPatient = await patientDb.updateOrder(input.patientId, parsedInput, context.user);
      return updatedPatient.orders.find((o: any) => o.id === input.orderId);
    },
    updateAppointment: async (_: any, { input }: any, context: MyContext) => {
      if (!context.user) {
        throw new GraphQLError('User not logged in.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return await appointmentDb.updateAppointment(input, context.user.id);
    },
    updateAppointmentStatus: async (_: any, { input }: any, context: MyContext) => {
      if (!context.user) {
        throw new GraphQLError('User not logged in.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return await appointmentDb.updateAppointmentStatus(input.id, input.status, context.user.id, input.changeReason);
    },
    updateAppointmentAttendance: async (_: any, { input }: any, context: MyContext) => {
      if (!context.user) {
        throw new GraphQLError('User not logged in.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return await appointmentDb.updateAppointmentAttendance(input.id, input, context.user.id);
    }
  },
  Patient: {
    records: async (parent: any) => {
      return await patientDb.getRecordsForPatient(parent.id);
    },
    careTeam: (parent: any) => {
      // Stitching data from GraphDB
      const network = getPatientNetwork(parent.id);
      if (!network) return [];
      
      return network.relationships.map((rel: any) => ({
        professional: rel.professional,
        type: rel.type,
        details: JSON.stringify(rel.details)
      }));
    }
  },
  Appointment: {
    patient: async (parent: any) => {
      const patients = await patientDb.getAllPatients();
      return patients.find(p => p.id === parent.patientId);
    }
  },
  Professional: {
    patients: async (parent: any) => {
      const data = getProfessionalPatients(parent.id);
      if (!data) return [];
      
      const allPatients = await patientDb.getAllPatients();
      
      return data.relationships.map((rel: any) => {
        const fullPatient = allPatients.find(p => p.id === rel.patient.id);
        return {
          patient: fullPatient || rel.patient,
          type: rel.type,
          details: JSON.stringify(rel.details)
        };
      });
    }
  }
};

export const apolloServer = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
});
