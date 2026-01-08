'use client';

import React, { useMemo, useState } from 'react';
import zorgDataRaw from '../data/zorgdata.json';
import { ZorgData, ZorgCategory } from '../types/zorg';

const zorgData = zorgDataRaw as ZorgData;

type View = 'dashboard' | 'category' | 'definities' | 'contacten' | 'annuaires';

function cleanText(s?: string) {
  if (!s) return '';
  return s
    .replace(/\s*\[cite:[^\]]+\]\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// alias → extra zoektermen (OR)
const queryAliases: Array<[string, string[]]> = [
  ['thuiszorg', ['ssiad', 'soins infirmiers', 'domicile']],
  ['zorg aan huis', ['ssiad', 'domicile']],
  ['thuisverpleging', ['ssiad', 'infirmier', 'domicile']],
  ['verzorgingshuis', ['ehpad', 'maison de retraite', 'établissement']],
  ['verpleeghuis', ['ehpad', 'maison de retraite', 'établissement']],
  ['dagopvang', ['accueil de jour', 'adj']],
  ['dagbesteding', ['accueil de jour', 'adj']],
  ['tijdelijk verblijf', ['hébergement temporaire', 'heb_temp']],
  ['respijtzorg', ['répit', 'pfr', 'heb_temp']],
  ['mantelzorg', ['aidant', 'pfr']],
  ['zorgtoelage', ['apa']],
  ['autonomie', ['apa']]
];

export default function Home() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<ZorgCategory | null>(null);
  const [q, setQ] = useState('');

  // Build OR-query list: the raw query + synonym expansions
  const queryList = useMemo(() => {
    const base = q.trim().toLowerCase();
    if (!base) return [] as string[];

    const list = new Set<string>();
    list.add(base);

    // also add individual tokens from base (helps when user types multiple words)
    base.split(/\s+/).forEach((t) => t && list.add(t));

    for (const [alias, extras] of queryAliases) {
      if (base.includes(alias)) {
        extras.forEach((e) => e && list.add(e.toLowerCase()));
      }
    }

    return Array.from(list).filter(Boolean);
  }, [q]);

  const filteredDefinitions = useMemo(() => {
    const entries = Object.entries(zorgData.definitions || {});
    if (queryList.length === 0) return entries;

    return entries.filter(([key, def]) => {
      const hay = [
        key,
        cleanText(def.term_nl),
        cleanText(def.term_fr),
        cleanText(def.uitleg),
        def.url || ''
      ]
        .join(' ')
        .toLowerCase();

      // OR match: any query term/phrase matches
      return queryList.some((term) => hay.includes(term));
    });
  }, [queryList]);

  const filteredContacts = useMemo(() => {
    const entries = Object.entries(zorgData.contacten || {});
    if (queryList.length === 0) return entries;

    return entries.filter(([key, c]) => {
      const hay = [
        key,
        cleanText(c.naam),
        cleanText(c.nummer),
        cleanText(c.email || ''),
        cleanText(c.details),
        cleanText(c.tijden)
      ]
        .join(' ')
        .toLowerCase();

      return queryList.some((term) => hay.includes(term));
    });
  }, [queryList]);

  const openCategory = (cat: ZorgCategory) => {
    setSelectedCategory(cat);
    setView('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    setSelectedCategory(null);
    setQ('');
    setView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto font-mulish leading-[1.8em]">
      <header className="mb-8 md:mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-poppins text-maroon">
              Mijn Zorgkompas
            </h1>
            <p className="text-base md:text-lg text-gray-700 mt-2">
              NL-dashboard voor ouderenzorg in Frankrijk: begrijp, kies, en vind het juiste loket.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={goHome}
              className="px-4 py-2 rounded-xl border border-maroon/25 text-maroon font-semibold hover:bg-softYellow transition"
            >
              Dashboard
            </button>
            <button
              onClick={() => setView('definities')}
              className="px-4 py-2 rounded-xl border border-maroon/25 text-maroon font-semibold hover:bg-softYellow transition"
            >
              Begrippen
            </button>
            <button
              onClick={() => setView('contacten')}
              className="px-4 py-2 rounded-xl border border-maroon/25 text-maroon font-semibold hover:bg-softYellow transition"
            >
              Nuttige nummers
            </button>
            <button
              onClick={() => setView('annuaires')}
              className="px-4 py-2 rounded-xl border border-maroon/25 text-maroon font-semibold hover:bg-softYellow transition"
            >
              Annuaires
            </button>
          </div>
        </div>
      </header>

      {view === 'dashboard' && (
        <section className="space-y-10">
          <div className="bg-softYellow/35 border border-maroon/10 rounded-3xl p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold font-poppins text-maroon mb-3">
              Start met een vraag
            </h2>
            <p className="text-gray-700 mb-6">
              Kies wat het beste past. U krijgt daarna NL-uitleg, belangrijke begrippen en directe contactopties.
              Officiële Franse bronnen blijven beschikbaar als verdieping.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {zorgData.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => openCategory(cat)}
                  className="text-left p-6 rounded-2xl bg-white border-2 border-maroon/15 hover:border-maroon hover:bg-softYellow transition shadow-sm"
                >
                  <h3 className="text-xl font-bold font-poppins text-maroon mb-1">
                    {cleanText(cat.label_nl)}
                  </h3>
                  <div className="text-sm italic text-maroon/70 mb-3">
                    {cleanText(cat.label_fr)}
                  </div>
                  <p className="text-gray-700 text-sm">
                    {cleanText(cat.description)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl p-6 md:p-8 border border-maroon/10 bg-white">
            <h3 className="text-2xl font-bold font-poppins text-maroon mb-2">
              Snel zoeken (begrippen + nummers)
            </h3>
            <p className="text-gray-700 mb-4">
              Voorbeelden: “Thuiszorg”, “Verzorgingshuis”, “APA”, “EHPAD”, “SSIAD”, “39 77”.
            </p>

            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Zoekterm…"
                className="w-full md:flex-1 px-4 py-3 rounded-xl border border-maroon/20 focus:outline-none focus:ring-2 focus:ring-maroon/20"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setView('definities')}
                  className="px-5 py-3 rounded-xl bg-softYellow text-maroon font-bold border border-maroon/20 hover:border-maroon transition"
                >
                  Begrippen
                </button>
                <button
                  onClick={() => setView('contacten')}
                  className="px-5 py-3 rounded-xl bg-softYellow text-maroon font-bold border border-maroon/20 hover:border-maroon transition"
                >
                  Nummers
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {view === 'category' && selectedCategory && (
        <section className="space-y-10">
          <button onClick={goHome} className="text-maroon font-bold hover:underline font-poppins">
            ← Terug naar dashboard
          </button>

          <div className="bg-softYellow/30 p-6 md:p-8 rounded-3xl border border-maroon/10">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 font-poppins text-maroon">
              {cleanText(selectedCategory.label_nl)}
            </h2>
            <div className="italic text-maroon/70 mb-6">
              {cleanText(selectedCategory.label_fr)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-maroon/10">
                <h3 className="text-2xl font-bold font-poppins text-maroon mb-4">Belangrijke begrippen</h3>
                <div className="space-y-4">
                  {selectedCategory.related_definitions.map((defKey) => {
                    const def = zorgData.definitions[defKey];
                    if (!def) return null;
                    return (
                      <div key={defKey} className="p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-lg font-bold font-poppins text-maroon">
                          {cleanText(def.term_nl)}{' '}
                          <span className="font-normal text-maroon/70">({cleanText(def.term_fr)})</span>
                        </div>
                        <p className="text-gray-700 mt-2">{cleanText(def.uitleg)}</p>
                        <a
                          href={def.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-maroon underline font-semibold text-sm"
                        >
                          Officiële Franse info →
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-maroon/10">
                <h3 className="text-2xl font-bold font-poppins text-maroon mb-4">Hulplijnen & contact</h3>
                <div className="space-y-4">
                  {selectedCategory.related_contacts.map((contactKey) => {
                    const c = zorgData.contacten[contactKey];
                    if (!c) return null;
                    return (
                      <div key={contactKey} className="p-5 rounded-xl border-l-8 border-maroon shadow-md border border-gray-100">
                        <div className="text-lg font-bold font-poppins text-maroon">{cleanText(c.naam)}</div>
                        <div className="text-maroon text-2xl font-mono font-bold my-2">{cleanText(c.nummer)}</div>
                        {c.email && <div className="text-sm font-semibold">E-mail: {cleanText(c.email)}</div>}
                        <p className="text-gray-700 text-sm mt-2">{cleanText(c.details)}</p>
                        <p className="text-xs text-gray-500 italic mt-2">Bereikbaar: {cleanText(c.tijden)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-maroon text-white p-6 md:p-8 rounded-3xl shadow-xl">
            <h3 className="text-2xl font-bold mb-3 font-poppins">Lokale ondersteuning vinden</h3>
            <p className="opacity-90 mb-5">
              Als u niet weet waar te beginnen: start bij het lokale informatiepunt (CLIC / Point d’information local).
            </p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(zorgData.annuaires).map(([key, ann]) => (
                <a
                  key={key}
                  href={ann.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-maroon px-6 py-3 rounded-full font-bold hover:bg-softYellow transition shadow text-center"
                >
                  {cleanText(ann.naam)} →
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {view === 'definities' && (
        <section className="space-y-6">
          <button onClick={goHome} className="text-maroon font-bold hover:underline font-poppins">
            ← Terug naar dashboard
          </button>

          <div className="bg-white rounded-3xl p-6 md:p-8 border border-maroon/10">
            <h2 className="text-3xl font-bold font-poppins text-maroon mb-2">Begrippen (NL → FR)</h2>
            <p className="text-gray-700 mb-5">Typ om te filteren (ook op synoniemen zoals “thuiszorg”, “verzorgingshuis”).</p>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Zoek in begrippen…"
              className="w-full px-4 py-3 rounded-xl border border-maroon/20 focus:outline-none focus:ring-2 focus:ring-maroon/20 mb-6"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDefinitions.map(([key, def]) => (
                <div key={key} className="bg-softYellow/25 p-5 rounded-2xl border border-maroon/10">
                  <div className="text-lg font-bold font-poppins text-maroon">
                    {cleanText(def.term_nl)}{' '}
                    <span className="font-normal text-maroon/70">({cleanText(def.term_fr)})</span>
                  </div>
                  <p className="text-gray-700 mt-2">{cleanText(def.uitleg)}</p>
                  <a
                    href={def.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-maroon underline font-semibold text-sm"
                  >
                    Officiële Franse info →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {view === 'contacten' && (
        <section className="space-y-6">
          <button onClick={goHome} className="text-maroon font-bold hover:underline font-poppins">
            ← Terug naar dashboard
          </button>

          <div className="bg-white rounded-3xl p-6 md:p-8 border border-maroon/10">
            <h2 className="text-3xl font-bold font-poppins text-maroon mb-2">Nuttige nummers</h2>
            <p className="text-gray-700 mb-5">Typ om te filteren. Bij spoed: bel 15 (SAMU) of 112.</p>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Zoek in nummers…"
              className="w-full px-4 py-3 rounded-xl border border-maroon/20 focus:outline-none focus:ring-2 focus:ring-maroon/20 mb-6"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContacts.map(([key, c]) => (
                <div key={key} className="bg-white p-6 rounded-2xl border-l-8 border-maroon shadow-md border border-gray-100">
                  <div className="text-lg font-bold font-poppins text-maroon">{cleanText(c.naam)}</div>
                  <div className="text-maroon text-2xl font-mono font-bold my-2">{cleanText(c.nummer)}</div>
                  {c.email && <div className="text-sm font-semibold">E-mail: {cleanText(c.email)}</div>}
                  <p className="text-gray-700 text-sm mt-2">{cleanText(c.details)}</p>
                  <p className="text-xs text-gray-500 italic mt-2">Bereikbaar: {cleanText(c.tijden)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {view === 'annuaires' && (
        <section className="space-y-6">
          <button onClick={goHome} className="text-maroon font-bold hover:underline font-poppins">
            ← Terug naar dashboard
          </button>

          <div className="bg-white rounded-3xl p-6 md:p-8 border border-maroon/10">
            <h2 className="text-3xl font-bold font-poppins text-maroon mb-2">Officiële annuaires</h2>
            <p className="text-gray-700 mb-6">Gebruik als verdieping of om lokale contactpunten te vinden.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(zorgData.annuaires).map(([key, ann]) => (
                <div key={key} className="bg-softYellow/25 p-5 rounded-2xl border border-maroon/10">
                  <div className="text-lg font-bold font-poppins text-maroon">{cleanText(ann.naam)}</div>
                  <p className="text-gray-700 mt-2">{cleanText(ann.uitleg)}</p>
                  <a
                    href={ann.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 bg-maroon text-white px-5 py-3 rounded-full font-bold hover:opacity-90 transition"
                  >
                    Open officiële annuaire →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
