import { he } from './i18n/he.js';
import { Sidebar } from './layout/Sidebar.js';

export function App() {
  return (
    <div dir="rtl" className="flex min-h-screen flex-col bg-page md:h-screen md:flex-row">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-3xl font-black text-gray-900">{he.home.title}</h2>
          <div className="rounded-4xl border-2 border-dashed border-gray-200 bg-white p-12 text-center md:p-20">
            <p className="font-bold text-gray-400">{he.home.prompt}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
