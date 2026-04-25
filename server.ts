import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import { expressMiddleware } from '@as-integrations/express5';
import { seedGraph, getPatientNetwork, getProfessionalPatients, getAllNodesByType } from './server/graphDb.js';
import { patientDb } from './server/patientDb.js';
import { appointmentDb } from './server/appointmentDb.js';
import { apolloServer } from './server/graphql.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // Initialize Graph DB
  seedGraph();

  // Start Apollo Server
  await apolloServer.start();
  app.use('/graphql', expressMiddleware(apolloServer, {
    context: async ({ req }) => {
      const authHeader = req.headers.authorization || '';
      let user = undefined;
      
      if (authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          // In a real app, this would be a JWT verification.
          // For our mock setup, the frontend will send the JSON stringified user object.
          user = JSON.parse(token);
        } catch (e) {
          console.error('Failed to parse mock token', e);
        }
      }
      
      return { user };
    },
  }));

  // --- API Routes for Graph DB ---
  
  app.get('/api/graph/patients', (req, res) => {
    res.json(getAllNodesByType('Patient'));
  });

  app.get('/api/graph/professionals', (req, res) => {
    res.json(getAllNodesByType('Professional'));
  });

  app.get('/api/patients/:id/network', (req, res) => {
    const network = getPatientNetwork(req.params.id);
    if (!network) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(network);
  });

  app.get('/api/professionals/:id/patients', (req, res) => {
    const data = getProfessionalPatients(req.params.id);
    if (!data) {
      return res.status(404).json({ error: 'Professional not found' });
    }
    res.json(data);
  });

  // --- API Routes for Patients ---
  app.get('/api/patients', async (req, res) => {
    const patients = await patientDb.getAllPatients();
    res.json(patients);
  });

  app.post('/api/patients', async (req, res) => {
    try {
      const newPatient = await patientDb.addPatient(req.body.formData, req.body.currentUser);
      res.json(newPatient);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/patients/:id', async (req, res) => {
    const updatedPatient = await patientDb.savePatient(req.body.patient);
    res.json(updatedPatient);
  });

  app.post('/api/patients/:id/prescriptions', async (req, res) => {
    try {
      const rx = await patientDb.addPrescription(req.params.id, req.body.prescriptionData, req.body.currentUser);
      res.json(rx);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/patients/:id/referrals', async (req, res) => {
    try {
      const p = await patientDb.addReferral(req.params.id, req.body.referralData, req.body.currentUser);
      res.json(p);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/patients/:id/vitals', async (req, res) => {
    try {
      const p = await patientDb.addVitalsRecord(req.params.id, req.body.vitals, req.body.currentUser);
      res.json(p);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/patients/:id/procedures', async (req, res) => {
    try {
      const p = await patientDb.addProcedure(req.params.id, req.body.procedureData, req.body.currentUser);
      res.json(p);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/patients/:id/medications/:medId/discontinue', async (req, res) => {
    try {
      const p = await patientDb.discontinueMedication(req.params.id, req.params.medId, req.body.medicationName, req.body.currentUser);
      res.json(p);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/patients/:id/diagnoses/:diagId/confirm', async (req, res) => {
    try {
      const p = await patientDb.confirmDiagnosis(req.params.id, req.params.diagId, req.body.currentUser);
      res.json(p);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/patients/:id/diagnoses/pending', async (req, res) => {
    try {
      const p = await patientDb.addPendingDiagnoses(req.params.id, req.body.diagnoses, req.body.noteId);
      res.json(p);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/patients/:id/orders', async (req, res) => {
    try {
      const result = await patientDb.addOrder(req.params.id, req.body.orderData, req.body.currentUser);
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/patients/:id/orders/:orderId', async (req, res) => {
    try {
      const p = await patientDb.updateOrder(req.params.id, req.body.order, req.body.currentUser);
      res.json(p);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // --- API Routes for Medical Records ---
  app.get('/api/patients/:id/records', async (req, res) => {
    const records = await patientDb.getRecordsForPatient(req.params.id);
    res.json(records);
  });

  app.post('/api/patients/:id/records', async (req, res) => {
    const result = await patientDb.addMedicalRecord(req.body.entryData);
    res.json(result);
  });

  // --- API Routes for Appointments ---
  app.get('/api/appointments', async (req, res) => {
    const appts = await appointmentDb.getAllAppointments();
    res.json(appts);
  });

  app.get('/api/appointments/:id', async (req, res) => {
    const appt = await appointmentDb.getAppointmentById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Not found' });
    res.json(appt);
  });

  app.post('/api/appointments', async (req, res) => {
    const newAppt = await appointmentDb.addAppointment(req.body.appointmentData);
    res.json(newAppt);
  });

  app.put('/api/appointments/:id', async (req, res) => {
    try {
      const updated = await appointmentDb.updateAppointment(req.body.appointmentData, req.body.actorId);
      res.json(updated);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/appointments/:id/status', async (req, res) => {
    try {
      const updated = await appointmentDb.updateAppointmentStatus(
        req.params.id,
        req.body.status,
        req.body.actorId,
        req.body.reason,
        req.body.method
      );
      res.json(updated);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/appointments/:id', async (req, res) => {
    try {
      await appointmentDb.deleteAppointment(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
