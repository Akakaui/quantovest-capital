import type { ReactNode } from 'react';
import { Icon } from '@iconify/react';

type EmptyStateProps = {
  title: string;
  hint?: string;
  icon?: string;
  action?: ReactNode;
};

export default function EmptyState({ title, hint, icon = 'solar:inbox-bold', action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[#2B393F] bg-[#10161A]/40 px-6 py-12 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#1A2429] border border-[#2B393F] flex items-center justify-center mb-4">
        <Icon icon={icon} className="w-7 h-7 text-[#75928A]" />
      </div>
      <p className="text-sm font-semibold text-[#E8EFEB]">{title}</p>
      {hint && <p className="text-xs text-[#7F8C86] mt-2 max-w-sm">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}