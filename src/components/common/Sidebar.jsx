import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useFarm } from '../../context/FarmContext';
import {
  LayoutDashboard,
  MapPin,
  PlusCircle,
  CloudSun,
  Satellite,
  AlertTriangle,
  Repeat,
  Activity,
  FileText,
  Microscope,
  Users,
  ClipboardCheck,
  Building2,
  X,
  Radio,
  Sprout
} from 'lucide-react';

// Experience A — Farmer Mode (6 focused, simple items)
const FARMER_NAV_ITEMS = [
  {
    path: '/app/overview',
    labelEn: '1. My Farm',
    labelBn: '১. আমার খামার',
    subEn: 'Crop, weather & next steps',
    icon: Sprout
  },
  {
    path: '/app/farms',
    labelEn: '2. Farm Location',
    labelBn: '২. খামারের অবস্থান',
    subEn: 'Map pin & plot details',
    icon: MapPin
  },
  {
    path: '/app/climate',
    labelEn: '3. Weather & Alerts',
    labelBn: '৩. আবহাওয়া ও সতর্কবার্তা',
    subEn: 'Rain, heat & waterlogging',
    icon: CloudSun
  },
  {
    path: '/app/crop-planner',
    labelEn: '4. Crop Planner',
    labelBn: '৪. ফসল পরিকল্পনা',
    subEn: 'What to grow next season',
    icon: Repeat
  },
  {
    path: '/app/recovery',
    labelEn: '5. My Farm Recovery',
    labelBn: '৫. খামার পুনরুদ্ধার',
    subEn: 'Checklist & field notes',
    icon: Activity
  },
  {
    path: '/app/reports',
    labelEn: '6. Reports / Help',
    labelBn: '৬. প্রতিবেদন ও সহায়তা',
    subEn: 'Print summary & guidance',
    icon: FileText
  }
];

// Experience B — Institutional & Field Teams Workspace (9 comprehensive items)
const INSTITUTIONAL_NAV_ITEMS = [
  {
    path: '/app/institutional',
    labelEn: '1. Organization Overview',
    labelBn: '১. প্রাতিষ্ঠানিক সারসংক্ষেপ',
    icon: Building2,
    badge: 'ORG'
  },
  {
    path: '/app/farms',
    labelEn: '2. Farm & Member Management',
    labelBn: '২. খামার ও সদস্য ব্যবস্থাপনা',
    icon: Users
  },
  {
    path: '/app/gis-explorer',
    labelEn: '3. GIS Farm Explorer',
    labelBn: '৩. জিআইএস ফার্ম এক্সপ্লোরার',
    icon: MapPin,
    badge: 'GIS'
  },
  {
    path: '/app/satellite',
    labelEn: '4. Climate & Satellite Monitoring',
    labelBn: '৪. জলবায়ু ও উপগ্রহ পর্যবেক্ষণ',
    icon: Satellite
  },
  {
    path: '/app/risk',
    labelEn: '5. Risk Monitoring',
    labelBn: '৫. ঝুঁকি পর্যবেক্ষণ',
    icon: AlertTriangle
  },
  {
    path: '/app/crop-planner',
    labelEn: '6. Crop Planning',
    labelBn: '৬. ফসল পরিকল্পনা',
    icon: Repeat
  },
  {
    path: '/app/recovery',
    labelEn: '7. Recovery Monitoring',
    labelBn: '৭. পুনরুদ্ধার পর্যবেক্ষণ',
    icon: Activity
  },
  {
    path: '/app/field-visits',
    labelEn: '8. Field Visits & Observations',
    labelBn: '৮. মাঠ পরিদর্শন ও পর্যবেক্ষণ',
    icon: ClipboardCheck
  },
  {
    path: '/app/reports',
    labelEn: '9. Reports & Analytics',
    labelBn: '৯. প্রতিবেদন ও বিশ্লেষণ',
    icon: FileText
  }
];

