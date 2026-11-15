import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, Satellite, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-soft-bg)', padding: '3.5rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '920px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <img
            src="/assets/agrovision-logo.png"
            alt="AgroVision Emblem"
            style={{
              height: '92px',
              width: 'auto',
              marginBottom: '1.25rem',
              borderRadius: '14px',
              border: '1px solid rgba(53, 197, 244, 0.35)'
            }}
          />
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.6rem', color: '#F8FAFC' }}>
            About Agro<span style={{ color: 'var(--color-lime-green)' }}>Vision</span>
          </h1>
          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--color-bright-cyan)',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)'
            }}
          >
            From Space Data to Farm Recovery Decisions
          </p>
        </div>

        {/* Mission Card */}
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.45rem', marginBottom: '0.75rem', color: '#F8FAFC' }}>
            Mission & Architecture
          </h2>
          <p style={{ lineHeight: 1.7, color: '#E2E8F0', marginBottom: '1rem' }}>
            AgroVision was engineered for the <strong>NASA Space Apps Challenge 2026</strong> by{' '}
            <strong style={{ color: 'var(--color-lime-green)' }}>Team Innovatrix</strong>.
          </p>
          <p style={{ lineHeight: 1.7, color: 'var(--color-text-muted)', marginBottom: 0 }}>
            Our platform bridges petabytes of open NASA Earth observation telemetry with the field-level decisions of smallholder farmers. Currently implemented across <strong>West Bengal, India</strong>, AgroVision is architected to scale <strong>globally</strong> across international agricultural belts in future releases—translating multi-mission satellite signals into actionable decisions for crop rotation, water conservation, and post-hazard soil recovery.
          </p>
        </div>

        {/* Team Innovatrix */}
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
            <Users size={22} style={{ color: 'var(--color-bright-cyan)' }} />
            <h3 style={{ fontSize: '1.35rem', margin: 0, color: '#F8FAFC' }}>Team Innovatrix</h3>
          </div>
          <p style={{ lineHeight: 1.6, color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Engineered with a focus on scientific honesty, spatial resolution awareness, and practical agronomic utility—currently active across West Bengal (Gangetic alluvial, coastal Sundarbans, and red lateritic zones) and expanding globally in future phases.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginTop: '1rem'
            }}
          >
            <div
              style={{
                padding: '0.85rem',
                background: 'rgba(6, 20, 38, 0.8)',
                border: '1px solid rgba(53, 197, 244, 0.2)',
                borderRadius: 'var(--radius-md)',
                color: '#E2E8F0'
              }}
            >
              <strong style={{ color: 'var(--color-bright-cyan)' }}>Challenge:</strong> NASA Space Apps 2026
            </div>
            <div
              style={{
                padding: '0.85rem',
                background: 'rgba(6, 20, 38, 0.8)',
                border: '1px solid rgba(53, 197, 244, 0.2)',
                borderRadius: 'var(--radius-md)',
                color: '#E2E8F0'
              }}
            >
              <strong style={{ color: 'var(--color-lime-green)' }}>Plot Region:</strong> West Bengal, India (Future: Global)
            </div>
            <div
              style={{
                padding: '0.85rem',
                background: 'rgba(6, 20, 38, 0.8)',
                border: '1px solid rgba(53, 197, 244, 0.2)',
                borderRadius: 'var(--radius-md)',
                color: '#E2E8F0'
              }}
            >
              <strong style={{ color: 'var(--color-bright-cyan)' }}>Stack:</strong> React + Leaflet GIS + Express
            </div>
          </div>
        </div>

        {/* Scientific Integrity */}
        <div className="card" style={{ borderLeft: '4px solid var(--color-lime-green)' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
            <ShieldCheck size={20} style={{ color: 'var(--color-lime-green)' }} />
            <h3 style={{ fontSize: '1.25rem', margin: 0, color: '#F8FAFC' }}>
              Scientific Integrity Commitments
            </h3>
          </div>
          <ul
            style={{
              paddingLeft: '1.25rem',
              lineHeight: 1.75,
              color: '#E2E8F0',
              fontSize: '0.9rem'
            }}
          >
            <li>
              We never claim that optical or microwave satellites directly measure soil NPK or plot-level root-zone EC without laboratory soil testing.
            </li>
            <li>
              We explicitly label spatial grids (`0.5°` NASA POWER, `9 km` SMAP, `10 km` GPM, `30 m` HLS) on every telemetry module.
            </li>
            <li>
              Missing sensor records (`-999`) are sanitized and flagged as `MISSING` rather than coerced to zero.
            </li>
            <li>
              All crop rotation sequences adhere to the West Bengal Crop Planning Calendar and CSSRI Canning agro-ecological guidelines.
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <div style={{ textAlign: 'center', marginTop: '2.75rem' }}>
          <Link to="/app/overview" className="btn btn-lg btn-primary">
            <Satellite size={18} />
            <span>Open Farm Command Center</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
