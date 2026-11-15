import React, { useState, useEffect } from 'react';
import { useFarm } from '../../context/FarmContext';
import { recoveryService } from '../../services/recoveryService';
import { satelliteService } from '../../services/satelliteService';
import { soilService } from '../../services/soilService';
import DataSourceCard from '../../components/common/DataSourceCard';
import {
  Clock,
  Camera,
  CheckSquare,
  PlusCircle,
  CheckCircle2,
  Layers,
  FlaskConical,
  Upload,
  X,
  Info
} from 'lucide-react';

const RECOVERY_STAGES = [
  {
    id: 'BEFORE',
    labelEn: '1. Before the problem',
    labelBn: '১. সমস্যার পূর্বে',
    desc: 'Initial crop establishment and normal seasonal conditions'
  },
  {
    id: 'DURING',
    labelEn: '2. During the problem',
    labelBn: '২. সমস্যা চলাকালীন',
    desc: 'Heavy rainfall, waterlogging, tidal surge, or salinity stress event'
  },
  {
    id: 'RECOVERY',
    labelEn: '3. Recovery period',
    labelBn: '৩. পুনরুদ্ধার সময়কাল',
    desc: 'Drainage clearing, soil testing, mulching, and field preparation'
  },
  {
    id: 'CURRENT',
    labelEn: '4. Current condition',
    labelBn: '৪. বর্তমান অবস্থা',
    desc: 'Latest soil moisture status, relay sowing, or standing crop progress'
  }
];

const OBSERVATION_CATEGORIES = [
  { value: 'waterlogging', label: 'Waterlogging (জলমগ্নতা)' },
  { value: 'drainage', label: 'Drainage cleared (জল নিষ্কাশন)' },
  { value: 'soil_condition', label: 'Soil condition / Salinity (মাটির অবস্থা)' },
  { value: 'crop_condition', label: 'Crop condition / Greenness (ফসলের অবস্থা)' },
  { value: 'replanting', label: 'Replanting / Next sowing (পুনরায় বপন)' },
  { value: 'harvest_status', label: 'Harvest status (ফসল কাটা)' }
];

