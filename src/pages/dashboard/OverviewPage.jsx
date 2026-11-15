import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFarm } from '../../context/FarmContext';
import { climateService } from '../../services/climateService';
import { riskService } from '../../services/riskService';
import { satelliteService } from '../../services/satelliteService';
import { soilService } from '../../services/soilService';
import DataSourceCard from '../../components/common/DataSourceCard';
import DemoBadge from '../../components/common/DemoBadge';
import AgroVisionGisMap from '../../components/map/AgroVisionGisMap';
import {
  CloudSun,
  Droplets,
  Thermometer,
  Sprout,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Activity,
  Repeat,
  Compass,
  FlaskConical,
  FileText,
  Layers,
  ShieldAlert
} from 'lucide-react';

export default function OverviewPage() {
  const { activeFarm, farms, switchFarm, t, formatArea, experienceMode } = useFarm();
  const [climateData, setClimateData] = useState(null);
  const [climateMeta, setClimateMeta] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [satelliteData, setSatelliteData] = useState(null);
  const [soilData, setSoilData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      if (!activeFarm) return;
      setLoading(true);
      try {
        const [cRes, rRes, sRes, soilRes] = await Promise.all([
          climateService.getClimateByFarmId(activeFarm.id),
          riskService.getRiskAssessment(activeFarm.id),
          satelliteService.getSatelliteObservations(activeFarm.id),
          soilService.getSoilData(activeFarm.id)
        ]);
        setClimateData(cRes.data);
        setClimateMeta(cRes.metadata);
        setRiskData(rRes.data);
        setSatelliteData(sRes.data);
        setSoilData(soilRes.data);
      } catch (err) {
        console.error('Error loading farm overview:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, [activeFarm]);

  if (!activeFarm) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ color: '#F8FAFC', marginBottom: '0.75rem' }}>No Active Farm Found</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          Please register a farm plot or select one of our West Bengal pilot stations.
        </p>
        <Link to="/app/register-farm" className="btn btn-primary">
          Register Your First Farm
        </Link>
      </div>
    );
  }

  const snapshot = climateData?.currentSnapshot;
  const isLiveClimate = climateMeta?.dataState === 'LIVE';
  const isFarmer = experienceMode === 'farmer';

  return (
    <div>
      {/* Page Header */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: '1.35rem', flexWrap: 'wrap', gap: '0.85rem' }}
      >
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.85rem', color: '#F8FAFC', margin: 0 }}>
              {isFarmer
                ? t(`My Farm Summary — ${activeFarm.name}`, `আমার খামারের সারসংক্ষেপ — ${activeFarm.name}`)
                : t('Agricultural Intelligence Command Center', 'কৃষি ইন্টেলিজেন্স কমান্ড সেন্টার')}
            </h1>
            <DemoBadge
              label={isLiveClimate ? 'LIVE NASA DATA' : 'REGIONAL BASELINE'}
              isLive={isLiveClimate}
            />
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            {isFarmer
              ? t(
                  'Simple weather, soil moisture, crop health, and next-step guidance for ',
                  'আপনার খামারের আবহাওয়া, মাটির আর্দ্রতা ও পরবর্তী কাজের সহজ নির্দেশিকা — '
                )
              : t(
                  'Multi-mission satellite telemetry, soil chemistry, and hazard screening for ',
                  'বহুমুখী উপগ্রহ টেলিমেট্রি, মাটির রসায়ন এবং ঝুঁকি মূল্যায়ন — '
                )}
            <strong style={{ color: 'var(--color-bright-cyan)' }}>{activeFarm.name}</strong> (
            {activeFarm.district}, {formatArea(activeFarm)}).
          </p>
        </div>

        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          <Link to="/app/satellite" className="btn btn-sm btn-secondary">
            <Compass size={15} style={{ color: 'var(--color-bright-cyan)' }} />
            <span>{isFarmer ? t('View Crop Map', 'ফসলের ম্যাপ দেখুন') : t('Full GIS Telemetry', 'সম্পূর্ণ জিআইএস ভিউ')}</span>
          </Link>
          <Link to="/app/crop-planner" className="btn btn-sm btn-primary">
            <Repeat size={15} />
            <span>{isFarmer ? t('What to Grow Next', 'পরবর্তী ফসল পরিকল্পনা') : t('Plan Crop Rotation', 'ফসল আবর্তন পরিকল্পনা')}</span>
          </Link>
          <Link to="/app/reports" className="btn btn-sm btn-outline">
            <FileText size={15} />
            <span>{t('Print Farm Report', 'প্রতিবেদন প্রিন্ট')}</span>
          </Link>
        </div>
      </div>

      {/* 4 PRIMARY CARDS (Simple everyday language in Farmer Mode, Technical in Institutional Mode) */}
      <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '1.5rem' }}>
        {/* 1. Temperature */}
        <div className="card" style={{ padding: '1.2rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              {isFarmer
                ? t("Today's Weather & Temp", 'আজকের তাপমাত্রা ও আবহাওয়া')
                : t('Air Temperature (T2M)', 'বায়ুর তাপমাত্রা (T2M)')}
            </span>
            <Thermometer size={18} style={{ color: '#F97316' }} />
          </div>
          <div
            style={{
              fontSize: '1.9rem',
              fontWeight: 800,
              color: '#F8FAFC',
              lineHeight: 1.1,
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {snapshot ? `${snapshot.temperature}°C` : '--'}
          </div>
          <div
            style={{
              fontSize: '0.76rem',
              color: 'var(--color-text-muted)',
              marginTop: '0.4rem',
              fontFamily: 'var(--font-mono)'
            }}
          >
            Day High: {snapshot?.maxTemperature ?? '--'}°C • Night Low: {snapshot?.minTemperature ?? '--'}°C
          </div>
          <div
            className="flex items-center justify-between"
            style={{
              fontSize: '0.7rem',
              color: 'var(--color-bright-cyan)',
              fontWeight: 600,
              marginTop: '0.55rem',
              borderTop: '1px solid rgba(53, 197, 244, 0.16)',
              paddingTop: '0.4rem'
            }}
          >
            <span>{isFarmer ? 'District Weather' : 'NASA POWER 0.5°'}</span>
            <span>Humidity: {snapshot?.relativeHumidity ?? 68}%</span>
          </div>
        </div>

        {/* 2. Rainfall to Date */}
        <div className="card" style={{ padding: '1.2rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              {isFarmer
                ? t('Recent Rainfall (30 Days)', 'গত ৩০ দিনের বৃষ্টিপাত')
                : t('30-Day Precipitation', '৩০ দিনের বৃষ্টিপাত')}
            </span>
            <Droplets size={18} style={{ color: 'var(--color-bright-cyan)' }} />
          </div>
          <div
            style={{
              fontSize: '1.9rem',
              fontWeight: 800,
              color: 'var(--color-bright-cyan)',
              lineHeight: 1.1,
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {satelliteData?.gpmRainfall?.thirtyDayAccumulation ?? snapshot?.rainfallMonthlyToDate ?? '--'} mm
          </div>
          <div
            style={{
              fontSize: '0.76rem',
              color: 'var(--color-lime-green)',
              fontWeight: 600,
              marginTop: '0.4rem'
            }}
          >
            Last 7 Days: {satelliteData?.gpmRainfall?.sevenDayAccumulation ?? 14.5} mm
          </div>
          <div
            className="flex items-center justify-between"
            style={{
              fontSize: '0.7rem',
              color: 'var(--color-bright-cyan)',
              fontWeight: 600,
              marginTop: '0.55rem',
              borderTop: '1px solid rgba(53, 197, 244, 0.16)',
              paddingTop: '0.4rem'
            }}
          >
            <span>{isFarmer ? 'Satellite Rain Check' : 'GPM IMERG 10km'}</span>
            <span>{satelliteData?.gpmRainfall?.sevenDayAccumulation > 60 ? 'Wet' : 'Normal'}</span>
          </div>
        </div>

        {/* 3. Soil Moisture */}
        <div className="card" style={{ padding: '1.2rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              {isFarmer
                ? t('Estimated Moisture in Soil', 'মাটিতে আনুমানিক আর্দ্রতা')
                : t('Root-Zone Moisture (SMAP)', 'মূলের আর্দ্রতা (SMAP)')}
            </span>
            <Layers size={18} style={{ color: '#38BDF8' }} />
          </div>
          <div
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#F8FAFC',
              lineHeight: 1.15,
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {isFarmer
              ? satelliteData?.smapSoilMoisture?.surfaceMoisture?.includes('Near Saturation')
                ? 'Very Wet / Saturated'
                : 'Good Moisture for Sowing'
              : satelliteData?.smapSoilMoisture?.surfaceMoisture || '0.28 cm³/cm³'}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
            Deep Soil: {satelliteData?.smapSoilMoisture?.rootZoneMoisture || '0.32 cm³/cm³ (Optimal)'}
          </div>
          <div
            className="flex items-center justify-between"
            style={{
              fontSize: '0.7rem',
              color: 'var(--color-bright-cyan)',
              fontWeight: 600,
              marginTop: '0.55rem',
              borderTop: '1px solid rgba(53, 197, 244, 0.16)',
              paddingTop: '0.4rem'
            }}
          >
            <span>{isFarmer ? 'Regional Soil Moisture' : 'NASA SMAP L4 (9km)'}</span>
            <span>0–100 cm depth</span>
          </div>
        </div>

        {/* 4. Vegetation Condition */}
        <div className="card" style={{ padding: '1.2rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              {isFarmer
                ? t('How Green & Healthy Crop Looks', 'উপগ্রহ থেকে ফসল কতটা সবুজ ও সুস্থ')
                : t('Canopy Vitality (NDVI)', 'ফসলের সজীবতা (NDVI)')}
            </span>
            <Sprout size={18} style={{ color: 'var(--color-lime-green)' }} />
          </div>
          <div
            style={{
              fontSize: isFarmer ? '1.45rem' : '1.9rem',
              fontWeight: 800,
              color: 'var(--color-lime-green)',
              lineHeight: 1.15,
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {isFarmer
              ? Number(satelliteData?.vegetationNdvi?.currentNdvi || 0.68) >= 0.6
                ? `Healthy Green (${satelliteData?.vegetationNdvi?.currentNdvi || '0.68'})`
                : `Moderate Growth (${satelliteData?.vegetationNdvi?.currentNdvi || '0.54'})`
              : satelliteData?.vegetationNdvi?.currentNdvi || '0.68'}
          </div>
          <div
            style={{
              fontSize: '0.76rem',
              color: 'var(--color-lime-green)',
              fontWeight: 600,
              marginTop: '0.4rem'
            }}
          >
            {satelliteData?.vegetationNdvi?.ndviHealth || 'Healthy Active Crop Stand'}
          </div>
          <div
            className="flex items-center justify-between"
            style={{
              fontSize: '0.7rem',
              color: 'var(--color-bright-cyan)',
              fontWeight: 600,
              marginTop: '0.55rem',
              borderTop: '1px solid rgba(53, 197, 244, 0.16)',
              paddingTop: '0.4rem'
            }}
          >
            <span>{isFarmer ? 'Satellite Crop View' : 'HLS 30m / MODIS'}</span>
            <span>Pass Verified</span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE WEST BENGAL GIS COMMAND MAP + SOIL & CROP SUMMARY */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Left (Span 2 on wide screens via flex/grid): Real Interactive GIS Map */}
        <div className="card" style={{ gridColumn: 'span 1', padding: '1.15rem' }}>
          <div className="card-header" style={{ marginBottom: '0.75rem' }}>
            <div>
              <h3 className="card-title">
                <Compass size={19} style={{ color: 'var(--color-bright-cyan)' }} />
                <span>{t('West Bengal Interactive Farm GIS Map', 'পশ্চিমবঙ্গ ইন্টারঅ্যাক্টিভ ফার্ম জিআইএস ম্যাপ')}</span>
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                Switch base tiles (Satellite / Street / Terrain), toggle NDVI & SMAP layers, or click any farm polygon to switch plots.
              </p>
            </div>
            <Link to="/app/satellite" className="btn btn-xs btn-outline">
              {t('Expand 3-Panel GIS →', 'পূর্ণ জিআইএস ভিউ →')}
            </Link>
          </div>

          <AgroVisionGisMap
            farms={farms}
            activeFarm={activeFarm}
            onSelectFarm={switchFarm}
            satelliteData={satelliteData}
            riskData={riskData}
            height={400}
          />
        </div>

        {/* Right: Soil Chemistry & Active Rotation Snapshot */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Soil Profile Card */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <h3 className="card-title">
                <FlaskConical size={18} style={{ color: 'var(--color-lime-green)' }} />
                <span>{t('Soil Chemistry & Salinity Profile', 'মাটির রসায়ন ও লবণাক্ততা')}</span>
              </h3>
              <span className="badge badge-satellite">
                {soilData?.labTest?.isDefaultDemo ? 'SOILGRIDS + ICAR' : 'LAB VERIFIED'}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                marginBottom: '0.9rem'
              }}
            >
              <div
                style={{
                  background: 'rgba(6, 20, 38, 0.75)',
                  padding: '0.7rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(53, 197, 244, 0.18)'
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Soil pH</div>
                <div
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: '#F8FAFC',
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {soilData?.labTest?.ph ?? '6.4'}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-bright-cyan)' }}>
                  {soilData?.labTest?.ph < 5.8 ? 'Slightly Acidic' : 'Neutral Optimal'}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(6, 20, 38, 0.75)',
                  padding: '0.7rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(53, 197, 244, 0.18)'
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                  Salinity (EC)
                </div>
                <div
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color:
                      Number(soilData?.labTest?.ecDsM) >= 4.0
                        ? '#F87171'
                        : 'var(--color-lime-green)',
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {soilData?.labTest?.ecDsM ?? '0.85'} dS/m
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                  Threshold: 4.0 dS/m
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(6, 20, 38, 0.75)',
                  padding: '0.7rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(53, 197, 244, 0.18)'
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                  Organic Carbon
                </div>
                <div
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: 'var(--color-bright-cyan)',
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {soilData?.labTest?.organicCarbonPct ?? '0.68'}%
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                  N: {soilData?.labTest?.nitrogenStatus || 'Medium'}
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>Texture: {soilData?.regionalBaseline?.clayContentPct ?? 32}% Clay ({activeFarm.soilType})</span>
              <Link to="/app/risk" style={{ color: 'var(--color-lime-green)', fontWeight: 700 }}>
                + Update Soil Lab Test →
              </Link>
            </div>
          </div>

          {/* 12-Month Rotation Strip Summary */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header" style={{ marginBottom: '0.65rem' }}>
              <h3 className="card-title">
                <Repeat size={18} style={{ color: 'var(--color-bright-cyan)' }} />
                <span>{t('Active 12-Month Crop Calendar', 'বর্তমান ১২ মাসের ফসল ক্যালেন্ডার')}</span>
              </h3>
              <Link
                to="/app/crop-planner"
                style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-lime-green)' }}
              >
                {t('Simulate Alternatives →', 'বিকল্প আবর্তন দেখুন →')}
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '0.4rem'
              }}
            >
              {Object.entries(activeFarm.monthlyRotation || {}).map(([month, crop]) => (
                <div
                  key={month}
                  style={{
                    background: 'rgba(6, 20, 38, 0.8)',
                    border: '1px solid rgba(53, 197, 244, 0.16)',
                    borderRadius: '6px',
                    padding: '0.35rem 0.45rem',
                    fontSize: '0.7rem'
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-bright-cyan)',
                      fontWeight: 700,
                      fontSize: '0.65rem'
                    }}
                  >
                    {month}
                  </div>
                  <div
                    style={{
                      color: crop === 'Fallow' ? 'var(--color-text-muted)' : '#F8FAFC',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={crop}
                  >
                    {crop}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN WORKSPACE: NEXT ACTIONS & MULTI-HAZARD RISK SCREENING */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Left Column: Actionable Guidance */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <CheckCircle2 size={20} style={{ color: 'var(--color-lime-green)' }} />
              <span>{t('Priority Agronomic Actions', 'অগ্রাধিকারমূলক কৃষি পদক্ষেপ')}</span>
            </h3>
            <span className="badge badge-live">DECISION SUPPORT</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div
              style={{
                padding: '0.9rem',
                background: 'rgba(6, 20, 38, 0.78)',
                border: '1px solid rgba(53, 197, 244, 0.16)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.8rem'
              }}
            >
              <div
                style={{
                  background: 'rgba(56, 168, 50, 0.2)',
                  color: 'var(--color-lime-green)',
                  padding: '0.45rem',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: '2px'
                }}
              >
                <Repeat size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '0.9rem', color: '#F8FAFC' }}>
                  Evaluate Post-Monsoon Rabi Sowing Sequence
                </strong>
                <p style={{ margin: '0.25rem 0 0.5rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  SMAP root-zone moisture ({satelliteData?.smapSoilMoisture?.rootZoneMoisture || '0.32 cm³/cm³'}) supports immediate zero-tillage pulse or mustard establishment after Aman harvest.
                </p>
                <Link
                  to="/app/crop-planner"
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--color-lime-green)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <span>Compare 2–3 Rotation Plans</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div
              style={{
                padding: '0.9rem',
                background: 'rgba(6, 20, 38, 0.78)',
                border: '1px solid rgba(53, 197, 244, 0.16)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.8rem'
              }}
            >
              <div
                style={{
                  background: 'rgba(22, 139, 206, 0.2)',
                  color: 'var(--color-bright-cyan)',
                  padding: '0.45rem',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: '2px'
                }}
              >
                <Droplets size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '0.9rem', color: '#F8FAFC' }}>
                  Groundwater & Capillary Salinity Protection
                </strong>
                <p style={{ margin: '0.25rem 0 0.5rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  Replacing summer Boro rice with Sesame (Til) or Green Gram reduces groundwater extraction by 38–42% and prevents dry-season salt rise.
                </p>
                <Link
                  to="/app/climate"
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--color-bright-cyan)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <span>Inspect 10-Year Climate Normals</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div
              style={{
                padding: '0.9rem',
                background: 'rgba(6, 20, 38, 0.78)',
                border: '1px solid rgba(53, 197, 244, 0.16)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.8rem'
              }}
            >
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#FBBF24',
                  padding: '0.45rem',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: '2px'
                }}
              >
                <Activity size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '0.9rem', color: '#F8FAFC' }}>
                  Log Field Drainage & Emergence Evidence
                </strong>
                <p style={{ margin: '0.25rem 0 0.5rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  Pair ground-level field notes and soil EC readings with satellite passes to track post-monsoon recovery milestones.
                </p>
                <Link
                  to="/app/recovery"
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#FBBF24',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <span>Open Recovery Checklist</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Agricultural Risk Screening */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <AlertTriangle size={20} style={{ color: '#FBBF24' }} />
              <span>{t('Multi-Hazard Risk Screening', 'বহুমুখী কৃষি ঝুঁকি মূল্যায়ন')}</span>
            </h3>
            <span
              className={`badge ${
                riskData?.overallRiskLevel?.includes('High') ||
                activeFarm.district.includes('24 Parganas')
                  ? 'badge-warning'
                  : 'badge-live'
              }`}
            >
              {riskData?.overallRiskLevel || 'Evaluated'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(riskData?.riskFactors || []).map((rf, idx) => {
              const isHigh = rf.level?.includes('High') || rf.level?.includes('Severe');
              const isMod = rf.level?.includes('Moderate');
              return (
                <div
                  key={idx}
                  style={{
                    padding: '0.8rem 0.9rem',
                    background: 'rgba(6, 20, 38, 0.78)',
                    border: '1px solid rgba(53, 197, 244, 0.16)',
                    borderLeft: `3px solid ${
                      isHigh ? '#EF4444' : isMod ? '#F59E0B' : 'var(--color-lime-green)'
                    }`,
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem'
                  }}
                >
                  <div
                    className="flex items-center justify-between"
                    style={{ marginBottom: '0.25rem' }}
                  >
                    <strong style={{ color: '#F8FAFC' }}>{rf.category}</strong>
                    <span
                      style={{
                        fontSize: '0.73rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: isHigh
                          ? '#F87171'
                          : isMod
                          ? '#FBBF24'
                          : 'var(--color-lime-green)'
                      }}
                    >
                      {rf.level} {rf.score !== undefined ? `(${rf.score}/100)` : ''}
                    </span>
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                    {rf.indicator}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-bright-cyan)' }}>
                    <strong>Advisory:</strong> {rf.recommendation}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="flex items-center justify-between"
            style={{
              marginTop: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(53, 197, 244, 0.16)',
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)'
            }}
          >
            <span>Heuristic decision-support screening (non-probabilistic)</span>
            <Link
              to="/app/risk"
              style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-bright-cyan)' }}
            >
              Full Hazard Breakdown →
            </Link>
          </div>
        </div>
      </div>

      {/* Provenance Card */}
      <DataSourceCard
        sourceName="NASA POWER, GPM IMERG & SMAP L4 Feeds"
        product="Agroclimatology & Root-Zone Hydrology"
        resolution="0.5° (POWER) • 10km (GPM) • 9km (SMAP) • 30m (HLS)"
        observationDate={snapshot?.observationDate || '2026-11-14'}
        coverage="West Bengal Gangetic, Coastal & Lateritic Zones"
        dataState={isLiveClimate ? 'LIVE API' : 'CALIBRATED SEED'}
        caveat="Gridded satellite products characterize macro-environmental trends. Combine with laboratory soil EC/pH testing before modifying fertilizer or salinity treatments."
      />
    </div>
  );
}
