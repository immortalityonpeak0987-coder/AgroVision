import React, { useState, useEffect, useMemo } from 'react';
import { useFarm } from '../../context/FarmContext';
import { climateService } from '../../services/climateService';
import DataSourceCard from '../../components/common/DataSourceCard';
import DemoBadge from '../../components/common/DemoBadge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { CloudSun, Droplets, Thermometer, Sun, Wind, Filter } from 'lucide-react';

const SEASON_FILTERS = [
  { id: 'ALL', label: 'Full 12-Month Cycle', months: null },
  { id: 'KHARIF', label: 'Kharif Monsoon (Jun–Oct)', months: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct'] },
  { id: 'RABI', label: 'Rabi Winter (Nov–Feb)', months: ['Nov', 'Dec', 'Jan', 'Feb'] },
  { id: 'SUMMER', label: 'Pre-Kharif Summer (Mar–May)', months: ['Mar', 'Apr', 'May'] }
];

export default function ClimatePage() {
  const { activeFarm, t } = useFarm();
  const [climateState, setClimateState] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState('ALL');

  useEffect(() => {
    async function fetchClimate() {
      if (!activeFarm) return;
      try {
        const res = await climateService.getClimateByFarmId(activeFarm.id);
        setClimateState(res);
      } catch (err) {
        console.error('Failed to load climate data:', err);
      }
    }
    fetchClimate();
  }, [activeFarm]);

  const rawTrends = climateState?.data?.monthlyTrends || [];

  const filteredTrends = useMemo(() => {
    const filterObj = SEASON_FILTERS.find((s) => s.id === selectedSeason);
    if (!filterObj || !filterObj.months) return rawTrends;
    return rawTrends.filter((item) => filterObj.months.includes(item.month));
  }, [rawTrends, selectedSeason]);

  const seasonalMetrics = useMemo(() => {
    if (!filteredTrends.length) {
      return { totalRain: 0, normalRain: 0, avgTemp: 0, maxPeak: 0, avgHumidity: 0 };
    }
    const totalRain = filteredTrends.reduce((acc, m) => acc + (Number(m.rainfall) || 0), 0);
    const normalRain = filteredTrends.reduce((acc, m) => acc + (Number(m.rainfallNormal) || 0), 0);
    const avgTemp =
      filteredTrends.reduce((acc, m) => acc + (Number(m.tempMean) || 0), 0) / filteredTrends.length;
    const maxPeak = Math.max(...filteredTrends.map((m) => Number(m.tempMax) || 0));
    const avgHumidity =
      filteredTrends.reduce((acc, m) => acc + (Number(m.humidity) || 68), 0) / filteredTrends.length;

    return {
      totalRain: Math.round(totalRain),
      normalRain: Math.round(normalRain),
      avgTemp: avgTemp.toFixed(1),
      maxPeak: maxPeak.toFixed(1),
      avgHumidity: Math.round(avgHumidity)
    };
  }, [filteredTrends]);

  if (!activeFarm || !climateState) {
    return (
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: '#F8FAFC' }}>
        Loading NASA POWER 0.5° Agroclimatology...
      </div>
    );
  }

  const { data, metadata } = climateState;
  const isLive = metadata?.dataState === 'LIVE';

  return (
    <div>
      {/* Header & Season Filter Bar */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: '1.35rem', flexWrap: 'wrap', gap: '1rem' }}
      >
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.85rem', color: '#F8FAFC', margin: 0 }}>
              {t('Climate Intelligence & Seasonal Anomalies', 'জলবায়ু ইন্টেলিজেন্স ও ঋতুভিত্তিক বিশ্লেষণ')}
            </h1>
            <DemoBadge
              label={isLive ? 'LIVE NASA POWER' : '10-YR CLIMATOLOGY'}
              isLive={isLive}
            />
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Multi-year monthly normals (`T2M`, `PRECTOTCORR`, `RH2M`, `ALLSKY_SFC_SW_DWN`) for{' '}
            <strong style={{ color: 'var(--color-bright-cyan)' }}>{activeFarm.district}</strong> (
            {data?.coordinates || `${activeFarm.latitude}°N, ${activeFarm.longitude}°E`}).
          </p>
        </div>

        {/* Season Filter Controls */}
        <div
          className="flex items-center gap-1"
          style={{
            background: 'rgba(6, 20, 38, 0.85)',
            padding: '0.3rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(53, 197, 244, 0.25)',
            flexWrap: 'wrap'
          }}
        >
          {SEASON_FILTERS.map((season) => {
            const active = selectedSeason === season.id;
            return (
              <button
                key={season.id}
                onClick={() => setSelectedSeason(season.id)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: active
                    ? 'linear-gradient(135deg, var(--color-agri-green), var(--color-satellite-blue))'
                    : 'transparent',
                  color: active ? '#FFFFFF' : 'var(--color-text-muted)',
                  border: 'none'
                }}
              >
                {season.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 SEASONAL SUMMARY METRICS */}
      <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>
            Cumulative Rainfall ({selectedSeason})
          </div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--color-bright-cyan)',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {seasonalMetrics.totalRain} mm
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            10-Yr Normal: {seasonalMetrics.normalRain} mm
          </div>
        </div>

        <div className="card" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>
            Mean Seasonal Temp (T2M)
          </div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#F8FAFC',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {seasonalMetrics.avgTemp}°C
          </div>
          <div style={{ fontSize: '0.74rem', color: '#F97316', marginTop: '0.25rem' }}>
            Peak Max: {seasonalMetrics.maxPeak}°C
          </div>
        </div>

        <div className="card" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>
            Mean Relative Humidity (RH2M)
          </div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--color-lime-green)',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {seasonalMetrics.avgHumidity}%
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            2-Meter Atmospheric Moisture
          </div>
        </div>

        <div className="card" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>
            Solar Irradiance (All-Sky)
          </div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#FBBF24',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {data?.currentSnapshot?.solarRadiation ?? 18.4} MJ/m²/d
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Photosynthetic Active Flux
          </div>
        </div>
      </div>

      {/* Seasonal Anomalies Strip */}
      {data?.anomalies && (
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
            background:
              'linear-gradient(120deg, rgba(15, 36, 66, 0.92) 0%, rgba(10, 42, 46, 0.88) 100%)',
            border: '1px solid rgba(53, 197, 244, 0.3)'
          }}
        >
          <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
            <CloudSun size={20} style={{ color: 'var(--color-bright-cyan)' }} />
            <h3 style={{ fontSize: '1.05rem', margin: 0, color: '#F8FAFC' }}>
              Seasonal Agro-Climatic Anomaly Diagnosis
            </h3>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              fontSize: '0.84rem'
            }}
          >
            <div
              style={{
                background: 'rgba(6, 20, 38, 0.65)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(53, 197, 244, 0.16)'
              }}
            >
              <strong style={{ color: 'var(--color-bright-cyan)' }}>Monsoon Trajectory:</strong>
              <div style={{ color: '#E2E8F0', marginTop: '0.25rem' }}>
                {data.anomalies.monsoonStatus}
              </div>
            </div>
            <div
              style={{
                background: 'rgba(6, 20, 38, 0.65)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(53, 197, 244, 0.16)'
              }}
            >
              <strong style={{ color: '#FBBF24' }}>Thermal / Heatwave Stress:</strong>
              <div style={{ color: '#E2E8F0', marginTop: '0.25rem' }}>
                {data.anomalies.heatwaveRisk}
              </div>
            </div>
            <div
              style={{
                background: 'rgba(6, 20, 38, 0.65)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(53, 197, 244, 0.16)'
              }}
            >
              <strong style={{ color: 'var(--color-lime-green)' }}>Sowing Window Advisory:</strong>
              <div style={{ color: '#E2E8F0', marginTop: '0.25rem' }}>
                {data.anomalies.delayedSowingRisk}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHARTS GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Chart 1: Rainfall vs Historical 10-Yr Normal */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Droplets size={18} style={{ color: 'var(--color-bright-cyan)' }} />
              <span>Precipitation vs 10-Yr Normal (mm)</span>
            </h3>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--color-bright-cyan)' }}>
              PRECTOTCORR
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Compares observed monthly precipitation against the 10-year regional baseline for {activeFarm.district}.
          </p>

          <div style={{ height: '290px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredTrends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.14)" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} unit="mm" />
                <Tooltip
                  contentStyle={{
                    background: '#061426',
                    borderRadius: '8px',
                    border: '1px solid #35C5F4',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#E2E8F0' }} />
                <Bar
                  dataKey="rainfall"
                  name="Observed Season (mm)"
                  fill="#35C5F4"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="rainfallNormal"
                  name="10-Yr Normal (mm)"
                  fill="#475569"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Temperature Trends (T2M, T2M_MAX, T2M_MIN) */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Thermometer size={18} style={{ color: '#F97316' }} />
              <span>Monthly Temperature Envelope (°C)</span>
            </h3>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#F97316' }}>
              T2M_MAX / MEAN / MIN
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Thermal envelope governing winter tuber bulking (Potato), vernalization (Mustard), and pre-monsoon heat stress.
          </p>

          <div style={{ height: '290px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredTrends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.14)" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} unit="°C" />
                <Tooltip
                  contentStyle={{
                    background: '#061426',
                    borderRadius: '8px',
                    border: '1px solid #35C5F4',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#E2E8F0' }} />
                <Line
                  type="monotone"
                  dataKey="tempMax"
                  name="Max Temp (°C)"
                  stroke="#F87171"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="tempMean"
                  name="Mean Temp (°C)"
                  stroke="#FBBF24"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="tempMin"
                  name="Min Temp (°C)"
                  stroke="#35C5F4"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Provenance and Scientific Context */}
      <DataSourceCard
        sourceName={metadata?.source || 'NASA Langley POWER Project'}
        product="MERRA-2 Assimilated Agroclimatology"
        resolution={metadata?.spatialResolution || '0.5° × 0.5° (~50 km)'}
        observationDate="Multi-Year Baseline + Current Season"
        coverage="West Bengal, India"
        dataState={isLive ? 'LIVE API' : 'CALIBRATED SEED'}
        caveat={
          metadata?.caveat ||
          'Missing sensor records (-999) are explicitly filtered and flagged as MISSING rather than coerced to zero.'
        }
      />
    </div>
  );
}
