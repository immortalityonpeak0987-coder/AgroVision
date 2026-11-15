// Farm Advisory Report Service
// Compiles farm data, NASA observations, and recommendations for PDF download, printing, and CSV export

import { apiRequest } from '../api/apiClient';
import { farmService } from './farmService';
import { climateService } from './climateService';
import { riskService } from './riskService';
import { cropService } from './cropService';
import { soilService } from './soilService';

export const reportService = {
  async generateFarmReport(farmId) {
    const [farm, climate, risks, rotation, soil, backendRep] = await Promise.all([
      farmService.getFarmById(farmId),
      climateService.getClimateByFarmId(farmId),
      riskService.getRiskAssessment(farmId),
      cropService.getRotationRecommendations(farmId),
      soilService.getSoilData(farmId),
      apiRequest('/api/reports/generate', {
        method: 'POST',
        body: JSON.stringify({ farmId, reportType: 'FULL_ADVISORY', format: 'PDF' })
      })
    ]);

    const backendReportData = backendRep?.data || null;

    return {
      reportId: backendReportData?.reportId || `AGRO-REP-${farmId}-${Date.now().toString().slice(-6)}`,
      storageKey: backendReportData?.storageKey || null,
      downloadUrl: backendReportData?.reportId ? `/api/reports/${backendReportData.reportId}/download` : null,
      generatedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      farm,
      climate: climate.data,
      climateMeta: climate.metadata,
      risks: risks.data,
      riskMeta: risks.metadata,
      rotation: rotation.data,
      soil: soil.data,
      nasaMetadata: {
        sources: 'NASA POWER (0.5°), GPM IMERG (0.1°), SMAP L4 (9km), MODIS/Landsat HLS (30m–250m), ISRIC SoilGrids (250m)',
        institution: 'AgroVision Agricultural Decision Support Platform • Team Innovatrix',
        officialTagline: 'From Space Data to Farm Recovery Decisions',
        disclaimer: 'This advisory report synthesizes NASA satellite Earth observations with local agro-ecological guidelines from the West Bengal Crop Planning Calendar and ICAR-CSSRI. Gridded satellite observations reflect regional conditions and do not replace direct laboratory soil NPK/EC testing.'
      }
    };
  },

  exportToCSV(reportData) {
    const headers = ['Category', 'Parameter', 'Observed Value', 'Unit / Scale', 'Data Source & Provenance'];
    const rows = [
      ['Farm Profile', 'Farm Name', reportData.farm?.name || '', 'Plot', 'AgroVision Registry'],
      ['Farm Profile', 'District & Block', `${reportData.farm?.block ? reportData.farm.block + ', ' : ''}${reportData.farm?.district || ''}`, 'West Bengal', 'AgroVision Registry'],
      ['Farm Profile', 'Coordinates', `${reportData.farm?.coordinates?.latitude ?? ''}°N, ${reportData.farm?.coordinates?.longitude ?? ''}°E`, 'WGS84', 'GPS / GIS Selection'],
      ['Farm Profile', 'Farm Area', `${reportData.farm?.area || ''} ${reportData.farm?.areaUnit || ''} (${reportData.farm?.areaInAcres || ''} Acres)`, 'Land Area', 'Farmer Provided'],
      ['Climate Snapshot', 'Mean Air Temperature (T2M)', `${reportData.climate?.currentSnapshot?.temperature ?? ''}`, '°C (0.5° Grid)', 'NASA POWER Agroclimatology'],
      ['Climate Snapshot', 'Max / Min Temperature', `${reportData.climate?.currentSnapshot?.maxTemperature ?? ''} / ${reportData.climate?.currentSnapshot?.minTemperature ?? ''}`, '°C', 'NASA POWER Agroclimatology'],
      ['Climate Snapshot', 'Relative Humidity (RH2M)', `${reportData.climate?.currentSnapshot?.relativeHumidity ?? ''}`, '%', 'NASA POWER Agroclimatology'],
      ['Climate Snapshot', 'Monthly Rainfall to Date', `${reportData.climate?.currentSnapshot?.rainfallMonthlyToDate ?? ''}`, 'mm', 'NASA POWER / GPM IMERG'],
      ['Soil Chemistry', 'Soil pH', `${reportData.soil?.latestLabTest?.ph ?? ''}`, 'pH H2O', reportData.soil?.latestLabTest?.labName || 'Soil Lab Record'],
      ['Soil Chemistry', 'Electrical Conductivity (EC)', `${reportData.soil?.latestLabTest?.electricalConductivity ?? ''}`, 'dS/m', reportData.soil?.latestLabTest?.labName || 'Soil Lab Record'],
      ['Risk Intelligence', 'Overall Risk Classification', reportData.risks?.overallRiskLevel || '', 'Heuristic Index', 'AgroVision Multi-Hazard Engine'],
      ['Crop Rotation', 'Primary Recommended Sequence', reportData.rotation?.[0]?.sequence || '', '12-Month Cycle', 'West Bengal Crop Planning Calendar']
    ];

    const escapeCsv = (val) => {
      const str = String(val ?? '');
      return `"${str.replace(/"/g, '""')}"`;
    };

    const csvContent = '\uFEFF' + [
      headers.map(escapeCsv).join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AgroVision_Advisory_${reportData.farm?.id || 'plot'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
