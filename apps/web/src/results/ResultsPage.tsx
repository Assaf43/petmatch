import type { PetProfile, RecommendationResult } from '@petmatch/core';
import { Pencil } from 'lucide-react';
import { he } from '../i18n/he.js';
import { ExcludedList } from './ExcludedList.js';
import { FoodCard } from './FoodCard.js';

interface ResultsPageProps {
  profile: PetProfile;
  result: RecommendationResult;
  onEdit: () => void;
}

export function ResultsPage({ profile, result, onEdit }: ResultsPageProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-black text-gray-900">{he.results.title(profile.name)}</h2>
        <button
          type="button"
          onClick={onEdit}
          className="flex cursor-pointer items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:border-brand-blue hover:text-brand-blue"
        >
          <Pencil size={16} aria-hidden="true" />
          {he.results.edit}
        </button>
      </div>

      {result.matches.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {result.matches.map((match) => (
            <FoodCard key={match.food.id} match={match} />
          ))}
        </div>
      ) : (
        <div className="rounded-4xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="font-bold text-gray-500">{he.results.empty}</p>
        </div>
      )}

      <ExcludedList excluded={result.excluded} />

      <p className="text-sm text-gray-500">{he.disclaimer}</p>
    </div>
  );
}
