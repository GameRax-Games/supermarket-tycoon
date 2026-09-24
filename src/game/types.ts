export interface DepartmentDef {
  id: string;
  name: string;
  icon: string;
  baseCost: number;
  baseRevenue: number;
  costGrowth: number;
  description: string;
}

export interface ManagerDef {
  id: string;
  departmentId: string;
  name: string;
  icon: string;
  baseCost: number;
  description: string;
}

export interface UpgradeDef {
  id: string;
  name: string;
  icon: string;
  baseCost: number;
  costGrowth: number;
  maxLevel: number;
  description: string;
  effect: 'income' | 'click' | 'discount' | 'offline';
  value: number;
}

export interface PrestigeDef {
  multiplier: number;
}

export interface DepartmentState {
  level: number;
  progress: number;
  hasManager: boolean;
}

export interface GameState {
  cash: number;
  totalEarned: number;
  prestigePoints: number;
  prestigeMultiplier: number;
  clickPower: number;
  managerCount: number;
  upgrades: Record<string, number>;
  departments: Record<string, DepartmentState>;
  lastSeen: number;
  startedAt: number;
}
