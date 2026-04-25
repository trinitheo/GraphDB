import Graph from 'graphology';

// Initialize the graph
export const db = new Graph({ multi: true });

// Add some initial data
export function seedGraph() {
  // Clear existing
  db.clear();

  // Add Professionals
  db.addNode('dr_smith', { type: 'Professional', name: 'Dr. Sarah Smith', role: 'Cardiologist', id: 'dr_smith' });
  db.addNode('dr_jones', { type: 'Professional', name: 'Dr. Mike Jones', role: 'General Practitioner', id: 'dr_jones' });
  db.addNode('nurse_joy', { type: 'Professional', name: 'Nurse Joy', role: 'Registered Nurse', id: 'nurse_joy' });

  // Add Patients
  db.addNode('pat_ben_carter_123', { type: 'Patient', name: 'Benjamin Carter', age: 42, id: 'pat_ben_carter_123' });
  db.addNode('pat_olivia_rodriguez_456', { type: 'Patient', name: 'Olivia Rodriguez', age: 32, id: 'pat_olivia_rodriguez_456' });
  db.addNode('pat_eleanor_vance_789', { type: 'Patient', name: 'Eleanor Vance', age: 68, id: 'pat_eleanor_vance_789' });

  // Add Relationships
  // pat_ben_carter_123 is treated by dr_smith and nurse_joy
  db.addEdge('pat_ben_carter_123', 'dr_smith', { type: 'TREATED_BY', since: '2023-01-15', condition: 'Hypertension' });
  db.addEdge('pat_ben_carter_123', 'nurse_joy', { type: 'CARED_FOR_BY', since: '2023-01-15' });
  
  // pat_olivia_rodriguez_456's primary care is dr_jones
  db.addEdge('pat_olivia_rodriguez_456', 'dr_jones', { type: 'PRIMARY_CARE', since: '2020-05-10' });
  
  // pat_eleanor_vance_789 was referred by dr_jones to dr_smith
  db.addEdge('pat_eleanor_vance_789', 'dr_jones', { type: 'PRIMARY_CARE', since: '2019-11-20' });
  db.addEdge('dr_jones', 'dr_smith', { type: 'REFERRED', patientId: 'pat_eleanor_vance_789', date: '2024-02-01' });
  db.addEdge('pat_eleanor_vance_789', 'dr_smith', { type: 'TREATED_BY', since: '2024-02-05', condition: 'Osteoarthritis' });
}

// Helper to get patient network
export function getPatientNetwork(patientId: string) {
  if (!db.hasNode(patientId)) return null;
  
  const patient = db.getNodeAttributes(patientId);
  const relationships: any[] = [];
  
  db.forEachOutboundEdge(patientId, (edge, attributes, source, target) => {
    relationships.push({
      type: attributes.type,
      details: attributes,
      professional: db.getNodeAttributes(target)
    });
  });

  return {
    patient,
    relationships
  };
}

// Helper to get professional's patients
export function getProfessionalPatients(professionalId: string) {
  if (!db.hasNode(professionalId)) return null;

  const professional = db.getNodeAttributes(professionalId);
  const patients: any[] = [];

  db.forEachInboundEdge(professionalId, (edge, attributes, source, target) => {
    if (db.getNodeAttribute(source, 'type') === 'Patient') {
      patients.push({
        relationship: attributes.type,
        details: attributes,
        patient: db.getNodeAttributes(source)
      });
    }
  });

  return {
    professional,
    patients
  };
}

export function getAllNodesByType(type: string) {
  const nodes: any[] = [];
  db.forEachNode((node, attributes) => {
    if (attributes.type === type) {
      nodes.push(attributes);
    }
  });
  return nodes;
}