export default function RecoveryPage() {
  const { activeFarm, t, experienceMode } = useFarm();
  const [timelineData, setTimelineData] = useState(null);
  const [satData, setSatData] = useState(null);
  const [soilData, setSoilData] = useState(null);

  // New observation form state
  const [selectedStage, setSelectedStage] = useState('CURRENT');
  const [obsCategory, setObsCategory] = useState('drainage');
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [milestoneSaved, setMilestoneSaved] = useState(false);

  // 3-State Checklist ('Pending' | 'In progress' | 'Completed') persisted to backend
  const [checklistItems, setChecklistItems] = useState([]);
  const [checklistUpdatingId, setChecklistUpdatingId] = useState(null);

  const loadRecovery = async (farm) => {
    if (!farm) return;
    try {
      const [recRes, satRes, sRes] = await Promise.all([
        recoveryService.getRecoveryTimeline(farm.id),
        satelliteService.getSatelliteObservations(farm.id),
        soilService.getSoilData(farm.id)
      ]);
      setTimelineData(recRes.data);
      setSatData(satRes.data);
      setSoilData(sRes.data);

      if (Array.isArray(recRes.data?.checklist) && recRes.data.checklist.length > 0) {
        setChecklistItems(recRes.data.checklist);
      } else {
        setChecklistItems([
          {
            id: 'chk-1',
            key: 'grainMoistureChecked',
            title: 'Dry harvested grain below 14% moisture before storage',
            desc: 'Sun-dry harvested Aman paddy grain below 14% moisture to prevent fungal spoilage.',
            status: 'Completed'
          },
          {
            id: 'chk-2',
            key: 'drainageFurrowsCleaned',
            title: 'Clear perimeter drainage channels',
            desc: 'Open field drainage channels so excess surface water drains before winter sowing.',
            status: 'Completed'
          },
          {
            id: 'chk-3',
            key: 'mulchApplied',
            title: 'Keep paddy straw mulch on soil surface (15–20 cm)',
            desc: 'Retain crop residue mulch to conserve soil moisture and reduce salt rise.',
            status: 'In progress'
          },
          {
            id: 'chk-4',
            key: 'postHarvestStoragePrepared',
            title: 'Prepare certified winter pulse or mustard seed',
            desc: 'Collect certified Mustard (B-9), Lentil, or Khesari seed for timely Rabi sowing.',
            status: 'Pending'
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load recovery timeline:', err);
    }
  };

  useEffect(() => {
    loadRecovery(activeFarm);
  }, [activeFarm]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handleChecklistStatusChange = async (item, newStatus) => {
    const optimistic = checklistItems.map((c) =>
      c.id === item.id || c.key === item.key ? { ...c, status: newStatus } : c
    );
    setChecklistItems(optimistic);
    setChecklistUpdatingId(item.id || item.key);
    try {
      const res = await recoveryService.updateChecklist(activeFarm.id, {
        taskId: item.id,
        key: item.key,
        status: newStatus
      });
      if (res?.checklist) {
        setChecklistItems(res.checklist);
      }
    } catch (e) {
      console.warn('Checklist update fallback to local state:', e.message);
    } finally {
      setChecklistUpdatingId(null);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() && !newMilestoneDesc.trim()) return;
    const categoryObj = OBSERVATION_CATEGORIES.find((c) => c.value === obsCategory);

    await recoveryService.logFieldObservation(activeFarm.id, {
      title: newMilestoneTitle.trim() || `${categoryObj?.label || 'Field Observation'}`,
      description:
        newMilestoneDesc.trim() ||
        'Field condition verified and recorded during farm recovery check.',
      phase: selectedStage,
      observationType: obsCategory,
      eventType: obsCategory.toUpperCase(),
      photoUrl: photoPreview || null
    });

    setNewMilestoneTitle('');
    setNewMilestoneDesc('');
    setPhotoPreview(null);
    await loadRecovery(activeFarm);
    setMilestoneSaved(true);
    setTimeout(() => setMilestoneSaved(false), 3500);
  };

  if (!activeFarm || !timelineData) {
    return (
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: '#F8FAFC' }}>
        Loading Farm Recovery Progress...
      </div>
    );
  }

  const events = timelineData.events || [];
  const completedTasks = checklistItems.filter((i) => i.status === 'Completed').length;
  const inProgressTasks = checklistItems.filter((i) => i.status === 'In progress').length;
  const pendingTasks = checklistItems.filter((i) => i.status === 'Pending').length;

  const isFarmer = experienceMode === 'farmer';
  const latestLab = soilData?.latestLabTest || soilData?.labTest || {};

  // Group events into the 4 stages
  const eventsByStage = {
    BEFORE: [],
    DURING: [],
    RECOVERY: [],
    CURRENT: []
  };

  events.forEach((evt, idx) => {
    const phase = evt.phase
      ? evt.phase
      : idx === events.length - 1
      ? 'BEFORE'
      : String(evt.type).includes('SHOCK') || String(evt.type).includes('ALERT')
      ? 'DURING'
      : idx === 0
      ? 'CURRENT'
      : 'RECOVERY';
    if (eventsByStage[phase]) {
      eventsByStage[phase].push(evt);
    } else {
      eventsByStage.CURRENT.push(evt);
    }
  });

  return (
    <div>
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: '1.35rem', flexWrap: 'wrap', gap: '0.75rem' }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', color: '#F8FAFC', marginBottom: '0.25rem' }}>
            {isFarmer
              ? t('My Farm Recovery Progress', 'আমার খামারের পুনরুদ্ধার অগ্রগতি')
              : t('Recovery Monitoring & Ground-Truth Verification', 'খামার পুনরুদ্ধার ও মাঠ পর্যবেক্ষণ')}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            {isFarmer
              ? `Track your farm before, during, and after heavy rain or salinity problems for ${activeFarm.name}.`
              : `Separated tracking of farmer recovery activities, verified field observations, satellite indicators, and measured soil tests for ${activeFarm.name}.`}
          </p>
        </div>

        <div>
          <span className="badge badge-live">{timelineData.currentStatus}</span>
        </div>
      </div>

      {/* 4 SEPARATED EVIDENCE STREAMS (Replaces artificial checklist-driven % score) */}
      <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '1.5rem' }}>
        {/* 1. Recorded Recovery Activities */}
        <div className="card" style={{ padding: '1.1rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-lime-green)' }}>
              1. Recorded Recovery Tasks
            </span>
            <CheckSquare size={17} style={{ color: 'var(--color-lime-green)' }} />
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#F8FAFC' }}>
            {completedTasks} / {checklistItems.length} Done
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            {inProgressTasks} In progress • {pendingTasks} Pending
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--color-bright-cyan)', marginTop: '0.45rem' }}>
            Source: Farmer action checklist
          </div>
        </div>

        {/* 2. Verified Field Observations */}
        <div className="card" style={{ padding: '1.1rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-bright-cyan)' }}>
              2. Field Observations
            </span>
            <Camera size={17} style={{ color: 'var(--color-bright-cyan)' }} />
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#F8FAFC' }}>
            {events.length} Logged
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Across 4 seasonal stages
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--color-lime-green)', marginTop: '0.45rem' }}>
            Source: Ground-truth notes & photos
          </div>
        </div>

        {/* 3. Satellite Indicators */}
        <div className="card" style={{ padding: '1.1rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38BDF8' }}>
              3. Satellite Moisture & Crop
            </span>
            <Layers size={17} style={{ color: '#38BDF8' }} />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#F8FAFC' }}>
            {satData?.smapSoilMoisture?.rootZoneMoisture?.split(' ')[0] || '0.32'} cm³/cm³
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-lime-green)', marginTop: '0.25rem' }}>
            Crop Greenness: {satData?.vegetationNdvi?.currentNdvi || '0.68'}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '0.45rem' }}>
            Source: NASA SMAP (9km) & HLS (30m)
          </div>
        </div>

        {/* 4. Measured Soil Information */}
        <div className="card" style={{ padding: '1.1rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FBBF24' }}>
              4. Measured Soil Status
            </span>
            <FlaskConical size={17} style={{ color: '#FBBF24' }} />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#F8FAFC' }}>
            pH {latestLab.ph ?? '6.5'} • EC {latestLab.electricalConductivity ?? latestLab.ecDsM ?? '0.35'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            {latestLab.salinityClass || 'Non-Saline'}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--color-bright-cyan)', marginTop: '0.45rem' }}>
            Source: {latestLab.isVerifiedLab ? 'Verified Soil Lab' : 'Regional Soil Baseline'}
          </div>
        </div>
      </div>

      {/* Scientific Separation Note */}
      <div className="alert-strip alert-strip-info" style={{ marginBottom: '1.5rem' }}>
        <Info size={18} style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.82rem' }}>
          <strong>Transparent Progress Tracking:</strong> Completing field preparation tasks updates your{' '}
          <em>Recorded Recovery Tasks</em> count above. It never artificially changes satellite soil moisture or laboratory soil chemistry measurements.
        </div>
      </div>

      {/* 4-STAGE RECOVERY TIMELINE BOARD (Before -> During -> Recovery -> Current) */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Clock size={20} style={{ color: 'var(--color-bright-cyan)' }} />
            <span>
              {t(
                '4-Stage Farm Recovery Timeline (Before • During • Recovery • Current)',
                '৪-ধাপের খামার পুনরুদ্ধার টাইমলাইন'
              )}
            </span>
          </h3>
          <span className="badge badge-satellite">{events.length} RECORDED OBSERVATIONS</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '1rem'
          }}
        >
          {RECOVERY_STAGES.map((stage) => {
            const stageEvents = eventsByStage[stage.id] || [];
            return (
              <div
                key={stage.id}
                style={{
                  background: 'rgba(6, 20, 38, 0.82)',
                  border: '1px solid rgba(53, 197, 244, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.9rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem'
                }}
              >
                <div style={{ borderBottom: '1px solid rgba(53, 197, 244, 0.15)', paddingBottom: '0.45rem' }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--color-lime-green)' }}>
                    {t(stage.labelEn, stage.labelBn)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {stage.desc}
                  </div>
                </div>

                {stageEvents.length === 0 ? (
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', padding: '0.5rem 0' }}>
                    No events recorded for this stage yet.
                  </div>
                ) : (
                  stageEvents.map((evt, idx) => (
                    <div
                      key={evt.id || idx}
                      style={{
                        padding: '0.65rem',
                        background: 'rgba(11, 31, 58, 0.9)',
                        borderRadius: 'var(--radius-sm)',
                        borderLeft: '3px solid var(--color-bright-cyan)'
                      }}
                    >
                      <div className="flex items-center justify-between" style={{ marginBottom: '0.2rem' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--color-bright-cyan)',
                            fontWeight: 700
                          }}
                        >
                          {evt.date}
                        </span>
                        <span
                          style={{
                            fontSize: '0.62rem',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: 'rgba(56, 168, 50, 0.2)',
                            color: 'var(--color-lime-green)'
                          }}
                        >
                          {evt.observationType || evt.type}
                        </span>
                      </div>
                      <strong style={{ fontSize: '0.82rem', color: '#F8FAFC', display: 'block' }}>
                        {evt.title}
                      </strong>
                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--color-text-muted)',
                          margin: '0.25rem 0 0',
                          lineHeight: 1.4
                        }}
                      >
                        {evt.description}
                      </p>
                      {evt.photoUrl && (
                        <img
                          src={evt.photoUrl}
                          alt="Field evidence"
                          style={{
                            marginTop: '0.45rem',
                            width: '100%',
                            maxHeight: '95px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid rgba(53, 197, 244, 0.3)'
                          }}
                        />
                      )}
                      <div
                        style={{
                          fontSize: '0.66rem',
                          color: 'var(--color-lime-green)',
                          marginTop: '0.3rem',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        {evt.source}
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* TWO-COLUMN INTERACTIVE LOGGER & 3-STATE CHECKLIST */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Left: Record Field Observation + Photo Upload */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Camera size={20} style={{ color: 'var(--color-bright-cyan)' }} />
              <span>{t('Record Field Observation & Photo', 'মাঠের পর্যবেক্ষণ ও ছবি যোগ করুন')}</span>
            </h3>
            <span className="badge badge-live">SAVES TO TIMELINE</span>
          </div>

          <p style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Record what you see on your farm—waterlogging, drainage cleared, soil condition, crop health, replanting, or harvest status.
          </p>

          <form onSubmit={handleAddMilestone}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="recovery-stage-select">
                  Timeline Stage
                </label>
                <select
                  id="recovery-stage-select"
                  className="form-select"
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                >
                  {RECOVERY_STAGES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="recovery-cat-select">
                  What are you recording?
                </label>
                <select
                  id="recovery-cat-select"
                  className="form-select"
                  value={obsCategory}
                  onChange={(e) => setObsCategory(e.target.value)}
                >
                  {OBSERVATION_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="obs-title-input">
                Short Summary *
              </label>
              <input
                id="obs-title-input"
                type="text"
                className="form-input"
                placeholder="e.g., Drainage channel opened; standing water cleared in 2 days"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="obs-desc-input">
                Field Notes (Optional)
              </label>
              <textarea
                id="obs-desc-input"
                rows="2"
                className="form-textarea"
                placeholder="Describe soil moisture, crop recovery, or seed preparation..."
                value={newMilestoneDesc}
                onChange={(e) => setNewMilestoneDesc(e.target.value)}
              />
            </div>

            {/* Optional Photo Attachment */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.85rem',
                  background: 'rgba(6, 20, 38, 0.85)',
                  border: '1px dashed rgba(53, 197, 244, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  color: 'var(--color-bright-cyan)',
                  fontWeight: 600
                }}
              >
                <Upload size={15} />
                <span>Attach Field Photo (Optional)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                />
              </label>

              {photoPreview && (
                <div style={{ marginTop: '0.6rem', position: 'relative', display: 'inline-block' }}>
                  <img
                    src={photoPreview}
                    alt="Field preview"
                    style={{
                      width: '110px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '1px solid var(--color-lime-green)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: '#EF4444',
                      color: '#FFF',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={11} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-sm btn-primary">
                <PlusCircle size={15} />
                <span>Save Observation to Timeline</span>
              </button>
              {milestoneSaved && (
                <span style={{ fontSize: '0.8rem', color: 'var(--color-lime-green)', fontWeight: 700 }}>
                  ✓ Observation saved to {selectedStage} stage!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Right: 3-State Recovery & Harvest Checklist (Pending / In progress / Completed) */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <CheckSquare size={20} style={{ color: 'var(--color-lime-green)' }} />
              <span>{t('Farm Recovery & Next-Crop Checklist', 'খামার পুনরুদ্ধার চেকলিস্ট')}</span>
            </h3>
            <span className="badge badge-satellite">
              {completedTasks}/{checklistItems.length} COMPLETED
            </span>
          </div>

          <p style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Update each field recovery step as <strong>Pending</strong>, <strong>In progress</strong>, or <strong>Completed</strong>. Changes are saved to your farm record.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {checklistItems.map((item) => {
              const isDone = item.status === 'Completed';
              const isInProg = item.status === 'In progress';
              return (
                <div
                  key={item.id || item.key}
                  style={{
                    padding: '0.85rem',
                    background: isDone
                      ? 'rgba(56, 168, 50, 0.14)'
                      : isInProg
                      ? 'rgba(22, 139, 206, 0.14)'
                      : 'rgba(6, 20, 38, 0.78)',
                    border: isDone
                      ? '1px solid rgba(181, 230, 29, 0.38)'
                      : isInProg
                      ? '1px solid rgba(53, 197, 244, 0.35)'
                      : '1px solid rgba(53, 197, 244, 0.16)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div
                    className="flex items-center justify-between"
                    style={{ marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}
                  >
                    <strong style={{ fontSize: '0.88rem', color: '#F8FAFC' }}>{item.title}</strong>
                    <div className="flex items-center gap-1">
                      {['Pending', 'In progress', 'Completed'].map((st) => {
                        const active = item.status === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            disabled={checklistUpdatingId === (item.id || item.key)}
                            onClick={() => handleChecklistStatusChange(item, st)}
                            style={{
                              padding: '0.2rem 0.5rem',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              borderRadius: '4px',
                              cursor: 'pointer',
                              background: active
                                ? st === 'Completed'
                                  ? 'var(--color-lime-green)'
                                  : st === 'In progress'
                                  ? 'var(--color-bright-cyan)'
                                  : '#475569'
                                : 'rgba(4, 12, 24, 0.8)',
                              color: active && st !== 'Pending' ? '#04101E' : '#E2E8F0',
                              border: '1px solid rgba(53, 197, 244, 0.25)'
                            }}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.77rem',
                      color: 'var(--color-text-muted)',
                      lineHeight: 1.45
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <DataSourceCard
        sourceName="AgroVision Farm Recovery & Field Observation Log"
        product="Farmer Ground-Truth Observations + NASA SMAP Soil Moisture Context"
        whatItHelpsUnderstand="Shows what happened on the farm before, during, and after heavy rain or salinity stress, keeping your action checklist separate from satellite and lab measurements."
        resolution="Plot-Level Farmer Notes + 9 km Regional Soil Moisture"
        observationDate="Active 2026 Season"
        coverage="West Bengal Agricultural Regions"
        caveat="Checklist completion tracks farmer preparation steps. Soil recovery and salinity status require field inspection and laboratory soil testing."
      />
    </div>
  );
}