export default function Sidebar({ isOpen, onClose }) {
  const {
    t,
    activeFarm,
    experienceMode,
    setExperienceMode,
    institutionalRole,
    setInstitutionalRole
  } = useFarm();
  const navigate = useNavigate();

  const isFarmer = experienceMode === 'farmer';
  const navItems = isFarmer ? FARMER_NAV_ITEMS : INSTITUTIONAL_NAV_ITEMS;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="no-print"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(4, 12, 24, 0.72)',
            zIndex: 90,
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          background: 'linear-gradient(180deg, rgba(8, 22, 42, 0.98) 0%, rgba(5, 16, 32, 0.99) 100%)',
          color: 'var(--color-white)',
          borderRight: '1px solid rgba(53, 197, 244, 0.16)',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - var(--navbar-height))',
          position: 'sticky',
          top: 'var(--navbar-height)',
          zIndex: 95,
          transition: 'transform var(--transition-normal)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'
        }}
        className="sidebar-responsive no-print"
      >
        {/* Mode Switcher Header inside Sidebar */}
        <div
          style={{
            padding: '0.85rem 0.85rem 0.7rem',
            borderBottom: '1px solid rgba(53, 197, 244, 0.14)'
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: '0.55rem' }}>
            <div className="flex items-center gap-2">
              <Radio size={14} style={{ color: 'var(--color-lime-green)' }} />
              <span
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: 'var(--color-bright-cyan)',
                  letterSpacing: '0.06em'
                }}
              >
                {isFarmer
                  ? t('FARMER WORKSPACE', 'কৃষক মোড')
                  : t('INSTITUTIONAL WORKSPACE', 'প্রাতিষ্ঠানিক মোড')}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{ color: 'var(--color-text-muted)' }}
              className="close-btn"
              aria-label="Close Sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* 2-Button Experience Toggle */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.35rem',
              background: 'rgba(4, 12, 24, 0.9)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(53, 197, 244, 0.2)'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setExperienceMode('farmer');
                navigate('/app/overview');
              }}
              style={{
                padding: '0.38rem 0.4rem',
                borderRadius: '6px',
                fontSize: '0.73rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: isFarmer
                  ? 'linear-gradient(135deg, #38A832 0%, #168BCE 100%)'
                  : 'transparent',
                color: isFarmer ? '#FFFFFF' : 'var(--color-text-muted)',
                border: 'none'
              }}
            >
              {t('Farmer Mode', 'কৃষক মোড')}
            </button>
            <button
              type="button"
              onClick={() => {
                setExperienceMode('institutional');
                navigate('/app/institutional');
              }}
              style={{
                padding: '0.38rem 0.35rem',
                borderRadius: '6px',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: !isFarmer
                  ? 'linear-gradient(135deg, #168BCE 0%, #35C5F4 100%)'
                  : 'transparent',
                color: !isFarmer ? '#04101E' : 'var(--color-text-muted)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem'
              }}
            >
              <span>{t('Institutional', 'প্রতিষ্ঠান')}</span>
              <span
                style={{
                  fontSize: '0.55rem',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  background: 'rgba(245, 158, 11, 0.22)',
                  color: '#FBBF24',
                  border: '1px solid rgba(245, 158, 11, 0.45)',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                SOON
              </span>
            </button>
          </div>

          {/* Institutional Role Selector when in Institutional Mode */}
          {!isFarmer && (
            <div style={{ marginTop: '0.55rem' }}>
              <label
                htmlFor="sidebar-role-select"
                style={{
                  display: 'block',
                  fontSize: '0.66rem',
                  color: 'var(--color-text-muted)',
                  marginBottom: '0.2rem'
                }}
              >
                Active Institutional Role:
              </label>
              <select
                id="sidebar-role-select"
                value={institutionalRole}
                onChange={(e) => setInstitutionalRole(e.target.value)}
                style={{
                  width: '100%',
                  background: '#061426',
                  color: 'var(--color-lime-green)',
                  border: '1px solid rgba(181, 230, 29, 0.35)',
                  borderRadius: '6px',
                  padding: '0.3rem 0.45rem',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <option value="fpo">FPO / Farmer Cooperative</option>
                <option value="officer">Field Extension Officer</option>
                <option value="ngo">NGO / Resilience Program</option>
              </select>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.65rem 0.6rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                style={{ padding: isFarmer ? '0.68rem 0.85rem' : '0.58rem 0.85rem' }}
              >
                <Icon size={17} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, lineHeight: 1.25 }}>
                  <div>{t(item.labelEn, item.labelBn)}</div>
                  {item.subEn && (
                    <div
                      style={{
                        fontSize: '0.67rem',
                        color: 'var(--color-text-muted)',
                        fontWeight: 400,
                        marginTop: '2px'
                      }}
                    >
                      {item.subEn}
                    </div>
                  )}
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '0.1rem 0.35rem',
                      borderRadius: '4px',
                      background: 'rgba(181, 230, 29, 0.16)',
                      color: 'var(--color-lime-green)',
                      border: '1px solid rgba(181, 230, 29, 0.35)',
                      fontWeight: 700
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Quick Add Plot & Satellite Map shortcuts in Farmer mode */}
          <div
            style={{
              marginTop: '0.65rem',
              paddingTop: '0.65rem',
              borderTop: '1px dashed rgba(53, 197, 244, 0.16)'
            }}
          >
            <NavLink
              to="/app/register-farm"
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              style={{ fontSize: '0.8rem' }}
            >
              <PlusCircle size={16} style={{ color: 'var(--color-lime-green)' }} />
              <span>{t('+ Add New Farm Plot', '+ নতুন খামার যোগ করুন')}</span>
            </NavLink>

            {isFarmer && (
              <>
                <NavLink
                  to="/app/satellite"
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  style={{ fontSize: '0.8rem' }}
                >
                  <Satellite size={16} style={{ color: 'var(--color-bright-cyan)' }} />
                  <span>{t('Satellite Crop Map', 'উপগ্রহ ফসলের ম্যাপ')}</span>
                </NavLink>
                <NavLink
                  to="/app/risk"
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  style={{ fontSize: '0.8rem' }}
                >
                  <AlertTriangle size={16} style={{ color: '#FBBF24' }} />
                  <span>{t('Soil Test & Risk Check', 'মাটি পরীক্ষা ও ঝুঁকি')}</span>
                </NavLink>
              </>
            )}

            <NavLink
              to="/app/research"
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              style={{ fontSize: '0.78rem' }}
            >
              <Microscope size={15} style={{ color: 'var(--color-text-muted)' }} />
              <span>{t('Data Sources & Science', 'তথ্যসূত্র ও বিজ্ঞান')}</span>
            </NavLink>
          </div>
        </div>

        {/* Active Farm Footer */}
        <div
          style={{
            padding: '0.85rem 1rem',
            background: 'rgba(4, 13, 26, 0.9)',
            borderTop: '1px solid rgba(53, 197, 244, 0.16)',
            fontSize: '0.74rem',
            color: 'var(--color-text-muted)'
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: '0.2rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.67rem', color: 'var(--color-bright-cyan)' }}>
              {isFarmer ? t('MY ACTIVE PLOT', 'সক্রিয় খামার') : t('WEST BENGAL NETWORK', 'পশ্চিমবঙ্গ নেটওয়ার্ক')}
            </span>
            <span style={{ color: 'var(--color-lime-green)', fontFamily: 'var(--font-mono)', fontSize: '0.66rem' }}>
              ● ONLINE
            </span>
          </div>
          {activeFarm && (
            <div style={{ fontSize: '0.73rem', color: '#E2E8F0', fontWeight: 600 }}>
              {activeFarm.district} • {Number(activeFarm.latitude).toFixed(2)}°N, {Number(activeFarm.longitude).toFixed(2)}°E
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
