import React, { useState } from 'react';
import { Satellite, Info, Radio, ChevronDown, ChevronUp } from 'lucide-react';

export default function DataSourceCard({
  sourceName,
  product,
  resolution,
  observationDate,
  coverage,
  caveat,
  whatItHelpsUnderstand,
  dataState = 'LIVE / SEED'
}) {
  const [showTechnical, setShowTechnical] = useState(false);

  const friendlyPurpose =
    whatItHelpsUnderstand ||
    (String(sourceName).includes('Crop')
      ? 'Helps choose crops that save water, improve soil fertility, and reduce pest risk.'
      : String(sourceName).includes('Recovery')
      ? 'Combines your farm notes with satellite moisture checks to track recovery after heavy rain or salinity.'
      : 'Helps us understand weather patterns, soil moisture, and how green and healthy crops look from space.');

  return (
    <div
      style={{
        background: 'rgba(6, 20, 38, 0.78)',
        border: '1px solid rgba(53, 197, 244, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.15rem',
        fontSize: '0.84rem',
        marginTop: '1.1rem'
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: '0.7rem', flexWrap: 'wrap', gap: '0.5rem' }}
      >
        <span
          className="flex items-center gap-2"
          style={{ fontWeight: 700, color: 'var(--color-bright-cyan)', fontSize: '0.9rem' }}
        >
          <Satellite size={16} />
          <span>Where this information comes from: {sourceName}</span>
        </span>
        <div className="flex items-center gap-2">
          <span
            style={{
              fontSize: '0.68rem',
              fontFamily: 'var(--font-mono)',
              background: 'rgba(56, 168, 50, 0.16)',
              color: 'var(--color-lime-green)',
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid rgba(181, 230, 29, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <Radio size={10} />
            {dataState}
          </span>

          <button
            type="button"
            onClick={() => setShowTechnical(!showTechnical)}
            style={{
              background: 'rgba(15, 36, 66, 0.9)',
              border: '1px solid rgba(53, 197, 244, 0.3)',
              color: '#F8FAFC',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.74rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              cursor: 'pointer'
            }}
          >
            <span>{showTechnical ? 'Hide technical details' : 'Learn more'}</span>
            {showTechnical ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Simple Farmer-Friendly Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
          color: '#E2E8F0',
          marginBottom: caveat ? '0.65rem' : 0,
          fontSize: '0.8rem'
        }}
      >
        <div>
          <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.72rem' }}>
            What it helps us understand:
          </span>
          <strong style={{ color: '#F8FAFC', fontWeight: 600 }}>{friendlyPurpose}</strong>
        </div>

        {coverage && (
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.72rem' }}>
              Area covered by this data:
            </span>
            <strong style={{ color: '#F8FAFC' }}>{coverage}</strong>
            {resolution && (
              <span style={{ color: 'var(--color-bright-cyan)', display: 'block', fontSize: '0.72rem' }}>
                ({resolution})
              </span>
            )}
          </div>
        )}

        {observationDate && (
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.72rem' }}>
              Dates covered:
            </span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: '#F8FAFC' }}>
              {observationDate}
            </strong>
          </div>
        )}
      </div>

      {/* Important Note / Caveat */}
      {caveat && (
        <div
          className="flex items-start gap-2"
          style={{
            fontSize: '0.77rem',
            color: 'var(--color-text-muted)',
            borderTop: '1px dashed rgba(53, 197, 244, 0.22)',
            paddingTop: '0.55rem',
            lineHeight: 1.45
          }}
        >
          <Info
            size={14}
            style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-bright-cyan)' }}
          />
          <span>{caveat}</span>
        </div>
      )}

      {/* Expandable Technical Details ("Learn more") */}
      {showTechnical && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.75rem',
            background: 'rgba(4, 12, 24, 0.85)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(53, 197, 244, 0.2)',
            fontSize: '0.76rem',
            color: '#CBD5E1'
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--color-lime-green)', marginBottom: '0.35rem' }}>
            Technical Provenance & Sensor Specifications
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Dataset / Product: </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#F8FAFC' }}>{product || sourceName}</span>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Spatial Grid Resolution: </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#F8FAFC' }}>{resolution || 'Regional Grid'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Missing Value Policy: </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-bright-cyan)' }}>
                Fill (-999) flagged MISSING, never coerced to 0
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
