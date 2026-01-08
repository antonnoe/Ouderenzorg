'use client';

import React, { useMemo, useState } from 'react';
import zorgDataRaw from '../data/zorgdata.json';
import { ZorgData, ZorgCategory } from '../types/zorg';

const zorgData = zorgDataRaw as ZorgData;

type View = 'dashboard' | 'category' | 'definities' | 'contacten' | 'annuaires';

function cleanText(s?: string) {
  if (!s) return '';
  return s.replace(/\s*\[cite:[^\]]+\]\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

function nlTranslateUrl(url: string) {
  const u = encodeURIComponent(url);
  return `https://translate.google.com/translate?sl=auto&tl=nl&u=${u}`;
}

/** Zoeken: synoniemen/alias → extra termen */
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
  ['autonomie', ['apa']],
  ['clic', ['clic', 'pil', "point d'information local", 'point information local', 'information local']]
];

// Icons (inline SVG)
function IconBox({ children }: { children: React.ReactNode }) {
  return <div className="zk-tile-icon">{children}</div>;
}
function ArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconMapPins() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" className="text-maroon">
      <path d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function IconHomeCare() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" className="text-maroon">
      <path d="M3 11l9-8 9 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v10h14V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 14.5l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconBuilding() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" className="text-maroon">
      <path d="M4 21V3h10v18" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 21V8h6v13" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7 6h4M7 9h4M7 12h4M7 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17 11h1M17 14h1M17 17h1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" className="text-maroon">
      <path
        d="M22 16.9v2a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012 3.2 2 2 0 014 1h2a2 2 0 012 1.7c.1.9.3 1.7.6 2.5a2 2 0 01-.5 2.1L7.9 8.1a16 16 0 006 6l.8-.8a2 2 0 012.1-.5c.8.3 1.6.5 2.5.6A2 2 0 0122 16.9z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" className="text-maroon">
      <path d="M4 19a2 2 0 012-2h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 3h14v18H6a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 7h8M9 11h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

type FooterAction =
  | { kind: 'home' }
  | { kind: 'view'; view: View; q?: string }
  | { kind: 'category'; categoryId: string };

