
import type { FC } from 'react';

export interface RecentActivity {
  id: string;
  type: 'appointment' | 'note' | 'prescription' | 'lab' | 'payment' | 'system';
  description: string;
  patientName?: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface QuickAction {
  label: string;
  icon: FC<any>;
  href: string;
  description: string;
  // FIX: Add optional 'accent' property for styling QuickAction buttons.
  accent?: 'primary' | 'secondary' | 'warning' | 'success';
}