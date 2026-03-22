import clsx from 'clsx';
import { ShieldAlert, AlertTriangle, CheckCircle, TrendingDown, Tag } from 'lucide-react';

const STATUS_CONFIG = {
  Expired:         { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/30',    Icon: ShieldAlert },
  'Expiring Soon': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', Icon: AlertTriangle },
  Safe:            { bg: 'bg-green-500/10',  text: 'text-green-400',  border: 'border-green-500/30',  Icon: CheckCircle },
  'Low Stock':     { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', Icon: TrendingDown },
  Discount:        { bg: 'bg-accent-500/10', text: 'text-accent-400', border: 'border-accent-500/30', Icon: Tag },
};

export default function StatusBadge({ type, value }) {
  const cfg = STATUS_CONFIG[type] || STATUS_CONFIG['Safe'];
  const Icon = cfg.Icon;

  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm whitespace-nowrap",
      cfg.bg, cfg.text, cfg.border
    )}>
      <Icon className="w-3.5 h-3.5" />
      {value || type}
    </span>
  );
}
