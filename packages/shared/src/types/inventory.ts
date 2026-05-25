export interface Warehouse {
  id: string;
  name: string;
  address: string;
  totalCapacity: number;
  usedCapacity: number;
  locations: Location[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  warehouseId: string;
  aisle: string;
  bay: string;
  shelf: string;
  position?: string;
  barcode: string;
  occupied: boolean;
  recordId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UtilizationReport {
  warehouseId: string;
  warehouseName: string;
  totalLocations: number;
  occupiedLocations: number;
  utilizationPercentage: number;
  aisleBreakdown: AisleUtilization[];
  generatedAt: string;
}

export interface AisleUtilization {
  aisle: string;
  totalLocations: number;
  occupiedLocations: number;
  utilizationPercentage: number;
}
