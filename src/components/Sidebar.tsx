import { useState, useEffect } from 'react';
import {
  Wallet, TrendingUp, Coins, Zap, Trophy, RotateCcw,
  Store, Sparkles, Clock, ChevronRight, Star,
} from 'lucide-react';
import type { GameState } from '@/game/types';
import {
  formatMoney, formatNumber, getUpgradeLevel, getUpgradeCost,
  getIncomeMultiplier, getPrestigeGain, getTotalIncomePerSecond,
} from '@/game/utils';
import { UPGRADES } from '@/game/data';

interface SidebarProps {
  state: GameState;
  incomeMultiplier: number;
  onBuyUpgrade: (id: string) => void;
  onPrestige: () => void;
  onHardReset: () => void;
}

type Tab = 'upgrades' | 'prestige' | 'stats';

export function Sidebar({ state, incomeMultiplier, onBuyUpgrade, onPrestige, onHardReset }: SidebarProps) {
  const [tab, setTab] = useState<Tab>('upgrades');
  const prestigeGain = getPrestigeGain(state);
  const totalIncome = getTotalIncomePerSecond(state);

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-slate-700/50">
        {([
          { id: 'upgrades' as const, label: 'Upgrades', icon: Zap },
          { id: 'prestige' as const, label: 'Prestige', icon: Trophy },
          { id: 'stats' as const, label: 'Stats', icon: TrendingUp },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-all ${
              tab === t.id
                ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {tab === 'upgrades' && <UpgradesTab state={state} onBuyUpgrade={onBuyUpgrade} />}
        {tab === 'prestige' && (
          <PrestigeTab
            state={state}
            prestigeGain={prestigeGain}
            incomeMultiplier={incomeMultiplier}
            onPrestige={onPrestige}
          />
        )}
        {tab === 'stats' && (
          <StatsTab state={state} totalIncome={totalIncome} onHardReset={onHardReset} />
        )}
      </div>
    </div>
  );
}

function UpgradesTab({ state, onBuyUpgrade }: { state: GameState; onBuyUpgrade: (id: string) => void }) {
  return (
    <>
      {UPGRADES.map(u => {
        const level = getUpgradeLevel(state, u.id);
        const cost = getUpgradeCost(state, u.id);
        const maxed = level >= u.maxLevel;
        const canAfford = state.cash >= cost;
        const Icon = getIconByName(u.icon);

        return (
          <button
            key={u.id}
            onClick={() => !maxed && canAfford && onBuyUpgrade(u.id)}
            disabled={maxed || !canAfford}
            className={`w-full text-left p-3 rounded-xl border transition-all ${
              maxed
                ? 'border-amber-500/30 bg-amber-500/5'
                : canAfford
                ? 'border-slate-700/50 bg-slate-800/40 hover:border-emerald-500/50 hover:bg-emerald-500/5 cursor-pointer'
                : 'border-slate-700/30 bg-slate-800/20 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                maxed ? 'bg-amber-500/20' : canAfford ? 'bg-emerald-500/15' : 'bg-slate-700/30'
              }`}>
                <Icon className={`w-5 h-5 ${maxed ? 'text-amber-400' : canAfford ? 'text-emerald-400' : 'text-slate-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-100">{u.name}</span>
                  <span className={`text-xs font-medium ${maxed ? 'text-amber-400' : 'text-slate-400'}`}>
                    Lv {level}/{u.maxLevel}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{u.description}</p>
                <div className="flex items-center justify-between mt-1.5">
                  {maxed ? (
                    <span className="text-xs font-bold text-amber-400">MAXED</span>
                  ) : (
                    <span className={`text-xs font-semibold ${canAfford ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {formatMoney(cost)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </>
  );
}

function PrestigeTab({
  state, prestigeGain, incomeMultiplier, onPrestige,
}: {
  state: GameState;
  prestigeGain: number;
  incomeMultiplier: number;
  onPrestige: () => void;
}) {
  const newMultiplier = 1 + (state.prestigePoints + prestigeGain) * 0.1;
  const canPrestige = prestigeGain > 0;

  return (
    <div className="space-y-4">
      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
        <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-2" />
        <h3 className="text-lg font-bold text-slate-100">Prestige</h3>
        <p className="text-xs text-slate-400 mt-1">
          Reset your supermarket to earn Prestige Points. Each point permanently boosts all income by 10%.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={Star} label="Current Points" value={formatNumber(state.prestigePoints)} />
        <StatCard icon={Sparkles} label="Current Boost" value={`x${incomeMultiplier.toFixed(2)}`} />
      </div>

      <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">You will gain</span>
          <span className={`text-lg font-bold ${canPrestige ? 'text-amber-400' : 'text-slate-500'}`}>
            {prestigeGain > 0 ? '+' + formatNumber(prestigeGain) : '—'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">New income boost</span>
          <span className="text-sm font-semibold text-emerald-400">x{newMultiplier.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={() => canPrestige && confirm('Are you sure? This resets your supermarket but keeps prestige points.') && onPrestige()}
        disabled={!canPrestige}
        className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
          canPrestige
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/20'
            : 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
        }`}
      >
        {canPrestige ? `Prestige for ${formatNumber(prestigeGain)} points` : 'Need $1B total earned'}
      </button>
    </div>
  );
}

function StatsTab({
  state, totalIncome, onHardReset,
}: {
  state: GameState;
  totalIncome: number;
  onHardReset: () => void;
}) {
  const playTime = Date.now() - state.startedAt;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={Wallet} label="Cash" value={formatMoney(state.cash)} />
        <StatCard icon={TrendingUp} label="Total Earned" value={formatMoney(state.totalEarned)} />
        <StatCard icon={Store} label="Departments" value={Object.values(state.departments).filter(d => d.level > 0).length + '/' + Object.keys(state.departments).length} />
        <StatCard icon={Zap} label="Income/sec" value={formatMoney(totalIncome)} />
        <StatCard icon={Star} label="Prestige Points" value={formatNumber(state.prestigePoints)} />
        <StatCard icon={Sparkles} label="Income Boost" value={`x${(1 + state.prestigePoints * 0.1).toFixed(2)}`} />
      </div>

      <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Clock className="w-4 h-4" />
          <span>Play time: {formatPlayTime(playTime)}</span>
        </div>
      </div>

      <button
        onClick={() => confirm('Reset ALL progress including prestige? This cannot be undone.') && onHardReset()}
        className="w-full py-2.5 rounded-xl text-sm font-medium text-red-400/70 border border-red-500/20 hover:bg-red-500/10 transition-all"
      >
        <RotateCcw className="w-4 h-4 inline mr-1.5" />
        Hard Reset
      </button>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="text-sm font-bold text-slate-100">{value}</div>
    </div>
  );
}

function formatPlayTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function getIconByName(name: string): any {
  const icons: Record<string, any> = {
    MousePointerClick: Zap,
    Megaphone: Sparkles,
    Percent: ChevronRight,
    Moon: Clock,
  };
  return icons[name] ?? Zap;
}
