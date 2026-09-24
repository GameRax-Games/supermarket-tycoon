import { DEPARTMENTS, MANAGERS, UPGRADES, INITIAL_CLICK_POWER } from './data';
import type { GameState, DepartmentState } from './types';

export function formatMoney(n: number): string {
  if (n < 0) return '-' + formatMoney(-n);
  if (n < 1000) return '$' + n.toFixed(2).replace(/\.?0+$/, '') || '$0';
  const units = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  const tier = Math.floor(Math.log10(n) / 3);
  if (tier >= units.length) return '$' + n.toExponential(2);
  const scaled = n / Math.pow(10, tier * 3);
  return '$' + scaled.toFixed(2).replace(/\.?0+$/, '') + units[tier];
}

export function formatNumber(n: number): string {
  if (n < 1000) return Math.floor(n).toString();
  const units = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  const tier = Math.floor(Math.log10(n) / 3);
  if (tier >= units.length) return n.toExponential(2);
  const scaled = n / Math.pow(10, tier * 3);
  return scaled.toFixed(2).replace(/\.?0+$/, '') + units[tier];
}

export function getUpgradeLevel(state: GameState, upgradeId: string): number {
  return state.upgrades[upgradeId] ?? 0;
}

export function getUpgradeCost(state: GameState, upgradeId: string): number {
  const def = UPGRADES.find(u => u.id === upgradeId)!;
  const level = getUpgradeLevel(state, upgradeId);
  return Math.ceil(def.baseCost * Math.pow(def.costGrowth, level));
}

export function getIncomeMultiplier(state: GameState): number {
  const marketingLevel = getUpgradeLevel(state, 'income_boost');
  const incomeBonus = 1 + marketingLevel * 0.1;
  return incomeBonus * state.prestigeMultiplier;
}

export function getDiscountMultiplier(state: GameState): number {
  const bulkLevel = getUpgradeLevel(state, 'bulk_discount');
  return Math.max(0.1, 1 - bulkLevel * 0.03);
}

export function getOfflineRate(state: GameState): number {
  const nightLevel = getUpgradeLevel(state, 'offline_efficiency');
  return 0.5 + nightLevel * 0.05;
}

export function getClickPower(state: GameState): number {
  const cashierLevel = getUpgradeLevel(state, 'click_power');
  return (INITIAL_CLICK_POWER + cashierLevel) * getIncomeMultiplier(state);
}

export function getDepartmentRevenue(state: GameState, departmentId: string): number {
  const def = DEPARTMENTS.find(d => d.id === departmentId)!;
  const deptState = state.departments[departmentId];
  if (!deptState || deptState.level === 0) return 0;
  return def.baseRevenue * deptState.level * getIncomeMultiplier(state);
}

export function getDepartmentCycleTime(_departmentId: string): number {
  // All departments share the same cycle time for simplicity
  return 1000;
}

export function getDepartmentUpgradeCost(state: GameState, departmentId: string): number {
  const def = DEPARTMENTS.find(d => d.id === departmentId)!;
  const deptState = state.departments[departmentId];
  const nextLevel = (deptState?.level ?? 0) + 1;
  return Math.ceil(def.baseCost * Math.pow(def.costGrowth, nextLevel - 1) * getDiscountMultiplier(state));
}

export function getManagerCost(state: GameState, managerId: string): number {
  const def = MANAGERS.find(m => m.id === managerId)!;
  return def.baseCost;
}

export function getDepartmentById(deptId: string) {
  return DEPARTMENTS.find(d => d.id === deptId)!;
}

export function canAfford(state: GameState, cost: number): boolean {
  return state.cash >= cost;
}

export function getPrestigeGain(state: GameState): number {
  // Every $1B total earned gives 1 prestige point (square root scaling for balance)
  if (state.totalEarned < 1e9) return 0;
  return Math.floor(Math.sqrt(state.totalEarned / 1e9));
}

export function getPrestigeMultiplier(points: number): number {
  // Each prestige point gives +10% income
  return 1 + points * 0.1;
}

export function getTotalIncomePerSecond(state: GameState): number {
  let total = 0;
  for (const def of DEPARTMENTS) {
    const dept = state.departments[def.id];
    if (dept && dept.level > 0 && dept.hasManager) {
      total += getDepartmentRevenue(state, def.id);
    }
  }
  return total;
}
