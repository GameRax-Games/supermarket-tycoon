import type { DepartmentDef, ManagerDef, UpgradeDef } from './types';

export const DEPARTMENTS: DepartmentDef[] = [
  {
    id: 'produce',
    name: 'Produce',
    icon: 'Apple',
    baseCost: 4,
    baseRevenue: 1,
    costGrowth: 1.07,
    description: 'Fresh fruits & vegetables',
  },
  {
    id: 'bakery',
    name: 'Bakery',
    icon: 'Croissant',
    baseCost: 60,
    baseRevenue: 60,
    costGrowth: 1.15,
    description: 'Fresh bread & pastries',
  },
  {
    id: 'dairy',
    name: 'Dairy',
    icon: 'Milk',
    baseCost: 720,
    baseRevenue: 540,
    costGrowth: 1.14,
    description: 'Milk, cheese & eggs',
  },
  {
    id: 'meat',
    name: 'Meat & Fish',
    icon: 'Beef',
    baseCost: 8640,
    baseRevenue: 4320,
    costGrowth: 1.13,
    description: 'Premium cuts & seafood',
  },
  {
    id: 'frozen',
    name: 'Frozen Foods',
    icon: 'Snowflake',
    baseCost: 103680,
    baseRevenue: 62208,
    costGrowth: 1.12,
    description: 'Ice cream & frozen meals',
  },
  {
    id: 'beverages',
    name: 'Beverages',
    icon: 'CupSoda',
    baseCost: 1244160,
    baseRevenue: 746496,
    costGrowth: 1.11,
    description: 'Sodas, juices & drinks',
  },
  {
    id: 'snacks',
    name: 'Snack Aisle',
    icon: 'Cookie',
    baseCost: 14929920,
    baseRevenue: 8957952,
    costGrowth: 1.1,
    description: 'Chips, cookies & candy',
  },
  {
    id: 'household',
    name: 'Household',
    icon: 'Home',
    baseCost: 179159040,
    baseRevenue: 107495424,
    costGrowth: 1.09,
    description: 'Cleaning & supplies',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: 'Tv',
    baseCost: 2149908480,
    baseRevenue: 1289945088,
    costGrowth: 1.08,
    description: 'Gadgets & accessories',
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    icon: 'Pill',
    baseCost: 25798901760,
    baseRevenue: 15479341056,
    costGrowth: 1.07,
    description: 'Health & wellness',
  },
];

export const MANAGERS: ManagerDef[] = [
  { id: 'm_produce', departmentId: 'produce', name: 'Green Grocer', icon: 'Sprout', baseCost: 1000, description: 'Automates Produce' },
  { id: 'm_bakery', departmentId: 'bakery', name: 'Head Baker', icon: 'Wheat', baseCost: 15000, description: 'Automates Bakery' },
  { id: 'm_dairy', departmentId: 'dairy', name: 'Dairy Manager', icon: 'Milk', baseCost: 100000, description: 'Automates Dairy' },
  { id: 'm_meat', departmentId: 'meat', name: 'Butcher', icon: 'Beef', baseCost: 500000, description: 'Automates Meat & Fish' },
  { id: 'm_frozen', departmentId: 'frozen', name: 'Frost Manager', icon: 'Snowflake', baseCost: 1200000, description: 'Automates Frozen Foods' },
  { id: 'm_beverages', departmentId: 'beverages', name: 'Beverage Director', icon: 'CupSoda', baseCost: 10000000, description: 'Automates Beverages' },
  { id: 'm_snacks', departmentId: 'snacks', name: 'Snack Supervisor', icon: 'Cookie', baseCost: 111111111, description: 'Automates Snack Aisle' },
  { id: 'm_household', departmentId: 'household', name: 'Store Manager', icon: 'Home', baseCost: 555555555, description: 'Automates Household' },
  { id: 'm_electronics', departmentId: 'electronics', name: 'Tech Lead', icon: 'Tv', baseCost: 10000000000, description: 'Automates Electronics' },
  { id: 'm_pharmacy', departmentId: 'pharmacy', name: 'Chief Pharmacist', icon: 'Pill', baseCost: 100000000000, description: 'Automates Pharmacy' },
];

export const UPGRADES: UpgradeDef[] = [
  { id: 'click_power', name: 'Better Cashiers', icon: 'MousePointerClick', baseCost: 50, costGrowth: 1.5, maxLevel: 100, description: '+1 click revenue per level', effect: 'click', value: 1 },
  { id: 'income_boost', name: 'Marketing Campaign', icon: 'Megaphone', baseCost: 500, costGrowth: 1.8, maxLevel: 50, description: '+10% all income per level', effect: 'income', value: 0.1 },
  { id: 'bulk_discount', name: 'Bulk Purchasing', icon: 'Percent', baseCost: 1000, costGrowth: 2, maxLevel: 25, description: '-3% department costs per level', effect: 'discount', value: 0.03 },
  { id: 'offline_efficiency', name: 'Night Shift', icon: 'Moon', baseCost: 2000, costGrowth: 1.6, maxLevel: 20, description: '+5% offline earnings per level', effect: 'offline', value: 0.05 },
];

export const CYCLE_TIME = 1000; // ms per cycle
export const INITIAL_CLICK_POWER = 1;
export const OFFLINE_BASE_RATE = 0.5; // 50% of online earnings while away
export const OFFLINE_MAX_HOURS = 8;

export function createInitialState(): import('./types').GameState {
  const departments: Record<string, import('./types').DepartmentState> = {};
  DEPARTMENTS.forEach(d => {
    departments[d.id] = { level: 0, progress: 0, hasManager: false };
  });
  // Give the player the first department at level 1 to start
  departments['produce'].level = 1;
  return {
    cash: 0,
    totalEarned: 0,
    prestigePoints: 0,
    prestigeMultiplier: 1,
    clickPower: INITIAL_CLICK_POWER,
    managerCount: 0,
    upgrades: {},
    departments,
    lastSeen: Date.now(),
    startedAt: Date.now(),
  };
}
