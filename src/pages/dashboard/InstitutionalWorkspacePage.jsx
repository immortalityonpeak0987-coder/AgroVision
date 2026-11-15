import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useFarm } from '../../context/FarmContext';
import { recoveryService } from '../../services/recoveryService';
import AgroVisionGisMap from '../../components/map/AgroVisionGisMap';
import DataSourceCard from '../../components/common/DataSourceCard';
import {
  Building2,
  Users,
  AlertTriangle,
  Compass,
  ClipboardCheck,
  MapPin,
  Plus,
  CheckCircle2,
  ArrowRight,
  Sprout,
  Droplets,
  ShieldAlert,
  FileDown,
  Filter
} from 'lucide-react';

const ROLE_DESCRIPTIONS = {
  fpo: {
    title: 'FPO / Cooperative Operations Hub',
    subtitle:
      'Coordinate member farms, aggregate regional crop plans, track post-hazard recovery needs, and prioritize seed & soil amendment supply across districts.',
    badge: 'FPO / COOPERATIVE WORKSPACE'
  },
  officer: {
    title: 'Field Officer & Extension Workbench',
    subtitle:
      'Inspect assigned farm plots, verify satellite alerts on the ground, log field visit diagnostics, and guide plot-level soil recovery actions.',
    badge: 'AGRICULTURAL EXTENSION OFFICER'
  },
  ngo: {
    title: 'NGO Climate Resilience & Recovery Monitor',
    subtitle:
      'Monitor vulnerable coastal and flood-prone clusters, track multi-stage recovery progress, and generate impact reports for climate adaptation programs.',
    badge: 'NGO PROGRAM MONITOR'
  }
};

