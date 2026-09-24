import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEPARTMENTS, MANAGERS, UPGRADES, CYCLE_TIME,
  OFFLINE_BASE_RATE, OFFLINE_MAX_HOURS, createInitialState,
} from './data';
import type { GameState } from './types';
import {
  getDepartmentRevenue, getDepartmentUpgradeCost, getManagerCost,
  getUpgradeCost, getClickPower, getOfflineRate, getPrestigeGain,
  getPrestigeMultiplier, getIncomeMultiplier,
} from './utils';

const SAVE_KEY = 'supermarket-tycoon-save';

function loadGame(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as GameState;
    const base = createInitialState();
    // Merge to handle new departments added in updates
    const merged: GameState = {
      ...base,
      ...parsed,
      departments: { ...base.departments, ...parsed.departments },
      upgrades: { ...parsed.upgrades },
    };
    return merged;
  } catch {
    return createInitialState();
  }
}

function saveGame(state: GameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export interface OfflineEarnings {
  amount: number;
  duration: number;
}

export function useGame() {
  const [state, setState] = useState<GameState>(loadGame);
  const [offlineEarnings, setOfflineEarnings] = useState<OfflineEarnings | null>(null);
  const [lastTickIncome, setLastTickIncome] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Offline earnings calculation on mount
  useEffect(() => {
    const s = stateRef.current;
    const now = Date.now();
    const elapsed = now - s.lastSeen;
    const maxMs = OFFLINE_MAX_HOURS * 60 * 60 * 1000;
    const effectiveElapsed = Math.min(elapsed, maxMs);

    if (effectiveElapsed < 5000) return; // Less than 5 seconds, no offline earnings

    // Calculate income from automated departments
    let incomePerCycle = 0;
    for (const def of DEPARTMENTS) {
      const dept = s.departments[def.id];
      if (dept && dept.level > 0 && dept.hasManager) {
        incomePerCycle += getDepartmentRevenue(s, def.id);
      }
    }

    if (incomePerCycle <= 0) return;

    const cycles = effectiveElapsed / CYCLE_TIME;
    const rate = getOfflineRate(s);
    const earned = incomePerCycle * cycles * rate;

    if (earned > 0) {
      setState(prev => ({
        ...prev,
        cash: prev.cash + earned,
        totalEarned: prev.totalEarned + earned,
      }));
      setOfflineEarnings({ amount: earned, duration: effectiveElapsed });
    }
  }, []); // Run once on mount

  // Game loop
  useEffect(() => {
    let lastTime = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const dt = now - lastTime;
      lastTime = now;

      setState(prev => {
        let cashEarnedThisTick = 0;
        const newDepartments = { ...prev.departments };

        for (const def of DEPARTMENTS) {
          const dept = prev.departments[def.id];
          if (!dept || dept.level === 0) continue;

          if (dept.hasManager) {
            // Auto-collect
            const revenue = getDepartmentRevenue(prev, def.id) * (dt / CYCLE_TIME);
            cashEarnedThisTick += revenue;
          } else {
            // Progress bar fills up, then waits for click
            const progressPerMs = 1 / CYCLE_TIME;
            const newProgress = Math.min(1, dept.progress + progressPerMs * dt);
            newDepartments[def.id] = { ...dept, progress: newProgress };
          }
        }

        if (cashEarnedThisTick > 0) {
          setLastTickIncome(cashEarnedThisTick * (1000 / dt));
          return {
            ...prev,
            cash: prev.cash + cashEarnedThisTick,
            totalEarned: prev.totalEarned + cashEarnedThisTick,
            departments: newDepartments,
            lastSeen: now,
          };
        }
        return { ...prev, departments: newDepartments, lastSeen: now };
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Auto-save every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveGame({ ...stateRef.current, lastSeen: Date.now() });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Save on unmount / page hide
  useEffect(() => {
    const handler = () => saveGame({ ...stateRef.current, lastSeen: Date.now() });
    window.addEventListener('beforeunload', handler);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) handler();
    });
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // Actions
  const collectDepartment = useCallback((departmentId: string) => {
    setState(prev => {
      const dept = prev.departments[departmentId];
      if (!dept || dept.level === 0 || dept.hasManager) return prev;
      if (dept.progress < 1) return prev; // Not ready

      const revenue = getDepartmentRevenue(prev, departmentId);
      return {
        ...prev,
        cash: prev.cash + revenue,
        totalEarned: prev.totalEarned + revenue,
        departments: {
          ...prev.departments,
          [departmentId]: { ...dept, progress: 0 },
        },
      };
    });
  }, []);

  const buyDepartment = useCallback((departmentId: string) => {
    setState(prev => {
      const cost = getDepartmentUpgradeCost(prev, departmentId);
      if (prev.cash < cost) return prev;
      const dept = prev.departments[departmentId];
      return {
        ...prev,
        cash: prev.cash - cost,
        departments: {
          ...prev.departments,
          [departmentId]: { ...dept, level: dept.level + 1 },
        },
      };
    });
  }, []);

  const hireManager = useCallback((managerId: string) => {
    setState(prev => {
      const manager = MANAGERS.find(m => m.id === managerId);
      if (!manager) return prev;
      const dept = prev.departments[manager.departmentId];
      if (!dept || dept.hasManager) return prev;
      const cost = getManagerCost(prev, managerId);
      if (prev.cash < cost) return prev;
      return {
        ...prev,
        cash: prev.cash - cost,
        managerCount: prev.managerCount + 1,
        departments: {
          ...prev.departments,
          [manager.departmentId]: { ...dept, hasManager: true, progress: 0 },
        },
      };
    });
  }, []);

  const buyUpgrade = useCallback((upgradeId: string) => {
    setState(prev => {
      const def = UPGRADES.find(u => u.id === upgradeId);
      if (!def) return prev;
      const level = prev.upgrades[upgradeId] ?? 0;
      if (level >= def.maxLevel) return prev;
      const cost = getUpgradeCost(prev, upgradeId);
      if (prev.cash < cost) return prev;
      return {
        ...prev,
        cash: prev.cash - cost,
        upgrades: { ...prev.upgrades, [upgradeId]: level + 1 },
      };
    });
  }, []);

  const clickCollect = useCallback((departmentId: string) => {
    setState(prev => {
      const dept = prev.departments[departmentId];
      if (!dept || dept.level === 0 || dept.hasManager) return prev;
      // Click collects if progress is full, OR gives a small boost
      if (dept.progress >= 1) {
        const revenue = getDepartmentRevenue(prev, departmentId);
        return {
          ...prev,
          cash: prev.cash + revenue,
          totalEarned: prev.totalEarned + revenue,
          departments: {
            ...prev.departments,
            [departmentId]: { ...dept, progress: 0 },
          },
        };
      }
      // Small click power bonus
      const clickRev = getClickPower(prev);
      return {
        ...prev,
        cash: prev.cash + clickRev,
        totalEarned: prev.totalEarned + clickRev,
      };
    });
  }, []);

  const prestige = useCallback(() => {
    setState(prev => {
      const gain = getPrestigeGain(prev);
      if (gain <= 0) return prev;
      const newPoints = prev.prestigePoints + gain;
      const fresh = createInitialState();
      return {
        ...fresh,
        prestigePoints: newPoints,
        prestigeMultiplier: getPrestigeMultiplier(newPoints),
        startedAt: prev.startedAt,
        lastSeen: Date.now(),
      };
    });
  }, []);

  const dismissOfflineEarnings = useCallback(() => {
    setOfflineEarnings(null);
  }, []);

  const hardReset = useCallback(() => {
    const fresh = createInitialState();
    setState(fresh);
    saveGame(fresh);
    setOfflineEarnings(null);
  }, []);

  return {
    state,
    lastTickIncome,
    offlineEarnings,
    collectDepartment,
    buyDepartment,
    hireManager,
    buyUpgrade,
    clickCollect,
    prestige,
    dismissOfflineEarnings,
    hardReset,
    incomeMultiplier: getIncomeMultiplier(state),
  };
}
