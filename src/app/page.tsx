'use client';

import React, { useMemo, useState } from 'react';
import zorgDataRaw from '../data/zorgdata.json';
import { ZorgData, ZorgCategory } from '../types/zorg';

const zorgData = zorgDataRaw as ZorgData;

type View =
  | 'dashboard'
  | 'category'
  | 'definities'
  | 'contacten'
  | 'annuaires';

export default function Home() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<ZorgCategory | null>(null);

  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();

  const filteredDefinitions = useMemo(() => {
    const entries = Object.entries(zorgData.definitions || {});
    if (!query) return entries;
    return entries.filter(([key, def]) => {
      const hay = [
        key,
        def.term_nl,
        def.term_fr,
        def.uitleg,
        def.url
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(query);
    });
  }, [query]);

  const filteredContacts = useMemo(() => {
    const entries = Object.entries(zorgData.contacten || {});
    if (!query) return entries;
    return entries.filter(([key, c]) => {
      const hay = [
        key,
        c.naam,
        c.nummer,
        c.email || '',
        c.details,
        c.tijden
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(query);
    });
  }, [query]);

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
            <p className="text-base md:text-lg text-gray-600 mt-2">
              NL-dashboard voor ouderenzorg in Frankrijk: begrijp, kies, en vind het juiste loket.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={goHome}
              className="px-4 py-2 rounded-full border border-maroon/30 text-maroon font-semibold hover:bg-softYellow transition"
            >
              Dashboard
            </button>
            <button
              onClick={() => setView('definities')}
              className="px-4 py-2 rounded-full border border-maroon/30 text-maroon font-semibold hover:bg-softYellow transition"
            >
              Begrippen
            </button>
            <button
              onClick={() => setView('contacten')}
              className="px-4 py-2 rounded-full border border-maroon/30 text-maroon font-semibold hover:bg-softYellow transition"
            >
              Nuttige nummers
            </button>
            <button
              onClick={() => setView('annuaires')}
              className="px-4 py-2 rounded-full border border-maroon/30 text-maroon font-semibold hover:bg-softYellow transition"
            >
              Annuaires
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD */}
      {view === 'dashboard' && (
        <section className="space-y-10">
          {/* Start met een vraag */}
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
                  className="text-left p-6 rounded-2xl bg-white border-2 border-maroon/15 hover:border-maroon hover:bg-softYellow transition"
                >
                  <h3 className="text-xl font-bold font-poppins text-maroon mb-1">
                    {cat.label_nl}
                  </h3>
                  <div className="text-sm italic text-maroon/70 mb-3">
                    {cat.label_fr}
                  </div>
                  <p className="text-gray-700 text-sm">
                    {cat.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Snelle acties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nood */}
            <div className="rounded-3xl p-6 md:p-8 border border-maroon/10 bg-white">
              <h3 className="text-2xl font-bold font-poppins text-maroon mb-2">
                Nood of spoed?
              </h3>
              <p className="text-gray-700 mb-5">
                Bij acute medische nood: bel direct. Deze nummers zijn belangrijk om zichtbaar te houden.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 rounded-full bg-softYellow text-maroon font-bold border border-maroon/20">
                  SAMU: 15
                </span>
                <span className="px-4 py-2 rounded-full bg-softYellow text-maroon font-bold border border-maroon/20">
                  Europees noodnummer: 112
                </span>
                <span className="px-4 py-2 rounded-full bg-softYellow text-maroon font-bold border border-maroon/20">
                  Politie: 17
                </span>
                <span className="px-4 py-2 rounded-full bg-softYellow text-maroon font-bold border border-maroon/20">
                  Brandweer: 18
                </span>
              </div>
              <div className="mt-5">
                <button
                  onClick={() => setView('contacten')}
                  className="text-maroon font-bold hover:underline font-poppins"
                >
                  Bekijk alle nuttige nummers →
                </button>
              </div>
            </div>

            {/* Loket/CLIC */}
            <div className="rounded-3xl p-6 md:p-8 border border-maroon/10 bg-maroon text-white">
              <h3 className="text-2xl font-bold font-poppins mb-2">
                Eerste loket in uw regio (CLIC / Point d’information local)
              </h3>
              <p className="opacity-90 mb-5">
                In Frankrijk wordt ouderenzorg lokaal gecoördineerd. Dit loket helpt u met uitleg, doorverwijzing en
                de juiste procedures in uw departement.
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
                    {ann.naam} →
                  </a>
                ))}
              </div>
              <div className="mt-5">
                <button
                  onClick={() => setView('annuaires')}
                  className="text-white font-bold hover:underline font-poppins"
                >
                  Overzicht annuaires (NL-uitleg) →
                </button>
              </div>
            </div>
          </div>

          {/* Mini-zoekblok */}
          <div className="rounded-3xl p-6 md:p-8 border border-maroon/10 bg-white">
            <h3 className="text-2xl font-bold font-poppins text-maroon mb-2">
              Snel zoeken in begrippen en telefoons
            </h3>
            <p className="text-gray-700 mb-4">
              Typ bijvoorbeeld: “APA”, “EHPAD”, “SSIAD”, “mantelzorger”, “39 77”.
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

      {/* CATEGORY VIEW */}
      {view === 'category' && selectedCategory && (
        <section className="space-y-10">
          <button
            onClick={goHome}
            className="text-maroon font-bold hover:underline font-poppins"
          >
            ← Terug naar dashboard
          </button>

          <div className="bg-softYellow/30 p-6 md:p-8 rounded-3xl border border-maroon/10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 font-poppins text-maroon">
              {selectedCategory.label_nl}
            </h2>
            <div className="italic text-maroon/70 mb-6">
              {selectedCategory.label_fr}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Begrippen */}
              <div className="bg-white rounded-2xl p-6 border border-maroon/10">
                <h3 className="text-2xl font-bold font-poppins text-maroon mb-4">
                  Belangrijke begrippen
                </h3>

                <div className="space-y-4">
                  {selectedCategory.related_definitions.map((defKey) => {
                    const def = zorgData.definitions[defKey];
                    if (!def) return null;

                    return (
                      <div
                        key={defKey}
                        className="p-5 rounded-xl border border-gray-100 shadow-sm"
                      >
                        <div className="text-lg font-bold font-poppins text-maroon">
                          {def.term_nl} <span className="font-normal text-maroon/70">({def.term_fr})</span>
                        </div>
                        <p className="text-gray-700 mt-2">
                          {def.uitleg}
                        </p>
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

                <button
                  onClick={() => setView('definities')}
                  className="mt-5 text-maroon font-bold hover:underline font-poppins"
                >
                  Alle begrippen bekijken →
                </button>
              </div>

              {/* Contacten */}
              <div className="bg-white rounded-2xl p-6 border border-maroon/10">
                <h3 className="text-2xl font-bold font-poppins text-maroon mb-4">
                  Hulplijnen & contact
                </h3>

                <div className="space-y-4">
                  {selectedCategory.related_contacts.map((contactKey) => {
                    const c = zorgData.contacten[contactKey];
                    if (!c) return null;

                    return (
                      <div
                        key={contactKey}
                        className="p-5 rounded-xl border-l-8 border-maroon shadow-md border border-gray-100"
                      >
                        <div className="text-lg font-bold font-poppins text-maroon">
                          {c.naam}
                        </div>
                        <div className="text-maroon text-2xl font-mono font-bold my-2">
                          {c.nummer}
                        </div>
                        {c.email && (
                          <div className="text-sm font-semibold">
                            E-mail: {c.email}
                          </div>
                        )}
                        <p className="text-gray-700 text-sm mt-2">
                          {c.details}
                        </p>
                        <p className="text-xs text-gray-500 italic mt-2">
                          Bereikbaar: {c.tijden}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setView('contacten')}
                  className="mt-5 text-maroon font-bold hover:underline font-poppins"
                >
                  Alle nuttige nummers bekijken →
                </button>
              </div>
            </div>
          </div>

          <div className="bg-maroon text-white p-6 md:p-8 rounded-3xl shadow-xl">
            <h3 className="text-2xl font-bold mb-3 font-poppins">
              Lokale ondersteuning vinden
            </h3>
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
                  {ann.naam} →
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DEFINITIES */}
      {view === 'definities' && (
        <section className="space-y-6">
          <button
            onClick={goHome}
            className="text-maroon font-bold hover:underline font-poppins"
          >
            ← Terug naar dashboard
          </button>

          <div className="bg-white rounded-3xl p-6 md:p-8 border border-maroon/10">
            <h2 className="text-3xl font-bold font-poppins text-maroon mb-2">
              Begrippen (NL → FR)
            </h2>
            <p className="text-gray-700 mb-5">
              Typ om te filteren. U ziet NL-uitleg en de officiële Franse bron als verdieping.
            </p>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Zoek in begrippen…"
              className="w-full px-4 py-3 rounded-xl border border-maroon/20 focus:outline-none focus:ring-2 focus:ring-maroon/20 mb-6"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDefinitions.map(([key, def]) => (
                <div
                  key={key}
                  className="bg-softYellow/25 p-5 rounded-2xl border border-maroon/10"
                >
                  <div className="text-lg font-bold font-poppins text-maroon">
                    {def.term_nl} <span className="font-normal text-maroon/70">({def.term_fr})</span>
                  </div>
                  <p className="text-gray-700 mt-2">
                    {def.uitleg}
                  </p>
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

      {/* CONTACTEN */}
      {view === 'contacten' && (
        <section className="space-y-6">
          <button
            onClick={goHome}
            className="text-maroon font-bold hover:underline font-poppins"
          >
            ← Terug naar dashboard
          </button>

          <div className="bg-white rounded-3xl p-6 md:p-8 border border-maroon/10">
            <h2 className="text-3xl font-bold font-poppins text-maroon mb-2">
              Nuttige nummers
            </h2>
            <p className="text-gray-700 mb-5">
              Typ om te filteren. Bij spoed: bel 15 (SAMU) of 112.
            </p>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Zoek in nummers…"
              className="w-full px-4 py-3 rounded-xl border border-maroon/20 focus:outline-none focus:ring-2 focus:ring-maroon/20 mb-6"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContacts.map(([key, c]) => (
                <div
                  key={key}
                  className="bg-white p-6 rounded-2xl border-l-8 border-maroon shadow-md border border-gray-100"
                >
                  <div className="text-lg font-bold font-poppins text-maroon">
                    {c.naam}
                  </div>
                  <div className="text-maroon text-2xl font-mono font-bold my-2">
                    {c.nummer}
                  </div>
                  {c.email && (
                    <div className="text-sm font-semibold">
                      E-mail: {c.email}
                    </div>
                  )}
                  <p className="text-gray-700 text-sm mt-2">
                    {c.details}
                  </p>
                  <p className="text-xs text-gray-500 italic mt-2">
                    Bereikbaar: {c.tijden}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ANNUAIRES */}
      {view === 'annuaires' && (
        <section className="space-y-6">
          <button
            onClick={goHome}
            className="text-maroon font-bold hover:underline font-poppins"
          >
            ← Terug naar dashboard
          </button>

          <div className="bg-white rounded-3xl p-6 md:p-8 border border-maroon/10">
            <h2 className="text-3xl font-bold font-poppins text-maroon mb-2">
              Officiële annuaires
            </h2>
            <p className="text-gray-700 mb-6">
              Dit zijn officiële zoekpagina’s. Gebruik ze als verdieping of om direct lokale contactpunten te vinden.
              Tip: start meestal bij het lokale informatiepunt (CLIC / Point d’information local).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(zorgData.annuaires).map(([key, ann]) => (
                <div
                  key={key}
                  className="bg-softYellow/25 p-5 rounded-2xl border border-maroon/10"
                >
                  <div className="text-lg font-bold font-poppins text-maroon">
                    {ann.naam}
                  </div>
                  <p className="text-gray-700 mt-2">
                    {ann.uitleg}
                  </p>
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