export default function InstitutionalWorkspacePage() {
  const {
    farms,
    activeFarm,
    switchFarm,
    formatArea,
    institutionalRole,
    setInstitutionalRole,
    setExperienceMode
  } = useFarm();
  const location = useLocation();
  const navigate = useNavigate();

  // Ensure Institutional Mode is active when visiting this workspace
  useEffect(() => {
    setExperienceMode('institutional');
  }, [setExperienceMode]);

  // Determine active tab from route (/app/institutional, /app/gis-explorer, /app/field-visits)
  const activeTab = useMemo(() => {
    if (location.pathname.includes('gis-explorer')) return 'gis';
    if (location.pathname.includes('field-visits')) return 'visits';
    return 'overview';
  }, [location.pathname]);

  // Filters for GIS Explorer & Member table
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  // Field Visit Logger state
  const [visitFarmId, setVisitFarmId] = useState(activeFarm?.id || farms[0]?.id || 'farm-sundarbans');
  const [officerName, setOfficerName] = useState('Subhajit Mondal (Block Extension Officer)');
  const [visitRole, setVisitRole] = useState(
    institutionalRole === 'fpo'
      ? 'FPO Coordinator'
      : institutionalRole === 'ngo'
      ? 'NGO Field Coordinator'
      : 'Field Officer'
  );
  const [visitPurpose, setVisitPurpose] = useState('Soil Salinity & Drainage Verification');
  const [findings, setFindings] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('');
  const [visitSubmitting, setVisitSubmitting] = useState(false);
  const [visitSuccess, setVisitSuccess] = useState('');
  const [visitsByFarm, setVisitsByFarm] = useState({});

  useEffect(() => {
    if (activeFarm?.id) {
      setVisitFarmId(activeFarm.id);
    }
  }, [activeFarm]);

  // Load field visits across all farms
  useEffect(() => {
    async function loadAllVisits() {
      const map = {};
      for (const f of farms) {
        try {
          const res = await recoveryService.getRecoveryPlan(f.id);
          map[f.id] = res.data?.fieldVisits || [];
        } catch (err) {
          map[f.id] = [];
        }
      }
      setVisitsByFarm(map);
    }
    loadAllVisits();
  }, [farms]);

  // Enrich farms with risk classification for institutional triage
  const enrichedFarms = useMemo(() => {
    return farms.map((farm) => {
      const isCoastal =
        farm.district?.includes('24 Parganas') ||
        farm.agroClimaticZone?.toLowerCase().includes('coastal');
      const isFlood =
        farm.district?.includes('Purba Bardhaman') ||
        farm.district?.includes('Hooghly') ||
        farm.agroClimaticZone?.toLowerCase().includes('alluvial');
      const attentionLevel = isCoastal ? 'HIGH' : isFlood ? 'MODERATE' : 'NORMAL';
      const primaryConcern = isCoastal
        ? 'Coastal Salinity & Cyclone Surge'
        : isFlood
        ? 'Monsoon Waterlogging & Drainage'
        : 'Routine Seasonal Monitoring';
      const recoveryStage = isCoastal
        ? 'Stage 3 — Active Soil Recovery'
        : isFlood
        ? 'Stage 3 — Post-Waterlogging Drainage'
        : 'Stage 4 — Stable Rabi Readiness';
      return {
        ...farm,
        attentionLevel,
        primaryConcern,
        recoveryStage
      };
    });
  }, [farms]);

  const districts = useMemo(() => {
    const set = new Set(enrichedFarms.map((f) => f.district).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [enrichedFarms]);

  const filteredFarms = useMemo(() => {
    return enrichedFarms.filter((f) => {
      const matchDist = districtFilter === 'ALL' || f.district === districtFilter;
      const matchRisk = riskFilter === 'ALL' || f.attentionLevel === riskFilter;
      return matchDist && matchRisk;
    });
  }, [enrichedFarms, districtFilter, riskFilter]);

  const highAttentionCount = enrichedFarms.filter((f) => f.attentionLevel === 'HIGH').length;
  const moderateAttentionCount = enrichedFarms.filter((f) => f.attentionLevel === 'MODERATE').length;
  const totalAreaHa = enrichedFarms
    .reduce((sum, f) => sum + Number(f.areaHectares || f.sizeHectares || 1.2), 0)
    .toFixed(1);

  const allVisitsList = useMemo(() => {
    const list = [];
    for (const f of farms) {
      const fVisits = visitsByFarm[f.id] || [];
      for (const v of fVisits) {
        list.push({
          ...v,
          farmId: f.id,
          farmName: f.name,
          district: f.district
        });
      }
    }
    return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [farms, visitsByFarm]);

  const handleLogVisit = async (e) => {
    e.preventDefault();
    if (!findings.trim()) return;
    setVisitSubmitting(true);
    setVisitSuccess('');
    try {
      const res = await recoveryService.logFieldVisit(visitFarmId, {
        officerName,
        role: visitRole,
        visitPurpose,
        findings: findings.trim(),
        recommendedAction: recommendedAction.trim() || 'Continue scheduled soil & drainage checklist',
        verifiedStatus: 'Verified on Ground'
      });
      if (res.data?.visit) {
        setVisitsByFarm((prev) => ({
          ...prev,
          [visitFarmId]: [res.data.visit, ...(prev[visitFarmId] || [])]
        }));
      }
      setFindings('');
      setRecommendedAction('');
      setVisitSuccess('Field visit recorded and linked to farm recovery timeline.');
      setTimeout(() => setVisitSuccess(''), 4000);
    } catch (err) {
      console.error('Error logging field visit:', err);
    } finally {
      setVisitSubmitting(false);
    }
  };

  const roleMeta = ROLE_DESCRIPTIONS[institutionalRole] || ROLE_DESCRIPTIONS.fpo;

  return (
    <div>
      {/* INSTITUTIONAL SECTOR — COMING SOON BANNER */}
      <div
        className="card"
        style={{
          marginBottom: '1.25rem',
          background: 'linear-gradient(110deg, rgba(245, 158, 11, 0.16) 0%, rgba(6, 20, 38, 0.96) 55%, rgba(22, 139, 206, 0.18) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.5)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.3rem' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                padding: '0.18rem 0.55rem',
                borderRadius: '4px',
                background: '#F59E0B',
                color: '#04101E'
              }}
            >
              COMING SOON — NASA HARVEST & ACRES INSTITUTIONAL PORTAL
            </span>
            <span className="badge badge-satellite">EARLY PREVIEW SANDBOX</span>
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC' }}>
            Institutional Multi-Farm Sector (FPO / Cooperative, Field Officer & NGO Cluster Rollout — Coming Soon)
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
            Full regional FPO bulk-onboarding and NASA Harvest district telemetry synchronization is scheduled for Phase 2 release. You can explore the interactive preview below or return to Farmer Mode anytime.
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setExperienceMode('farmer');
            navigate('/app/overview');
          }}
          className="btn btn-sm btn-primary"
        >
          <span>← Return to Farmer Mode</span>
        </button>
      </div>

      {/* Header & Role Selector */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}
      >
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.35rem' }}>
            <span className="badge badge-satellite">{roleMeta.badge} (COMING SOON)</span>
            <span className="badge badge-live">{enrichedFarms.length} MONITORED FARMS</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', color: '#F8FAFC', marginBottom: '0.2rem' }}>
            {roleMeta.title}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            {roleMeta.subtitle}
          </p>
        </div>

        {/* Role Switcher Pills */}
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            background: 'rgba(6, 20, 38, 0.9)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(53, 197, 244, 0.25)'
          }}
        >
          {[
            { id: 'fpo', label: 'FPO / Cooperative' },
            { id: 'officer', label: 'Field Officer' },
            { id: 'ngo', label: 'NGO Program' }
          ].map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setInstitutionalRole(role.id)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                border:
                  institutionalRole === role.id
                    ? '1px solid var(--color-bright-cyan)'
                    : '1px solid transparent',
                background:
                  institutionalRole === role.id ? 'rgba(53, 197, 244, 0.2)' : 'transparent',
                color: institutionalRole === role.id ? '#F8FAFC' : 'var(--color-text-muted)'
              }}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-navigation bar matching Institutional Sidebar routes */}
      <div
        style={{
          display: 'flex',
          gap: '0.6rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid rgba(53, 197, 244, 0.18)',
          paddingBottom: '0.75rem',
          flexWrap: 'wrap'
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/app/institutional')}
          className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Building2 size={15} />
          <span>1. Organization Overview</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/app/gis-explorer')}
          className={`btn btn-sm ${activeTab === 'gis' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Compass size={15} />
          <span>3. GIS Farm Explorer</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/app/field-visits')}
          className={`btn btn-sm ${activeTab === 'visits' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <ClipboardCheck size={15} />
          <span>8. Field Visits & Observations</span>
        </button>
        <Link to="/app/register-farm" className="btn btn-sm btn-secondary" style={{ marginLeft: 'auto' }}>
          <Plus size={15} />
          <span>Enroll Member Farm Plot</span>
        </Link>
      </div>

      {/* KPI SUMMARY CARDS (Always visible across Institutional tabs) */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '1.5rem' }}>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <span className="metric-label">Total Monitored Farms</span>
            <Users size={18} style={{ color: 'var(--color-bright-cyan)' }} />
          </div>
          <div className="metric-value">{enrichedFarms.length} Plots</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-lime-green)', fontWeight: 600 }}>
            {totalAreaHa} Hectares Total Enrolled Area
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <span className="metric-label">Farms Needing Immediate Attention</span>
            <AlertTriangle size={18} style={{ color: '#EF4444' }} />
          </div>
          <div className="metric-value" style={{ color: '#F87171' }}>
            {highAttentionCount} High Priority
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            +{moderateAttentionCount} Moderate Watchlist Plots
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <span className="metric-label">District / Block Coverage</span>
            <MapPin size={18} style={{ color: 'var(--color-lime-green)' }} />
          </div>
          <div className="metric-value">{districts.length - 1} Districts</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-bright-cyan)' }}>
            Coastal, Alluvial & Red Lateritic Belts
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <span className="metric-label">Verified Field Visits</span>
            <ClipboardCheck size={18} style={{ color: 'var(--color-bright-cyan)' }} />
          </div>
          <div className="metric-value">{allVisitsList.length} Visits</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-lime-green)' }}>
            Ground-Truthed by Extension Team
          </div>
        </div>
      </div>

      {/* TAB 1: ORGANIZATION OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          {/* Filters + Quick Actions */}
          <div
            className="card"
            style={{
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
              <div className="flex items-center gap-2">
                <Filter size={16} style={{ color: 'var(--color-bright-cyan)' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F8FAFC' }}>
                  Filter Portfolio:
                </span>
              </div>

              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '180px', padding: '0.4rem 0.75rem' }}
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d === 'ALL' ? 'All Districts' : d}
                  </option>
                ))}
              </select>

              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '180px', padding: '0.4rem 0.75rem' }}
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <option value="ALL">All Attention Levels</option>
                <option value="HIGH">High Priority (Coastal / Salinity)</option>
                <option value="MODERATE">Moderate Watchlist (Waterlogging)</option>
                <option value="NORMAL">Normal / Stable</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/app/reports" className="btn btn-sm btn-secondary">
                <FileDown size={15} />
                <span>Export Institutional Dossier</span>
              </Link>
            </div>
          </div>

          {/* Multi-Farm Triage & Member Comparison Table */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h3 className="card-title">
                <Building2 size={18} style={{ color: 'var(--color-bright-cyan)' }} />
                <span>Member Farms Triage, Crop Distribution & Recovery Status</span>
              </h3>
              <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                Showing {filteredFarms.length} of {enrichedFarms.length} plots
              </span>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Farm / Member Plot</th>
                    <th>District & Block</th>
                    <th>Plot Area</th>
                    <th>Standing Crop</th>
                    <th>Primary Risk / Alert</th>
                    <th>Recovery Stage</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFarms.map((farm) => {
                    const isSelected = activeFarm?.id === farm.id;
                    return (
                      <tr
                        key={farm.id}
                        style={{
                          background: isSelected ? 'rgba(53, 197, 244, 0.08)' : 'transparent'
                        }}
                      >
                        <td>
                          <div style={{ fontWeight: 700, color: '#F8FAFC' }}>{farm.name}</div>
                          <div
                            style={{
                              fontSize: '0.72rem',
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--color-text-muted)'
                            }}
                          >
                            {Number(farm.coordinates?.latitude ?? farm.latitude).toFixed(4)}°N,{' '}
                            {Number(farm.coordinates?.longitude ?? farm.longitude).toFixed(4)}°E
                          </div>
                        </td>
                        <td>
                          <div style={{ color: '#E2E8F0', fontWeight: 600 }}>{farm.district}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                            {farm.village || farm.agroClimaticZone}
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-lime-green)' }}>
                          {formatArea(farm)}
                        </td>
                        <td>
                          <span className="badge badge-live">
                            {farm.currentCrop || farm.mainCrop || 'Kharif Paddy'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              farm.attentionLevel === 'HIGH'
                                ? 'badge-risk-high'
                                : farm.attentionLevel === 'MODERATE'
                                ? 'badge-risk-moderate'
                                : 'badge-risk-low'
                            }`}
                          >
                            {farm.attentionLevel} — {farm.primaryConcern}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#E2E8F0' }}>{farm.recoveryStage}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                switchFarm(farm.id);
                                navigate('/app/overview');
                              }}
                              className="btn btn-sm btn-primary"
                            >
                              <span>Inspect</span>
                              <ArrowRight size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                switchFarm(farm.id);
                                navigate('/app/recovery');
                              }}
                              className="btn btn-sm btn-secondary"
                            >
                              Recovery
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* District & Crop Distribution Summary Cards */}
          <div className="grid grid-cols-2 gap-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Sprout size={18} style={{ color: 'var(--color-lime-green)' }} />
                  <span>Regional Crop & Rotation Advisory Focus</span>
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.84rem' }}>
                <div
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(6, 20, 38, 0.8)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(53, 197, 244, 0.16)'
                  }}
                >
                  <strong style={{ color: 'var(--color-bright-cyan)' }}>
                    Coastal Saline Belt (South 24 Parganas):
                  </strong>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-secondary)' }}>
                    Transition post-monsoon saline plots from rice monocropping to salt-tolerant{' '}
                    <strong>Khesari / Grass Pea</strong>, <strong>Mustard</strong>, or{' '}
                    <strong>Sunflower</strong> with gypsum amendment and ridge-furrow drainage.
                  </p>
                </div>
                <div
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(6, 20, 38, 0.8)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(53, 197, 244, 0.16)'
                  }}
                >
                  <strong style={{ color: 'var(--color-lime-green)' }}>
                    Alluvial Floodplain Belt (Purba Bardhaman):
                  </strong>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-secondary)' }}>
                    Utilize residual SMAP root-zone moisture after Aman paddy harvest for zero-tillage{' '}
                    <strong>Lentil (Masoor)</strong>, <strong>Potato</strong>, or{' '}
                    <strong>Mustard</strong> to save 25–35% irrigation water.
                  </p>
                </div>
                <div
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(6, 20, 38, 0.8)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(53, 197, 244, 0.16)'
                  }}
                >
                  <strong style={{ color: '#F59E0B' }}>
                    Red & Lateritic Belt (Bankura / Purulia):
                  </strong>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-secondary)' }}>
                    Prioritize low-water requirement pulses (<strong>Chickpea / Gram</strong>,{' '}
                    <strong>Green Gram</strong>) and organic mulching to counter rapid topsoil drying.
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <ClipboardCheck size={18} style={{ color: 'var(--color-bright-cyan)' }} />
                  <span>Recent Field Officer Ground Verifications</span>
                </h3>
                <button
                  type="button"
                  onClick={() => navigate('/app/field-visits')}
                  className="btn btn-sm btn-secondary"
                >
                  Log New Visit
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {allVisitsList.slice(0, 3).map((visit) => (
                  <div
                    key={visit.id}
                    style={{
                      padding: '0.75rem',
                      background: 'rgba(6, 20, 38, 0.8)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(53, 197, 244, 0.16)'
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem' }}>
                      <strong style={{ color: '#F8FAFC', fontSize: '0.86rem' }}>
                        {visit.farmName} ({visit.district})
                      </strong>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-lime-green)'
                        }}
                      >
                        {visit.date}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-bright-cyan)', marginBottom: '0.25rem' }}>
                      {visit.officerName} • {visit.visitPurpose}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                      {visit.findings}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GIS FARM EXPLORER */}
      {activeTab === 'gis' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
            <div className="card-header" style={{ marginBottom: '0.85rem' }}>
              <div>
                <h3 className="card-title">
                  <Compass size={19} style={{ color: 'var(--color-bright-cyan)' }} />
                  <span>Multi-Farm GIS Explorer & Satellite Boundary Inspector</span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0.2rem 0 0' }}>
                  Click any farm pin or polygon to switch active telemetry, compare NDVI canopy health, and inspect regional risk overlays.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                >
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d === 'ALL' ? 'All Districts' : d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <AgroVisionGisMap
              farms={filteredFarms}
              activeFarm={activeFarm}
              onSelectFarm={switchFarm}
              height={460}
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            {filteredFarms.map((farm) => {
              const isSelected = activeFarm?.id === farm.id;
              return (
                <div
                  key={farm.id}
                  className="card"
                  style={{
                    border: isSelected
                      ? '2px solid var(--color-lime-green)'
                      : '1px solid rgba(53, 197, 244, 0.2)'
                  }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                    <span
                      className={`badge ${
                        farm.attentionLevel === 'HIGH'
                          ? 'badge-risk-high'
                          : farm.attentionLevel === 'MODERATE'
                          ? 'badge-risk-moderate'
                          : 'badge-live'
                      }`}
                    >
                      {farm.attentionLevel} PRIORITY
                    </span>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#E2E8F0' }}>
                      {formatArea(farm)}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.08rem', color: '#F8FAFC', marginBottom: '0.25rem' }}>
                    {farm.name}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-bright-cyan)', marginBottom: '0.65rem' }}>
                    {farm.village ? `${farm.village}, ` : ''}
                    {farm.district}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '0.85rem' }}>
                    <div>
                      <strong>Standing Crop:</strong> {farm.currentCrop || farm.mainCrop}
                    </div>
                    <div>
                      <strong>Focus:</strong> {farm.primaryConcern}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => switchFarm(farm.id)}
                      className="btn btn-sm btn-secondary"
                      style={{ flex: 1 }}
                    >
                      {isSelected ? '✓ Focused on Map' : 'Focus on Map'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        switchFarm(farm.id);
                        navigate('/app/satellite');
                      }}
                      className="btn btn-sm btn-primary"
                    >
                      NDVI Map
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: FIELD VISITS & OBSERVATIONS */}
      {activeTab === 'visits' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Left: Log New Field Officer / NGO Visit */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <ClipboardCheck size={19} style={{ color: 'var(--color-lime-green)' }} />
                <span>Record Ground Verification & Field Visit</span>
              </h3>
              <span className="badge badge-live">FIELD OFFICER LOG</span>
            </div>

            <p style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Ground observations recorded here are saved directly to the selected farm’s recovery dossier and kept separate from satellite estimates.
            </p>

            <form onSubmit={handleLogVisit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label className="form-label">Target Member Farm Plot</label>
                <select
                  className="form-select"
                  value={visitFarmId}
                  onChange={(e) => {
                    setVisitFarmId(e.target.value);
                    switchFarm(e.target.value);
                  }}
                >
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.district})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Visiting Officer / Coordinator Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Institutional Role</label>
                  <select
                    className="form-select"
                    value={visitRole}
                    onChange={(e) => setVisitRole(e.target.value)}
                  >
                    <option value="Field Officer">Agricultural Field Officer</option>
                    <option value="FPO Coordinator">FPO / Cooperative Coordinator</option>
                    <option value="NGO Field Coordinator">NGO Resilience Coordinator</option>
                    <option value="Soil Technician">Soil Testing Technician</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Inspection Purpose</label>
                <select
                  className="form-select"
                  value={visitPurpose}
                  onChange={(e) => setVisitPurpose(e.target.value)}
                >
                  <option value="Soil Salinity & Drainage Verification">
                    Soil Salinity & Drainage Verification
                  </option>
                  <option value="Post-Flood / Cyclone Damage Assessment">
                    Post-Flood / Cyclone Damage Assessment
                  </option>
                  <option value="Crop Stand & Canopy Ground-Truthing">
                    Crop Stand & Canopy Ground-Truthing
                  </option>
                  <option value="Soil Sample Collection for Lab Test">
                    Soil Sample Collection for Lab Test
                  </option>
                  <option value="Rabi Seed & Input Distribution Follow-up">
                    Rabi Seed & Input Distribution Follow-up
                  </option>
                </select>
              </div>

              <div>
                <label className="form-label">Ground Findings & Field Condition</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="Describe soil surface condition, standing water depth, crop vigor, or salinity patches observed on the plot..."
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Recommended Next Action for Farmer</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Clear southern perimeter drainage channel and apply 250 kg/ha gypsum before Rabi sowing"
                  value={recommendedAction}
                  onChange={(e) => setRecommendedAction(e.target.value)}
                />
              </div>

              {visitSuccess && (
                <div
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.16)',
                    border: '1px solid var(--color-lime-green)',
                    color: '#F8FAFC',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <CheckCircle2 size={16} style={{ color: 'var(--color-lime-green)' }} />
                  <span>{visitSuccess}</span>
                </div>
              )}

              <button type="submit" disabled={visitSubmitting} className="btn btn-primary">
                <ClipboardCheck size={17} />
                <span>{visitSubmitting ? 'Saving Field Visit...' : 'Save Verified Field Visit'}</span>
              </button>
            </form>
          </div>

          {/* Right: Chronological Log of All Institutional Field Visits */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Users size={19} style={{ color: 'var(--color-bright-cyan)' }} />
                <span>Chronological Field Visit Log ({allVisitsList.length})</span>
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '540px', overflowY: 'auto' }}>
              {allVisitsList.map((visit) => (
                <div
                  key={visit.id}
                  style={{
                    padding: '0.9rem',
                    background: 'rgba(6, 20, 38, 0.85)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(53, 197, 244, 0.2)'
                  }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '0.92rem' }}>
                      {visit.farmName} ({visit.district})
                    </span>
                    <span className="badge badge-live">{visit.verifiedStatus || 'Verified'}</span>
                  </div>

                  <div
                    style={{
                      fontSize: '0.76rem',
                      color: 'var(--color-bright-cyan)',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>
                      {visit.officerName} ({visit.role})
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{visit.date}</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#E2E8F0', marginBottom: '0.4rem' }}>
                    <strong>Purpose:</strong> {visit.visitPurpose}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '0.45rem' }}>
                    <strong>Findings:</strong> {visit.findings}
                  </div>
                  {visit.recommendedAction && (
                    <div
                      style={{
                        padding: '0.45rem 0.65rem',
                        background: 'rgba(56, 168, 50, 0.12)',
                        borderLeft: '3px solid var(--color-lime-green)',
                        fontSize: '0.78rem',
                        color: '#F8FAFC'
                      }}
                    >
                      <strong>Advisory Action:</strong> {visit.recommendedAction}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <DataSourceCard
        sourceName="AgroVision Institutional & Extension Telemetry"
        whatItMeasures="Multi-farm satellite indicators (NASA POWER, SMAP, GPM, MODIS/HLS) paired with verified ground visits and lab soil tests"
        areaCovered="Registered FPO, Field Officer, and NGO Farm Clusters in West Bengal"
        datesCovered="2026 Kharif & Rabi Operational Cycle"
        resolution="10m–250m Optical NDVI • 9km SMAP Moisture • Plot-Level Ground Logs"
        caveat="Regional satellite alerts help prioritize which farms to inspect first, but plot-specific interventions should always be confirmed by field visits or soil tests."
      />
    </div>
  );
}
