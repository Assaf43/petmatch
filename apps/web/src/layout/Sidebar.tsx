import { Dog, Search } from 'lucide-react';
import { he } from '../i18n/he.js';
import { SidebarItem } from './SidebarItem.js';

/** Side navigation on desktop; collapses into a top bar on narrow screens. */
export function Sidebar() {
  return (
    <aside className="flex w-full shrink-0 items-center justify-between gap-4 border-b border-gray-100 bg-white p-4 md:h-full md:w-72 md:flex-col md:items-stretch md:justify-start md:border-b-0 md:border-l md:p-8">
      <div className="flex items-center gap-3 md:mb-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue text-white shadow-premium">
          <Dog size={28} aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-black text-gray-900">{he.app.name}</h1>
      </div>

      <nav aria-label={he.app.name} className="md:space-y-2">
        <SidebarItem icon={Search} label={he.nav.findMatch} active />
      </nav>
    </aside>
  );
}
