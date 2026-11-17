import type { ExcludedFood } from '@petmatch/core';
import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { he } from '../i18n/he.js';

function reasonText(excluded: ExcludedFood): string {
  const reason = excluded.excludedBecause;
  if (reason.code === 'SPECIES_MISMATCH') return he.exclusion.SPECIES_MISMATCH;
  const names = reason.allergens.map((allergen) => he.allergenName[allergen]).join(', ');
  return he.exclusion.CONTAINS_ALLERGEN(names);
}

/** Foods the filter removed, with the reason, so the owner can see the filter working. */
export function ExcludedList({ excluded }: { excluded: ExcludedFood[] }) {
  const [open, setOpen] = useState(false);
  const listId = useId();

  if (excluded.length === 0) return null;

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-5">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          setOpen((current) => !current);
        }}
        className="flex w-full cursor-pointer items-center justify-between gap-3 text-start font-bold text-gray-700"
      >
        <span>{he.results.excluded(excluded.length)}</span>
        {/* Visual hint only: aria-expanded already tells assistive tech whether it is open. */}
        <span aria-hidden="true" className="flex items-center gap-1 text-sm text-brand-blue">
          {open ? he.results.hideExcluded : he.results.showExcluded}
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={open ? 'rotate-180 transition' : 'transition'}
          />
        </span>
      </button>

      {open && (
        <ul id={listId} className="mt-4 divide-y divide-gray-100">
          {excluded.map((item) => (
            <li key={item.food.id} className="flex flex-col gap-0.5 py-3">
              <span className="text-sm font-bold text-gray-800">
                {item.food.brand} · {item.food.name}
              </span>
              <span className="text-sm text-gray-500">{reasonText(item)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
