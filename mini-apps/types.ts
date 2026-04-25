import type React from 'react';
import type { UserRole } from '../api_contract/shared';

export interface MiniApp {
  path: string;
  name: string;
  component: React.ComponentType;
  icon: React.ReactNode;
  roles?: UserRole[];
  category?: 'General' | 'Clinical' | 'Admin';

  // Replace boolean mobile flag with a structured mobile configuration
  mobileConfig?: {
    enabled?: boolean; // whether the mini-app has a mobile-optimized variant
    priority?: 'high' | 'medium' | 'low'; // Load order for mobile
    offlineSupport?: boolean; // Can function without internet
    touchOptimized?: boolean; // UI optimized for touch
    quickActions?: string[]; // Actions available from mobile home screen
  };

  // Contextual availability
  availableWhen?: {
    patientSelected?: boolean;
    duringAppointment?: boolean;
    hasPermissions?: string[];
  };

  // Quick actions for dashboard cards
  quickActions?: {
    label: string;
    action: string;
    icon: React.ReactNode;
    roles: UserRole[];
  }[];
}

// Re-export from the single source of truth in the API contract
export type { UserRole } from '../api_contract/shared';

// Enhanced MiniApp with mobile-specific features (kept for compatibility)
export interface MobileEnhancedMiniApp extends MiniApp {
  mobileConfig: {
    priority: 'high' | 'medium' | 'low'; // Load order for mobile
    offlineSupport: boolean; // Can function without internet
    touchOptimized: boolean; // UI optimized for touch
    quickActions: string[]; // Actions available from mobile home screen
  };
}