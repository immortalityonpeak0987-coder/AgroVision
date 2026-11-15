import React from 'react';
import { Link } from 'react-router-dom';
import { Satellite, ShieldCheck, Globe } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

export default function Footer() {
  const { t } = useFarm();

  return (
    <footer
      className="no-print"
      style={{
        backgroundColor: '#040D1A',
        color: 'var(--color-text-light)',
        borderTop: '1px solid rgba(53, 197, 244, 0.18)',
        padding: '3.5rem 0 1.75rem',
        fontSize: '0.88rem'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem'
          }}
        >
          {/* Brand Col */}
          <div>
            <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
              <img
                src="/assets/agrovision-logo.png"
                alt="AgroVision"
                style={{ height: '44px', width: 'auto' }}
              />
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    display: 'block',
                    lineHeight: 1.1
                  }}
                >
                  Agro<span style={{ color: 'var(--color-lime-green)' }}>Vision</span>
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-bright-cyan)'
                  }}
                >
                  SPACE DATA TO FARM RECOVERY
                </span>
              </div>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem', lineHeight: 1.65 }}>
              {t(
                'A climate-informed crop rotation and soil recovery decision-support system integrating NASA Earth observation telemetry with West Bengal agro-climatic science.',
                'নাসা আর্থ অবজারভেশন টেলিমেট্রি এবং পশ্চিমবঙ্গের কৃষি-জলবায়ু বিজ্ঞানের সমন্বয়ে তৈরি ফসল আবর্তন ও মাটি পুনরুদ্ধার সিদ্ধান্ত সহায়তা ব্যবস্থা।'
              )}
            </p>
            <div
              style={{
                marginTop: '0.85rem',
                color: 'var(--color-lime-green)',
                fontWeight: 700,
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              Team Innovatrix • NASA Space Apps Challenge 2026
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4
              style={{
                color: '#F8FAFC',
                fontSize: '0.92rem',
                marginBottom: '1rem',
                borderBottom: '1px solid rgba(53, 197, 244, 0.16)',
                paddingBottom: '0.45rem'
              }}
            >
              {t('Core Intelligence Modules', 'প্রধান মডিউলসমূহ')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              <li>
                <Link to="/app/overview" style={{ color: 'var(--color-text-dark)', fontSize: '0.84rem' }}>
                  {t('Agricultural Command Center', 'কৃষি কমান্ড সেন্টার')}
                </Link>
              </li>
              <li>
                <Link to="/app/satellite" style={{ color: 'var(--color-text-dark)', fontSize: '0.84rem' }}>
                  {t('Interactive GIS & Satellite Pass Map', 'ইন্টারঅ্যাক্টিভ জিআইএস ও উপগ্রহ ম্যাপ')}
                </Link>
              </li>
              <li>
                <Link to="/app/climate" style={{ color: 'var(--color-text-dark)', fontSize: '0.84rem' }}>
                  {t('Climate Telemetry (NASA POWER 0.5°)', 'জলবায়ু টেলিমেট্রি (NASA POWER)')}
                </Link>
              </li>
              <li>
                <Link to="/app/risk" style={{ color: 'var(--color-text-dark)', fontSize: '0.84rem' }}>
                  {t('Multi-Hazard & Salinity Screening', 'বহুমুখী ঝুঁকি ও লবণাক্ততা মূল্যায়ন')}
                </Link>
              </li>
              <li>
                <Link to="/app/crop-planner" style={{ color: 'var(--color-text-dark)', fontSize: '0.84rem' }}>
                  {t('12-Month Crop Rotation Planner', '১২ মাসের ফসল আবর্তন পরিকল্পক')}
                </Link>
              </li>
            </ul>
          </div>

          {/* NASA Data Attribution */}
          <div>
            <h4
              style={{
                color: '#F8FAFC',
                fontSize: '0.92rem',
                marginBottom: '1rem',
                borderBottom: '1px solid rgba(53, 197, 244, 0.16)',
                paddingBottom: '0.45rem'
              }}
            >
              {t('NASA & Earth Science Data', 'নাসা ও আর্থ সায়েন্স তথ্যসূত্র')}
            </h4>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>
              We acknowledge the NASA Earth Science Division, NASA Langley POWER Project, NASA GPM IMERG, NASA SMAP Science Team, USGS/NASA Harmonized Landsat Sentinel-2 (HLS), and ISRIC SoilGrids.
            </p>
            <div
              className="flex items-center gap-2"
              style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--color-bright-cyan)' }}
            >
              <Satellite size={14} />
              <span>Open Earth Science for Resilient Farming</span>
            </div>
          </div>

          {/* Scientific Disclaimer */}
          <div>
            <h4
              style={{
                color: '#F8FAFC',
                fontSize: '0.92rem',
                marginBottom: '1rem',
                borderBottom: '1px solid rgba(53, 197, 244, 0.16)',
                paddingBottom: '0.45rem'
              }}
            >
              {t('Scientific Integrity & Caveats', 'বৈজ্ঞানিক সতর্কবার্তা')}
            </h4>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', lineHeight: 1.55 }}>
              Gridded satellite products (0.5° NASA POWER, 9km SMAP, 10km GPM) reflect regional environmental conditions and do not replace plot-level laboratory soil EC/pH testing or Block Agricultural Officer verification.
            </p>
            <div
              className="flex items-center gap-2"
              style={{ marginTop: '0.75rem', fontSize: '0.76rem', color: 'var(--color-lime-green)' }}
            >
              <ShieldCheck size={14} />
              <span>Honest Provenance: LIVE / DEMO / CACHED</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(53, 197, 244, 0.12)',
            paddingTop: '1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.78rem',
            color: 'var(--color-text-muted)'
          }}
        >
          <div>
            © 2026 AgroVision (Team Innovatrix). Built for West Bengal Agricultural Resilience.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/about" style={{ color: 'var(--color-bright-cyan)' }}>
              System Architecture
            </Link>
            <Link to="/app/research" style={{ color: 'var(--color-bright-cyan)' }}>
              NASA API Provenance
            </Link>
            <Link to="/app/reports" style={{ color: 'var(--color-bright-cyan)' }}>
              Printable Farmer Dossier
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
