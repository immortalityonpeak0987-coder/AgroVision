import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

const ROUTE_LABELS = {
  app: { en: 'Mission Portal', bn: 'মিশন পোর্টাল' },
  overview: { en: 'Farm Command Center', bn: 'কৃষি কমান্ড সেন্টার' },
  farms: { en: 'My Farm Plots', bn: 'আমার খামারসমূহ' },
  'register-farm': { en: 'Register New Farm', bn: 'নতুন খামার নিবন্ধন' },
  climate: { en: 'Climate Telemetry', bn: 'জলবায়ু টেলিমেট্রি' },
  satellite: { en: 'Satellite & GIS Monitoring', bn: 'উপগ্রহ ও জিআইএস পর্যবেক্ষণ' },
  risk: { en: 'Multi-Hazard & Salinity Risk', bn: 'ঝুঁকি ও লবণাক্ততা' },
  'crop-planner': { en: 'Crop Rotation Planner', bn: 'ফসল আবর্তন পরিকল্পক' },
  recovery: { en: 'Soil Recovery Tracker', bn: 'মাটি পুনরুদ্ধার ট্র্যাকার' },
  reports: { en: 'Farmer Advisory Dossiers', bn: 'কৃষক পরামর্শ প্রতিবেদন' },
  research: { en: 'NASA Data Provenance Lab', bn: 'নাসা গবেষণা ও তথ্যসূত্র' },
  settings: { en: 'System Settings', bn: 'সিস্টেম সেটিংস' }
};

export default function Breadcrumbs() {
  const location = useLocation();
  const { t } = useFarm();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="no-print"
      style={{
        padding: '0.6rem 0',
        marginBottom: '1.1rem',
        borderBottom: '1px solid rgba(53, 197, 244, 0.15)'
      }}
    >
      <div
        className="flex items-center gap-2"
        style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}
      >
        <Link
          to="/"
          className="flex items-center gap-1"
          style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}
        >
          <Home size={13} style={{ color: 'var(--color-bright-cyan)' }} />
          <span>{t('Home', 'হোম')}</span>
        </Link>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const entry = ROUTE_LABELS[value];
          const label = entry ? t(entry.en, entry.bn) : value.charAt(0).toUpperCase() + value.slice(1);

          return (
            <React.Fragment key={to}>
              <ChevronRight size={13} style={{ color: 'rgba(148, 163, 184, 0.5)' }} />
              {isLast ? (
                <span style={{ fontWeight: 700, color: 'var(--color-lime-green)' }}>{label}</span>
              ) : (
                <Link to={to} style={{ color: 'var(--color-text-muted)' }}>
                  {label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}
