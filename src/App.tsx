import { useState } from 'react';
import { Store } from 'lucide-react';
import { useGame } from '@/game/useGame';
import { DEPARTMENTS } from '@/game/data';
import { TopBar } from '@/components/TopBar';
import { Sidebar } from '@/components/Sidebar';
import { DepartmentCard } from '@/components/DepartmentCard';
import { OfflineModal } from '@/components/OfflineModal';
import { getTotalIncomePerSecond } from '@/game/utils';

function App() {
  const game = useGame();
  const { state, offlineEarnings } = game;
  const [mobileTab, setMobileTab] = useState<'departments' | 'manage'>('departments');
  const incomePerSec = getTotalIncomePerSecond(state);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        <TopBar
          state={state}
          incomeMultiplier={game.incomeMultiplier}
          incomePerSec={incomePerSec}
        />

        {/* Desktop layout */}
        <div className="hidden md:grid md:grid-cols-[1fr_340px] gap-4">
          <div className="space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto pr-1 scrollbar-thin">
            {DEPARTMENTS.map(def => (
              <DepartmentCard
                key={def.id}
                deptId={def.id}
                state={state}
                onCollect={game.clickCollect}
                onBuy={game.buyDepartment}
                onHireManager={game.hireManager}
              />
            ))}
          </div>
          <div className="h-[calc(100vh-140px)]">
            <Sidebar
              state={state}
              incomeMultiplier={game.incomeMultiplier}
              onBuyUpgrade={game.buyUpgrade}
              onPrestige={game.prestige}
              onHardReset={game.hardReset}
            />
          </div>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden">
          {/* Tab switcher */}
          <div className="flex gap-2 mb-3 p-1 rounded-xl bg-slate-900/60 border border-slate-700/50">
            <button
              onClick={() => setMobileTab('departments')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                mobileTab === 'departments' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
              }`}
            >
              <Store className="w-4 h-4" />
              Departments
            </button>
            <button
              onClick={() => setMobileTab('manage')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                mobileTab === 'manage' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
              }`}
            >
              Manage
            </button>
          </div>

          {mobileTab === 'departments' ? (
            <div className="space-y-3">
              {DEPARTMENTS.map(def => (
                <DepartmentCard
                  key={def.id}
                  deptId={def.id}
                  state={state}
                  onCollect={game.clickCollect}
                  onBuy={game.buyDepartment}
                  onHireManager={game.hireManager}
                />
              ))}
            </div>
          ) : (
            <div className="min-h-[400px]">
              <Sidebar
                state={state}
                incomeMultiplier={game.incomeMultiplier}
                onBuyUpgrade={game.buyUpgrade}
                onPrestige={game.prestige}
                onHardReset={game.hardReset}
              />
            </div>
          )}
        </div>
      </div>

      {offlineEarnings && (
        <OfflineModal
          amount={offlineEarnings.amount}
          duration={offlineEarnings.duration}
          onDismiss={game.dismissOfflineEarnings}
        />
      )}
    </div>
  );
}

export default App;
