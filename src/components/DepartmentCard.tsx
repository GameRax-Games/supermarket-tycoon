import { useState } from 'react';
import * as Icons from 'lucide-react';
import { ChevronUp, Lock, UserPlus, Check } from 'lucide-react';
import type { DepartmentState } from '@/game/types';
import { DEPARTMENTS, MANAGERS } from '@/game/data';
import {
  getDepartmentRevenue, getDepartmentUpgradeCost, getManagerCost,
} from '@/game/utils';
import { formatMoney } from '@/game/utils';
import type { GameState } from '@/game/types';

interface DepartmentCardProps {
  deptId: string;
  state: GameState;
  onCollect: (id: string) => void;
  onBuy: (id: string) => void;
  onHireManager: (id: string) => void;
}

export function DepartmentCard({ deptId, state, onCollect, onBuy, onHireManager }: DepartmentCardProps) {
  const def = DEPARTMENTS.find(d => d.id === deptId)!;
  const dept: DepartmentState = state.departments[deptId];
  const isUnlocked = dept.level > 0;
  const upgradeCost = getDepartmentUpgradeCost(state, deptId);
  const canUpgrade = state.cash >= upgradeCost;
  const revenue = getDepartmentRevenue(state, deptId);
  const manager = MANAGERS.find(m => m.departmentId === deptId);
  const managerCost = manager ? getManagerCost(state, manager.id) : 0;
  const canHireManager = manager && !dept.hasManager && state.cash >= managerCost;

  // Check if previous department is at level 5+ for unlock
  const deptIndex = DEPARTMENTS.findIndex(d => d.id === deptId);
  const prevDef = deptIndex > 0 ? DEPARTMENTS[deptIndex - 1] : null;
  const prevDept = prevDef ? state.departments[prevDef.id] : null;
  const isLocked = !isUnlocked && (!prevDept || prevDept.level < 5);

  const Icon = (Icons as any)[def.icon] ?? Icons.Store;
  const ManagerIcon = manager ? ((Icons as any)[manager.icon] ?? Icons.User) : Icons.User;

  if (isLocked) {
    return (
      <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800/50 flex items-center gap-3 opacity-60">
        <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center">
          <Lock className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-500">{def.name}</div>
          <div className="text-xs text-slate-600">
            {prevDef ? `Unlock by reaching ${prevDef.name} Lv 5` : 'Locked'}
          </div>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    // Can be purchased (first time)
    return (
      <button
        onClick={() => canUpgrade && onBuy(deptId)}
        disabled={!canUpgrade}
        className={`w-full text-left p-4 rounded-2xl border transition-all ${
          canUpgrade
            ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-400/60 hover:bg-emerald-500/10 cursor-pointer'
            : 'border-slate-700/40 bg-slate-800/20 cursor-not-allowed'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${canUpgrade ? 'bg-emerald-500/15' : 'bg-slate-700/30'}`}>
            <Icon className={`w-6 h-6 ${canUpgrade ? 'text-emerald-400' : 'text-slate-500'}`} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-100">{def.name}</div>
            <div className="text-xs text-slate-400">{def.description}</div>
            <div className={`text-sm font-bold mt-1 ${canUpgrade ? 'text-emerald-400' : 'text-slate-500'}`}>
              {formatMoney(upgradeCost)}
            </div>
          </div>
        </div>
      </button>
    );
  }

  // Active department
  return (
    <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600/50 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-emerald-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-100">{def.name}</div>
              <div className="text-xs text-slate-400">Level {dept.level}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-emerald-400">{formatMoney(revenue)}</div>
              <div className="text-xs text-slate-500">per cycle</div>
            </div>
          </div>

          {/* Progress / Collect button */}
          {dept.hasManager ? (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-sky-400">
              <Icons.CircleCheck className="w-4 h-4" />
              <span>Auto-collecting</span>
            </div>
          ) : (
            <button
              onClick={() => onCollect(deptId)}
              disabled={dept.progress < 1}
              className={`mt-2 w-full h-9 rounded-lg relative overflow-hidden transition-all ${
                dept.progress >= 1
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 cursor-pointer'
                  : 'bg-slate-700/30 cursor-not-allowed'
              }`}
            >
              <div
                className="absolute inset-0 bg-gradient-to-r from-emerald-500/40 to-emerald-400/30 transition-all"
                style={{ width: `${dept.progress * 100}%` }}
              />
              <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${dept.progress >= 1 ? 'text-emerald-300' : 'text-slate-400'}`}>
                {dept.progress >= 1 ? 'COLLECT' : `${Math.floor(dept.progress * 100)}%`}
              </span>
            </button>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => canUpgrade && onBuy(deptId)}
              disabled={!canUpgrade}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                canUpgrade
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                  : 'bg-slate-700/20 text-slate-500 border border-slate-700/30 cursor-not-allowed'
              }`}
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Upgrade · {formatMoney(upgradeCost)}</span>
            </button>

            {manager && !dept.hasManager && (
              <button
                onClick={() => canHireManager && onHireManager(manager.id)}
                disabled={!canHireManager}
                className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  canHireManager
                    ? 'bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/30'
                    : 'bg-slate-700/20 text-slate-500 border border-slate-700/30 cursor-not-allowed'
                }`}
                title={`Hire ${manager.name} for ${formatMoney(managerCost)}`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{formatMoney(managerCost)}</span>
              </button>
            )}

            {dept.hasManager && (
              <div className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{manager?.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
