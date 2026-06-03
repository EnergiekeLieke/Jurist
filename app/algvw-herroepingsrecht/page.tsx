'use client';

import { useState, useEffect } from 'react';

const C = {
  cream:     '#fcebdc',
  lightBg:   '#f4c293',
  darkSlate: '#2a3a3c',
  darkRed:   '#9e3816',
  darkGreen: '#3b5633',
  midGreen:  '#758d69',
  orange:    '#d56119',
  white:     '#ffffff',
};

type Markt = 'b2b' | 'b2c' | 'combo';
type CategorieId = 'digitaal' | 'fysiek-product' | 'fysiek-dienst';

const MARKT_OPTIES: { id: Markt; label: string; sub: string }[] = [
  { id: 'b2b',   label: 'Alleen B2B',             sub: 'Ik verkoop uitsluitend aan bedrijven' },
  { id: 'b2c',   label: 'Alleen B2C',             sub: 'Ik verkoop uitsluitend aan consumenten' },
  { id: 'combo', label: 'Combinatie: B2B én B2C', sub: 'Ik verkoop aan zowel bedrijven als consumenten' },
];

const CATEGORIEEN: { id: CategorieId; label: string }[] = [
  { id: 'digitaal',       label: 'Ik lever digitale producten en diensten' },
  { id: 'fysiek-product', label: 'Ik lever fysieke producten' },
  { id: 'fysiek-dienst',  label: 'Ik lever fysieke diensten' },
];

const TEKSTEN: Record<'b2b' | CategorieId, { titel: string; tekst: string }> = {
  b2b: {
    titel: 'Alleen B2B',
    tekst: 'Het herroepingsrecht is niet van toepassing, omdat onze producten en diensten bedoeld zijn voor zakelijke klanten.',
  },
  digitaal: {
    titel: 'Digitale producten en diensten',
    tekst: 'dit is de tekst voor digitale producten en diensten',
  },
  'fysiek-product': {
    titel: 'Fysieke producten',
    tekst: 'dit is de tekst voor fysieke producten',
  },
  'fysiek-dienst': {
    titel: 'Fysieke diensten',
    tekst: 'dit is de tekst voor fysieke diensten',
  },
};