function FooterNav({ onAction }: { onAction: (a: FooterAction) => void }) {
  return (
    <footer className="zk-footer">
      <div className="zk-footer-box">
        <div className="zk-footer-title">Snel naar</div>
        <div className="zk-footer-sub">
          Kies een onderwerp. U blijft binnen dit dashboard. Officiële Franse bronnen zijn beschikbaar als verdieping (met “Lees in NL”).
        </div>

        <div className="zk-footer-grid">
          <div>
            <div className="zk-col-title">Thuis wonen</div>
            <ul>
              <li><button className="zk-footer-link" onClick={() => onAction({ kind: 'view', view: 'definities', q: 'Thuiszorg' })}>Thuiszorg</button></li>
              <li><button className="zk-footer-link" onClick={() => onAction({ kind: 'view', view: 'definities', q: 'SSIAD' })}>Thuisverpleging (SSIAD)</button></li>
              <li><button className="zk-footer-link" onClick={() => onAction({ kind: 'view', view: 'definities', q: 'Tijdelijk verblijf' })}>Tijdelijk verblijf</button></li>
              <li><button className="zk-footer-link" onClick={() => onAction({ kind: 'view', view: 'annuaires' })}>Zoek diensten per departement</button></li>
            </ul>
          </div>

          <div>
            <div className="zk-col-title">Verzorgingshuis</div>
            <ul>
              <li><button className="zk-footer-link" onClick={() => onAction({ kind: 'view', view: 'definities', q: 'Verzorgingshuis' })}>Wat is een EHPAD?</button></li>
              <li><button className="zk-footer-link" onClick={() => onAction({ kind: 'view', view: 'definities', q: 'EHPAD' })}>Begrip & uitleg</button></li>
              <li><button className="zk-footer-link" onClick={() => onAction({ kind: 'view', view: 'annuaires', q: 'EHPAD' })}>EHPAD zoeken (annuaire)</button></li>
              <li><button className="zk-footer-link" onClick={() => onAction({ kind: 'view', view: 'contacten', q: '39 77' })}>Meldpunt misstanden</button></li>
            </ul>
          </div>

          <div>
            <div className="zk-col-title">Mantelzorg</div>
            <ul>
              <li><button className="zk-footer-link" onClick={() => onAction({ kind: 'category', categoryId: 'repit' })}>Overzicht mantelzorg</button></li>
              <li><button className="zk-footer-link" onClick={() => onAction({ kind: 'view', view: 'definities', q: 'PFR' })}>PFR (répit)</button></li>
              <li><button className="zk-footer-link" onClick={() => onAction({ kind: 'view', view: 'definities', q: 'respijtzorg' })}>Respijtzorg</button></li>
              <li><button className="zk-footer-link" onClick={() => onAction({ kind: 'view', view: 'contacten', q: 'Avec nos proches' })}>Hulplijn overbelasting</button></li>
            </ul>
          </div>

          <div>
            <div className="zk-col-title">Rechten & geld</div>
            <ul>
              <li><button className="zk-footer-link" onClick={() => onAction({ kind: 'category', categoryId: 'rechten_financien' })}>Overzicht rechten</button></li>
              <li><button className="zk-footer-link" onClick={() => onAction({ kind: 'view', view: 'definities', q: 'APA' })}>APA (toelage)</button></li>
              <li><button className="zk-footer-link" onClick={() => onAction({ kind: 'view', view: 'contacten', q: 'Santé Info Droits' })}>Santé Info Droits</button></li>
              <li><button className="zk-footer-link" onClick={() => onAction({ kind: 'view', view: 'contacten', q: 'Numéro handicap' })}>Numéro handicap</button></li>
            </ul>
          </div>

          <div>
            <div className="zk-col-title">Gidsen & diensten</div>
            <ul>
              <li><button className="zk-footer-link" onClick={() => onAction({ kind: 'view', view: 'annuaires', q: 'CLIC' })}>CLIC / PIL (loket)</button></li>
              <li><button className="zk-footer-link" onClick={() => onAction({ kind: 'view', view: 'annuaires' })}>Alle annuaires</button></li>
              <li><button className="zk-footer-link" onClick={() => onAction({ kind: 'view', view: 'contacten', q: '112' })}>Noodnummers</button></li>
              <li><button className="zk-footer-link" onClick={() => onAction({ kind: 'view', view: 'definities' })}>Alle begrippen</button></li>
            </ul>
          </div>
        </div>

        <div className="zk-footnote">
          Tip: gebruik “Lees in NL” bij officiële pagina’s als u Frans lastig vindt.
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<ZorgCategory | null>(null);
  const [q, setQ] = useState('');

  const queryList = useMemo(() => {
    const base = q.trim().toLowerCase();
    if (!base) return [] as string[];

    const list = new Set<string>();
    list.add(base);
    base.split(/\s+/).forEach((t) => t && list.add(t));

    for (const [alias, extras] of queryAliases) {
      if (base.includes(alias)) extras.forEach((e) => e && list.add(e.toLowerCase()));
    }

    return Array.from(list).filter(Boolean);
  }, [q]);

  const filteredDefinitions = useMemo(() => {
    const entries = Object.entries(zorgData.definitions || {});
    if (queryList.length === 0) return entries;

    return entries.filter(([key, def]) => {
      const hay = [key, cleanText(def.term_nl), cleanText(def.term_fr), cleanText(def.uitleg), def.url || '']
        .join(' ')
        .toLowerCase();
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

  const filteredAnnuaires = useMemo(() => {
    const entries = Object.entries(zorgData.annuaires || {});
    if (queryList.length === 0) return entries;

    return entries.filter(([key, a]) => {
      const hay = [key, cleanText(a.naam), cleanText(a.uitleg), a.url || ''].join(' ').toLowerCase();
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

  const openCategoryById = (id: string) => {
    const cat = zorgData.categories.find((c) => c.id === id);
    if (cat) openCategory(cat);
    else goHome();
  };

  const handleFooterAction = (a: FooterAction) => {
    if (a.kind === 'home') { goHome(); return; }
    if (a.kind === 'category') { openCategoryById(a.categoryId); return; }
    if (a.kind === 'view') {
      setSelectedCategory(null);
      setView(a.view);
      setQ(a.q || '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  };

  const current = (v: View): React.AriaAttributes['aria-current'] =>
    view === v ? 'page' : undefined;

  const doSearch = () => {
    // Slim: eerst definities, dan contacten, dan annuaires
    if (filteredDefinitions.length > 0) setView('definities');
    else if (filteredContacts.length > 0) setView('contacten');
    else setView('annuaires');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen px-6 md:px-12 py-8 max-w-7xl mx-auto">
      <header className="zk-header">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="zk-title font-bold font-poppins">Mijn Zorgkompas</h1>
            <p className="zk-subtitle">NL-dashboard voor ouderenzorg in Frankrijk: begrijp, kies, en vind het juiste loket.</p>
          </div>

          <div className="zk-topnav">
            <button className="zk-tab zk-tab--home" aria-current={current('dashboard')} onClick={goHome}>Dashboard</button>
            <button className="zk-tab" aria-current={current('definities')} onClick={() => { setSelectedCategory(null); setView('definities'); }}>Begrippen</button>
            <button className="zk-tab" aria-current={current('contacten')} onClick={() => { setSelectedCategory(null); setView('contacten'); }}>Nuttige nummers</button>
            <button className="zk-tab" aria-current={current('annuaires')} onClick={() => { setSelectedCategory(null); setView('annuaires'); }}>Annuaires</button>
          </div>
        </div>
      </header>

      {view === 'dashboard' && (
        <section className="space-y-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-poppins text-maroon mb-4">Start met een vraag</h2>

            <div className="zk-tiles zk-tiles--primary">
              <button onClick={() => setView('annuaires')} className="zk-tile">
                <IconBox><IconMapPins /></IconBox>
                <div className="zk-tile-h">Lokale informatiepunten</div>
                <div className="zk-tile-p">Vind CLIC / PIL in uw departement (eerste loket).</div>
                <div className="zk-tile-arrow"><ArrowIcon /></div>
                <div className="zk-tile-bar" />
              </button>

              <button
                onClick={() => openCategory(zorgData.categories.find((c) => c.id === 'wonen_zorg') || zorgData.categories[0])}
                className="zk-tile"
              >
                <IconBox><IconBuilding /></IconBox>
                <div className="zk-tile-h">Verpleeghuis / EHPAD</div>
                <div className="zk-tile-p">Begrippen + officiële zoekroutes voor instellingen.</div>
                <div className="zk-tile-arrow"><ArrowIcon /></div>
                <div className="zk-tile-bar" />
              </button>

              <button
                onClick={() => openCategory(zorgData.categories.find((c) => c.id === 'repit') || zorgData.categories[0])}
                className="zk-tile"
              >
                <IconBox><IconHomeCare /></IconBox>
                <div className="zk-tile-h">Thuiszorg & mantelzorg</div>
                <div className="zk-tile-p">Thuisverpleging, respijtzorg en hulp voor naasten.</div>
                <div className="zk-tile-arrow"><ArrowIcon /></div>
                <div className="zk-tile-bar" />
              </button>

              <button onClick={() => setView('contacten')} className="zk-tile">
                <IconBox><IconPhone /></IconBox>
                <div className="zk-tile-h">Nuttige nummers</div>
                <div className="zk-tile-p">Spoed, hulplijnen, advies en ondersteuning.</div>
                <div className="zk-tile-arrow"><ArrowIcon /></div>
                <div className="zk-tile-bar" />
              </button>
            </div>
          </div>

          <div className="zk-panel" style={{ background: 'rgba(255,253,231,.18)' }}>
            <div className="flex items-center gap-3 mb-4">
              <IconBook />
              <h3 className="text-2xl font-bold font-poppins text-maroon">Kies een onderwerp</h3>
            </div>

            <div className="zk-tiles zk-tiles--cats">
              {zorgData.categories.map((cat) => (
                <button key={cat.id} onClick={() => openCategory(cat)} className="zk-tile">
                  <div className="zk-tile-h">{cleanText(cat.label_nl)}</div>
                  <div className="zk-tile-p" style={{ fontStyle: 'italic', color: 'rgba(128,0,0,.7)' }}>
                    {cleanText(cat.label_fr)}
                  </div>
                  <div className="zk-tile-p">{cleanText(cat.description)}</div>
                  <div className="zk-tile-arrow"><ArrowIcon /></div>
                  <div className="zk-tile-bar" />
                </button>
              ))}
            </div>
          </div>

          <div className="zk-panel">
            <h3 className="text-2xl font-bold font-poppins text-maroon mb-2">Snel zoeken (begrippen + nummers)</h3>
            <p className="text-gray-700 mb-4">
              Voorbeelden: “Thuiszorg”, “Verzorgingshuis”, “APA”, “EHPAD”, “SSIAD”, “CLIC”, of een nummer zoals “39 77” (meldpunt ouderenmishandeling).
            </p>

            <div className="flex flex-col gap-3">
              <div className="zk-searchbar">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Doorzoek de tool (begrippen, nummers, annuaires)…"
                  onKeyDown={(e) => { if (e.key === 'Enter') doSearch(); }}
                />
                <button type="button" onClick={doSearch}>Zoeken</button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => setView('definities')} className="zk-btn zk-btn--soft">Begrippen</button>
                <button onClick={() => setView('contacten')} className="zk-btn zk-btn--soft">Nuttige nummers</button>
                <button onClick={() => setView('annuaires')} className="zk-btn zk-btn--soft">Annuaires</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {view === 'category' && selectedCategory && (
        <section className="space-y-8">
          <div className="zk-panel" style={{ background: 'rgba(255,253,231,.18)' }}>
            <h2 className="text-3xl md:text-4xl font-bold font-poppins text-maroon">{cleanText(selectedCategory.label_nl)}</h2>
            <div className="text-sm italic mt-2" style={{ color: 'rgba(128,0,0,.7)' }}>{cleanText(selectedCategory.label_fr)}</div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="zk-panel">
                <h3 className="text-2xl font-bold font-poppins text-maroon mb-4">Belangrijke begrippen</h3>
                <div className="space-y-4">
                  {selectedCategory.related_definitions.map((defKey) => {
                    const def = zorgData.definitions[defKey];
                    if (!def) return null;

                    return (
                      <div key={defKey} className="zk-card">
                        <div className="zk-card-h">
                          {cleanText(def.term_nl)}{' '}
                          <span className="font-normal" style={{ color: 'rgba(128,0,0,.70)' }}>
                            ({cleanText(def.term_fr)})
                          </span>
                        </div>
                        <div className="zk-card-p">{cleanText(def.uitleg)}</div>

                        <div className="zk-card-actions">
                          <a href={def.url} target="_blank" rel="noopener noreferrer" className="zk-btn zk-btn--primary">Open officieel →</a>
                          <a href={nlTranslateUrl(def.url)} target="_blank" rel="noopener noreferrer" className="zk-btn zk-btn--soft">Lees in NL →</a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="zk-panel">
                <h3 className="text-2xl font-bold font-poppins text-maroon mb-4">Hulplijnen & contact</h3>
                <div className="space-y-4">
                  {selectedCategory.related_contacts.map((contactKey) => {
                    const c = zorgData.contacten[contactKey];
                    if (!c) return null;

                    return (
                      <div key={contactKey} className="zk-card">
                        <div className="zk-card-h">{cleanText(c.naam)}</div>
                        <div className="mt-2" style={{ color: 'var(--maroon)', fontSize: 22, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 900 }}>
                          {cleanText(c.nummer)}
                        </div>
                        {c.email && <div className="mt-2 text-sm font-semibold">E-mail: {cleanText(c.email)}</div>}
                        <div className="zk-card-p" style={{ fontSize: 14 }}>{cleanText(c.details)}</div>
                        <div className="mt-2 text-xs" style={{ color: '#666', fontStyle: 'italic' }}>Bereikbaar: {cleanText(c.tijden)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {view === 'definities' && (
        <section className="space-y-6">
          <div className="zk-panel">
            <h2 className="text-3xl font-bold font-poppins text-maroon mb-2">Begrippen (NL → FR)</h2>
            <p className="text-gray-700 mb-5">Typ om te filteren (ook op synoniemen zoals “thuiszorg”, “verzorgingshuis”, “CLIC”).</p>

            <div className="zk-searchbar" style={{ maxWidth: 780 }}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Zoek in begrippen…"
                onKeyDown={(e) => { if (e.key === 'Enter') window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              />
              <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Zoeken</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {filteredDefinitions.map(([key, def]) => (
                <div key={key} className="zk-card">
                  <div className="zk-card-h">
                    {cleanText(def.term_nl)}{' '}
                    <span className="font-normal" style={{ color: 'rgba(128,0,0,.70)' }}>
                      ({cleanText(def.term_fr)})
                    </span>
                  </div>
                  <div className="zk-card-p">{cleanText(def.uitleg)}</div>

                  <div className="zk-card-actions">
                    <a href={def.url} target="_blank" rel="noopener noreferrer" className="zk-btn zk-btn--primary">Open officieel →</a>
                    <a href={nlTranslateUrl(def.url)} target="_blank" rel="noopener noreferrer" className="zk-btn zk-btn--soft">Lees in NL →</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {view === 'contacten' && (
        <section className="space-y-6">
          <div className="zk-panel">
            <h2 className="text-3xl font-bold font-poppins text-maroon mb-2">Nuttige nummers</h2>
            <p className="text-gray-700 mb-5">Typ om te filteren. Bij spoed: bel 15 (SAMU) of 112.</p>

            <div className="zk-searchbar" style={{ maxWidth: 780 }}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Zoek in nummers…"
                onKeyDown={(e) => { if (e.key === 'Enter') window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              />
              <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Zoeken</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {filteredContacts.map(([key, c]) => (
                <div key={key} className="zk-card">
                  <div className="zk-card-h">{cleanText(c.naam)}</div>
                  <div className="mt-2" style={{ color: 'var(--maroon)', fontSize: 22, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 900 }}>
                    {cleanText(c.nummer)}
                  </div>
                  {c.email && <div className="mt-2 text-sm font-semibold">E-mail: {cleanText(c.email)}</div>}
                  <div className="zk-card-p" style={{ fontSize: 14 }}>{cleanText(c.details)}</div>
                  <div className="mt-2 text-xs" style={{ color: '#666', fontStyle: 'italic' }}>Bereikbaar: {cleanText(c.tijden)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {view === 'annuaires' && (
        <section className="space-y-6">
          <div className="zk-panel">
            <h2 className="text-3xl font-bold font-poppins text-maroon mb-2">Officiële annuaires</h2>
            <p className="text-gray-700 mb-6">Gebruik als verdieping of om lokale contactpunten te vinden (bijv. CLIC / PIL).</p>

            <div className="zk-searchbar" style={{ maxWidth: 780 }}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Zoek in annuaires… (bijv. CLIC, EHPAD)"
                onKeyDown={(e) => { if (e.key === 'Enter') window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              />
              <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Zoeken</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {(q.trim() ? filteredAnnuaires : Object.entries(zorgData.annuaires)).map(([key, ann]) => (
                <div key={key} className="zk-card">
                  <div className="zk-card-h">{cleanText(ann.naam)}</div>
                  <div className="zk-card-p">{cleanText(ann.uitleg)}</div>

                  <div className="zk-card-actions">
                    <a href={ann.url} target="_blank" rel="noopener noreferrer" className="zk-btn zk-btn--primary">Open officieel →</a>
                    <a href={nlTranslateUrl(ann.url)} target="_blank" rel="noopener noreferrer" className="zk-btn zk-btn--soft">Lees in NL →</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <FooterNav onAction={handleFooterAction} />
    </main>
  );
}
