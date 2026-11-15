import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFarm } from '../../context/FarmContext';
import { MapPin, Plus, CheckCircle, ArrowRight, Compass } from 'lucide-react';
import DemoBadge from '../../components/common/DemoBadge';
import AgroVisionGisMap from '../../components/map/AgroVisionGisMap';

export default function MyFarmsPage() {
  const { farms, activeFarm, switchFarm, formatArea, experienceMode, t } = useFarm();
  const navigate = useNavigate();
  const isFarmer = experienceMode === 'farmer';

  return (
    <div>
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: '1.35rem', flexWrap: 'wrap', gap: '1rem' }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', color: '#F8FAFC', marginBottom: '0.25rem' }}>
            {isFarmer
              ? t('Farm Location & Saved Plots', 'খামারের অবস্থান ও সংরক্ষিত জমি')
              : t('Farm & Member Management', 'খামার ও সদস্য ব্যবস্থাপনা')}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            {isFarmer
              ? 'View your farm location on the map, check district and village details, or add a new farm plot.'
              : 'Manage enrolled member plots across West Bengal agro-climatic zones and switch active evaluation targets.'}
          </p>
        </div>

        <Link to="/app/register-farm" className="btn btn-primary">
          <Plus size={18} />
          <span>{t('Add New Farm Location', 'নতুন খামার যোগ করুন')}</span>
        </Link>
      </div>

      {/* Interactive Multi-Plot Overview Map */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div className="card-header" style={{ marginBottom: '0.75rem' }}>
          <h3 className="card-title">
            <Compass size={18} style={{ color: 'var(--color-bright-cyan)' }} />
            <span>West Bengal Registered Plots GIS Distribution</span>
          </h3>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-lime-green)' }}>
            {farms.length} MONITORED PLOTS
          </span>
        </div>
        <AgroVisionGisMap
          farms={farms}
          activeFarm={activeFarm}
          onSelectFarm={switchFarm}
          height={340}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {farms.map((farm) => {
          const isActive = activeFarm && activeFarm.id === farm.id;
          const lat = farm.coordinates?.latitude ?? farm.latitude;
          const lng = farm.coordinates?.longitude ?? farm.longitude;

          return (
            <div
              key={farm.id}
              className="card"
              style={{
                border: isActive
                  ? '2px solid var(--color-lime-green)'
                  : '1px solid rgba(53, 197, 244, 0.22)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Status Badges */}
                <div className="flex items-center justify-between" style={{ marginBottom: '0.85rem' }}>
                  <DemoBadge
                    label={farm.id?.startsWith('farm-custom') ? 'REGISTERED PLOT' : 'PILOT STATION'}
                    isLive={farm.id?.startsWith('farm-custom')}
                  />
                  {isActive && (
                    <span className="badge badge-live">
                      <CheckCircle size={12} />
                      Active Target
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.22rem', color: '#F8FAFC', marginBottom: '0.35rem' }}>
                  {farm.name}
                </h3>

                <div
                  className="flex items-center gap-1"
                  style={{
                    fontSize: '0.84rem',
                    color: 'var(--color-bright-cyan)',
                    marginBottom: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  <MapPin size={14} />
                  <span>
                    {farm.village ? `${farm.village}, ` : ''}
                    {farm.district}, West Bengal
                  </span>
                </div>

                <div
                  style={{
                    background: 'rgba(6, 20, 38, 0.8)',
                    border: '1px solid rgba(53, 197, 244, 0.16)',
                    padding: '0.8rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                    fontSize: '0.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}
                >
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-text-muted)' }}>Plot Area:</span>
                    <strong style={{ color: 'var(--color-lime-green)' }}>{formatArea(farm)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-text-muted)' }}>Coordinates:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#E2E8F0' }}>
                      {Number(lat).toFixed(4)}°N, {Number(lng).toFixed(4)}°E
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-text-muted)' }}>Standing Crop:</span>
                    <strong style={{ color: '#F8FAFC' }}>
                      {farm.currentCrop || farm.mainCrop}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-text-muted)' }}>Agro-Climatic Zone:</span>
                    <span style={{ color: 'var(--color-bright-cyan)' }}>
                      {farm.agroClimaticZone || 'West Bengal Belt'}
                    </span>
                  </div>
                </div>

                {farm.description && (
                  <p
                    style={{
                      fontSize: '0.79rem',
                      color: 'var(--color-text-muted)',
                      lineHeight: 1.5,
                      marginBottom: '1rem'
                    }}
                  >
                    {farm.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div
                className="flex items-center gap-2"
                style={{
                  borderTop: '1px solid rgba(53, 197, 244, 0.16)',
                  paddingTop: '0.85rem'
                }}
              >
                {!isActive ? (
                  <button
                    onClick={() => switchFarm(farm.id)}
                    className="btn btn-sm btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Select as Active
                  </button>
                ) : (
                  <button
                    disabled
                    className="btn btn-sm btn-ghost"
                    style={{ flex: 1, color: 'var(--color-lime-green)', fontWeight: 700 }}
                  >
                    ✓ Active Target
                  </button>
                )}

                <button
                  onClick={() => {
                    switchFarm(farm.id);
                    navigate('/app/overview');
                  }}
                  className="btn btn-sm btn-primary"
                  title="Open Farm Command Center"
                >
                  <span>Command Center</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
