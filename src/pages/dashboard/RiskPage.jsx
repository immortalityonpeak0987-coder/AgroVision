import React, { useState, useEffect } from 'react';
import { useFarm } from '../../context/FarmContext';
import { riskService } from '../../services/riskService';
import { soilService } from '../../services/soilService';
import { recoveryService } from '../../services/recoveryService';
import DataSourceCard from '../../components/common/DataSourceCard';
import {
  AlertTriangle,
  Camera,
  Upload,
  X,
  CheckCircle2,
  FlaskConical,
  Sparkles
} from 'lucide-react';

export default function RiskPage() {
  const { activeFarm, t, experienceMode } = useFarm();
  const [riskData, setRiskData] = useState(null);
  const [soilData, setSoilData] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoNote, setPhotoNote] = useState('');
  const [photoType, setPhotoType] = useState('Field Drainage & Emergence');
  const [photoSubmitted, setPhotoSubmitted] = useState(false);
  const [photoError, setPhotoError] = useState('');

  // Mode toggle inside Soil section: 'simulation' ("Try a Soil Test") vs 'verified' ("Submit Official Lab Card")
  const [soilEntryMode, setSoilEntryMode] = useState('simulation');

  // Soil Test form state (supports Soil pH, Soil salinity EC, Nitrogen, Phosphorus, Potassium)
  const [labForm, setLabForm] = useState({
    testDate: new Date().toISOString().split('T')[0],
    labName: 'District Krishi Vigyan Kendra (KVK) Soil Lab',
    ph: '6.5',
    ec: '0.85',
    nitrogenKgHa: '220',
    phosphorusKgHa: '25',
    potassiumKgHa: '200',
    organicCarbonPct: '0.68'
  });
  const [labSubmitted, setLabSubmitted] = useState(false);
  const [labError, setLabError] = useState('');
  const [simExplanation, setSimExplanation] = useState(null);

  const loadRiskAndSoil = async (farm) => {
    if (!farm) return;
    try {
      const [rRes, sRes] = await Promise.all([
        riskService.getRiskAssessment(farm.id),
        soilService.getSoilData(farm.id)
      ]);
      setRiskData(rRes.data);
      setSoilData(sRes.data);
      const lt = sRes.data?.labTest || sRes.data?.latestLabTest;
      if (lt) {
        setLabForm((prev) => ({
          ...prev,
          ph: String(lt.ph ?? '6.5'),
          ec: String(lt.ecDsM ?? lt.electricalConductivity ?? '0.85'),
          nitrogenKgHa: String(lt.availableNitrogenKgHa ?? '220'),
          phosphorusKgHa: String(lt.availablePhosphorusKgHa ?? '25'),
          potassiumKgHa: String(lt.availablePotassiumKgHa ?? '200'),
          organicCarbonPct: String(lt.organicCarbonPercent ?? lt.organicCarbonPct ?? '0.68')
        }));
      }
    } catch (err) {
      console.error('Failed to load risk data:', err);
    }
  };

  useEffect(() => {
    loadRiskAndSoil(activeFarm);
  }, [activeFarm]);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreview(objectUrl);
      setPhotoError('');
    }
  };

  const handleClearPhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
  };

  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    if (!photoNote.trim()) {
      setPhotoError('Please enter field observation notes before logging evidence.');
      return;
    }
    setPhotoError('');
    try {
      await recoveryService.logFieldObservation(activeFarm.id, {
        title: `${photoType} — Ground Truth Log`,
        description: photoNote.trim(),
        type: 'Farmer Observation',
        phase: 'CURRENT'
      });
      setPhotoSubmitted(true);
      setPhotoNote('');
      setTimeout(() => setPhotoSubmitted(false), 4500);
    } catch (err) {
      setPhotoError(err.message || 'Could not save field observation.');
    }
  };

  const buildPlainLanguageSoilBreakdown = (formVals) => {
    const phVal = parseFloat(formVals.ph);
    const ecVal = parseFloat(formVals.ec);
    const nVal = parseFloat(formVals.nitrogenKgHa);
    const pVal = parseFloat(formVals.phosphorusKgHa);
    const kVal = parseFloat(formVals.potassiumKgHa);

    const missingFields = [];
    if (Number.isNaN(nVal)) missingFields.push('Nitrogen (N)');
    if (Number.isNaN(pVal)) missingFields.push('Phosphorus (P)');
    if (Number.isNaN(kVal)) missingFields.push('Potassium (K)');

    const phMeaning =
      phVal < 5.5
        ? 'Acidic soil — may limit phosphorus uptake; consider agricultural lime or organic compost.'
        : phVal > 7.5
        ? 'Slightly alkaline soil — common in coastal areas; avoid excess chemical urea.'
        : 'Balanced neutral pH (5.5–7.5) — ideal for rice, potato, mustard, and pulses.';

    const ecMeaning =
      ecVal >= 4.0
        ? 'High salt level in soil (EC ≥ 4.0 dS/m) — sensitive crops like potato or Boro rice may fail. Grow salt-tolerant pulses (Khesari/Moong) and keep paddy straw mulch on the soil.'
        : ecVal >= 2.0
        ? 'Mild salinity (EC 2.0–4.0 dS/m) — avoid heavy groundwater pumping; choose Mustard or tolerant pulses.'
        : 'Low salt / sweet soil (EC < 2.0 dS/m) — safe for all standard winter crops including potato, mustard, and vegetables.';

    const nMeaning = Number.isNaN(nVal)
      ? 'Not provided — Nitrogen level is needed to decide urea/compost dose.'
      : nVal < 280
      ? `Low Nitrogen (${nVal} kg/ha) — include a legume/pulse crop (Moong, Lentil, Khesari) in rotation to naturally add nitrogen to the soil.`
      : nVal <= 560
      ? `Medium Nitrogen (${nVal} kg/ha) — good baseline fertility.`
      : `High Nitrogen (${nVal} kg/ha) — reduce nitrogen fertilizer to prevent crop lodging.`;

    const pkMeaning =
      Number.isNaN(pVal) || Number.isNaN(kVal)
        ? 'Phosphorus or Potassium value not entered — regional baseline will be used until lab results are added.'
        : `Phosphorus (${pVal} kg/ha) supports root growth; Potassium (${kVal} kg/ha) helps crops resist drought and disease.`;

    return {
      phMeaning,
      ecMeaning,
      nMeaning,
      pkMeaning,
      missingFields,
      isSimulation: soilEntryMode === 'simulation'
    };
  };

  const handleLabSubmit = async (e) => {
    e.preventDefault();
    const phNum = parseFloat(labForm.ph);
    const ecNum = parseFloat(labForm.ec);
    if (Number.isNaN(phNum) || phNum < 3.0 || phNum > 10.5) {
      setLabError('Soil pH must be a valid number between 3.0 and 10.5.');
      return;
    }
    if (Number.isNaN(ecNum) || ecNum < 0 || ecNum > 30) {
      setLabError('Soil salinity (EC) must be between 0.0 and 30.0 dS/m.');
      return;
    }
    setLabError('');
    const breakdown = buildPlainLanguageSoilBreakdown(labForm);
    setSimExplanation(breakdown);

    try {
      await soilService.submitLabTest(activeFarm.id, {
        ph: phNum,
        ecDsM: ecNum,
        nitrogenKgHa: parseFloat(labForm.nitrogenKgHa) || 220,
        phosphorusKgHa: parseFloat(labForm.phosphorusKgHa) || 25,
        potassiumKgHa: parseFloat(labForm.potassiumKgHa) || 200,
        organicCarbonPct: parseFloat(labForm.organicCarbonPct) || 0.65,
        labName: labForm.labName,
        testDate: labForm.testDate,
        isSimulation: soilEntryMode === 'simulation'
      });
      await loadRiskAndSoil(activeFarm);
      setLabSubmitted(true);
      setTimeout(() => setLabSubmitted(false), 4500);
    } catch (err) {
      setLabError(err.message || 'Failed to evaluate soil test.');
    }
  };

  if (!activeFarm || !riskData) {
    return (
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: '#F8FAFC' }}>
        Checking Farm Weather, Soil & Salinity Risks...
      </div>
    );
  }

  const isCoastal = activeFarm.district.includes('24 Parganas');
  const labTest = soilData?.labTest || soilData?.latestLabTest || {};
  const ecValue = Number(labTest.ecDsM ?? labTest.electricalConductivity ?? (isCoastal ? 4.8 : 0.85));
  const phValue = Number(labTest.ph ?? (isCoastal ? 7.6 : 6.4));
  const isFarmer = experienceMode === 'farmer';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.35rem' }}>
        <h1 style={{ fontSize: '1.85rem', color: '#F8FAFC', marginBottom: '0.25rem' }}>
          {isFarmer
            ? t('Farm Risk Check & Try a Soil Test', 'খামারের ঝুঁকি ও মাটি পরীক্ষা')
            : t(
                'Multi-Hazard Risk Screening & Soil Chemistry Lab',
                'বহুমুখী ঝুঁকি মূল্যায়ন ও মাটি পরীক্ষাগার'
              )}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
          {isFarmer
            ? `Check waterlogging, heat, and soil salinity risks for ${activeFarm.name}, and try sample soil test numbers to see what they mean for your next crop.`
            : `Explainable screening for waterlogging, coastal salinity (EC), heat stress, and laboratory N-P-K soil chemistry for ${activeFarm.name} (${activeFarm.district}).`}
        </p>
      </div>

      {/* RISK SUMMARY ALERT */}
      <div
        className={`alert-strip ${
          isCoastal || ecValue >= 4.0 ? 'alert-strip-warning' : 'alert-strip-info'
        }`}
        style={{ marginBottom: '1.5rem' }}
      >
        <AlertTriangle size={20} style={{ flexShrink: 0 }} />
        <div>
          <strong>Overall Farm Risk Level: {riskData.overallRiskLevel}</strong>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem' }}>
            {isCoastal || ecValue >= 4.0
              ? `High Soil Salinity (EC = ${ecValue} dS/m): Dry-season salt rise can harm sensitive winter crops. Grow salt-tolerant pulses (Khesari / Moong) and keep paddy straw mulch on the field.`
              : `Normal Non-Saline Soil (EC = ${ecValue} dS/m): Salt risk is low. Focus on saving winter soil moisture and rotating rice with pulses or oilseeds.`}
          </p>
        </div>
      </div>

      {/* EXPLAINABLE RISK FACTORS BREAKDOWN */}
      <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '1.5rem' }}>
        {(riskData.riskFactors || []).map((rf, idx) => {
          const isHigh = rf.level?.includes('High') || rf.level?.includes('Severe');
          const isMod = rf.level?.includes('Moderate');
          const badgeColor = isHigh ? '#F87171' : isMod ? '#FBBF24' : 'var(--color-lime-green)';

          return (
            <div
              key={idx}
              className="card"
              style={{
                borderLeft: `4px solid ${
                  isHigh ? '#EF4444' : isMod ? '#F59E0B' : 'var(--color-lime-green)'
                }`
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '1.05rem', color: '#F8FAFC' }}>{rf.category}</strong>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    background: 'rgba(6, 20, 38, 0.85)',
                    color: badgeColor,
                    border: `1px solid ${badgeColor}`
                  }}
                >
                  {rf.level}
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', marginBottom: '0.65rem' }}>
                <strong>What we noticed:</strong> {rf.indicator}
              </p>
              <div
                style={{
                  padding: '0.6rem 0.8rem',
                  background: 'rgba(6, 20, 38, 0.78)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(53, 197, 244, 0.16)',
                  fontSize: '0.8rem',
                  color: 'var(--color-bright-cyan)'
                }}
              >
                <strong>What you can do:</strong> {rf.recommendation}
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION 11: "TRY A SOIL TEST" & LAB RECORD ENTRY */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Left: Current Soil Status & Plain-Language Explanation */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FlaskConical size={20} style={{ color: 'var(--color-bright-cyan)' }} />
              <span>Current Soil Health & Salinity Summary</span>
            </h3>
            <span className={`badge ${labTest.isSimulation ? 'badge-demo' : 'badge-live'}`}>
              {labTest.isSimulation
                ? 'SAMPLE SIMULATION'
                : labTest.isVerifiedLab
                ? 'VERIFIED LAB RECORD'
                : 'REGIONAL BASELINE'}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}
          >
            <div
              style={{
                padding: '0.8rem',
                background: 'rgba(6, 20, 38, 0.8)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(53, 197, 244, 0.2)'
              }}
            >
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.74rem' }}>
                Soil Salinity (EC)
              </span>
              <div
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  color: ecValue >= 4.0 ? '#F87171' : 'var(--color-lime-green)',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {ecValue} dS/m
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: ecValue >= 4.0 ? '#FBBF24' : 'var(--color-lime-green)'
                }}
              >
                {ecValue >= 4.0 ? '⚠ High salt (Needs tolerant crops)' : '✓ Low salt (Safe for most crops)'}
              </span>
            </div>

            <div
              style={{
                padding: '0.8rem',
                background: 'rgba(6, 20, 38, 0.8)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(53, 197, 244, 0.2)'
              }}
            >
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.74rem' }}>
                Soil pH (Acidity / Alkalinity)
              </span>
              <div
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  color: '#F8FAFC',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {phValue}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-bright-cyan)' }}>
                {phValue > 7.4 ? 'Slightly Alkaline' : phValue < 5.8 ? 'Slightly Acidic' : 'Balanced Neutral'}
              </span>
            </div>
          </div>

          <div
            style={{
              padding: '0.75rem 0.9rem',
              background: 'rgba(6, 20, 38, 0.72)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(53, 197, 244, 0.16)',
              fontSize: '0.8rem',
              color: '#E2E8F0',
              marginBottom: '0.85rem'
            }}
          >
            <div style={{ marginBottom: '0.3rem' }}>
              <strong>Nutrients (N - P - K):</strong>{' '}
              Nitrogen: {labTest.availableNitrogenKgHa ?? 220} kg/ha • Phosphorus:{' '}
              {labTest.availablePhosphorusKgHa ?? 25} kg/ha • Potassium:{' '}
              {labTest.availablePotassiumKgHa ?? 200} kg/ha
            </div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.76rem' }}>
              Source: {labTest.labName || 'Regional Soil Baseline'} ({labTest.testedBy || 'Demo Record'})
            </div>
          </div>

          {/* Plain-language explanation card when user runs "Try a Soil Test" */}
          {simExplanation && (
            <div
              style={{
                padding: '0.85rem',
                background: 'rgba(22, 139, 206, 0.14)',
                border: '1px solid rgba(53, 197, 244, 0.35)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.79rem',
                color: '#F8FAFC',
                marginBottom: '0.85rem'
              }}
            >
              <div
                className="flex items-center justify-between"
                style={{ marginBottom: '0.4rem', color: 'var(--color-lime-green)', fontWeight: 700 }}
              >
                <span>What Your Soil Numbers Mean:</span>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
                  {simExplanation.isSimulation ? 'SIMULATION PREVIEW' : 'SAVED LAB RECORD'}
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', lineHeight: 1.55, color: '#E2E8F0' }}>
                <li>
                  <strong>Soil pH:</strong> {simExplanation.phMeaning}
                </li>
                <li>
                  <strong>Salinity (EC):</strong> {simExplanation.ecMeaning}
                </li>
                <li>
                  <strong>Nitrogen (N):</strong> {simExplanation.nMeaning}
                </li>
                <li>
                  <strong>Phosphorus & Potassium (P & K):</strong> {simExplanation.pkMeaning}
                </li>
              </ul>
              {simExplanation.missingFields.length > 0 && (
                <div style={{ marginTop: '0.45rem', color: '#FBBF24', fontSize: '0.75rem' }}>
                  <strong>Missing information:</strong> {simExplanation.missingFields.join(', ')}. Get a soil health card from your local block soil lab for complete fertilizer guidance.
                </div>
              )}
            </div>
          )}

          <div
            style={{
              fontSize: '0.75rem',
              color: '#FBBF24',
              fontWeight: 600,
              lineHeight: 1.45
            }}
          >
            * Important: Satellites in space cannot measure soil pH, salt (EC), or N-P-K nutrients directly. Use the tool on the right to try sample values or save your real soil test card.
          </div>
        </div>

        {/* Right: "Try a Soil Test" (Simulation) & Verified Lab Entry */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: '0.75rem' }}>
            <h3 className="card-title">
              <Sparkles size={20} style={{ color: 'var(--color-lime-green)' }} />
              <span>{t('Try a Soil Test', 'মাটি পরীক্ষা করে দেখুন')}</span>
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSoilEntryMode('simulation')}
                style={{
                  padding: '0.22rem 0.55rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background:
                    soilEntryMode === 'simulation' ? 'var(--color-lime-green)' : 'rgba(6, 20, 38, 0.8)',
                  color: soilEntryMode === 'simulation' ? '#04101E' : '#CBD5E1',
                  border: '1px solid rgba(181, 230, 29, 0.35)'
                }}
              >
                Sample Simulation
              </button>
              <button
                type="button"
                onClick={() => setSoilEntryMode('verified')}
                style={{
                  padding: '0.22rem 0.55rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background:
                    soilEntryMode === 'verified' ? 'var(--color-bright-cyan)' : 'rgba(6, 20, 38, 0.8)',
                  color: soilEntryMode === 'verified' ? '#04101E' : '#CBD5E1',
                  border: '1px solid rgba(53, 197, 244, 0.35)'
                }}
              >
                Verified Lab Report
              </button>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.9rem' }}>
            {soilEntryMode === 'simulation'
              ? 'Enter sample numbers below to see what each value means and how it changes your farm risk—kept separate from official lab records.'
              : 'Enter values from your official Block / KVK Soil Health Card to permanently log a verified soil test.'}
          </p>

          <form onSubmit={handleLabSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: '0.4rem' }}>
                <label className="form-label" htmlFor="soil-ph-input">
                  Soil pH (3.0 – 10.5)
                </label>
                <input
                  id="soil-ph-input"
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={labForm.ph}
                  onChange={(e) => setLabForm({ ...labForm, ph: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.4rem' }}>
                <label className="form-label" htmlFor="soil-ec-input">
                  Soil Salinity EC (dS/m)
                </label>
                <input
                  id="soil-ec-input"
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={labForm.ec}
                  onChange={(e) => setLabForm({ ...labForm, ec: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.4rem' }}>
                <label className="form-label" htmlFor="soil-n-input">
                  Nitrogen — N (kg/ha)
                </label>
                <input
                  id="soil-n-input"
                  type="number"
                  step="5"
                  className="form-input"
                  placeholder="e.g., 220"
                  value={labForm.nitrogenKgHa}
                  onChange={(e) => setLabForm({ ...labForm, nitrogenKgHa: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.4rem' }}>
                <label className="form-label" htmlFor="soil-p-input">
                  Phosphorus — P (kg/ha)
                </label>
                <input
                  id="soil-p-input"
                  type="number"
                  step="1"
                  className="form-input"
                  placeholder="e.g., 25"
                  value={labForm.phosphorusKgHa}
                  onChange={(e) => setLabForm({ ...labForm, phosphorusKgHa: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.4rem' }}>
                <label className="form-label" htmlFor="soil-k-input">
                  Potassium — K (kg/ha)
                </label>
                <input
                  id="soil-k-input"
                  type="number"
                  step="5"
                  className="form-input"
                  placeholder="e.g., 200"
                  value={labForm.potassiumKgHa}
                  onChange={(e) => setLabForm({ ...labForm, potassiumKgHa: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.4rem' }}>
                <label className="form-label" htmlFor="soil-oc-input">
                  Organic Carbon (%)
                </label>
                <input
                  id="soil-oc-input"
                  type="number"
                  step="0.05"
                  className="form-input"
                  value={labForm.organicCarbonPct}
                  onChange={(e) => setLabForm({ ...labForm, organicCarbonPct: e.target.value })}
                />
              </div>
            </div>

            {labError && (
              <div style={{ color: '#F87171', fontSize: '0.78rem', marginTop: '0.4rem' }}>
                {labError}
              </div>
            )}

            <div
              className="flex items-center justify-between"
              style={{ marginTop: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}
            >
              <button type="submit" className="btn btn-sm btn-primary">
                <FlaskConical size={15} />
                <span>
                  {soilEntryMode === 'simulation'
                    ? 'Test Sample Values & Explain'
                    : 'Save Verified Lab Report'}
                </span>
              </button>

              {labSubmitted && (
                <span style={{ color: 'var(--color-lime-green)', fontWeight: 700, fontSize: '0.8rem' }}>
                  ✓ {soilEntryMode === 'simulation' ? 'Sample simulation evaluated!' : 'Verified lab report saved!'}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* GROUND TRUTH EVIDENCE: FIELD PHOTO UPLOAD & OBSERVATION LOG */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Camera size={20} style={{ color: 'var(--color-lime-green)' }} />
            <span>Field Observation & Photo Logger</span>
          </h3>
          <span className="badge badge-satellite">SAVES TO RECOVERY TIMELINE</span>
        </div>

        <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          Record what you see on your field (standing water, white salt crust, or healthy seedling emergence) and attach a photo.
        </p>

        <form onSubmit={handlePhotoSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              alignItems: 'start'
            }}
          >
            <div>
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.75rem 1rem',
                  border: '2px dashed rgba(53, 197, 244, 0.35)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  background: 'rgba(6, 20, 38, 0.72)'
                }}
              >
                <Upload size={28} style={{ color: 'var(--color-bright-cyan)', marginBottom: '0.5rem' }} />
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#F8FAFC' }}>
                  Attach Field Photograph (Optional)
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                  PNG, JPG, or WEBP (Max 5MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
              </label>

              {photoPreview && (
                <div style={{ marginTop: '0.75rem', position: 'relative', display: 'inline-block' }}>
                  <img
                    src={photoPreview}
                    alt="Uploaded field condition"
                    style={{
                      width: '120px',
                      height: '90px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-bright-cyan)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleClearPhoto}
                    aria-label="Remove uploaded photo"
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: 'var(--color-danger)',
                      color: '#FFFFFF',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            <div>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label" htmlFor="obs-category-select">
                  Observation Category
                </label>
                <select
                  id="obs-category-select"
                  className="form-select"
                  value={photoType}
                  onChange={(e) => setPhotoType(e.target.value)}
                >
                  <option value="Field Drainage & Emergence">Field Drainage & Emergence</option>
                  <option value="Salinity / White Crust Check">Salinity / White Crust Check</option>
                  <option value="Canopy Stress / Pest Check">Canopy Stress / Pest Check</option>
                  <option value="Harvest Readiness">Harvest Readiness</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label" htmlFor="obs-notes-textarea">
                  Field Observation Notes
                </label>
                <textarea
                  id="obs-notes-textarea"
                  className="form-textarea"
                  rows="3"
                  placeholder="e.g., Perimeter drainage channels cleared; soil moisture ready for winter pulse/mustard sowing."
                  value={photoNote}
                  onChange={(e) => setPhotoNote(e.target.value)}
                />
              </div>

              {photoError && (
                <div style={{ color: '#F87171', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
                  {photoError}
                </div>
              )}

              <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-sm btn-primary">
                  <Camera size={15} />
                  <span>Log Field Evidence to Recovery Timeline</span>
                </button>

                {photoSubmitted && (
                  <span style={{ color: 'var(--color-lime-green)', fontWeight: 700, fontSize: '0.82rem' }}>
                    ✓ Observation saved to Recovery Timeline!
                  </span>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      <DataSourceCard
        sourceName="NASA Rainfall & Soil Moisture + Local Soil Testing"
        product="NASA GPM IMERG, SMAP L4 & Soil Health Card Benchmarks"
        whatItHelpsUnderstand="Identifies flood, drought, heat, and soil salinity risks so you can protect your next crop."
        resolution="GPM: 10 km | SMAP: 9 km | Soil Test: Plot Sample"
        observationDate="Active 2026 Season"
        coverage="West Bengal Gangetic, Coastal & Lateritic Zones"
        caveat="Risk levels are practical decision-support guides, not insurance loss probabilities. Always verify soil salinity (EC) and N-P-K with a physical soil test."
      />
    </div>
  );
}
