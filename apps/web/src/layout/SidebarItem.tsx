import type { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}

export function SidebarItem({ icon: Icon, label, active = false }: SidebarItemProps) {
  const style = active
    ? 'bg-brand-blue text-white shadow-premium md:scale-[1.02]'
    : 'text-gray-400 hover:bg-gray-50 hover:text-brand-blue';
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-300 ${style}`}
    >
      <Icon size={20} aria-hidden="true" />
      <span className="text-sm font-bold">{label}</span>
    </button>
  );
}
