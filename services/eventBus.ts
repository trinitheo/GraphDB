// services/eventBus.ts

// Create a shared event system for MFE coordination
export interface MFEEvent {
  type: 'PATIENT_SELECTED' | 'APPOINTMENT_CREATED' | 'MEDICATION_ADDED';
  payload: any;
  source: string; // The name of the MFE that published the event
  timestamp: string;
}

export const createMFEEventBus = () => {
  const listeners = new Map<string, Set<(event: MFEEvent) => void>>();
  
  const publish = (event: MFEEvent) => {
    const eventListeners = listeners.get(event.type);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(event));
    }
  };

  const subscribe = (eventType: MFEEvent['type'], callback: (event: MFEEvent) => void) => {
    if (!listeners.has(eventType)) {
      listeners.set(eventType, new Set());
    }
    listeners.get(eventType)!.add(callback);
    // Return an unsubscribe function
    return () => {
      listeners.get(eventType)?.delete(callback);
    };
  };

  return {
    subscribe,
    publish,
    
    // Example: When a patient is selected in one MFE, others can react
    publishPatientSelected: (patientId: string, source: string) => {
      publish({
        type: 'PATIENT_SELECTED',
        payload: { patientId },
        source,
        timestamp: new Date().toISOString()
      });
    }
  };
};

// Export a singleton instance for the entire application to use
export const mfeEventBus = createMFEEventBus();
