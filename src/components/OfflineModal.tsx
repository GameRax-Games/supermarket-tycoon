import { Moon, X } from 'lucide-react';
import { formatMoney } from '@/game/utils';

interface OfflineModalProps {
  amount: number;
  duration: number;
  onDismiss: () => void;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function OfflineModal({ amount, duration, onDismiss }: OfflineModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative max-w-sm w-full p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl">
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-sky-500/10 flex items-center justify-center mx-auto mb-4">
            <Moon className="w-8 h-8 text-sky-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Welcome Back!</h2>
          <p className="text-sm text-slate-400 mt-1">
            Your managers kept things running for {formatDuration(duration)}
          </p>
          <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-2xl font-bold text-emerald-400">{formatMoney(amount)}</div>
            <div className="text-xs text-slate-400 mt-1">earned while away</div>
          </div>
          <button
            onClick={onDismiss}
            className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20"
          >
            Collect
          </button>
        </div>
      </div>
    </div>
  );
}
