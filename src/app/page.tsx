'use client';

import React, { useState } from 'react';
import zorgData from '../data/zorgdata.json';

export default function Home() {
  const [step, setStep] = useState('keuze');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const handleCategoryChoice = (category: any) => {
    setSelectedCategory(category);
    setStep('resultaten');
  };

  return (
    <main className="min-h-screen p-8 md:p-16 max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Mijn Zorgkompas</h1>
        <p className="text-xl text-gray-600">Bereid uw zorggesprek in Frankrijk voor.</p>
      </header>

      {step === 'keuze' && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {zorgData.categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChoice(cat)}
              className="p-8 border-2 border-maroon/20 rounded-2xl hover:border-maroon hover:bg-softYellow transition-all text-left group"
            >
              <h2 className="text-2xl font-bold mb-2 group-hover:text-maroon transition-colors">{cat.label_nl}</h2>
              <p className="italic text-maroon/70 mb-4">{cat.label_fr}</p>
              <p className="text-gray-700 leading-relaxed">{cat.description}</p>
            </button>
          ))}
        </section>
      )}

      {step === 'resultaten' && selectedCategory && (
        <section className="space-y-12 animate-in fade-in duration-500">
          <button 
            onClick={() => setStep('keuze')}
            className="text-maroon font-bold flex items-center gap-2 hover:underline"
          >
            ← Terug naar overzicht
          </button>

          <div className="bg-softYellow p-8 rounded-3xl border border-maroon/10">
            <h2 className="text-3xl font-bold mb-6">Uw gids voor: {selectedCategory.label_nl}</h2>
            
            {/* Definities */}
            <div className="space-y-6 mb-10">
              <h3 className="text-2xl font-semibold border-b border-maroon/10 pb-2">Belangrijke Begrippen</h3>
              <div className="grid gap-4">
                {selectedCategory.related_definitions.map((defKey: string) => {
                  const def = (zorgData.definitions as any)[defKey];
                  if (!def) return null;
                  
                  // Dynamische citatie mapping op basis van bronnen
                  let citation = "";
                  [cite_start]if (defKey === 'ehpad') citation = "[cite: 151]";
                  [cite_start]if (defKey === 'apa') citation = "[cite: 109]";
                  [cite_start]if (defKey === 'PFR') citation = "[cite: 119]";
                  [cite_start]if (defKey === 'adj') citation = "[cite: 68]";

                  return (
                    <div key={defKey} className="bg-white p-6 rounded-xl shadow-sm">
                      <h4 className="text-xl font-bold mb-1">{def.term_nl} ({def.term_fr}) {citation}</h4>
                      <p className="text-gray-700 mb-2">{def.uitleg} {citation}</p>
                      <a href={def.url} target="_blank" className="text-maroon underline font-semibold">Bekijk officiële bron →</a>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contacten */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold border-b border-maroon/10 pb-2">Hulplijnen & Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCategory.related_contacts.map((contactKey: string) => {
                  const contact = (zorgData.contacten as any)[contactKey];
                  if (!contact) return null;

                  let citation = "";
                  [cite_start]if (contactKey === 'instants_aidants') citation = "[cite: 1]";
                  [cite_start]if (contactKey === 'france_parkinson') citation = "[cite: 5]";
                  [cite_start]if (contactKey === 'solitud_ecoute') citation = "[cite: 42]";
                  [cite_start]if (contactKey === 'maltraitance') citation = "[cite: 37]";
                  [cite_start]if (contactKey === 'samu') citation = "[cite: 61]";

                  return (
                    <div key={contactKey} className="bg-white p-6 rounded-xl border-l-8 border-maroon shadow-sm">
                      <h4 className="text-xl font-bold mb-1">{contact.naam} {citation}</h4>
                      <div className="text-maroon text-2xl font-mono font-bold my-2">{contact.nummer} {citation}</div>
                      {contact.email && <p className="text-sm font-semibold mb-2">E-mail: {contact.email} {citation}</p>}
                      <p className="text-gray-600 text-sm">{contact.details} {citation}</p>
                      <p className="text-xs text-gray-500 mt-2 italic">Bereikbaar: {contact.tijden} {citation}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lokale loketten - Annuaires */}
          <div className="bg-maroon text-white p-10 rounded-3xl shadow-xl">
            <h3 className="text-2xl font-bold mb-4 text-white">Vind lokale ondersteuning (CLIC)</h3>
            <p className="mb-8 opacity-90 text-lg">
              [cite_start]In Frankrijk wordt zorg lokaal geregeld via het Point d'information local[cite: 122]. 
              [cite_start]Gebruik de annuaire om uw departement te selecteren en het juiste loket te vinden[cite: 156, 162].
            </p>
            <div className="flex flex-wrap gap-4">
              {Object.entries(zorgData.annuaires).map(([key, ann]: [string, any]) => (
                <a 
                  key={key} 
                  href={ann.url} 
                  target="_blank"
                  className="bg-white text-maroon px-8 py-4 rounded-full font-bold hover:bg-softYellow transition-colors shadow-lg"
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
