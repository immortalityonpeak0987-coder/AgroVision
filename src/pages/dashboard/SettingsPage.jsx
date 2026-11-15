import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { User, Globe, Scale, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const {
    activeFarm,
    unitPreference,
    setUnitPreference,
    language,
    setLanguage,
    t
  } = useFarm();

  const [farmerProfile, setFarmerProfile] = useState({
    name: activeFarm?.farmerName || 'Subhasish Mondal',
    phone: '+91 98321 00000',
    village: activeFarm?.village || 'Bagila',
    district: activeFarm?.district || 'Purba Bardhaman'
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetData = () => {
    localStorage.removeItem('agrovision_registered_farms_v1');
    localStorage.removeItem('agrovision_active_farm_id_v1');
    window.location.reload();
  };

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.35rem' }}>
        <h1 style={{ fontSize: '1.85rem', color: '#F8FAFC', marginBottom: '0.25rem' }}>
          {t('System Settings & Regional Preferences', 'সিস্টেম সেটিংস ও আঞ্চলিক পছন্দসমূহ')}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Configure land area units (`Bigha`, `Acre`, `Hectare`), bilingual interface mode (`English` / `বাংলা`), and operator profile.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* 1. Measurement Units Preference */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Scale size={20} style={{ color: 'var(--color-lime-green)' }} />
              <span>{t('Farm Area Unit Preference', 'জমির পরিমাপ একক')}</span>
            </h3>
            <span className="badge badge-satellite">LIVE UNIT CONVERSION</span>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Select the primary land measurement unit displayed across the Navbar, Command Center, and Printable Advisory Dossiers.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1rem'
            }}
          >
            {[
              {
                id: 'Bigha',
                label: 'Bigha (বিঘা)',
                desc: 'West Bengal Standard (1 Bigha ≈ 0.3306 Acre / 1,338 m²)'
              },
              {
                id: 'Acre',
                label: 'Acre (একর)',
                desc: 'National Standard (1 Acre ≈ 3.025 Bigha)'
              },
              {
                id: 'Hectare',
                label: 'Hectare (হেক্টর)',
                desc: 'Scientific Metric Standard (1 Hectare ≈ 7.475 Bigha)'
              }
            ].map((unit) => {
              const selected = unitPreference === unit.id;
              return (
                <label
                  key={unit.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: selected
                      ? '2px solid var(--color-lime-green)'
                      : '1px solid rgba(53, 197, 244, 0.2)',
                    background: selected
                      ? 'rgba(56, 168, 50, 0.14)'
                      : 'rgba(6, 20, 38, 0.8)',
                    cursor: 'pointer'
                  }}
                >
                  <div
                    className="flex items-center justify-between"
                    style={{ marginBottom: '0.35rem' }}
                  >
                    <strong style={{ color: '#F8FAFC', fontSize: '0.95rem' }}>
                      {unit.label}
                    </strong>
                    <input
                      type="radio"
                      name="unitPref"
                      checked={selected}
                      onChange={() => setUnitPreference(unit.id)}
                      style={{ accentColor: 'var(--color-lime-green)' }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                      lineHeight: 1.45
                    }}
                  >
                    {unit.desc}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 2. Language Selection */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Globe size={20} style={{ color: 'var(--color-bright-cyan)' }} />
              <span>{t('Bilingual Interface Mode', 'দ্বিভাষিক ইন্টারফেস মোড')}</span>
            </h3>
            <span className="badge badge-live">EN / বাংলা ACTIVE</span>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Switch between English and Bengali (`বাংলা`) navigation and headers at any time.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem'
            }}
          >
            <button
              type="button"
              onClick={() => setLanguage('en')}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border:
                  language === 'en'
                    ? '2px solid var(--color-bright-cyan)'
                    : '1px solid rgba(53, 197, 244, 0.2)',
                background:
                  language === 'en'
                    ? 'rgba(22, 139, 206, 0.16)'
                    : 'rgba(6, 20, 38, 0.8)',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: '0.35rem' }}>
                <strong style={{ color: '#F8FAFC' }}>English (Default)</strong>
                {language === 'en' && <span className="badge badge-live">Active</span>}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Clear agronomic & Earth observation terminology in English.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setLanguage('bn')}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border:
                  language === 'bn'
                    ? '2px solid var(--color-lime-green)'
                    : '1px solid rgba(53, 197, 244, 0.2)',
                background:
                  language === 'bn'
                    ? 'rgba(56, 168, 50, 0.16)'
                    : 'rgba(6, 20, 38, 0.8)',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: '0.35rem' }}>
                <strong style={{ color: '#F8FAFC' }}>বাংলা (Bengali)</strong>
                {language === 'bn' && <span className="badge badge-live">সক্রিয়</span>}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                পশ্চিমবঙ্গের কৃষকদের জন্য বাংলা নেভিগেশন ও শিরোনাম।
              </span>
            </button>
          </div>
        </div>

        {/* 3. Farmer Profile Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <User size={20} style={{ color: 'var(--color-bright-cyan)' }} />
              <span>Farmer Contact & Village Record</span>
            </h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
              Operator Identity
            </span>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}
            >
              <div className="form-group">
                <label className="form-label" htmlFor="prof-name">
                  Farmer / Operator Name
                </label>
                <input
                  id="prof-name"
                  type="text"
                  className="form-input"
                  value={farmerProfile.name}
                  onChange={(e) => setFarmerProfile({ ...farmerProfile, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-phone">
                  Contact Phone (Optional)
                </label>
                <input
                  id="prof-phone"
                  type="tel"
                  className="form-input"
                  value={farmerProfile.phone}
                  onChange={(e) => setFarmerProfile({ ...farmerProfile, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-village">
                  Village
                </label>
                <input
                  id="prof-village"
                  type="text"
                  className="form-input"
                  value={farmerProfile.village}
                  onChange={(e) => setFarmerProfile({ ...farmerProfile, village: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">District in West Bengal</label>
                <input
                  type="text"
                  className="form-input"
                  value={farmerProfile.district}
                  disabled
                  style={{ opacity: 0.7 }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button type="submit" className="btn btn-sm btn-primary">
                Save Operator Profile
              </button>
              {saveSuccess && (
                <span
                  style={{
                    color: 'var(--color-lime-green)',
                    fontWeight: 700,
                    fontSize: '0.84rem'
                  }}
                >
                  ✓ Profile settings saved!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* 4. Data Management & Reset (No window.confirm per iframe rules) */}
        <div className="card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
          <div
            className="flex items-center justify-between"
            style={{ flexWrap: 'wrap', gap: '1rem' }}
          >
            <div>
              <strong style={{ color: '#F8FAFC', fontSize: '0.95rem' }}>
                Local State & Cache Reset
              </strong>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                Restore default West Bengal pilot stations (Nadia, South 24 Parganas, Bankura).
              </p>
            </div>
            {!resetConfirmOpen ? (
              <button
                type="button"
                onClick={() => setResetConfirmOpen(true)}
                className="btn btn-sm btn-danger"
              >
                <Trash2 size={14} />
                <span>Reset Local Cache</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetData}
                  className="btn btn-sm btn-danger"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setResetConfirmOpen(false)}
                  className="btn btn-sm btn-secondary"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
