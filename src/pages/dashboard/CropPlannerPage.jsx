import React, { useState, useEffect } from 'react';
import { useFarm } from '../../context/FarmContext';
import { cropService } from '../../services/cropService';
import DataSourceCard from '../../components/common/DataSourceCard';
import {
  Repeat,
  Droplets,
  Leaf,
  ShieldCheck,
  Sliders,
  Calendar,
  CheckCircle2
} from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function CropPlannerPage() {
  const { activeFarm, updateActiveFarmRotation, t } = useFarm();
  const [recommendations, setRecommendations] = useState([]);
  const [currentRotation, setCurrentRotation] = useState([]);
  const [appliedPlanId, setAppliedPlanId] = useState(null);

  // Simulation Sliders
  const [delayDays, setDelayDays] = useState(0);
  const [tempOffset, setTempOffset] = useState(0.0);
  const [rainOffset, setRainOffset] = useState(0);
  const [simulationResult, setSimulationResult] = useState(null);

  useEffect(() => {
    if (!activeFarm) return;

    // Normalize 12-month rotation array
    const initialRot = MONTHS.map((m, idx) => {
      if (Array.isArray(activeFarm.currentRotation) && activeFarm.currentRotation[idx]) {
        return { ...activeFarm.currentRotation[idx], month: m };
      }
      const cropFromMap = activeFarm.monthlyRotation?.[m] || 'Fallow';
      return {
        month: m,
        crop: cropFromMap,
        stage: cropFromMap === 'Fallow' ? 'Resting' : 'Active Stand'
      };
    });
    setCurrentRotation(initialRot);

    async function fetchRecs() {
      const res = await cropService.getRotationRecommendations(activeFarm.id, initialRot);
      setRecommendations(res.data || []);
    }
    fetchRecs();

    runSimulation(0, 0.0, 0);
  }, [activeFarm]);

  const runSimulation = async (delay, temp, rain) => {
    if (!activeFarm) return;
    const res = await cropService.simulateClimateScenario({
      farmId: activeFarm.id,
      sowingDelayDays: delay,
      tempOffsetCelsius: temp,
      rainfallOffsetPercent: rain
    });
    setSimulationResult(res);
  };

  const handleRotationChange = async (monthIndex, newCrop) => {
    const normalized = MONTHS.map((m, idx) => {
      const existing = currentRotation[idx];
      return existing ? { ...existing } : { month: m, crop: 'Fallow', stage: 'Resting' };
    });
    normalized[monthIndex] = {
      ...normalized[monthIndex],
      month: MONTHS[monthIndex],
      crop: newCrop,
      stage: newCrop === 'Fallow' ? 'Resting' : 'Scheduled'
    };
    setCurrentRotation(normalized);
    if (updateActiveFarmRotation) {
      updateActiveFarmRotation(normalized);
    }
    const res = await cropService.getRotationRecommendations(activeFarm.id, normalized);
    setRecommendations(res.data || []);
  };

  const handleApplyPlanToCalendar = (plan) => {
    const seqText = plan.sequence || '';
    const isCoastalPlan = seqText.includes('Khesari') || seqText.includes('Luna');
    const isMustardPlan = seqText.includes('Mustard');

    const newRot = MONTHS.map((m) => {
      if (['Jul', 'Aug', 'Sep', 'Oct'].includes(m)) {
        return { month: m, crop: 'Aman Paddy', stage: 'Kharif Stand' };
      }
      if (['Nov', 'Dec', 'Jan', 'Feb'].includes(m)) {
        const rabiCrop = isCoastalPlan ? 'Khesari' : isMustardPlan ? 'Mustard' : 'Potato';
        return { month: m, crop: rabiCrop, stage: 'Rabi Window' };
      }
      if (['Mar', 'Apr', 'May'].includes(m)) {
        return { month: m, crop: 'Moong', stage: 'Summer N-Fixation' };
      }
      return { month: m, crop: 'Fallow', stage: 'Pre-Monsoon Rest' };
    });

    setCurrentRotation(newRot);
    if (updateActiveFarmRotation) {
      updateActiveFarmRotation(newRot);
    }
    setAppliedPlanId(plan.id);
    setTimeout(() => setAppliedPlanId(null), 4000);
  };

  if (!activeFarm) {
    return (
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: '#F8FAFC' }}>
        Loading Crop Rotation & Adaptation Planner...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.35rem' }}>
        <h1 style={{ fontSize: '1.85rem', color: '#F8FAFC', marginBottom: '0.25rem' }}>
          {t('Crop Planner & 12-Month Seasonal Calendar', 'ফসল পরিকল্পনা ও ১২ মাসের ফসল ক্যালেন্ডার')}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Plan your 12-month cropping calendar using NASA rainfall and soil moisture observations and the{' '}
          <strong>West Bengal Crop Planning Calendar</strong> for{' '}
          <strong style={{ color: 'var(--color-bright-cyan)' }}>{activeFarm.name}</strong>.
        </p>
      </div>

      {/* 1. INTERACTIVE 12-MONTH CROP CALENDAR INPUT */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Calendar size={20} style={{ color: 'var(--color-bright-cyan)' }} />
            <span>Interactive 12-Month Cropping Calendar</span>
          </h3>
          <span style={{ fontSize: '0.76rem', fontFamily: 'var(--font-mono)', color: 'var(--color-lime-green)' }}>
            CLICK ANY MONTH TO ADJUST CROP
          </span>
        </div>

        <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', marginBottom: '1.15rem' }}>
          Select the standing crop for each month (`Jan–Dec`). Changes immediately update your farm profile and recalculate water-use and nitrogen-restoration scores.
        </p>

        {/* 12-Month Calendar Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
            gap: '0.6rem',
            paddingBottom: '0.5rem'
          }}
        >
          {MONTHS.map((m, idx) => {
            const currentItem = currentRotation[idx] || { month: m, crop: 'Fallow' };
            const cropName = currentItem.crop || 'Fallow';
            const isRice = cropName.includes('Paddy') || cropName.includes('Rice');
            const isPotato = cropName.includes('Potato');
            const isOilseed = cropName.includes('Mustard') || cropName.includes('Sesame');
            const isLegume =
              cropName.includes('Moong') ||
              cropName.includes('Pea') ||
              cropName.includes('Khesari') ||
              cropName.includes('Lentil');

            let cardBg = 'rgba(6, 20, 38, 0.78)';
            let borderColor = 'rgba(53, 197, 244, 0.2)';
            let badgeColor = '#94A3B8';
            if (isRice) {
              cardBg = 'rgba(22, 139, 206, 0.18)';
              borderColor = '#35C5F4';
              badgeColor = '#35C5F4';
            } else if (isPotato) {
              cardBg = 'rgba(245, 158, 11, 0.16)';
              borderColor = '#F59E0B';
              badgeColor = '#FBBF24';
            } else if (isOilseed) {
              cardBg = 'rgba(181, 230, 29, 0.16)';
              borderColor = '#B5E61D';
              badgeColor = '#B5E61D';
            } else if (isLegume) {
              cardBg = 'rgba(56, 168, 50, 0.22)';
              borderColor = '#4ADE80';
              badgeColor = '#4ADE80';
            }

            return (
              <div
                key={m}
                style={{
                  background: cardBg,
                  border: `1.5px solid ${borderColor}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.6rem 0.45rem',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    fontSize: '0.76rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: badgeColor,
                    marginBottom: '0.35rem'
                  }}
                >
                  {m}
                </div>
                <select
                  aria-label={`Select crop for ${m}`}
                  value={cropName}
                  onChange={(e) => handleRotationChange(idx, e.target.value)}
                  style={{
                    width: '100%',
                    fontSize: '0.73rem',
                    padding: '0.28rem 0.2rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(53, 197, 244, 0.3)',
                    background: '#061426',
                    fontWeight: 600,
                    color: '#F8FAFC',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Aman Paddy">Aman Paddy</option>
                  <option value="Boro Paddy">Boro Paddy</option>
                  <option value="Potato">Potato</option>
                  <option value="Mustard">Mustard</option>
                  <option value="Moong">Moong</option>
                  <option value="Sesame">Sesame</option>
                  <option value="Jute">Jute</option>
                  <option value="Khesari">Khesari</option>
                  <option value="Fallow">Fallow / Rest</option>
                </select>
                <div
                  style={{
                    fontSize: '0.66rem',
                    color: 'var(--color-text-muted)',
                    marginTop: '0.35rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {currentItem.stage || 'Standing'}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="flex items-center gap-4"
          style={{
            marginTop: '0.9rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(53, 197, 244, 0.16)',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            flexWrap: 'wrap'
          }}
        >
          <span className="flex items-center gap-1">
            <span style={{ width: 10, height: 10, background: '#35C5F4', borderRadius: 2 }} /> Cereals (Aman/Boro Paddy)
          </span>
          <span className="flex items-center gap-1">
            <span style={{ width: 10, height: 10, background: '#F59E0B', borderRadius: 2 }} /> Tubers (Potato)
          </span>
          <span className="flex items-center gap-1">
            <span style={{ width: 10, height: 10, background: '#B5E61D', borderRadius: 2 }} /> Oilseeds (Mustard/Sesame)
          </span>
          <span className="flex items-center gap-1">
            <span style={{ width: 10, height: 10, background: '#4ADE80', borderRadius: 2 }} /> N-Fixing Legumes (Moong/Khesari)
          </span>
        </div>
      </div>

      {/* 2. ALTERNATIVE CROP ROTATION PLANS */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}
        >
          <div>
            <h2 style={{ fontSize: '1.4rem', color: '#F8FAFC', marginBottom: '0.2rem' }}>
              Recommended Multi-Season Crop Rotation Plans
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.86rem', margin: 0 }}>
              Scientifically ranked for water-demand reduction, biological nitrogen fixation, and pest-cycle disruption.
            </p>
          </div>
          <span className="badge badge-live">{recommendations.length} FEASIBLE CYCLES</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {recommendations.map((plan, idx) => (
            <div
              key={plan.id || idx}
              className="card"
              style={{
                borderLeft:
                  idx === 0
                    ? '4px solid var(--color-lime-green)'
                    : '4px solid var(--color-bright-cyan)'
              }}
            >
              {/* Plan Header */}
              <div
                className="flex items-center justify-between"
                style={{ marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.65rem' }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: idx === 0 ? 'var(--color-lime-green)' : 'var(--color-bright-cyan)',
                      letterSpacing: '0.06em'
                    }}
                  >
                    OPTION 0{idx + 1} • {idx === 0 ? 'PRIMARY RECOMMENDED' : 'ALTERNATIVE STRATEGY'}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', color: '#F8FAFC', marginTop: '0.15rem', marginBottom: 0 }}>
                    {plan.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                  <div
                    style={{
                      padding: '0.38rem 0.8rem',
                      background: 'rgba(6, 20, 38, 0.9)',
                      border: '1px solid rgba(53, 197, 244, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      color: 'var(--color-lime-green)'
                    }}
                  >
                    {plan.sequence}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyPlanToCalendar(plan)}
                    className="btn btn-xs btn-primary"
                  >
                    <CheckCircle2 size={13} />
                    <span>
                      {appliedPlanId === plan.id ? 'Applied to Calendar!' : 'Apply to Calendar'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Timing Timeline */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '0.6rem',
                  marginBottom: '1.1rem'
                }}
              >
                {(plan.timing || []).map((tItem, tIdx) => (
                  <div
                    key={tIdx}
                    style={{
                      padding: '0.65rem 0.8rem',
                      background: 'rgba(6, 20, 38, 0.8)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(53, 197, 244, 0.18)'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-bright-cyan)',
                        fontWeight: 700
                      }}
                    >
                      {tItem.window} ({tItem.duration})
                    </div>
                    <strong style={{ fontSize: '0.88rem', color: '#F8FAFC', display: 'block', marginTop: '2px' }}>
                      {tItem.crop}
                    </strong>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      {tItem.type}
                    </div>
                  </div>
                ))}
              </div>

              {/* EXPLAINABILITY CARDS (WHY THIS IS BETTER) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '0.9rem',
                  marginBottom: '0.9rem'
                }}
              >
                {/* 1. Water Demand Reduction */}
                <div
                  style={{
                    padding: '0.85rem',
                    background: 'rgba(22, 139, 206, 0.1)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(53, 197, 244, 0.25)'
                  }}
                >
                  <div
                    className="flex items-center gap-2"
                    style={{
                      fontWeight: 700,
                      color: 'var(--color-bright-cyan)',
                      fontSize: '0.83rem',
                      marginBottom: '0.35rem'
                    }}
                  >
                    <Droplets size={15} />
                    <span>Water Conservation Impact</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#E2E8F0', lineHeight: 1.5 }}>
                    <strong>{plan.waterBalance?.estimatedSavings}</strong>.{' '}
                    {plan.waterBalance?.groundwaterImpact}.
                  </p>
                </div>

                {/* 2. Soil Health & Nitrogen Restoring */}
                <div
                  style={{
                    padding: '0.85rem',
                    background: 'rgba(56, 168, 50, 0.12)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(181, 230, 29, 0.28)'
                  }}
                >
                  <div
                    className="flex items-center gap-2"
                    style={{
                      fontWeight: 700,
                      color: 'var(--color-lime-green)',
                      fontSize: '0.83rem',
                      marginBottom: '0.35rem'
                    }}
                  >
                    <Leaf size={15} />
                    <span>Soil Nitrogen & Organic Carbon</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#E2E8F0', lineHeight: 1.5 }}>
                    <strong>{plan.soilBenefit?.nitrogenContribution}</strong>.{' '}
                    {plan.soilBenefit?.organicCarbon}.
                  </p>
                </div>

                {/* 3. Pest & Disease Break */}
                <div
                  style={{
                    padding: '0.85rem',
                    background: 'rgba(6, 20, 38, 0.8)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(53, 197, 244, 0.2)'
                  }}
                >
                  <div
                    className="flex items-center gap-2"
                    style={{
                      fontWeight: 700,
                      color: '#F8FAFC',
                      fontSize: '0.83rem',
                      marginBottom: '0.35rem'
                    }}
                  >
                    <ShieldCheck size={15} style={{ color: 'var(--color-bright-cyan)' }} />
                    <span>Pathogen & Pest Cycle Break</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#E2E8F0', lineHeight: 1.5 }}>
                    {plan.pestCycleBreak}
                  </p>
                </div>
              </div>

              {/* Realistic Limitations Warning */}
              <div
                style={{
                  padding: '0.55rem 0.85rem',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  color: '#FDE68A'
                }}
              >
                <strong>Agronomic Caveat:</strong> {plan.limitations}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CLIMATE SCENARIO SIMULATOR ("WHAT-IF") */}
      <div
        className="card"
        style={{
          marginBottom: '1.75rem',
          background:
            'linear-gradient(135deg, rgba(11, 31, 58, 0.96) 0%, rgba(6, 20, 38, 0.98) 100%)',
          border: '1px solid rgba(53, 197, 244, 0.35)'
        }}
      >
        <div className="card-header">
          <h3 className="card-title" style={{ color: '#F8FAFC' }}>
            <Sliders size={20} style={{ color: 'var(--color-bright-cyan)' }} />
            <span>Interactive Climate Stress Simulator ("What-If" Analysis)</span>
          </h3>
          <span className="badge badge-satellite">SENSITIVITY MODEL</span>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.35rem' }}>
          Adjust sowing delay, rainfall anomaly, or temperature shift to test how your planned crop sequence responds to climate perturbations.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.75rem',
            marginBottom: '1.35rem'
          }}
        >
          {/* Slider 1: Sowing Delay */}
          <div>
            <div className="flex justify-between" style={{ marginBottom: '0.45rem', fontSize: '0.84rem' }}>
              <label htmlFor="sim-delay-slider" style={{ color: '#E2E8F0' }}>
                Sowing Delay:
              </label>
              <strong style={{ color: 'var(--color-lime-green)', fontFamily: 'var(--font-mono)' }}>
                {delayDays} Days
              </strong>
            </div>
            <input
              id="sim-delay-slider"
              type="range"
              min="0"
              max="30"
              step="5"
              value={delayDays}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setDelayDays(val);
                runSimulation(val, tempOffset, rainOffset);
              }}
              style={{ width: '100%', accentColor: 'var(--color-lime-green)', cursor: 'pointer' }}
            />
            <div
              className="flex justify-between"
              style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}
            >
              <span>On Time (0d)</span>
              <span>15 Days</span>
              <span>Late (30d)</span>
            </div>
          </div>

          {/* Slider 2: Seasonal Rainfall Offset */}
          <div>
            <div className="flex justify-between" style={{ marginBottom: '0.45rem', fontSize: '0.84rem' }}>
              <label htmlFor="sim-rain-slider" style={{ color: '#E2E8F0' }}>
                Rainfall Difference from Usual:
              </label>
              <strong style={{ color: 'var(--color-bright-cyan)', fontFamily: 'var(--font-mono)' }}>
                {rainOffset > 0 ? `+${rainOffset}` : rainOffset}%
              </strong>
            </div>
            <input
              id="sim-rain-slider"
              type="range"
              min="-40"
              max="40"
              step="10"
              value={rainOffset}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setRainOffset(val);
                runSimulation(delayDays, tempOffset, val);
              }}
              style={{ width: '100%', accentColor: 'var(--color-bright-cyan)', cursor: 'pointer' }}
            />
            <div
              className="flex justify-between"
              style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}
            >
              <span>Less Rain (-40%)</span>
              <span>Normal (0%)</span>
              <span>More Rain (+40%)</span>
            </div>
          </div>

          {/* Slider 3: Temperature Offset */}
          <div>
            <div className="flex justify-between" style={{ marginBottom: '0.45rem', fontSize: '0.84rem' }}>
              <label htmlFor="sim-temp-slider" style={{ color: '#E2E8F0' }}>
                Temperature Change:
              </label>
              <strong style={{ color: '#F97316', fontFamily: 'var(--font-mono)' }}>
                {tempOffset > 0 ? `+${tempOffset}` : tempOffset}°C
              </strong>
            </div>
            <input
              id="sim-temp-slider"
              type="range"
              min="-1.5"
              max="3.0"
              step="0.5"
              value={tempOffset}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setTempOffset(val);
                runSimulation(delayDays, val, rainOffset);
              }}
              style={{ width: '100%', accentColor: '#F97316', cursor: 'pointer' }}
            />
            <div
              className="flex justify-between"
              style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}
            >
              <span>Cooler (-1.5°C)</span>
              <span>Normal</span>
              <span>Warmer (+3.0°C)</span>
            </div>
          </div>
        </div>

        {/* Simulation Output Card */}
        {simulationResult && (
          <div
            style={{
              background: 'rgba(6, 20, 38, 0.88)',
              borderRadius: 'var(--radius-md)',
              padding: '1.15rem',
              border: '1px solid rgba(53, 197, 244, 0.3)'
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}
            >
              <strong style={{ color: 'var(--color-bright-cyan)', fontSize: '0.95rem' }}>
                {simulationResult.scenarioLabel}
              </strong>
              <span
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  background:
                    simulationResult.vulnerabilityIndex > 50
                      ? 'rgba(239, 68, 68, 0.25)'
                      : 'rgba(56, 168, 50, 0.25)',
                  color:
                    simulationResult.vulnerabilityIndex > 50
                      ? '#FCA5A5'
                      : 'var(--color-lime-green)',
                  border: `1px solid ${
                    simulationResult.vulnerabilityIndex > 50
                      ? 'rgba(239, 68, 68, 0.5)'
                      : 'rgba(181, 230, 29, 0.4)'
                  }`
                }}
              >
                Weather Stress Level: {simulationResult.vulnerabilityIndex} / 100
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                fontSize: '0.82rem'
              }}
            >
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Harvest Timing Impact:</span>
                <div style={{ marginTop: '0.2rem', color: '#F8FAFC', fontWeight: 600 }}>
                  {simulationResult.harvestWindowVerdict}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Water & Irrigation Impact:</span>
                <div style={{ marginTop: '0.2rem', color: '#F8FAFC', fontWeight: 600 }}>
                  {simulationResult.waterStressVerdict}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(53, 197, 244, 0.16)',
                fontSize: '0.82rem',
                color: 'var(--color-lime-green)'
              }}
            >
              <strong>Recommended Action:</strong> {simulationResult.suggestedAdjustment}
            </div>
          </div>
        )}
      </div>

      <DataSourceCard
        sourceName="West Bengal Crop Planning Calendar & NASA Weather Patterns"
        product="Seasonal Crop Calendar + NASA POWER Climatology"
        whatItHelpsUnderstand="Shows which crop sequences save irrigation water, restore soil nitrogen with pulses, and avoid pest buildup."
        resolution="District & Agro-Climatic Zone Reference"
        observationDate="2026 Cropping Cycle"
        coverage="West Bengal Gangetic, Coastal & Lateritic Zones"
        caveat="Rotation plans evaluate water savings, nitrogen restoration, and pest breaks. Check seed availability at your local Block Seed Store before sowing."
      />
    </div>
  );
}
