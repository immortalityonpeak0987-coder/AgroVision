import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Satellite,
  CloudSun,
  Repeat,
  Activity,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Droplets,
  Layers,
  Sparkles,
  Compass,
  Sprout,
  Radio,
  BarChart3
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import DemoBadge from '../components/common/DemoBadge';

export default function HomePage() {
  const { farms, activeFarm, switchFarm, t, formatArea } = useFarm();
  const navigate = useNavigate();

  const handleInspectFarm = (farmId) => {
    switchFarm(farmId);
    navigate('/app/overview');
  };

  return (
    <div style={{ backgroundColor: 'var(--color-soft-bg)', color: 'var(--color-text-dark)' }}>
      {/* 1. HERO SECTION — INSPIRED BY REFERENCE IMAGES 2 & 3 */}
      <section
        style={{
          background:
            'radial-gradient(circle at 82% 22%, rgba(53, 197, 244, 0.22) 0%, transparent 45%), radial-gradient(circle at 18% 80%, rgba(56, 168, 50, 0.22) 0%, transparent 50%), linear-gradient(135deg, #040D1A 0%, #061426 52%, #0B1F3A 100%)',
          color: '#FFFFFF',
          padding: '4.5rem 0 5.25rem',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(53, 197, 244, 0.22)'
        }}
      >
        {/* Subtle Orbital Grid Background */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(53, 197, 244, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(53, 197, 244, 0.05) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            pointerEvents: 'none'
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '3rem',
              alignItems: 'center'
            }}
          >
            {/* Left Content */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  background: 'rgba(11, 31, 58, 0.85)',
                  border: '1px solid rgba(53, 197, 244, 0.38)',
                  padding: '0.42rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.35rem',
                  boxShadow: '0 0 24px rgba(53, 197, 244, 0.15)'
                }}
              >
                <Radio size={14} style={{ color: 'var(--color-lime-green)' }} />
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: 'var(--color-bright-cyan)',
                    letterSpacing: '0.06em'
                  }}
                >
                  {t(
                    'NASA SPACE APPS 2026 • TEAM INNOVATRIX • WEST BENGAL PILOT',
                    'নাসা স্পেস অ্যাপস ২০২৬ • টিম ইনোভ্যাট্রিক্স • পশ্চিমবঙ্গ পাইলট'
                  )}
                </span>
              </div>

              <h1
                style={{
                  color: '#F8FAFC',
                  fontSize: 'clamp(2.25rem, 4vw, 3.35rem)',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  marginBottom: '1.15rem',
                  letterSpacing: '-0.025em'
                }}
              >
                {t('From ', 'মহাকাশ ডেটা থেকে ')}
                <span
                  style={{
                    background: 'linear-gradient(90deg, #35C5F4 0%, #B5E61D 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {t('Space Data', 'কৃষি পুনরুদ্ধার')}
                </span>
                {t(' to Farm Recovery Decisions.', ' সিদ্ধান্তে।')}
              </h1>

              <p
                style={{
                  color: '#CBD5E1',
                  fontSize: '1.06rem',
                  lineHeight: 1.65,
                  marginBottom: '1.85rem',
                  maxWidth: '60ch'
                }}
              >
                {t(
                  'AgroVision integrates NASA POWER agroclimatology, SMAP root-zone moisture, GPM precipitation, and HLS/MODIS canopy vitality with West Bengal soil chemistry to guide multi-hazard recovery and sustainable 12-month crop rotations.',
                  'AgroVision নাসা আর্থ অবজারভেশন টেলিমেট্রি এবং পশ্চিমবঙ্গের মাটি ও কৃষি-জলবায়ু তথ্যের সমন্বয়ে বন্যা, লবণাক্ততা ও খরা ঝুঁকি যাচাই করে টেকসই ১২ মাসের ফসল আবর্তন পরিকল্পনা প্রদান করে।'
                )}
              </p>

              <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
                <Link to="/app/overview" className="btn btn-lg btn-primary">
                  <Compass size={18} />
                  <span>{t('Open Farm Command Center', 'কমান্ড সেন্টার খুলুন')}</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/app/satellite" className="btn btn-lg btn-secondary">
                  <Satellite size={18} style={{ color: 'var(--color-bright-cyan)' }} />
                  <span>{t('Launch Interactive GIS Map', 'জিআইএস ম্যাপ দেখুন')}</span>
                </Link>
                <Link
                  to="/app/register-farm"
                  className="btn btn-lg btn-ghost"
                  style={{ color: 'var(--color-lime-green)' }}
                >
                  <span>{t('+ Register Plot', '+ খামার নিবন্ধন')}</span>
                </Link>
              </div>

              {/* KPI Strip Inspired by Reference Image 3 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: '1rem',
                  marginTop: '2.5rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(53, 197, 244, 0.18)'
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '1.65rem',
                      fontWeight: 800,
                      color: 'var(--color-lime-green)',
                      fontFamily: 'var(--font-heading)',
                      fontVariantNumeric: 'tabular-nums'
                    }}
                  >
                    6 Zones
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                    {t('West Bengal Agro-Climatic Belts', 'পশ্চিমবঙ্গের কৃষি-জলবায়ু অঞ্চল')}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '1.65rem',
                      fontWeight: 800,
                      color: 'var(--color-bright-cyan)',
                      fontFamily: 'var(--font-heading)',
                      fontVariantNumeric: 'tabular-nums'
                    }}
                  >
                    4 Missions
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                    POWER • GPM • SMAP • HLS/MODIS
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '1.65rem',
                      fontWeight: 800,
                      color: '#F8FAFC',
                      fontFamily: 'var(--font-heading)',
                      fontVariantNumeric: 'tabular-nums'
                    }}
                  >
                    35–42%
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                    {t('Rabi/Summer Irrigation Saved', 'রবি ও গ্রীষ্মকালীন জল সাশ্রয়')}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Orbital Telemetry Command Card & Official Emblem (Inspired by Ref Image 2) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  background:
                    'linear-gradient(155deg, rgba(11, 31, 58, 0.92) 0%, rgba(6, 20, 38, 0.95) 100%)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid rgba(53, 197, 244, 0.35)',
                  padding: '1.5rem',
                  boxShadow: '0 24px 55px rgba(2, 8, 20, 0.75)',
                  position: 'relative'
                }}
              >
                {/* Header with Emblem */}
                <div
                  className="flex items-center justify-between"
                  style={{
                    paddingBottom: '1rem',
                    marginBottom: '1rem',
                    borderBottom: '1px solid rgba(53, 197, 244, 0.18)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/agrovision-logo.png"
                      alt="AgroVision Official Emblem"
                      style={{
                        height: '58px',
                        width: 'auto',
                        borderRadius: '10px',
                        border: '1px solid rgba(53, 197, 244, 0.3)'
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-bright-cyan)',
                          letterSpacing: '0.06em'
                        }}
                      >
                        ORBITAL TELEMETRY FEED • LIVE SNAPSHOT
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC' }}>
                        {activeFarm ? activeFarm.name : 'Gangetic Alluvial Pilot Station'}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                        {activeFarm
                          ? `${activeFarm.district}, West Bengal (${Number(activeFarm.latitude).toFixed(2)}°N, ${Number(activeFarm.longitude).toFixed(2)}°E)`
                          : 'Nadia / Purba Bardhaman, West Bengal'}
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-live">PASS ACTIVE</span>
                </div>

                {/* 3 Telemetry Gauges (Like Ref Image 2: Humidity / Soil Moisture / NDVI) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.75rem',
                    marginBottom: '1rem'
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(6, 20, 38, 0.85)',
                      border: '1px solid rgba(53, 197, 244, 0.25)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                      Humidity (RH2M)
                    </div>
                    <div
                      style={{
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        color: 'var(--color-bright-cyan)',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      74%
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                      NASA POWER 0.5°
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(6, 20, 38, 0.85)',
                      border: '1px solid rgba(53, 197, 244, 0.25)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                      Root Moisture
                    </div>
                    <div
                      style={{
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        color: '#38BDF8',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      0.31 m³/m³
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                      SMAP L4 (9 km)
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(6, 20, 38, 0.85)',
                      border: '1px solid rgba(181, 230, 29, 0.35)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                      Canopy NDVI
                    </div>
                    <div
                      style={{
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        color: 'var(--color-lime-green)',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      0.72
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-lime-green)' }}>
                      Vigorous Stand
                    </div>
                  </div>
                </div>

                {/* Recommended Rotation Preview (Like Ref Image 2) */}
                <div
                  style={{
                    background: 'rgba(6, 20, 38, 0.9)',
                    border: '1px solid rgba(53, 197, 244, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.9rem 1rem',
                    marginBottom: '0.9rem'
                  }}
                >
                  <div
                    className="flex items-center justify-between"
                    style={{ marginBottom: '0.55rem' }}
                  >
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-lime-green)',
                        fontWeight: 700
                      }}
                    >
                      RECOMMENDED 3-SEASON ROTATION SEQUENCE
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-bright-cyan)' }}>
                      88% Suitability
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem' }}>
                    <div className="flex items-center justify-between">
                      <span style={{ color: '#F8FAFC', fontWeight: 600 }}>
                        ● Kharif: Swarna Sub-1 Aman Paddy
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-lime-green)' }}>
                        Flood-Tolerant
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: '#F8FAFC', fontWeight: 600 }}>
                        ● Rabi: Yellow Mustard (B-9) / Lentil
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-bright-cyan)' }}>
                        -38% Water Use
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: '#F8FAFC', fontWeight: 600 }}>
                        ● Summer: Short-Duration Green Gram (Moong)
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#FBBF24' }}>
                        +40 kg N/ha Fixation
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between" style={{ fontSize: '0.76rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {t(
                      'Click any pilot station below to inspect full GIS & soil analytics',
                      'যেকোনো পাইলট খামার নির্বাচন করে সম্পূর্ণ জিআইএস ও মাটি বিশ্লেষণ দেখুন'
                    )}
                  </span>
                  <Link
                    to="/app/satellite"
                    style={{ color: 'var(--color-bright-cyan)', fontWeight: 700 }}
                  >
                    {t('Open GIS Telemetry →', 'জিআইএস টেলিমেট্রি →')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE-STAGE WORKFLOW (BEFORE, DURING, AFTER) */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--color-bright-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              {t('END-TO-END DECISION ARCHITECTURE', 'সম্পূর্ণ কৃষি সিদ্ধান্ত কাঠামো')}
            </span>
            <h2 style={{ fontSize: '2.1rem', marginTop: '0.4rem', marginBottom: '0.75rem', color: '#F8FAFC' }}>
              {t('A Complete Three-Stage Decision Workflow', 'তিন ধাপের বৈজ্ঞানিক সিদ্ধান্ত প্রক্রিয়া')}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.98rem' }}>
              We go beyond raw weather charts. AgroVision guides farmers before sowing, monitors vitality during crop development, and plans soil recovery after climate hazards.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Stage 1: BEFORE */}
            <div className="card" style={{ borderTop: '3px solid var(--color-satellite-blue)' }}>
              <div
                style={{
                  display: 'inline-flex',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(22, 139, 206, 0.16)',
                  color: 'var(--color-bright-cyan)',
                  marginBottom: '1rem'
                }}
              >
                <CloudSun size={24} />
              </div>
              <div
                style={{
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: 'var(--color-bright-cyan)',
                  letterSpacing: '0.06em',
                  marginBottom: '0.3rem'
                }}
              >
                STAGE 01 • BEFORE SOWING
              </div>
              <h3 style={{ fontSize: '1.22rem', marginBottom: '0.55rem', color: '#F8FAFC' }}>
                Climate & Seasonal Risk Screening
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Inspect 10-year monthly normals of temperature (`T2M`), precipitation (`PRECTOTCORR`), and solar irradiance via <strong>NASA POWER</strong>. Detect delayed monsoon onset or dry spells before buying seed.
              </p>
              <div
                style={{
                  marginTop: '1rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(53, 197, 244, 0.16)',
                  fontSize: '0.8rem',
                  color: 'var(--color-lime-green)',
                  fontWeight: 600
                }}
              >
                ✓ Optimal sowing window & cultivar matching
              </div>
            </div>

            {/* Stage 2: DURING */}
            <div className="card" style={{ borderTop: '3px solid var(--color-bright-cyan)' }}>
              <div
                style={{
                  display: 'inline-flex',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(53, 197, 244, 0.16)',
                  color: 'var(--color-bright-cyan)',
                  marginBottom: '1rem'
                }}
              >
                <Satellite size={24} />
              </div>
              <div
                style={{
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: 'var(--color-bright-cyan)',
                  letterSpacing: '0.06em',
                  marginBottom: '0.3rem'
                }}
              >
                STAGE 02 • DURING THE SEASON
              </div>
              <h3 style={{ fontSize: '1.22rem', marginBottom: '0.55rem', color: '#F8FAFC' }}>
                Interactive GIS & Field Reality
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Track vegetative greenness (`NDVI`) via <strong>MODIS & Landsat/HLS</strong> alongside <strong>NASA GPM</strong> heavy rainfall and <strong>SMAP</strong> soil moisture. Submit lab soil EC/pH tests and field photos.
              </p>
              <div
                style={{
                  marginTop: '1rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(53, 197, 244, 0.16)',
                  fontSize: '0.8rem',
                  color: 'var(--color-lime-green)',
                  fontWeight: 600
                }}
              >
                ✓ Real-time waterlogging & coastal salinity alerts
              </div>
            </div>

            {/* Stage 3: AFTER */}
            <div className="card" style={{ borderTop: '3px solid var(--color-lime-green)' }}>
              <div
                style={{
                  display: 'inline-flex',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(56, 168, 50, 0.2)',
                  color: 'var(--color-lime-green)',
                  marginBottom: '1rem'
                }}
              >
                <Repeat size={24} />
              </div>
              <div
                style={{
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: 'var(--color-lime-green)',
                  letterSpacing: '0.06em',
                  marginBottom: '0.3rem'
                }}
              >
                STAGE 03 • AFTER HARVEST / HAZARD
              </div>
              <h3 style={{ fontSize: '1.22rem', marginBottom: '0.55rem', color: '#F8FAFC' }}>
                Recovery & Crop Rotation Planning
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Evaluate your 12-month cropping calendar and simulate climate shocks. Receive <strong>multi-plan crop rotations</strong> optimized for biological nitrogen fixation, aquifer conservation, and salinity resilience.
              </p>
              <div
                style={{
                  marginTop: '1rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(53, 197, 244, 0.16)',
                  fontSize: '0.8rem',
                  color: 'var(--color-lime-green)',
                  fontWeight: 600
                }}
              >
                ✓ Breaking monoculture exhaustion & pest cycles
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WEST BENGAL FOCUS SECTION & LIVE PILOT SELECTOR */}
      <section
        style={{
          backgroundColor: 'rgba(9, 25, 48, 0.65)',
          padding: '4.5rem 0',
          borderTop: '1px solid rgba(53, 197, 244, 0.16)',
          borderBottom: '1px solid rgba(53, 197, 244, 0.16)'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '3rem',
              alignItems: 'center'
            }}
          >
            <div>
              <span className="badge badge-satellite" style={{ marginBottom: '0.75rem' }}>
                ACTIVE PLOT REGION: WEST BENGAL • FUTURE: GLOBAL ROLLOUT
              </span>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#F8FAFC' }}>
                Currently Implemented Across West Bengal — Architected for Global Expansion
              </h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                AgroVision is currently implemented across the diverse agro-climatic zones of <strong>West Bengal, India</strong>, and is engineered on global NASA satellite grids (POWER, SMAP, GPM, MODIS/HLS) to scale <strong>globally</strong> across international farming regions in future releases:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div
                  style={{
                    padding: '0.95rem 1.1rem',
                    background: 'rgba(11, 31, 58, 0.85)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(53, 197, 244, 0.16)',
                    borderLeft: '4px solid var(--color-lime-green)'
                  }}
                >
                  <strong style={{ color: '#F8FAFC', fontSize: '0.95rem' }}>
                    1. Gangetic Alluvial Plains (Nadia, Purba Bardhaman & Hooghly)
                  </strong>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
                    Intensive Rice–Potato–Sesame/Mustard systems. High Boro groundwater extraction requires pulse rotation (Lentil/Moong) to restore soil nitrogen and conserve aquifers.
                  </p>
                </div>

                <div
                  style={{
                    padding: '0.95rem 1.1rem',
                    background: 'rgba(11, 31, 58, 0.85)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(53, 197, 244, 0.16)',
                    borderLeft: '4px solid var(--color-bright-cyan)'
                  }}
                >
                  <strong style={{ color: '#F8FAFC', fontSize: '0.95rem' }}>
                    2. Coastal Delta & Sundarbans (South 24 Parganas / Gosaba)
                  </strong>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
                    Cyclonic storm surges, waterlogging, and dry-season capillary soil salinity (`EC > 4.0 dS/m`). Demands salt-tolerant Aman paddy (`Luna Suvarna`) and zero-tillage relay Lathyrus (`Khesari`).
                  </p>
                </div>

                <div
                  style={{
                    padding: '0.95rem 1.1rem',
                    background: 'rgba(11, 31, 58, 0.85)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(53, 197, 244, 0.16)',
                    borderLeft: '4px solid var(--color-warning)'
                  }}
                >
                  <strong style={{ color: '#F8FAFC', fontSize: '0.95rem' }}>
                    3. Red & Lateritic Uplands (Bankura, Birbhum & Purulia)
                  </strong>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
                    Acidic soils (`pH 5.2–5.8`), rapid surface runoff, and terminal drought risk. Ideal for low-water oilseeds, mustard, and hardy legumes.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Pilot Farm Cards */}
            <div
              style={{
                background: 'rgba(11, 31, 58, 0.9)',
                padding: '1.75rem',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid rgba(53, 197, 244, 0.28)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.12rem', margin: 0, color: '#F8FAFC' }}>
                  {t('Inspect Live Pilot Farm Stations', 'পাইলট খামার স্টেশনসমূহ দেখুন')}
                </h3>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--color-bright-cyan)' }}>
                  CLICK TO SWITCH
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {farms.map((farm) => {
                  const isCurrent = activeFarm?.id === farm.id;
                  return (
                    <button
                      key={farm.id}
                      onClick={() => handleInspectFarm(farm.id)}
                      style={{
                        padding: '0.85rem 1rem',
                        background: isCurrent
                          ? 'linear-gradient(90deg, rgba(56, 168, 50, 0.2), rgba(15, 36, 66, 0.95))'
                          : 'rgba(6, 20, 38, 0.85)',
                        borderRadius: 'var(--radius-md)',
                        border: isCurrent
                          ? '1px solid var(--color-lime-green)'
                          : '1px solid rgba(53, 197, 244, 0.2)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 150ms ease'
                      }}
                    >
                      <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem' }}>
                        <strong style={{ color: '#F8FAFC', fontSize: '0.92rem' }}>
                          {farm.name}
                        </strong>
                        <DemoBadge label={isCurrent ? 'ACTIVE PLOT' : 'PILOT SEED'} isLive={isCurrent} />
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        {farm.district} • {farm.agroClimaticZone} • {formatArea(farm)}
                      </div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-bright-cyan)',
                          marginTop: '0.25rem'
                        }}
                      >
                        Standing: {farm.currentCrop} • Soil: {farm.soilType}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div
                className="flex items-center justify-between"
                style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(53, 197, 244, 0.16)' }}
              >
                <Link to="/app/register-farm" className="btn btn-sm btn-primary">
                  + Register Your Own Plot
                </Link>
                <Link to="/app/farms" className="btn btn-sm btn-outline">
                  Manage All Plots →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NASA DATA TRANSPARENCY & CITATION */}
      <section style={{ padding: '4.25rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem' }}>
            <span className="badge badge-satellite" style={{ marginBottom: '0.5rem' }}>
              OPEN SCIENCE & SPATIAL PROVENANCE
            </span>
            <h2 style={{ fontSize: '1.9rem', marginBottom: '0.5rem', color: '#F8FAFC' }}>
              NASA Earth Observation Missions Integrated
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
              Every metric in AgroVision carries explicit spatial resolution metadata and data-state badges (`LIVE`, `DEMO`, `CACHED`) so regional satellite grids are never confused with plot-level soil chemistry.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="card">
              <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#F8FAFC', fontSize: '1rem' }}>NASA POWER</strong>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-lime-green)' }}>
                  0.5° × 0.5°
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--color-bright-cyan)', fontWeight: 600 }}>
                Agroclimatology Archive
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.45rem', marginBottom: 0 }}>
                2-meter air temperature (`T2M`), bias-corrected precipitation (`PRECTOTCORR`), relative humidity (`RH2M`), and solar radiation.
              </p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#F8FAFC', fontSize: '1rem' }}>NASA GPM IMERG</strong>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-bright-cyan)' }}>
                  0.1° (~10 km)
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--color-bright-cyan)', fontWeight: 600 }}>
                Active Monsoon Precipitation
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.45rem', marginBottom: 0 }}>
                7-day and 30-day rainfall accumulation screening to detect waterlogging and low-lying Aman paddy submergence hazards.
              </p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#F8FAFC', fontSize: '1rem' }}>NASA SMAP L4</strong>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-bright-cyan)' }}>
                  9 km EASE-Grid
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--color-bright-cyan)', fontWeight: 600 }}>
                Surface & Root-Zone Moisture
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.45rem', marginBottom: 0 }}>
                Volumetric soil moisture (`cm³/cm³`) to evaluate post-monsoon residual moisture for zero-tillage Rabi pulse sowing.
              </p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#F8FAFC', fontSize: '1rem' }}>MODIS & HLS</strong>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-lime-green)' }}>
                  30m – 250m
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--color-bright-cyan)', fontWeight: 600 }}>
                Optical Canopy Vitality
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.45rem', marginBottom: 0 }}>
                Normalized Difference Vegetation Index (`NDVI`) temporal curves tracking crop emergence, peak tillering, and post-hazard recovery.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
