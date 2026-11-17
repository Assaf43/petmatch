import type { PetProfile, RecommendationResult } from '@petmatch/core';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { fetchRecommendations } from './api/client.js';
import { he } from './i18n/he.js';
import { Sidebar } from './layout/Sidebar.js';
import { ProfileForm } from './profile/ProfileForm.js';
import { loadProfile, saveProfile } from './profile/storage.js';
import { ResultsPage } from './results/ResultsPage.js';

type View =
  | { kind: 'form' }
  | { kind: 'loading' }
  | { kind: 'results'; result: RecommendationResult }
  | { kind: 'error' };

export function App() {
  const [profile, setProfile] = useState<PetProfile | null>(() => loadProfile());
  const [view, setView] = useState<View>({ kind: 'form' });
  const controller = useRef<AbortController | null>(null);

  // Drop an in-flight request when the app goes away.
  useEffect(() => {
    return () => {
      controller.current?.abort();
    };
  }, []);

  async function search(forProfile: PetProfile) {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setView({ kind: 'loading' });
    try {
      const result = await fetchRecommendations(forProfile, current.signal);
      if (current.signal.aborted) return;
      setView({ kind: 'results', result });
    } catch {
      // An aborted request was replaced or abandoned on purpose; anything else is shown.
      if (current.signal.aborted) return;
      setView({ kind: 'error' });
    }
  }

  function handleSubmit(submitted: PetProfile) {
    saveProfile(submitted);
    setProfile(submitted);
    void search(submitted);
  }

  function showForm() {
    controller.current?.abort();
    setView({ kind: 'form' });
  }

  return (
    <div dir="rtl" className="flex min-h-screen flex-col bg-page md:h-screen md:flex-row">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-10">
        <div className="mx-auto max-w-5xl">
          {view.kind === 'form' && (
            <div className="mx-auto max-w-3xl space-y-8">
              <h2 className="text-3xl font-black text-gray-900">{he.home.title}</h2>
              <ProfileForm initial={profile} onSubmit={handleSubmit} />
            </div>
          )}

          {view.kind === 'loading' && (
            <div
              role="status"
              className="flex flex-col items-center gap-4 rounded-4xl bg-white p-16 text-center shadow-card"
            >
              <LoaderCircle size={40} className="animate-spin text-brand-blue" aria-hidden="true" />
              <p className="font-bold text-gray-600">{he.loading}</p>
            </div>
          )}

          {view.kind === 'results' && profile && (
            <ResultsPage profile={profile} result={view.result} onEdit={showForm} />
          )}

          {view.kind === 'error' && (
            <div
              role="alert"
              className="flex flex-col items-center gap-5 rounded-4xl bg-white p-12 text-center shadow-card"
            >
              <p className="font-bold text-gray-700">{he.error.message}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (profile) void search(profile);
                  }}
                  className="cursor-pointer rounded-2xl bg-brand-blue px-6 py-3 font-black text-white shadow-premium"
                >
                  {he.error.retry}
                </button>
                <button
                  type="button"
                  onClick={showForm}
                  className="cursor-pointer rounded-2xl border border-gray-200 bg-white px-6 py-3 font-bold text-gray-700"
                >
                  {he.error.edit}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