function KopieerBlok({ titel, tekst }: { titel: string; tekst: string }) {
  const [gekopieerd, setGekopieerd] = useState(false);

  const kopieer = async () => {
    try {
      await navigator.clipboard.writeText(tekst);
    } catch {
      try {
        const el = document.createElement('textarea');
        el.value = tekst;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      } catch {
        return;
      }
    }
    setGekopieerd(true);
    setTimeout(() => setGekopieerd(false), 1500);
  };

  return (
    <div style={{ marginBottom: 16, border: `2px solid ${C.darkSlate}15`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '0.6rem 0.875rem', background: C.darkSlate + '08' }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const,
          letterSpacing: '0.08em', color: C.midGreen, margin: '0 0 6px' }}>{titel}</p>
        <p style={{ fontSize: 13.5, color: C.darkSlate, lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
          "{tekst}"
        </p>
      </div>
      <button onClick={kopieer}
        style={{ width: '100%', padding: '0.4rem', background: gekopieerd ? C.darkGreen : C.darkSlate,
          border: 'none', color: C.white, fontSize: 12, cursor: 'pointer',
          fontFamily: 'inherit', fontWeight: 600, transition: 'background 0.2s' }}>
        {gekopieerd ? '✓ Gekopieerd' : 'Kopieer tekst'}
      </button>
    </div>
  );
}

const uitbreidingKnopStijl = (actief: boolean, actiefKleur: string) => ({
  flex: 1, padding: '0.65rem', borderRadius: 10, fontFamily: 'inherit',
  fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
  border: `2px solid ${actief ? actiefKleur : C.darkSlate + '25'}`,
  background: actief ? actiefKleur + '15' : C.white,
  color: actief ? actiefKleur : C.darkSlate,
} as const);

export default function AlgvwHerroepingsrecht() {
  const [stap, setStap]               = useState<1 | 2 | 3>(1);
  const [markt, setMarkt]             = useState<Markt | null>(null);
  const [gekozen, setGekozen]         = useState<Set<CategorieId>>(new Set());
  const [uitbreiding, setUitbreiding] = useState<boolean | null>(null);

  useEffect(() => {
    const send = () => window.parent.postMessage(
      { type: 'iframeHeight', height: document.documentElement.scrollHeight + 32 },
      '*'
    );
    const observer = new ResizeObserver(send);
    observer.observe(document.documentElement);
    send();
    return () => observer.disconnect();
  }, [stap, uitbreiding]);

  const kiesMarkt = (m: Markt) => {
    setMarkt(m);
    setStap(m === 'b2b' ? 3 : 2);
  };

  const toggleCategorie = (id: CategorieId) => {
    setGekozen(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const terug = () => {
    setUitbreiding(null);
    setStap(stap === 3 && markt === 'b2b' ? 1 : (stap - 1) as 1 | 2);
  };

  const resultatenIds: ('b2b' | CategorieId)[] =
    markt === 'b2b'
      ? ['b2b']
      : [
          ...(markt === 'combo' ? ['b2b' as const] : []),
          ...CATEGORIEEN.filter(c => gekozen.has(c.id)).map(c => c.id),
        ];

  return (
    <div style={{ background: C.cream, minHeight: '100vh', padding: '1.5rem 1.25rem',
      fontFamily: 'Inter, system-ui, sans-serif', color: C.darkSlate }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const,
            letterSpacing: '0.12em', color: C.midGreen, marginBottom: 4 }}>
            Algemene voorwaarden
          </p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', lineHeight: 1.2, marginBottom: 8 }}>
            Herroepingsrecht: wat moet er in jouw voorwaarden?
          </h1>
          <p style={{ fontSize: 13, color: C.darkSlate + '80', lineHeight: 1.6 }}>
            Beantwoord de vragen. Je krijgt daarna de exacte tekst die je in je algemene voorwaarden kunt opnemen.
          </p>
        </div>

        {/* Stap 1: markt */}
        {stap === 1 && (
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.darkSlate, marginBottom: 12 }}>
              Aan wie verkoop je?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
              {MARKT_OPTIES.map(opt => (
                <button key={opt.id} onClick={() => kiesMarkt(opt.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '0.875rem 1rem', borderRadius: 12, cursor: 'pointer',
                    background: C.white, border: `2px solid ${C.darkSlate}20`,
                    textAlign: 'left' as const, fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = C.darkGreen;
                    (e.currentTarget as HTMLButtonElement).style.background = C.darkGreen + '08';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = C.darkSlate + '20';
                    (e.currentTarget as HTMLButtonElement).style.background = C.white;
                  }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: C.darkSlate, margin: '0 0 2px' }}>
                      {opt.label}
                    </p>
                    <p style={{ fontSize: 12, color: C.darkSlate + '65', margin: 0 }}>
                      {opt.sub}
                    </p>
                  </div>
                  <span style={{ color: C.darkSlate + '35', fontSize: 16 }}>›</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stap 2: categorieën (alleen B2C of combo) */}
        {stap === 2 && (
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.darkSlate, marginBottom: 4 }}>
              Wat lever jij aan consumenten?
            </p>
            {markt === 'combo' && (
              <p style={{ fontSize: 12, color: C.darkSlate + '60', marginBottom: 12, lineHeight: 1.5 }}>
                Je B2B-klanten vallen hier buiten.
              </p>
            )}
            {markt !== 'combo' && <div style={{ marginBottom: 12 }} />}
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10, marginBottom: 20 }}>
              {CATEGORIEEN.map(c => {
                const actief = gekozen.has(c.id);
                return (
                  <button key={c.id} onClick={() => toggleCategorie(c.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '0.75rem 1rem', borderRadius: 12, cursor: 'pointer',
                      background: actief ? C.darkGreen + '12' : C.white,
                      border: `2px solid ${actief ? C.darkGreen : C.darkSlate + '20'}`,
                      textAlign: 'left' as const, fontFamily: 'inherit', transition: 'all 0.15s',
                    }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                      border: `2px solid ${actief ? C.darkGreen : C.darkSlate + '35'}`,
                      background: actief ? C.darkGreen : C.white,
                      color: C.white, fontSize: 12, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', transition: 'all 0.15s',
                    }}>
                      {actief ? '✓' : ''}
                    </div>
                    <span style={{ fontSize: 14, color: C.darkSlate, fontWeight: actief ? 600 : 400 }}>
                      {c.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={terug}
                style={{ flex: 1, padding: '0.65rem', borderRadius: 10,
                  border: `2px solid ${C.darkSlate}25`, background: C.white,
                  color: C.darkSlate, fontSize: 14, fontWeight: 600,
                  fontFamily: 'inherit', cursor: 'pointer' }}>
                ← Terug
              </button>
              <button onClick={() => setStap(3)} disabled={gekozen.size === 0}
                style={{
                  flex: 2, padding: '0.65rem', borderRadius: 10, border: 'none',
                  background: gekozen.size > 0 ? C.darkGreen : C.darkSlate + '20',
                  color: gekozen.size > 0 ? C.white : C.darkSlate + '50',
                  fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                  cursor: gekozen.size > 0 ? 'pointer' : 'default', transition: 'all 0.2s',
                }}>
                Bekijk mijn tekst
              </button>
            </div>
          </div>
        )}

        {/* Stap 3: resultaat + slotvraag */}
        {stap === 3 && (
          <div>
            <p style={{ fontSize: 13, color: C.darkSlate + '70', marginBottom: 16, lineHeight: 1.6 }}>
              Hieronder vind je de tekst{resultatenIds.length > 1 ? 'en' : ''} voor jouw algemene voorwaarden. Kopieer {resultatenIds.length > 1 ? 'ze' : 'hem'} en voeg {resultatenIds.length > 1 ? 'ze' : 'hem'} toe aan het juiste artikel.
            </p>

            {resultatenIds.map(id => (
              <KopieerBlok key={id} {...TEKSTEN[id]} />
            ))}

            <button onClick={terug}
              style={{ marginTop: 16, padding: '0.5rem 1rem', borderRadius: 10,
                border: `2px solid ${C.darkSlate}25`, background: C.white,
                color: C.darkSlate, fontSize: 13, fontWeight: 600,
                fontFamily: 'inherit', cursor: 'pointer' }}>
              ← Terug
            </button>

            {/* Slotvraag */}
            <div style={{ marginTop: 24, borderTop: `1px solid ${C.darkSlate}12`, paddingTop: 20 }}>
              <div style={{ background: C.white, borderRadius: 14, padding: '1.25rem',
                border: `2px solid ${C.darkSlate}15`, marginBottom: 16 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: C.darkSlate, marginBottom: 16 }}>
                  Ben je van plan om op korte termijn je aanbod uit te breiden?
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setUitbreiding(true)} style={uitbreidingKnopStijl(uitbreiding === true, C.orange)}>
                    Ja
                  </button>
                  <button onClick={() => setUitbreiding(false)} style={uitbreidingKnopStijl(uitbreiding === false, C.darkGreen)}>
                    Nee, ik ben klaar
                  </button>
                </div>
              </div>

              {uitbreiding === true && (
                <div style={{ background: C.orange + '15', border: `2px solid ${C.orange}40`,
                  borderRadius: 12, padding: '1rem 1.125rem' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.orange, marginBottom: 6 }}>Tip</p>
                  <p style={{ fontSize: 13.5, color: C.darkSlate, lineHeight: 1.65, margin: 0 }}>
                    Doe deze check dan opnieuw zodra je dat nieuwe aanbod lanceert. Vink dan ook de categorie aan die daarbij hoort, zodat je voorwaarden meteen goed staan voor wat je nieuw gaat aanbieden. Of zet de voorwaarden voor je nieuwe aanbod er nu alvast in, zodat je goed voorbereid bent.
                  </p>
                </div>
              )}

              {uitbreiding === false && (
                <div style={{ background: C.darkGreen + '12', border: `2px solid ${C.darkGreen}40`,
                  borderRadius: 12, padding: '1rem 1.125rem', textAlign: 'center' as const }}>
                  <p style={{ fontSize: 22, marginBottom: 4 }}>✓</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.darkGreen, marginBottom: 4 }}>Je bent klaar!</p>
                  <p style={{ fontSize: 13, color: C.darkSlate + '80', margin: 0, lineHeight: 1.6 }}>
                    Plak {resultatenIds.length > 1 ? 'de teksten' : 'de tekst'} in het juiste artikel van je algemene voorwaarden.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
