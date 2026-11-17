import type { Match } from '@petmatch/core';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { he } from '../i18n/he.js';
import { ProteinIllustration } from './ProteinIllustration.js';

export function FoodCard({ match }: { match: Match }) {
  const { food, score, reasons } = match;
  return (
    <article className="group relative flex flex-col rounded-4xl border border-gray-50 bg-white p-6 shadow-card transition-all duration-500 hover:shadow-premium">
      <div className="absolute top-5 left-5 z-10 flex items-center gap-1.5 rounded-full bg-match-bg px-3 py-1.5 text-match-green">
        <span className="text-sm font-black">{score}%</span>
        <span className="text-[10px] font-black">{he.results.matchLabel}</span>
      </div>

      <ProteinIllustration protein={food.mainProtein} />

      <div className="mt-5 mb-4 flex flex-col gap-1.5">
        <span className="text-[11px] font-black tracking-tight text-brand-blue">{food.brand}</span>
        <h3 className="text-base leading-tight font-bold text-gray-800">{food.name}</h3>
      </div>

      <ul className="mb-6 flex flex-col gap-2">
        {reasons.map((reason) => (
          <li
            key={reason.code}
            className={`flex items-start gap-2 text-sm ${
              reason.kind === 'positive' ? 'text-gray-700' : 'text-gray-400'
            }`}
          >
            {reason.kind === 'positive' ? (
              <Plus size={16} className="mt-0.5 shrink-0 text-match-green" aria-hidden="true" />
            ) : (
              <Minus size={16} className="mt-0.5 shrink-0 text-gray-400" aria-hidden="true" />
            )}
            <span>{he.reason[reason.code]}</span>
          </li>
        ))}
      </ul>

      <a
        href={food.buyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto flex items-center justify-center gap-2 rounded-[18px] bg-gray-900 p-3.5 font-bold text-white shadow-sm transition-all duration-300 hover:bg-brand-blue hover:shadow-premium"
      >
        <ShoppingCart size={18} aria-hidden="true" />
        {he.results.buy}
      </a>
    </article>
  );
}
