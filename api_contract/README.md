# API Contract Guidelines

This directory contains **versioned, namespaced TypeScript API contracts** shared across all MFEs in the monorepo.  
The goal: **zero drift** between micro-frontends and the backend, with strong compile‑time guarantees.

---

## 📂 Structure

```
api_contract/
  core.ts         # Global types: ApiResponse, Entity, Pagination, etc.
  patient.ts      # Patient-specific DTOs and endpoints
  user.ts         # User-specific DTOs and endpoints
  shared.ts       # Common enums/constants (e.g. UserRole)
```

---

## 🧩 Namespace Merging Rules

We use **TypeScript namespaces** to group API types under a single `Api` root.

**Example:**
```ts
// core.ts
export namespace Api {
  export namespace V1 {
    export interface Entity {
      id: string;
      createdAt: string;
      updatedAt: string;
    }

    export interface ApiResponse<T> {
      data: T;
    }
  }
}
```

**Merging contracts:**
```ts
// patient.ts
import type { UserRole } from './shared'; // ✅ Allowed (non-Api imports)

export namespace Api {
  export namespace V1 {
    export interface Patient extends Entity {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      gender: 'male' | 'female' | 'other';
    }

    export type GetPatientsResponse = ApiResponse<{ patients: Patient[] }>;
  }
}
```

---

## 🚫 DO NOT

❌ **Do NOT** import `type { Api }` from `core.ts` into another contract file.  
This **breaks namespace merging** and will cause missing type errors like `Cannot find name 'Entity'`.

❌ **Do NOT** redefine types already in `core.ts` — extend them.

---

## ✅ DO

✔ Declare `export namespace Api { ... }` in each contract file.  
TypeScript will **merge** them into a single `Api` namespace at compile time.

✔ Import supporting types/enums (e.g. `UserRole`) from `shared.ts` — these are safe.

✔ Fully qualify core types: `Api.V1.Entity`, `Api.V1.ApiResponse`.

✔ Export constants at the **top level** (outside the namespace) if they are needed app‑wide:
```ts
export const VITAL_UNITS = ['bpm', 'mmHg', '°C'] as const;
```

---

## 🔄 Versioning

Each namespace contains its own version sub-namespace (`V1`, `V2`, etc.)  
When making a breaking change:
1. Copy the contract to a new version namespace.
2. Update consumers incrementally.

---

## 🧪 Testing Contracts

When adding or changing a contract:
1. Run `tsc --noEmit` in the repo root to catch type breaks.
2. Verify that all MFEs compile without touching their service or component code.
3. Add/update mock data in `mini-apps/**/db/` to match the new contract.

---

## 🌐 Service Layer Integration

All MFEs consume these contracts via `shared-api` services:
```ts
import { patientService } from '@shared-api/patientService';
import type { Api } from '@contracts/core';

const { data } = await patientService.getAll();
(data as Api.V1.Patient[]).forEach(...);
```

---

## 📌 Summary

- **One `Api` namespace to rule them all** — never import it directly, let TS merge it.
- **Core types live in `core.ts`**, domain-specific types live in their own file.
- **Top‑level constants** are exported outside the namespace for broad use.
- **Version bump** when breaking contracts, keep old version for legacy consumers.
