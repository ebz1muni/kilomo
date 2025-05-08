// src/types.ts
export type FuelLog = {
    id: string;
    generator: string;
    fuelAdded: number;
    runtimeHours: number;
    notes?: string;
    createdAt?: any;  // You can change this type to match Firebase timestamps
  };
  