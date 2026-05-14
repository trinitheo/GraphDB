# Appointments Micro-Frontend (MFE) Export Guide

This directory contains the standalone Appointments micro-frontend. It is built as a self-contained module that can be integrated into other React projects.

## Project Structure

- `index.tsx`: The main entry point component.
- `components/`: UI components (Dashboard, Calendar, Modals).
- `services/`: Data fetching logic (GraphQL & REST).
- `hooks/`: Custom React hooks for appointment logic.
- `types.ts`: TypeScript interfaces and types.

## Integration Dependencies

To use this MFE in another project, you will need to provide or mock the following dependencies that are currently imported from the parent project:

1. **Auth Service**: `mini-apps/PatientMFE/services/authService.ts`
   - The MFE uses this for getting the current user and authentication tokens.
2. **Patient Context**: `mini-apps/PatientMFE/context/PatientContext.tsx`
   - Used for looking up patient names and details.
3. **Shared Components**: `mini-apps/PatientMFE/components/modals/ConfirmationModal.tsx`
   - A generic modal component used for destructive actions.
4. **Icons**: `components/icons`
   - Uses `lucide-react` based custom icons.
5. **API Contract**: `api_contract/appointment.ts`
   - Defines the GraphQL/REST data structures.

## How to Export

1. **Copy the directory**: Copy the `mini-apps/AppointmentsMFE` folder to your new project.
2. **Resolve External Imports**: Update the relative imports at the top of the files to point to your project's equivalents, or copy the required files listed above.
3. **Install Peer Dependencies**:
   ```bash
   npm install react react-dom motion lucide-react framer-motion
   ```
4. **Configure GraphQL**: Ensure your backend supports the GraphQL queries defined in `services/appointmentService.ts`.

## Usage Example

```tsx
import { AppointmentsDashboard } from './AppointmentsMFE';

function MyDashboard() {
  return (
    <div className="p-8">
      <AppointmentsDashboard />
    </div>
  );
}
```

## Self-Contained Refactoring (Recommended)
If you want to make this strictly standalone:
1. Move `api_contract/appointment.ts` into `AppointmentsMFE/types.ts`.
2. Move `ConfirmationModal.tsx` into `AppointmentsMFE/components/shared/`.
3. Abstract the `authService` into a required prop or a context provider (e.g., `AppointmentsProvider`).
