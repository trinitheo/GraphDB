import crypto from 'crypto';

export interface DomainEvent {
    eventId: string;
    aggregateId: string;
    aggregateType: string;
    eventType: string;
    payload: any;
    timestamp: string;
    actorId?: string;
    version: number;
}

export interface Command {
    commandId: string;
    aggregateId: string;
    aggregateType: string;
    commandType: string;
    payload: any;
    actorId?: string;
}

export type EventReducer<T> = (state: T | undefined, event: DomainEvent) => T;

export class StatefulEventEngine {
    private eventStore: DomainEvent[] = [];
    private projections: Map<string, Map<string, any>> = new Map();
    private reducers: Map<string, EventReducer<any>> = new Map();
    private subscribers: Map<string, Array<(event: DomainEvent) => void>> = new Map();

    /**
     * Register an Event Sourced Read Model (Projection)
     */
    public registerAggregate<T>(aggregateType: string, reducer: EventReducer<T>) {
        this.reducers.set(aggregateType, reducer);
        this.projections.set(aggregateType, new Map());
        console.log(`[EventEngine] Registered aggregate: ${aggregateType}`);
    }

    /**
     * Dispatches a Command, runs business logic, and emits Domain Events
     */
    public dispatch(
        command: Command,
        generateEvents: (state: any | undefined, cmd: Command) => Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'>[]
    ): DomainEvent[] {
        console.log(`[EventEngine] Dispatching command: ${command.commandType} on ${command.aggregateId}`);
        // 1. Load current read-model state for validation
        const state = this.getState(command.aggregateType, command.aggregateId);

        // 2. Execute Business Logic to produce new events
        const newEventsData = generateEvents(state, command);

        // 3. Append and apply events
        const currentVersion = this.getAggregateVersion(command.aggregateId);
        const emittedEvents: DomainEvent[] = [];

        for (let i = 0; i < newEventsData.length; i++) {
            const domainEvent: DomainEvent = {
                ...newEventsData[i],
                eventId: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                version: currentVersion + i + 1,
                actorId: command.actorId
            };
            this.eventStore.push(domainEvent);
            this.applyEvent(domainEvent);
            emittedEvents.push(domainEvent);
        }

        return emittedEvents;
    }

    /**
     * Directly seed an event (bypass command validation) - Used for bootstrapping
     */
    public seedEvent(event: Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'> & { timestamp?: string }) {
        const currentVersion = this.getAggregateVersion(event.aggregateId);
        const domainEvent: DomainEvent = {
            ...event,
            eventId: crypto.randomUUID(),
            timestamp: event.timestamp || new Date().toISOString(),
            version: currentVersion + 1
        };
        this.eventStore.push(domainEvent);
        this.applyEvent(domainEvent);
    }

    private getAggregateVersion(aggregateId: string): number {
        return this.eventStore.filter(e => e.aggregateId === aggregateId).length;
    }

    private applyEvent(event: DomainEvent) {
        const reducer = this.reducers.get(event.aggregateType);
        if (!reducer) return;

        const collection = this.projections.get(event.aggregateType)!;
        const currentState = collection.get(event.aggregateId);

        // Calculate new state using the registered reducer
        const newState = reducer(currentState, event);

        if (newState === null || newState === undefined) {
             collection.delete(event.aggregateId);
        } else {
             collection.set(event.aggregateId, newState);
        }

        // Notify Pub/Sub listeners for reactive side-effects
        const typeSubs = this.subscribers.get(event.eventType) || [];
        const wildcardSubs = this.subscribers.get('*') || [];

        [...typeSubs, ...wildcardSubs].forEach(sub => sub(event));
    }

    public getState<T>(aggregateType: string, aggregateId: string): T | undefined {
        return this.projections.get(aggregateType)?.get(aggregateId) as T | undefined;
    }

    public getAllState<T>(aggregateType: string): T[] {
        const collection = this.projections.get(aggregateType);
        if (!collection) return [];
        return Array.from(collection.values()) as T[];
    }

    public getEventsForAggregate(aggregateId: string): DomainEvent[] {
         return this.eventStore.filter(e => e.aggregateId === aggregateId);
    }

    public getEventStore(): DomainEvent[] {
        return [...this.eventStore];
    }
    
    public subscribe(eventType: string, callback: (event: DomainEvent) => void) {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, []);
        }
        this.subscribers.get(eventType)!.push(callback);
    }
}

export const eventEngine = new StatefulEventEngine();
