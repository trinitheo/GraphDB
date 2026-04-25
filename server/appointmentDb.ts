import crypto from 'crypto';
import { eventEngine, Command, DomainEvent, EventReducer } from './eventEngine.js';

// --- APPOINTMENT AGGREGATE CONSTANTS ---
const AGGREGATE_TYPE = 'Appointment';

// --- EVENTS ---
const EVENT_APPOINTMENT_SCHEDULED = 'APPOINTMENT_SCHEDULED';
const EVENT_APPOINTMENT_STATUS_UPDATED = 'APPOINTMENT_STATUS_UPDATED';
const EVENT_APPOINTMENT_UPDATED = 'APPOINTMENT_UPDATED';
const EVENT_APPOINTMENT_DELETED = 'APPOINTMENT_DELETED';

// --- COMMANDS ---
const CMD_SCHEDULE_APPOINTMENT = 'SCHEDULE_APPOINTMENT';
const CMD_UPDATE_STATUS = 'UPDATE_STATUS';
const CMD_UPDATE_APPOINTMENT = 'UPDATE_APPOINTMENT';
const CMD_DELETE_APPOINTMENT = 'DELETE_APPOINTMENT';

// --- REDUCER ---
const appointmentReducer: EventReducer<any> = (state, event) => {
    switch(event.eventType) {
        case EVENT_APPOINTMENT_SCHEDULED:
            return {
                id: event.aggregateId,
                ...event.payload,
                createdAt: event.timestamp
            };
        case EVENT_APPOINTMENT_STATUS_UPDATED:
            return {
                ...state,
                status: event.payload.status,
                changeReason: event.payload.reason || state.changeReason,
                attendanceDetails: {
                    ...(state.attendanceDetails || {}),
                    ...event.payload.attendanceUpdates
                },
                ...event.payload.legacyUpdates,
                updatedAt: event.timestamp,
                updatedBy: event.actorId
            };
        case EVENT_APPOINTMENT_UPDATED:
            return {
                ...state,
                ...event.payload,
                updatedAt: event.timestamp,
                updatedBy: event.actorId
            };
        case EVENT_APPOINTMENT_DELETED:
            return null; // Signals deletion to engine
        default:
            return state;
    }
};

eventEngine.registerAggregate(AGGREGATE_TYPE, appointmentReducer);

// --- SEED INITIAL DATA (Via Events!) ---
const BEN_CARTER_ID = 'pat_ben_carter_123';
const ELEANOR_VANCE_ID = 'pat_eleanor_vance_789';

const seedInitialData = () => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0, 0);
    const endOfToday = new Date(startOfToday.getTime() + 45 * 60000);

    const clinicianTestAppointment = {
        patientId: BEN_CARTER_ID,
        startTime: startOfToday.toISOString(),
        endTime: endOfToday.toISOString(),
        status: 'checked_in',
        providerId: 'U007',
        location: 'Consultation Room 1',
        reason: 'Urgent IBD Flare-up Consult',
        createdBy: 'U003',
        attendanceDetails: {
            checkInTime: new Date(startOfToday.getTime() - 15 * 60000).toISOString(),
            checkInMethod: 'portal',
            checkedInBy: BEN_CARTER_ID
        },
        checkInTime: new Date(startOfToday.getTime() - 15 * 60000).toISOString(),
    };

    eventEngine.seedEvent({
        aggregateId: 'appt-physio-clintest',
        aggregateType: AGGREGATE_TYPE,
        eventType: EVENT_APPOINTMENT_SCHEDULED,
        payload: clinicianTestAppointment,
        actorId: 'system'
    });

    const createSeed = (id: string, payload: any) => {
        eventEngine.seedEvent({
            aggregateId: id,
            aggregateType: AGGREGATE_TYPE,
            eventType: EVENT_APPOINTMENT_SCHEDULED,
            payload: payload,
            actorId: 'system'
        });
    };

    // Other appointments... (simplified seed for brevity, you can add more if needed)
    
    // Auto-schedule remaining ones
    const m = today.getMonth();
    const y = today.getFullYear();
    const ts = (d: number, h: number) => new Date(y, m, d, h, 0, 0);

    createSeed('appt-01', { patientId: BEN_CARTER_ID, startTime: ts(7,10).toISOString(), endTime: new Date(ts(7,10).getTime() + 45 * 60000).toISOString(), status: 'confirmed', providerId: 'U001', location: 'Room A', reason: 'IBD Follow-up' });
    createSeed('appt-02', { patientId: ELEANOR_VANCE_ID, startTime: ts(9,14).toISOString(), endTime: new Date(ts(9,14).getTime() + 45 * 60000).toISOString(), status: 'confirmed', providerId: 'U001', location: 'Room B', reason: 'Post-op Knee Rehab Follow-up' });
};

seedInitialData();

// --- BUSINESS / COMMAND LOGIC ---

