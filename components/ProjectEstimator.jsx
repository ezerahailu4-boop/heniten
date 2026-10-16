'use client';

import { useState, useMemo } from 'react';

const COST_RATES = {
  'fuel-station': { label: 'Fuel Station Facility', icon: '⛽', basePerSqM: 42000, avgTimeline: '4 - 7 Months' },
  'commercial': { label: 'Commercial G+N Tower', icon: '🏢', basePerSqM: 58000, avgTimeline: '14 - 24 Months' },
  'industrial': { label: 'Factory / Warehouse', icon: '🏭', basePerSqM: 36000, avgTimeline: '8 - 14 Months' },
  'residential': { label: 'Luxury Residential', icon: '🏡', basePerSqM: 48000, avgTimeline: '12 - 18 Months' },
  'aviation': { label: 'Aviation / Depot', icon: '✈️', basePerSqM: 68000, avgTimeline: '12 - 20 Months' },
};

const USD_RATE = 135.0;

function formatCompact(val, isUSD) {
  if (val >= 1000000000) {
    return (val / 1000000000).toFixed(2) + ' Billion';
  } else if (val >= 1000000) {
    return (val / 1000000).toFixed(1) + (isUSD ? 'M' : ' Million');
  } else if (val >= 1000) {
    return Math.round(val / 1000).toLocaleString() + 'K';
  }
  return Math.round(val).toLocaleString();
}

