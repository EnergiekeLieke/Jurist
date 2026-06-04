'use client';

import { useState, useEffect } from 'react';

const C = {
  lichtgroen: '#f3f5f4',
  zand:       '#c7b6a7',
  grijsgroen: '#879891',
  zwart:      '#000000',
  wit:        '#ffffff',
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
    <div style={{ marginBottom: 16, borderRadius: 10, overflow: 'hidden',
      border: `1px solid ${C.zwart}18` }}>
      <div style={{ padding: '1rem 1.125rem', background: C.wit }}>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const,
          letterSpacing: '0.12em', color: C.grijsgroen, margin: '0 0 10px' }}>
          {titel}
        </p>
        <p style={{ fontSize: 15, color: C.zwart, lineHeight: 1.8, margin: 0, fontWeight: 300 }}>
          {tekst}
        </p>
      </div>
      <button onClick={kopieer}
        style={{ width: '100%', padding: '0.6rem', border: 'none',
          background: C.grijsgroen,
          color: C.wit, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase' as const, cursor: 'pointer',
          fontFamily: 'inherit', transition: 'background 0.2s' }}>
        {gekopieerd ? '✓  Gekopieerd' : 'Kopieer tekst'}
      </button>
    </div>
  );
}

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
    <div style={{ background: C.lichtgroen, minHeight: '100vh', padding: '2rem 1.25rem',
      fontFamily: 'Montserrat, system-ui, sans-serif',
      fontWeight: 300, color: C.zwart }}>
      <div style={{ maxWidth: 580, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const,
            letterSpacing: '0.16em', color: C.grijsgroen, marginBottom: 10 }}>
            Algemene voorwaarden
          </p>
          <h1 style={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.25,
            marginBottom: 12, letterSpacing: '-0.01em' }}>
            Herroepingsrecht: wat moet er in jouw voorwaarden?
          </h1>
          <p style={{ fontSize: 14, color: C.zwart + 'aa', lineHeight: 1.75, margin: 0 }}>
            Beantwoord de vragen. Je krijgt daarna de exacte tekst die je in je algemene voorwaarden kunt opnemen.
          </p>
        </div>

        {/* Stap 1: markt */}
        {stap === 1 && (
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
              textTransform: 'uppercase' as const, color: C.grijsgroen, marginBottom: 14 }}>
              Aan wie verkoop je?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
              {MARKT_OPTIES.map(opt => (
                <button key={opt.id} onClick={() => kiesMarkt(opt.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '1rem 1.25rem', borderRadius: 10, cursor: 'pointer',
                    background: C.wit, border: `1px solid ${C.zwart}18`,
                    textAlign: 'left' as const, fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = C.grijsgroen;
                    (e.currentTarget as HTMLButtonElement).style.background = C.grijsgroen + '0c';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = C.zwart + '18';
                    (e.currentTarget as HTMLButtonElement).style.background = C.wit;
                  }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: C.zwart, margin: '0 0 3px' }}>
                      {opt.label}
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 300, color: C.zwart + '70', margin: 0 }}>
                      {opt.sub}
                    </p>
                  </div>
                  <span style={{ color: C.grijsgroen, fontSize: 20, lineHeight: 1 }}>›</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stap 2: categorieën */}
        {stap === 2 && (
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
              textTransform: 'uppercase' as const, color: C.zwart + '60', marginBottom: 6 }}>
              Wat lever jij aan consumenten?
            </p>
            {markt === 'combo' && (
              <p style={{ fontSize: 13, fontWeight: 300, color: C.zwart + '70',
                marginBottom: 14, lineHeight: 1.6 }}>
                Je B2B-klanten vallen hier buiten.
              </p>
            )}
            {markt !== 'combo' && <div style={{ marginBottom: 14 }} />}

            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8, marginBottom: 24 }}>
              {CATEGORIEEN.map(c => {
                const actief = gekozen.has(c.id);
                return (
                  <button key={c.id} onClick={() => toggleCategorie(c.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '0.875rem 1.25rem', borderRadius: 10, cursor: 'pointer',
                      background: actief ? C.grijsgroen + '14' : C.wit,
                      border: `1px solid ${actief ? C.grijsgroen : C.zwart + '18'}`,
                      textAlign: 'left' as const, fontFamily: 'inherit', transition: 'all 0.15s',
                    }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                      border: `2px solid ${actief ? C.grijsgroen : C.zwart + '30'}`,
                      background: actief ? C.grijsgroen : C.wit,
                      color: C.wit, fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {actief ? '✓' : ''}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: actief ? 700 : 300, color: C.zwart }}>
                      {c.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button onClick={terug}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                  color: C.zwart + '60', padding: '0.65rem 0', letterSpacing: '0.02em' }}>
                ← Terug
              </button>
              <button onClick={() => setStap(3)} disabled={gekozen.size === 0}
                style={{
                  flex: 1, padding: '0.75rem', border: 'none', borderRadius: 8,
                  background: gekozen.size > 0 ? C.grijsgroen : C.zwart + '20',
                  color: gekozen.size > 0 ? C.wit : C.zwart + '40',
                  fontSize: 13, fontWeight: 700, letterSpacing: '0.05em',
                  textTransform: 'uppercase' as const,
                  fontFamily: 'inherit', cursor: gekozen.size > 0 ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                }}>
                Bekijk mijn tekst
              </button>
            </div>
          </div>
        )}

        {/* Stap 3: resultaat + slotvraag */}
        {stap === 3 && (
          <div>
            <p style={{ fontSize: 13, fontWeight: 300, color: C.zwart + 'aa',
              marginBottom: 20, lineHeight: 1.75 }}>
              Hieronder vind je de tekst{resultatenIds.length > 1 ? 'en' : ''} voor jouw algemene voorwaarden.
              Kopieer {resultatenIds.length > 1 ? 'ze' : 'hem'} en voeg {resultatenIds.length > 1 ? 'ze' : 'hem'} toe aan het juiste artikel.
            </p>

            {resultatenIds.map(id => (
              <KopieerBlok key={id} {...TEKSTEN[id]} />
            ))}

            <button onClick={terug}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                color: C.zwart + '60', padding: '0.5rem 0', marginTop: 4,
                letterSpacing: '0.02em' }}>
              ← Terug
            </button>

            {/* Slotvraag */}
            <div style={{ marginTop: 28, paddingTop: 28, borderTop: `1px solid ${C.zwart}18` }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.zwart, marginBottom: 16 }}>
                Ben je van plan om op korte termijn je aanbod uit te breiden?
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button onClick={() => setUitbreiding(true)}
                  style={{
                    flex: 1, padding: '0.7rem', borderRadius: 8, fontFamily: 'inherit',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                    letterSpacing: '0.04em', textTransform: 'uppercase' as const,
                    border: `1px solid ${uitbreiding === true ? C.zwart : C.zwart + '25'}`,
                    background: uitbreiding === true ? C.zwart : C.wit,
                    color: uitbreiding === true ? C.wit : C.zwart,
                  }}>
                  Ja
                </button>
                <button onClick={() => setUitbreiding(false)}
                  style={{
                    flex: 2, padding: '0.7rem', borderRadius: 8, fontFamily: 'inherit',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                    letterSpacing: '0.04em', textTransform: 'uppercase' as const,
                    border: `1px solid ${uitbreiding === false ? C.grijsgroen : C.zwart + '25'}`,
                    background: uitbreiding === false ? C.grijsgroen : C.wit,
                    color: uitbreiding === false ? C.wit : C.zwart,
                  }}>
                  Nee, ik ben klaar
                </button>
              </div>

              {uitbreiding === true && (
                <div style={{ background: C.lichtgroen, border: `1px solid ${C.zwart}20`,
                  borderRadius: 10, padding: '1rem 1.25rem' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const,
                    letterSpacing: '0.12em', color: C.grijsgroen, marginBottom: 8 }}>Tip</p>
                  <p style={{ fontSize: 14, fontWeight: 300, color: C.zwart, lineHeight: 1.75, margin: 0 }}>
                    Doe deze check dan opnieuw zodra je dat nieuwe aanbod lanceert. Vink dan ook de categorie aan die daarbij hoort, zodat je voorwaarden meteen goed staan voor wat je nieuw gaat aanbieden. Of zet de voorwaarden voor je nieuwe aanbod er nu alvast in, zodat je goed voorbereid bent.
                  </p>
                </div>
              )}

              {uitbreiding === false && (
                <div style={{ background: C.wit, border: `1px solid ${C.grijsgroen}50`,
                  borderRadius: 10, padding: '1.25rem', textAlign: 'center' as const }}>
                  <p style={{ fontSize: 24, margin: '0 0 8px', color: C.grijsgroen }}>✓</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: C.zwart, marginBottom: 6 }}>Je bent klaar!</p>
                  <p style={{ fontSize: 13, fontWeight: 300, color: C.zwart + '80', margin: 0, lineHeight: 1.7 }}>
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