// Helper function that produces events based on a dispatched command
const handleAppointmentCommands = (state: any, command: Command) => {
    switch(command.commandType) {
        case CMD_SCHEDULE_APPOINTMENT:
            return [{
                aggregateId: command.aggregateId,
                aggregateType: AGGREGATE_TYPE,
                eventType: EVENT_APPOINTMENT_SCHEDULED,
                payload: command.payload
            }];

        case CMD_UPDATE_STATUS:
            if (!state) throw new Error("Appointment not found");
            const now = new Date().toISOString();
            let attendanceUpdates: any = {};
            let legacyUpdates: any = {};

            const { status, reason, method } = command.payload;

            if (status === 'checked_in') {
                attendanceUpdates.checkInTime = now;
                attendanceUpdates.checkedInBy = command.actorId;
                attendanceUpdates.checkInMethod = method || 'staff';
                legacyUpdates = { checkInTime: now };
            } else if (status === 'in_progress') {
                attendanceUpdates.startedAt = now;
                legacyUpdates = { actualStartTime: now };
            } else if (status === 'completed') {
                attendanceUpdates.completedAt = now;
            } else if (status === 'no_show') {
                attendanceUpdates.noShowMarkedAt = now;
                attendanceUpdates.noShowMarkedBy = command.actorId;
            }

            return [{
                aggregateId: command.aggregateId,
                aggregateType: AGGREGATE_TYPE,
                eventType: EVENT_APPOINTMENT_STATUS_UPDATED,
                payload: { status, reason, attendanceUpdates, legacyUpdates }
            }];

        case CMD_UPDATE_APPOINTMENT:
            if (!state) throw new Error("Appointment not found");
            return [{
                aggregateId: command.aggregateId,
                aggregateType: AGGREGATE_TYPE,
                eventType: EVENT_APPOINTMENT_UPDATED,
                payload: command.payload
            }];
            
        case CMD_DELETE_APPOINTMENT:
            if (!state) throw new Error("Appointment not found");
            return [{
                aggregateId: command.aggregateId,
                aggregateType: AGGREGATE_TYPE,
                eventType: EVENT_APPOINTMENT_DELETED,
                payload: {}
            }];

        default:
            throw new Error(`Unknown command type: ${command.commandType}`);
    }
};

// Simulate backend cron job for no-shows (but using events)
const checkAutoNoShows = () => {
    const now = new Date();
    const appointments = eventEngine.getAllState<any>(AGGREGATE_TYPE);
    
    appointments.forEach(appt => {
        if ((appt.status === 'scheduled' || appt.status === 'confirmed') && new Date(appt.startTime).getTime() < now.getTime() - 60 * 60000) {
            console.log(`[EventEngine] Auto-marking appointment ${appt.id} as No Show`);
            eventEngine.dispatch({
                commandId: crypto.randomUUID(),
                aggregateId: appt.id,
                aggregateType: AGGREGATE_TYPE,
                commandType: CMD_UPDATE_STATUS,
                actorId: 'system_auto',
                payload: { status: 'no_show', method: 'system_auto' }
            }, handleAppointmentCommands);
        }
    });
};

// --- DATA ACCESS LAYER (API matches before) ---
export const appointmentDb = {
    async getAllAppointments(): Promise<any[]> {
        checkAutoNoShows(); // Run simulation
        return eventEngine.getAllState(AGGREGATE_TYPE).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    async getAppointmentById(id: string): Promise<any | undefined> {
        return eventEngine.getState(AGGREGATE_TYPE, id);
    },

    async updateAppointmentStatus(appointmentId: string, status: string, actorId: string, reason?: string, method?: string): Promise<any> {
        const events = eventEngine.dispatch({
            commandId: crypto.randomUUID(),
            aggregateId: appointmentId,
            aggregateType: AGGREGATE_TYPE,
            commandType: CMD_UPDATE_STATUS,
            actorId: actorId,
            payload: { status, reason, method }
        }, handleAppointmentCommands);
        
        return eventEngine.getState(AGGREGATE_TYPE, appointmentId);
    },
    
    async addAppointment(newAppointmentData: any): Promise<any> {
        const id = `appt-${crypto.randomUUID().slice(0, 6)}`;
        eventEngine.dispatch({
            commandId: crypto.randomUUID(),
            aggregateId: id,
            aggregateType: AGGREGATE_TYPE,
            commandType: CMD_SCHEDULE_APPOINTMENT,
            actorId: newAppointmentData.createdBy || 'system',
            payload: { ...newAppointmentData, status: 'scheduled' }
        }, handleAppointmentCommands);
        
        return eventEngine.getState(AGGREGATE_TYPE, id);
    },
    
    async updateAppointment(appointmentData: any, actorId: string): Promise<any> {
        eventEngine.dispatch({
            commandId: crypto.randomUUID(),
            aggregateId: appointmentData.id,
            aggregateType: AGGREGATE_TYPE,
            commandType: CMD_UPDATE_APPOINTMENT,
            actorId: actorId,
            payload: appointmentData
        }, handleAppointmentCommands);

        return eventEngine.getState(AGGREGATE_TYPE, appointmentData.id);
    },

    async deleteAppointment(appointmentId: string): Promise<void> {
        eventEngine.dispatch({
            commandId: crypto.randomUUID(),
            aggregateId: appointmentId,
            aggregateType: AGGREGATE_TYPE,
            commandType: CMD_DELETE_APPOINTMENT,
            actorId: 'system',
            payload: {}
        }, handleAppointmentCommands);
    },
};
