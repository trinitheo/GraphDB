import type { UserRole } from './shared';

export namespace Api {
  export namespace V1 {
    // --- Duplicated from core.ts to fix module resolution errors ---
    interface ApiResponse<T> {
      data: T;
      error?: {
        code: string;
        message: string;
      };
    }
    interface Entity {
      id: string;
    }
    // ----------------------------------------------------------------

    // --- Model ---
    export interface User extends Entity {
      name: string;
      email: string;
      role: UserRole;
      avatar: string;
      status: 'Active' | 'Inactive';
    }

    // --- API Responses ---
    export type GetUsersResponse = ApiResponse<{ users: User[] }>;
  }
}
