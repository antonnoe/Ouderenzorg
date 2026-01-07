'use client';

import React, { useState } from 'react';
import zorgDataRaw from '../data/zorgdata.json';
import { ZorgData, ZorgCategory, ZorgDefinition, ZorgContact } from '../types/zorg';

const zorgData = zorgDataRaw as ZorgData;

export default function Home() {
  const [step, setStep] = useState<'keuze' | 'resultaten'>('keuze');
  const [selectedCategory, setSelectedCategory] = useState<ZorgCategory | null>(null);

  const handleCategoryChoice = (category: ZorgCategory) => {
    setSelectedCategory(category);
    setStep('resultaten');
  };

  return (
    <main className="min-h-screen p-8 md:p-16 max-w-5xl mx-auto font-mulish leading-[1.8em]">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins text-maroon">Mijn Zorgkompas</h1>
        <p className="text-xl text-gray-600">Bereid uw zorggesprek in Frankrijk voor.</p>
      </header>

      {step === 'keuze' && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {zorgData.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChoice(cat)}
              className="p-8 border-2 border-maroon/20 rounded-2xl hover:border-maroon hover:bg-softYellow transition-all text-left group"
            >
              <h2 className="text-2xl font-bold mb-2 font-poppins text-maroon group-hover:scale-105 transition-transform">{cat.label_nl}</h2>
              <p className="italic text-maroon/70 mb-4">{cat.label_fr}</p>
              <p className="text-gray-700">{cat.description}</p>
            </button>
          ))}
        </section>
      )}

      {step === 'resultaten' && selectedCategory && (
        <section className="space-y-12 animate-in fade-in duration-500">
          <button 
            onClick={() => setStep('keuze')}
            className="text-maroon font-bold flex items-center gap-2 hover:underline font-poppins"
          >
            ← Terug naar overzicht
          </button>

          <div className="bg-softYellow/30 p-8 rounded-3xl border border-maroon/10">
            <h2 className="text-3xl font-bold mb-6 font-poppins text-maroon">Uw gids voor: {selectedCategory.label_nl}</h2>
            
            <div className="space-y-6 mb-10">
              <h3 className="text-2xl font-semibold border-b border-maroon/10 pb-2 font-poppins text-maroon">Belangrijke Begrippen</h3>
              <div className="grid gap-4">
                {selectedCategory.related_definitions.map((defKey) => {
                  const def = zorgData.definitions[defKey];
                  if (!def) return null;
                  
                  return (
                    <div key={defKey} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h4 className="text-xl font-bold mb-1 font-poppins text-maroon">{def.term_nl} ({def.term_fr})</h4>
                      <p className="text-gray-700 mb-2">{def.uitleg}</p>
                      <a href={def.url} target="_blank" rel="noopener noreferrer" className="text-maroon underline font-semibold text-sm">Officiële informatie →</a>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-semibold border-b border-maroon/10 pb-2 font-poppins text-maroon">Hulplijnen & Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCategory.related_contacts.map((contactKey) => {
                  const contact = zorgData.contacten[contactKey];
                  if (!contact) return null;

                  return (
                    <div key={contactKey} className="bg-white p-6 rounded-xl border-l-8 border-maroon shadow-md">
                      <h4 className="text-xl font-bold mb-1 font-poppins text-maroon">{contact.naam}</h4>
                      <div className="text-maroon text-2xl font-mono font-bold my-2">{contact.nummer}</div>
                      {contact.email && <p className="text-sm font-semibold mb-2">E-mail: {contact.email}</p>}
                      <p className="text-gray-600 text-sm mb-2">{contact.details}</p>
                      <p className="text-xs text-gray-500 italic">Bereikbaar: {contact.tijden}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-maroon text-white p-10 rounded-3xl shadow-xl">
            [cite_start]<h3 className="text-2xl font-bold mb-4 font-poppins text-white text-center md:text-left">Vind lokale ondersteuning (CLIC) [cite: 122]</h3>
            <p className="mb-8 opacity-90 text-lg">
              [cite_start]Zorg wordt in Frankrijk lokaal gecoördineerd via het Point d'information local[cite: 122, 123]. [cite_start]Gebruik de annuaire om direct het juiste loket in uw departement te vinden[cite: 124, 156].
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {Object.entries(zorgData.annuaires).map(([key, ann]) => (
                <a 
                  key={key} 
                  href={ann.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-maroon px-8 py-4 rounded-full font-bold hover:bg-softYellow transition-all shadow-lg text-center"
                >
                  {ann.naam} →
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
