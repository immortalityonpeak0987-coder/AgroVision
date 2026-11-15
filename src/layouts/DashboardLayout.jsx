import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useFarm } from '../context/FarmContext';
import { MapPin, Compass, Layers, Droplets, Sprout } from 'lucide-react';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    activeFarm,
    farms,
    formatArea,
    t,
    experienceMode,
    setExperienceMode,
    institutionalRole,
    setInstitutionalRole
  } = useFarm();

  const isFarmer = experienceMode === 'farmer';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-soft-bg)' }}>
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main
          style={{
            flex: 1,
            padding: '1.25rem 1.5rem 2.5rem',
            maxWidth: '100%',
            overflowX: 'hidden'
          }}
        >
          <div className="container" style={{ padding: 0 }}>
            {/* Top Mode Switcher Bar: Farmer Mode vs Institutional & Field Teams Workspace */}
            <div
              className="no-print"
              style={{
                background: 'rgba(6, 20, 38, 0.92)',
                border: '1px solid rgba(53, 197, 244, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.6rem 1rem',
                marginBottom: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {t('Workspace Experience:', 'ব্যবহারের মোড:')}
                </span>
                <button
                  type="button"
                  onClick={() => setExperienceMode('farmer')}
                  style={{
                    padding: '0.32rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: isFarmer ? 'rgba(56, 168, 50, 0.22)' : 'rgba(15, 36, 66, 0.7)',
                    color: isFarmer ? 'var(--color-lime-green)' : '#CBD5E1',
                    border: isFarmer ? '1px solid var(--color-lime-green)' : '1px solid rgba(53, 197, 244, 0.2)'
                  }}
                >
                  🌾 {t('Farmer Mode (Simple & Direct)', 'কৃষক মোড (সহজ বাংলা ও ইংরেজি)')}
                </button>
                <Link
                  to="/app/institutional"
                  onClick={() => setExperienceMode('institutional')}
                  style={{
                    padding: '0.32rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    background: !isFarmer ? 'rgba(22, 139, 206, 0.25)' : 'rgba(15, 36, 66, 0.7)',
                    color: !isFarmer ? 'var(--color-bright-cyan)' : '#CBD5E1',
                    border: !isFarmer ? '1px solid var(--color-bright-cyan)' : '1px solid rgba(53, 197, 244, 0.2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <span>🏢 {t('Institutional & Field Teams (FPO / Officer / NGO)', 'প্রাতিষ্ঠানিক ও মাঠকর্মী মোড')}</span>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      padding: '0.08rem 0.4rem',
                      borderRadius: '4px',
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#FBBF24',
                      border: '1px solid rgba(245, 158, 11, 0.45)',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    COMING SOON
                  </span>
                </Link>
              </div>

              {!isFarmer ? (
                <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Active Role:</span>
                  {[
                    { id: 'fpo', label: 'FPO / Cooperative' },
                    { id: 'officer', label: 'Field Officer' },
                    { id: 'ngo', label: 'NGO Program' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setInstitutionalRole(r.id)}
                      style={{
                        padding: '0.24rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background:
                          institutionalRole === r.id ? 'var(--color-lime-green)' : 'rgba(15, 36, 66, 0.8)',
                        color: institutionalRole === r.id ? '#04101E' : '#E2E8F0',
                        border: '1px solid rgba(181, 230, 29, 0.35)'
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                  <span className="badge badge-live">{farms.length} MONITORED FARMS</span>
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {t(
                    'Everyday farming language enabled • Technical satellite details available under "Learn more"',
                    'সহজ কৃষি ভাষা সক্রিয় করা হয়েছে'
                  )}
                </div>
              )}
            </div>

            {/* Top Active Farm Strip */}
            {activeFarm && (
              <div
                className="no-print"
                style={{
                  background:
                    'linear-gradient(110deg, rgba(11, 31, 58, 0.95) 0%, rgba(6, 20, 38, 0.96) 60%, rgba(16, 48, 44, 0.85) 100%)',
                  color: '#F8FAFC',
                  padding: '0.9rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(53, 197, 244, 0.25)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.85rem',
                  boxShadow: '0 10px 28px rgba(2, 8, 20, 0.45)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      background: 'rgba(181, 230, 29, 0.14)',
                      border: '1px solid rgba(181, 230, 29, 0.35)',
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-lime-green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.02rem', fontWeight: 800, color: '#F8FAFC' }}>
                        {activeFarm.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '0.12rem 0.45rem',
                          borderRadius: '4px',
                          background: 'rgba(53, 197, 244, 0.12)',
                          color: 'var(--color-bright-cyan)',
                          border: '1px solid rgba(53, 197, 244, 0.28)'
                        }}
                      >
                        {Number(activeFarm.latitude).toFixed(4)}°N, {Number(activeFarm.longitude).toFixed(4)}°E
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--color-text-muted)',
                        marginTop: '2px'
                      }}
                    >
                      {activeFarm.village ? `${activeFarm.village}, ` : ''}
                      {activeFarm.block ? `${activeFarm.block}, ` : ''}
                      <strong style={{ color: '#E2E8F0' }}>{activeFarm.district}</strong> •{' '}
                      {activeFarm.agroClimaticZone} •{' '}
                      <span style={{ color: 'var(--color-lime-green)', fontWeight: 600 }}>
                        {formatArea(activeFarm)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
                  <div
                    className="flex items-center gap-1"
                    style={{
                      fontSize: '0.76rem',
                      background: 'rgba(6, 20, 38, 0.75)',
                      padding: '0.3rem 0.65rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(53, 197, 244, 0.2)'
                    }}
                  >
                    <Layers size={13} style={{ color: 'var(--color-bright-cyan)' }} />
                    <span style={{ color: 'var(--color-text-muted)' }}>{t('Soil:', 'মাটি:')}</span>
                    <strong style={{ color: '#F8FAFC' }}>{activeFarm.soilType}</strong>
                  </div>

                  <div
                    className="flex items-center gap-1"
                    style={{
                      fontSize: '0.76rem',
                      background: 'rgba(6, 20, 38, 0.75)',
                      padding: '0.3rem 0.65rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(53, 197, 244, 0.2)'
                    }}
                  >
                    <Sprout size={13} style={{ color: 'var(--color-lime-green)' }} />
                    <span style={{ color: 'var(--color-text-muted)' }}>{t('Current Crop:', 'বর্তমান ফসল:')}</span>
                    <strong style={{ color: 'var(--color-lime-green)' }}>{activeFarm.currentCrop}</strong>
                  </div>

                  <div
                    className="flex items-center gap-1"
                    style={{
                      fontSize: '0.76rem',
                      background: 'rgba(6, 20, 38, 0.75)',
                      padding: '0.3rem 0.65rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(53, 197, 244, 0.2)'
                    }}
                  >
                    <Droplets size={13} style={{ color: 'var(--color-bright-cyan)' }} />
                    <span style={{ color: '#E2E8F0' }}>{activeFarm.irrigationSource}</span>
                  </div>

                  <Link
                    to="/app/satellite"
                    className="btn btn-xs btn-outline"
                    style={{ fontSize: '0.72rem', padding: '0.28rem 0.6rem' }}
                  >
                    <Compass size={12} />
                    <span>{t('Satellite Map', 'উপগ্রহ ম্যাপ')}</span>
                  </Link>
                </div>
              </div>
            )}

            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
