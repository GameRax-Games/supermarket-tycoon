import { Wallet, TrendingUp, Store, Zap } from 'lucide-react';
import type { GameState } from '@/game/types';
import { formatMoney, getTotalIncomePerSecond } from '@/game/utils';

interface TopBarProps {
  state: GameState;
  incomeMultiplier: number;
  incomePerSec: number;
}

export function TopBar({ state, incomeMultiplier, incomePerSec }: TopBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 backdrop-blur-sm border border-slate-700/50">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-100 leading-tight">Supermarket Tycoon</h1>
          <p className="text-xs text-slate-400">Idle Empire Builder</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <StatPill icon={Wallet} label="Cash" value={formatMoney(state.cash)} color="emerald" />
        <StatPill icon={TrendingUp} label="Per sec" value={formatMoney(incomePerSec)} color="sky" />
        <StatPill icon={Zap} label="Boost" value={`x${incomeMultiplier.toFixed(2)}`} color="amber" />
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-400/10',
    sky: 'text-sky-400 bg-sky-400/10',
    amber: 'text-amber-400 bg-amber-400/10',
  };
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="leading-tight">
        <div className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</div>
        <div className="text-sm font-bold text-slate-100">{value}</div>
      </div>
    </div>
  );
}