export default function ProjectEstimator() {
  const [projectType, setProjectType] = useState('fuel-station');
  const [area, setArea] = useState(2400);
  const [currency, setCurrency] = useState('ETB'); // 'ETB' | 'USD'
  const [scopes, setScopes] = useState({
    turnkey: true,
    structural: true,
    mep: true,
    canopy: true,
    engineering: true,
  });

  // Modal State for instant RFP submission
  const [rfpOpen, setRfpOpen] = useState(false);
  const [rfpName, setRfpName] = useState('');
  const [rfpPhone, setRfpPhone] = useState('');
  const [rfpEmail, setRfpEmail] = useState('');
  const [rfpNotes, setRfpNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rfpSuccess, setRfpSuccess] = useState(null);

  const toggleScope = key => {
    setScopes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const currentConfig = COST_RATES[projectType] || COST_RATES['fuel-station'];

  const calculation = useMemo(() => {
    let mult = 0;
    if (scopes.turnkey) mult += 0.35;
    if (scopes.structural) mult += 0.30;
    if (scopes.mep) mult += 0.15;
    if (scopes.canopy) mult += 0.12;
    if (scopes.engineering) mult += 0.08;
    mult = Math.max(0.3, mult);

    const baseRate = currentConfig.basePerSqM;
    const totalETB = area * baseRate * mult;
    const lowETB = totalETB * 0.92;
    const highETB = totalETB * 1.08;

    const isUSD = currency === 'USD';
    const divisor = isUSD ? USD_RATE : 1;
    const prefix = isUSD ? '$' : 'ETB ';

    return {
      lowFormatted: prefix + formatCompact(lowETB / divisor, isUSD),
      highFormatted: prefix + formatCompact(highETB / divisor, isUSD),
      rawLowETB: lowETB,
      rawHighETB: highETB,
    };
  }, [projectType, area, scopes, currency, currentConfig]);

  const handleSubmitRFP = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        projectType: currentConfig.label,
        calculatedArea: `${area.toLocaleString()} m²`,
        estimatedBudgetRange: `${calculation.lowFormatted} - ${calculation.highFormatted}`,
        selectedScopes: Object.keys(scopes).filter(k => scopes[k]).join(', '),
        clientNotes: rfpNotes,
      };

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'quotation',
          fields: {
            'Client Name': rfpName,
            'Phone Number': rfpPhone,
            'Email Address': rfpEmail,
            ...payload,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request');
      setRfpSuccess(data.ref);
    } catch (err) {
      alert(err.message || 'Error submitting quote');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="estimator" style={{ margin: '80px 0', position: 'relative' }}>
      <div style={{ background: 'linear-gradient(145deg, #0d182b, #11203b)', border: '1px solid rgba(253,185,19,0.3)', borderRadius: '20px', padding: 'clamp(24px, 5vw, 44px)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(253,185,19,0.12)', color: '#fdb913', padding: '5px 14px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px', border: '1px solid rgba(253,185,19,0.25)' }}>
            ⚡ INTERACTIVE BUDGET MODELER
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 12px' }}>
            Project Quotation & Scope Estimator
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
            Model your project parameters below to calculate an immediate indicative construction budget and timeline based on current Addis Ababa material indices (Q3 2026).
          </p>
        </div>

        {/* 2-Column Calculator Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          {/* Left Configurator Column */}
          <div style={{ background: '#080e1b', border: '1px solid #1e293b', borderRadius: '14px', padding: '24px' }}>
            {/* Step 1: Project Type */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fdb913', color: '#0b1f3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px' }}>1</div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#fff' }}>Select Sector & Project Category</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '28px' }}>
              {Object.entries(COST_RATES).map(([key, item]) => {
                const isSelected = projectType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setProjectType(key)}
                    style={{
                      background: isSelected ? 'rgba(253,185,19,0.15)' : '#0d182b',
                      border: `1.5px solid ${isSelected ? '#fdb913' : '#1e293b'}`,
                      borderRadius: '10px',
                      padding: '12px 10px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: '20px', marginBottom: '6px' }}>{item.icon}</div>
                    <div style={{ fontSize: '12px', fontWeight: isSelected ? '800' : '600', color: isSelected ? '#fdb913' : '#cbd5e1' }}>
                      {item.label}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Step 2: Built-Up Area Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fdb913', color: '#0b1f3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px' }}>2</div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#fff' }}>Estimated Built-Up Area / Footprint</div>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Gross Floor Area:</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#fdb913' }}>{area.toLocaleString()} m²</span>
              </div>
              <input
                type="range"
                min="300"
                max="15000"
                step="100"
                value={area}
                onChange={e => setArea(parseInt(e.target.value, 10))}
                style={{
                  width: '100%',
                  accentColor: '#fdb913',
                  cursor: 'pointer',
                  height: '6px',
                  borderRadius: '3px',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                <span>300 m² (Retail Forecourt)</span>
                <span>15,000 m² (Industrial Plant)</span>
              </div>
            </div>

            {/* Step 3: Scope Selection */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fdb913', color: '#0b1f3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px' }}>3</div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#fff' }}>Included Engineering Scope</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              {[
                ['turnkey', 'Turnkey EPC Management'],
                ['structural', 'Civil & Structural Shell'],
                ['mep', 'Electrical, MEP & Utilities'],
                ['canopy', 'Steel Canopies / Trusses'],
                ['engineering', 'EBCS Permit & Engineering QA'],
              ].map(([key, label]) => (
                <label
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: '#0d182b',
                    border: '1px solid #1e293b',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12.5px',
                    color: scopes[key] ? '#ffffff' : '#64748b',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={scopes[key]}
                    onChange={() => toggleScope(key)}
                    style={{ accentColor: '#fdb913', width: '16px', height: '16px' }}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Right Summary & RFP CTA Column */}
          <div style={{ background: '#080e1b', border: '1px solid rgba(253,185,19,0.3)', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estimated Budget Range</span>
                <button
                  type="button"
                  onClick={() => setCurrency(currency === 'ETB' ? 'USD' : 'ETB')}
                  style={{
                    background: '#152238',
                    border: '1px solid #243553',
                    color: '#fdb913',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Switch to {currency === 'ETB' ? 'USD ($)' : 'ETB (ብር)'}
                </button>
              </div>

              {/* Headline Output Figure */}
              <div style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: '900', color: '#fdb913', letterSpacing: '-0.02em', marginBottom: '8px' }}>
                {calculation.lowFormatted} - {calculation.highFormatted}
              </div>
              <p style={{ color: '#64748b', fontSize: '12.5px', lineHeight: '1.5', margin: '0 0 24px' }}>
                Indicative rate based on 2026 Grade 5 BC-6 benchmarks in Addis Ababa and surrounding corridors.
              </p>

              {/* Breakdown List */}
              <div style={{ display: 'grid', gap: '10px', borderTop: '1px solid #1e293b', paddingTop: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                  <span style={{ color: '#94a3b8' }}>Selected Sector:</span>
                  <strong style={{ color: '#fff' }}>{currentConfig.label}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                  <span style={{ color: '#94a3b8' }}>Footprint Area:</span>
                  <strong style={{ color: '#fff' }}>{area.toLocaleString()} m²</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                  <span style={{ color: '#94a3b8' }}>Est. Delivery Timeline:</span>
                  <strong style={{ color: '#10b981' }}>{currentConfig.avgTimeline}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                  <span style={{ color: '#94a3b8' }}>Supervision Grade:</span>
                  <strong style={{ color: '#38bdf8' }}>BC-6 Grade 5 Licensed</strong>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div>
              <button
                type="button"
                onClick={() => setRfpOpen(true)}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #fdb913, #e5a00d)',
                  color: '#0b1f3a',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '14.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 10px 25px rgba(253,185,19,0.25)',
                }}
              >
                Submit Scope for Official Tender BOQ →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Quote Submission Modal */}
      {rfpOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5,9,18,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
              background: '#0d182b',
              border: '1px solid rgba(253,185,19,0.4)',
              borderRadius: '16px',
              padding: '32px',
              position: 'relative',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setRfpOpen(false);
                setRfpSuccess(null);
              }}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '22px',
                cursor: 'pointer',
              }}
            >
              ×
            </button>

            {rfpSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(253,185,19,0.2)', color: '#fdb913', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '16px' }}>
                  ✓
                </div>
                <h3 style={{ fontSize: '22px', color: '#fff', marginBottom: '8px' }}>Quotation Scope Received</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                  Our senior engineering bureau in Wello Sefer will review your parameters and formulate an official proposal within one business day.
                </p>
                <div style={{ background: '#080e1b', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b', fontWeight: '800', color: '#fdb913', letterSpacing: '0.08em', fontSize: '14px' }}>
                  REFERENCE ID: {rfpSuccess}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ color: '#fdb913', fontWeight: '800', fontSize: '11px', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  OFFICIAL TENDER SUBMISSION
                </div>
                <h3 style={{ fontSize: '22px', color: '#fff', fontWeight: '800', marginBottom: '8px' }}>
                  Request Chief Estimator Proposal
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5', marginBottom: '20px' }}>
                  Lock in this modeled scope: <strong>{currentConfig.label} ({area.toLocaleString()} m²)</strong>
                </p>

                <form onSubmit={handleSubmitRFP} style={{ display: 'grid', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', fontWeight: '600', marginBottom: '4px' }}>Client / Organization Name *</label>
                    <input
                      type="text"
                      required
                      value={rfpName}
                      onChange={e => setRfpName(e.target.value)}
                      placeholder="e.g. Dawit Tadesse (Holding Co.)"
                      style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', background: '#080e1b', border: '1px solid #243553', borderRadius: '6px', color: '#fff', fontSize: '13.5px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', fontWeight: '600', marginBottom: '4px' }}>Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={rfpPhone}
                        onChange={e => setRfpPhone(e.target.value)}
                        placeholder="+251 9..."
                        style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', background: '#080e1b', border: '1px solid #243553', borderRadius: '6px', color: '#fff', fontSize: '13.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', fontWeight: '600', marginBottom: '4px' }}>Email Address</label>
                      <input
                        type="email"
                        value={rfpEmail}
                        onChange={e => setRfpEmail(e.target.value)}
                        placeholder="client@company.com"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', background: '#080e1b', border: '1px solid #243553', borderRadius: '6px', color: '#fff', fontSize: '13.5px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', fontWeight: '600', marginBottom: '4px' }}>Site Location & Specific Engineering Requirements</label>
                    <textarea
                      rows={3}
                      value={rfpNotes}
                      onChange={e => setRfpNotes(e.target.value)}
                      placeholder="Target location (e.g. Addis Ababa / Gelan), timeline urgency, or link to CAD drawings..."
                      style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', background: '#080e1b', border: '1px solid #243553', borderRadius: '6px', color: '#fff', fontSize: '13.5px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      background: 'linear-gradient(135deg, #fdb913, #e5a00d)',
                      color: '#0b1f3a',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '14px',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      marginTop: '6px',
                    }}
                  >
                    {submitting ? 'Submitting to Engineering Bureau...' : 'Dispatch Request to Chief Estimator →'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
