/**
 * Report Generation Constants & Templates
 * AgroVision (NASA Space Apps Challenge 2026 | Team Innovatrix)
 */

export const REPORT_TYPES = {
  FARM_ENVIRONMENTAL: 'FARM_ENVIRONMENTAL',
  AGRICULTURAL_RISK: 'AGRICULTURAL_RISK',
  CROP_INTELLIGENCE: 'CROP_INTELLIGENCE',
  RECOVERY_REPORT: 'RECOVERY_REPORT',
  COMPLETE_FARM_ASSESSMENT: 'COMPLETE_FARM_ASSESSMENT'
};

export const REPORT_FORMATS = {
  PDF: 'PDF',
  CSV: 'CSV',
  JSON: 'JSON'
};

export const STORAGE_PROVIDERS = {
  LOCAL: 'LOCAL',
  S3: 'S3',
  NONE: 'NONE'
};

export const REPORT_DISCLAIMER = 'This advisory report synthesizes NASA Earth Observation data (POWER, GPM IMERG, SMAP, Landsat/MODIS), IMD surface meteorology, and regional agro-ecological guidelines. It provides evidence-based decision support for farmers and agricultural extension workers. Direct ground verification is recommended before committing significant capital interventions.';
