import React, { useState, useEffect } from 'react';
import { useFarm } from '../../context/FarmContext';
import { reportService } from '../../services/reportService';
import { Printer, Download, FileText } from 'lucide-react';

export default function ReportsPage() {
  const { activeFarm, t } = useFarm();
  const [report, setReport] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      if (!activeFarm) return;
      try {
        const rep = await reportService.generateFarmReport(activeFarm.id);
        setReport(rep);
      } catch (err) {
        console.error('Failed to generate report:', err);
      }
    }
    fetchReport();
  }, [activeFarm]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (report) {
      reportService.exportToCSV(report);
    }
  };

  if (!activeFarm || !report) {
    return (
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: '#F8FAFC' }}>
        Compiling Printable Farmer Advisory Dossier...
      </div>
    );
  }

  const { farm, climate, risks, rotation, nasaMetadata } = report;
  const topPlan = rotation && rotation[0];

  return (
    <div>
      {/* Top Controls Bar (Hidden during print) */}
      <div
        className="flex items-center justify-between no-print"
        style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', color: '#F8FAFC', marginBottom: '0.25rem' }}>
            {t('Farmer Advisory Dossier & Printable Report', 'কৃষক পরামর্শ প্রতিবেদন ও প্রিন্ট ডসিয়ার')}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Official printable farm advisory sheet synthesizing NASA Earth observations with West Bengal agronomic recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          <button onClick={handleExportCSV} className="btn btn-sm btn-secondary">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <a
            href={`/api/reports/${activeFarm.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline"
          >
            <FileText size={15} />
            <span>Download Server PDF</span>
          </a>
          <button onClick={handlePrint} className="btn btn-sm btn-primary">
            <Printer size={15} />
            <span>Print Official Dossier</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE REPORT SHEET CONTAINER */}
      <div
        id="printable-report"
        className="card print-sheet"
        style={{
          background: 'rgba(11, 31, 58, 0.94)',
          border: '1px solid rgba(53, 197, 244, 0.35)',
          padding: '2.25rem',
          maxWidth: '880px',
          margin: '0 auto 2rem',
          boxShadow: 'var(--shadow-lg)',
          color: '#F8FAFC'
        }}
      >
        {/* Report Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid var(--color-bright-cyan)',
            paddingBottom: '1.25rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div className="flex items-center gap-3">
            <img
              src="/assets/agrovision-logo.png"
              alt="AgroVision Official Emblem"
              style={{ height: '62px', width: 'auto', borderRadius: '8px' }}
            />
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: '#F8FAFC',
                  lineHeight: 1
                }}
              >
                Agro<span style={{ color: 'var(--color-lime-green)' }}>Vision</span>
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--color-bright-cyan)',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  marginTop: '4px'
                }}
              >
                Climate-Informed Crop Advisory & Adaptation Dossier
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                Team Innovatrix • NASA Space Apps Challenge 2026 • West Bengal Pilot
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#E2E8F0' }}>
            <div>
              <strong>Dossier Ref:</strong>{' '}
              <span style={{ fontFamily: 'var(--font-mono)' }}>{report.reportId}</span>
            </div>
            <div>
              <strong>Generated:</strong> {report.generatedAt}
            </div>
            <div style={{ marginTop: '0.3rem' }}>
              <span className="badge badge-live">OFFICIAL ADVISORY SHEET</span>
            </div>
          </div>
        </div>

        {/* Section 1: Farm & Farmer Metadata */}
        <div
          style={{
            marginBottom: '1.5rem',
            background: 'rgba(6, 20, 38, 0.85)',
            border: '1px solid rgba(53, 197, 244, 0.2)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <h3
            style={{
              fontSize: '1rem',
              color: 'var(--color-bright-cyan)',
              marginBottom: '0.75rem',
              borderBottom: '1px solid rgba(53, 197, 244, 0.16)',
              paddingBottom: '0.35rem'
            }}
          >
            1. Registered Plot Information
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              fontSize: '0.84rem'
            }}
          >
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Farm Name:</span>
              <div style={{ fontWeight: 700, color: '#F8FAFC' }}>{farm.name}</div>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Location:</span>
              <div style={{ fontWeight: 700, color: '#F8FAFC' }}>
                {farm.village ? `${farm.village}, ` : ''}
                {farm.district}, WB
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Coordinates:</span>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-lime-green)' }}>
                {farm.coordinates.latitude}° N, {farm.coordinates.longitude}° E
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Plot Area:</span>
              <div style={{ fontWeight: 700, color: '#F8FAFC' }}>
                {farm.area} {farm.areaUnit} ({farm.areaInAcres} Acres)
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Soil Classification:</span>
              <div style={{ color: '#E2E8F0' }}>{farm.soilType}</div>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Agro-Climatic Zone:</span>
              <div style={{ color: '#E2E8F0' }}>{farm.agroClimaticZone || 'West Bengal'}</div>
            </div>
          </div>
        </div>

        {/* Section 2: NASA Agroclimatology Snapshot */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--color-bright-cyan)', marginBottom: '0.75rem' }}>
            2. Climate & Environmental Telemetry (NASA POWER & GPM)
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '0.75rem',
              fontSize: '0.82rem',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                padding: '0.8rem',
                background: 'rgba(6, 20, 38, 0.85)',
                border: '1px solid rgba(53, 197, 244, 0.2)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.74rem' }}>
                Temperature (T2M)
              </span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F8FAFC' }}>
                {climate?.currentSnapshot?.temperature}°C
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                Min: {climate?.currentSnapshot?.minTemperature}°C • Max:{' '}
                {climate?.currentSnapshot?.maxTemperature}°C
              </span>
            </div>

            <div
              style={{
                padding: '0.8rem',
                background: 'rgba(6, 20, 38, 0.85)',
                border: '1px solid rgba(53, 197, 244, 0.2)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.74rem' }}>
                Monthly Rainfall
              </span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-bright-cyan)' }}>
                {climate?.currentSnapshot?.rainfallMonthlyToDate} mm
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-lime-green)' }}>
                PRECTOTCORR / GPM
              </span>
            </div>

            <div
              style={{
                padding: '0.8rem',
                background: 'rgba(6, 20, 38, 0.85)',
                border: '1px solid rgba(53, 197, 244, 0.2)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.74rem' }}>
                Relative Humidity
              </span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F8FAFC' }}>
                {climate?.currentSnapshot?.relativeHumidity}%
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                2-Meter RH2M
              </span>
            </div>

            <div
              style={{
                padding: '0.8rem',
                background: 'rgba(6, 20, 38, 0.85)',
                border: '1px solid rgba(53, 197, 244, 0.2)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.74rem' }}>
                Multi-Hazard Status
              </span>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: risks?.overallRiskLevel?.includes('High')
                    ? '#F87171'
                    : 'var(--color-lime-green)',
                  marginTop: '4px'
                }}
              >
                {risks?.overallRiskLevel || 'Moderate'}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                Heuristic Screening
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Recommended Alternative Crop Rotation */}
        {topPlan && (
          <div
            style={{
              marginBottom: '1.5rem',
              border: '1.5px solid var(--color-lime-green)',
              padding: '1.1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(56, 168, 50, 0.1)'
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#F8FAFC', margin: 0 }}>
                3. Primary Recommended Crop Rotation Sequence
              </h3>
              <span className="badge badge-live">HIGHEST RESILIENCE</span>
            </div>

            <div
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: 'var(--color-lime-green)',
                marginBottom: '0.75rem'
              }}
            >
              {topPlan.sequence}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '0.55rem',
                marginBottom: '0.85rem'
              }}
            >
              {(topPlan.timing || []).map((tItem, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(6, 20, 38, 0.85)',
                    padding: '0.55rem 0.7rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(53, 197, 244, 0.2)',
                    fontSize: '0.78rem'
                  }}
                >
                  <div style={{ color: 'var(--color-bright-cyan)', fontWeight: 700 }}>
                    {tItem.window} ({tItem.duration})
                  </div>
                  <strong style={{ color: '#F8FAFC' }}>{tItem.crop}</strong>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    {tItem.type}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.82rem', lineHeight: 1.65, color: '#E2E8F0' }}>
              <div>
                <strong>• Water Conservation:</strong> {topPlan.waterBalance?.estimatedSavings}.{' '}
                {topPlan.waterBalance?.groundwaterImpact}.
              </div>
              <div>
                <strong>• Soil Nitrogen Restoration:</strong>{' '}
                {topPlan.soilBenefit?.nitrogenContribution}.
              </div>
              <div>
                <strong>• Pest Cycle Interruption:</strong> {topPlan.pestCycleBreak}
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Farmer Action Checklist */}
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1rem 1.25rem',
            background: 'rgba(6, 20, 38, 0.85)',
            border: '1px solid rgba(53, 197, 244, 0.2)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <h3 style={{ fontSize: '0.95rem', color: 'var(--color-bright-cyan)', marginBottom: '0.5rem' }}>
            4. Recommended Field Protocols for Farmer
          </h3>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#E2E8F0', lineHeight: 1.65 }}>
            <li>
              Conduct a direct laboratory soil EC/pH test at the nearest Krishi Vigyan Kendra (KVK), especially in coastal Sundarbans blocks.
            </li>
            <li>
              Retain 15–20 cm standing paddy stubble mulch to conserve SMAP root-zone moisture and suppress capillary salt rise.
            </li>
            <li>
              Introduce a short-duration summer legume (Moong / Lentil / Khesari) to restore 35–45 kg/ha biological nitrogen.
            </li>
          </ul>
        </div>

        {/* Report Footer & Disclaimer */}
        <div
          style={{
            borderTop: '1px solid rgba(53, 197, 244, 0.2)',
            paddingTop: '1rem',
            fontSize: '0.74rem',
            color: 'var(--color-text-muted)',
            lineHeight: 1.5
          }}
        >
          <div>
            <strong>Scientific Acknowledgement:</strong> {nasaMetadata?.sources}
          </div>
          <div>
            <strong>Disclaimer:</strong> {nasaMetadata?.disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
}
