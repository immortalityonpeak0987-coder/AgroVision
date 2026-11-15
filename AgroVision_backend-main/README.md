# AgroVision Backend — Environmental Intelligence & Decision Support Gateway

Node.js & Express REST API Gateway for AgroVision (NASA Space Apps Challenge 2026 | Team Innovatrix).

## Overview
This backend gateway provides climate-informed agricultural resilience intelligence for West Bengal, India. It features dual-mount endpoint backward compatibility (`/api` and `/api/v1`), explicit CORS allowlisting, rate limiting, centralized error handling, and MongoDB Atlas database models.

---

## Prerequisites
- Node.js v20+ (developed with Node.js v24 LTS)
- npm v10+
- MongoDB Atlas account (for cloud persistence)

---

## MongoDB Atlas Setup Guide

1. **Create an Atlas Cluster:**
   - Log into [MongoDB Cloud](https://cloud.mongodb.com/).
   - Create a free **M0 Sandbox** cluster in a nearby region (e.g., `ap-south-1` Mumbai).
2. **Configure Database Access:**
   - Go to **Security > Database Access**.
   - Click **Add New Database User**.
   - Select Authentication Method: **Password**.
   - Create a username (e.g., `agrovision_dev`) and a secure password.
   - Assign Role: **Read and write to any database** (or `readWrite@agrovision`).
3. **Configure Network Access:**
   - Go to **Security > Network Access**.
   - Click **Add IP Address**.
   - For local development, click **Add Current IP Address** (or `0.0.0.0/0` for cloud staging like Render).
4. **Obtain Connection String:**
   - On the cluster overview, click **Connect > Drivers > Node.js**.
   - Copy the connection URI:
     ```
     mongodb+srv://<username>:<password>@<cluster>.mongodb.net/agrovision?retryWrites=true&w=majority
     ```
5. **Configure Local Environment:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Paste your connection string into `MONGODB_URI` in `.env`.
   - Never commit `.env` or paste real credentials into version control.

---

## Available Scripts

- **`npm start`**: Starts the production HTTP server.
- **`npm run dev`**: Starts server in watch mode (`node --watch`).
- **`npm test`**: Runs the complete automated test suite (`node --test`).
- **`npm run seed:dev`**: Seeds deterministic demo farm profiles and crops (`dataOrigin: "DEMO"`). Prohibited in production.
- **`npm run seed:clean`**: Safely removes demonstration records (`dataOrigin: "DEMO"`). Genuine user data is never touched.

---

## Health & Readiness Endpoints

- **`GET /api/health` & `GET /api/v1/health` (Liveness):**
  - Returns HTTP 200 indicating the Express gateway process is alive.
  - Reports uptime, memory usage, environment, and database connection state (`status: "connected"` or `"disconnected"`).
- **`GET /api/ready` & `GET /api/v1/ready` (Readiness):**
  - Returns HTTP 200 if MongoDB Atlas is connected and ready to accept queries.
  - Returns HTTP 503 if MongoDB Atlas is disconnected.

---

## Architecture & Data Models

- **`Farm`**: Farm details, coordinates (-90 to 90, -180 to 180), area with Bengali Bigha conversion (1 Bigha = 0.1338 ha), 23 West Bengal districts.
- **`Crop`**: Agricultural classifications, seasons (`Kharif`, `Rabi`, `Zaid`), verified research sources.
- **`CropRotation`**: 12-month calendar plan (Jan–Dec), farm reference.
- **`EnvironmentalObservation`**: Scientific observation records; missing observations stored as `null` (never coerced to 0).
- **`RiskAssessment`**: Risk screenings (`FLOOD_WATERLOGGING`, `COASTAL_SALINITY`, etc.) with explicit `INDETERMINATE` state.
- **`RecoveryRecord`**: Chronological field event logs; recovery score defaults to `null`.
- **`SoilTest`**: Laboratory ECe and pH records; `isVerifiedLab` defaults strictly to `false`.
- **`Report`**: Generated report metadata.
- **`ApiCache`**: Compound & TTL indexes (`expireAfterSeconds: 0`) for caching future external data.

---

## Security & Scientific Integrity Principles

1. **Zero Credential Leaks:** Loggers, health endpoints, and error handlers sanitize URIs and strip internal stack traces in production.
2. **Scientific Data Integrity:** Regional soil averages are never labeled as individual farm lab tests. Fictional demo records carry `dataOrigin: "DEMO"`. Missing values are preserved as `null`.
3. **Idempotent Seeding:** Seeding uses deterministic demo IDs and upsert logic. Re-running `seed:dev` creates no duplicates and never drops collections.

---

## Stage 4: NASA POWER API Integration

AgroVision integrates NASA POWER (Prediction Of Worldwide Energy Resources) Agroclimatology (AG) daily point data as its first external environmental observation provider.

### Official Documentation
- **Portal:** [https://power.larc.nasa.gov/](https://power.larc.nasa.gov/)
- **API Documentation:** [https://power.larc.nasa.gov/docs/](https://power.larc.nasa.gov/docs/)
- **Base Endpoint:** `https://power.larc.nasa.gov/api/temporal/daily/point`

### Verified Parameters & Provenance
| Identifier | Parameter Description | Unit | Source Model | Spatial Resolution | Canonical Mapping |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `T2M` | Temperature at 2 Metres | °C | MERRA-2 | 0.5° × 0.625° | `SURFACE_TEMPERATURE` |
| `T2M_MAX` | Maximum Temperature at 2 Metres | °C | MERRA-2 | 0.5° × 0.625° | `SURFACE_TEMPERATURE` |
| `T2M_MIN` | Minimum Temperature at 2 Metres | °C | MERRA-2 | 0.5° × 0.625° | `SURFACE_TEMPERATURE` |
| `PRECTOTCORR` | Corrected Total Precipitation | mm/day | MERRA-2 | 0.5° × 0.625° | `RAINFALL_ACCUMULATION` |
| `RH2M` | Relative Humidity at 2 Metres | % | MERRA-2 | 0.5° × 0.625° | `RELATIVE_HUMIDITY` |
| `WS2M` | Wind Speed at 2 Metres | m/s | MERRA-2 | 0.5° × 0.625° | `WIND_SPEED` |
| `ALLSKY_SFC_SW_DWN` | All-Sky Surface Shortwave Downward Irradiance | MJ/m²/day | CERES SYN1deg / MERRA-2 | 1.0° × 1.0° | `SOLAR_RADIATION` |

### API Endpoints
All endpoints are dual-mounted under `/api` and `/api/v1`:

- **Provider Status:**
  - `GET /api/integrations/nasa-power/status`
  - `GET /api/v1/integrations/nasa-power/status`
- **Geographic Point Environmental Query:**
  - `GET /api/integrations/nasa-power/point?latitude=23.2324&longitude=88.3639&startDate=2024-05-01&endDate=2024-05-03`
  - `GET /api/v1/integrations/nasa-power/point?latitude=23.2324&longitude=88.3639&startDate=2024-05-01&endDate=2024-05-03`
- **Farm-Specific Environmental Query:**
  - `GET /api/integrations/nasa-power/farms/:farmId?startDate=2024-05-01&endDate=2024-05-03`
  - `GET /api/v1/integrations/nasa-power/farms/:farmId?startDate=2024-05-01&endDate=2024-05-03`

### Scientific Data Integrity Rules
- **Data Origin:** All observations are tagged `dataOrigin: "MODEL_ESTIMATE"`. They are gridded assimilation estimates, not direct in-situ sensor measurements.
- **Missing Data Handling:** Fill value `-999` is strictly mapped to `null` with `qualityFlag: "MISSING"`. Missing data is never coerced to `0`. Genuine zero measurements (e.g. `0.0 mm` rainfall) and negative temperatures are preserved.
- **Cache Lifecycle:** Results are cached in `ApiCache` with a 24-hour TTL using deterministic query keys.

---

## Stage 5: India Meteorological Department (IMD) API Integration

AgroVision integrates India Meteorological Department (IMD) surface and station meteorological observations as its ground-truth observed data provider for West Bengal.

### Official Documentation & Portals
- **IMD API Developer Portal:** [https://api.imd.gov.in/](https://api.imd.gov.in/)
- **Mausam Weather Portal:** [https://mausam.imd.gov.in/](https://mausam.imd.gov.in/)
- **Gateway Base URL:** `https://api.imd.gov.in/api/v1`

### Authentication Architecture & Availability States
IMD API access requires dual-header credentials (`X-Api-Key` and `Authorization: Bearer <jwt>`) and institutional/IP authorization. The backend exposes deterministic availability states:

- **`AVAILABLE`**: Valid credentials configured, endpoints accessible.
- **`AWAITING_CREDENTIALS`**: API key or bearer token unconfigured. Gateway returns structured 401 with missing credential flags without crashing.
- **`AWAITING_IP_APPROVAL`**: Dual credentials provided but client IP is awaiting IMD network security whitelisting (HTTP 403).
- **`UNAVAILABLE`**: Upstream gateway maintenance or connection failure (HTTP 503 / 504).
- **`ERROR`**: Parameter validation failure or unexpected upstream payload format.

### Supported Endpoints
All endpoints are dual-mounted under `/api` and `/api/v1` with kebab-case aliases:

| Endpoint | Alias | Update Cycle | Cache TTL | Data Scope |
| :--- | :--- | :--- | :--- | :--- |
| `GET /api/v1/integrations/imd/status` | — | Real-time | None | Provider operational status, credential flags, station list |
| `GET /api/v1/integrations/imd/current_wx` | `/current-weather` | Hourly | 30 minutes | Surface synoptic observations (Temp, RH, Wind, Rain, MSLP) |
| `GET /api/v1/integrations/imd/districtrainfall` | `/district-rainfall` | 1–4x Daily | 6 hours | Actual vs normal rainfall, departure %, and IMD category |
| `GET /api/v1/integrations/imd/staterainfall` | `/state-rainfall` | Daily | 12 hours | State-wide cumulative rainfall & reporting district statistics |
| `GET /api/v1/integrations/imd/aws_data` | `/aws` | 15–30 min | 15 minutes | Automatic Weather Station & Rain Gauge telemetry |

### Verified West Bengal Station Catalog
AgroVision indexes 14 primary surface and synoptic observation stations across West Bengal:
- `42809`: Kolkata (Alipore)
- `42807`: Kolkata (Dum Dum)
- `42704`: Burdwan (Purba Bardhaman)
- `42707`: Krishnanagar (Nadia)
- `42903`: Canning (South 24 Parganas — Sundarbans)
- `42700`: Bankura (Bankura)
- `42803`: Midnapore (Paschim Medinipur)
- `42500`: Malda (Malda)
- `42399`: Jalpaiguri (Jalpaiguri)
- `42398`: Siliguri (Darjeeling)
- `42295`: Darjeeling (Darjeeling)
- `42901`: Diamond Harbour (South 24 Parganas)
- `42703`: Panagarh (Paschim Bardhaman)
- `42702`: Sriniketan (Birbhum)

### Scientific Integrity & Provenance Rules
1. **Data Origin:** All IMD surface and station readings are tagged `dataOrigin: "OBSERVED"`.
2. **Point vs. Area Representation:** Station readings reflect localized instrument enclosures. They must not be conflated with district-wide agricultural block conditions without spatial interpolation.
3. **Missing Data Handling:** Fill values (`-999`, `-99.9`, `-99`, `NA`, `null`) are strictly converted to `null` with `qualityFlag: "MISSING"`. Never coerced to zero.
4. **Preservation of Genuine Zero Rainfall:** A reading of `0.0 mm` represents verified absence of precipitation and is preserved as `0.0` with `metadata.isZeroRainfall: true`.
5. **Database Resilience:** Gateway endpoints operate gracefully in database-disconnected mode; cache and persistence bypass transparently without throwing or crashing.

---

## Stage 6: NASA Satellite Data Integration & Environmental Data Ingestion

AgroVision integrates Earth Observation data from NASA satellites via NASA Earthdata CMR (Common Metadata Repository) for metadata and granule discovery, and NASA AppEEARS (Application for Extracting and Exploring Analysis Ready Samples) for asynchronous sample point extraction.

### Core Satellite Data Products
| Product Identifier | Satellite / Instrument | Temporal Coverage & Cycle | Spatial Resolution | Parameter / Measurement | Scientific Provenance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MOD13Q1.061` | Terra MODIS | 16-day Composite | 250 m | 250m 16 days NDVI (`_250m_16_days_NDVI`) | Scale factor `0.0001`, Fill `-3000`, Valid `[-0.2, 1.0]`, 16-bit VI Quality bitmask |
| `SPL3SMP_E.006` | SMAP Radiometer | Daily (~06:00 descending) | 9 km | Enhanced Surface Soil Moisture (0–5 cm) | Volumetric `cm³/cm³`, Fill `<= -9990.0`, Valid `[0.0, 0.6]` |
| `SPL4SMAU.008` | SMAP / Goddard GEOS-5 | 3-hourly assimilation | 9 km | Root-Zone Soil Moisture (0–100 cm) | Volumetric `cm³/cm³`, Fill `<= -9990.0`, Valid `[0.0, 0.6]` |
| `GPM_3IMERGDL.07` | GPM Constellation | Daily (Late Run, ~14h latency) | 0.1° (~10 km) | Daily Precipitation Accumulation (`precipitation`) | Calibrated against TRMM/GPM & climatology; unit `mm/day` |
| `GPM_3IMERGDF.07` | GPM Constellation | Daily (Final Run, ~3.5 months) | 0.1° (~10 km) | Research-Grade Calibrated Precipitation | Monthly GPCC gauge calibrated; unit `mm/day` |
| `HLSL30.020` | Landsat 8/9 & Sentinel-2 | 2–3 days (harmonized) | 30 m | Harmonized Landsat Sentinel Surface Reflectance | Nadir BRDF-adjusted surface reflectance reference |

### AppEEARS Asynchronous Task Lifecycle
NASA AppEEARS point extraction is inherently asynchronous. The backend coordinates the full lifecycle:
1. **Submission:** `POST /api/v1/integrations/satellite/tasks` creates and submits an extraction task to AppEEARS and tracks it in `SatelliteDataAsset` (`status: PENDING`).
2. **Status Polling:** `GET /api/v1/integrations/satellite/tasks/:taskId` checks task status (`PENDING`, `PROCESSING`, `DONE`, `ERROR`).
3. **Bundle Retrieval:** Once completed, `GET /api/v1/integrations/satellite/tasks/:taskId/data` retrieves the bundle file list, file IDs, sha256 checksums, and download endpoints.

### Authentication & Availability States
- **`AVAILABLE`**: Valid Earthdata credentials configured (`EARTHDATA_USERNAME` and `EARTHDATA_PASSWORD` or `EARTHDATA_TOKEN`).
- **`AWAITING_CREDENTIALS`**: Credentials missing or unconfigured. AppEEARS calls return structured 401 with informative diagnostic payload without crashing.
- **`UNAVAILABLE`**: Upstream NASA AppEEARS or CMR maintenance or outage (503/504).

### API Endpoints
All endpoints are dual-mounted under `/api` and `/api/v1`:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/integrations/satellite/status` | `GET` | Satellite provider status, verified product catalog, Earthdata credential status |
| `/api/v1/integrations/satellite/products` | `GET` | Complete verified product catalog with fill values, scale factors, and spatial resolutions |
| `/api/v1/integrations/satellite/search` | `GET` | NASA CMR collection and granule search with spatial bbox and date filters |
| `/api/v1/integrations/satellite/tasks` | `POST` | Submit AppEEARS asynchronous point extraction task |
| `/api/v1/integrations/satellite/tasks/:taskId` | `GET` | Check status and progress of AppEEARS task |
| `/api/v1/integrations/satellite/tasks/:taskId/data` | `GET` | Retrieve output bundle files and checksums for completed task |

### Scientific Data Integrity & Spatial Resolution Governance
1. **Data Origin:** All satellite-derived observations are strictly marked `dataOrigin: "SATELLITE_DERIVED"`.
2. **Sub-Pixel Parcel Disclaimer:** West Bengal smallholder farm plots typically measure 0.5 to 2.5 hectares (approx. 4 to 18 Bengali Bighas).
   - 10 km GPM IMERG pixel ≈ 10,000 ha (ratio > 4,000x farm size)
   - 9 km SMAP pixel ≈ 8,100 ha (ratio > 3,200x farm size)
   - 250 m MODIS pixel ≈ 6.25 ha (ratio 2.5x to 12.5x farm size)
   - Every normalized observation includes `isSubPixelObservation: true` and explicit spatial resolution disclaimers to prevent misinterpretation of regional macro-pixels as micro-parcel field measurements.
3. **Fill Value Handling:** Missing/fill values (MODIS `-3000`, SMAP `< -9990`, GPM `-9999.9`) are strictly converted to `null` with `qualityFlag: "MISSING"`. They are never coerced to zero.
4. **Preservation of Genuine Zero Rainfall:** A reading of `0.0 mm` in GPM IMERG is preserved as valid precipitation measurement, distinct from missing sensor data.
5. **Surface vs Root-Zone Moisture:** Surface soil moisture (SMAP L3, 0–5 cm) reflects topsoil evaporation and rain wetting; root-zone soil moisture (SMAP L4, 0–100 cm) models deep moisture available for crop root uptake. They are never conflated.

---

## Stage 7: Environmental Data Standardization

AgroVision unifies environmental observations across NASA POWER (model estimates), IMD (ground stations), and NASA Earth Observation satellites (MODIS, SMAP, GPM IMERG) into a traceable, standardized data structure.

### Canonical Parameters & Physical Range Checks
| Canonical Parameter | Standard Unit | Physical Range | Source Integrations | Fill Value Handling |
| :--- | :--- | :--- | :--- | :--- |
| `SURFACE_TEMPERATURE` | °C | [-10, 60] | NASA POWER (`T2M`), IMD (`temp`) | Converted from K where needed |
| `TEMPERATURE_MAX` | °C | [-10, 60] | NASA POWER (`T2M_MAX`), IMD (`max_temp`) | Direct °C |
| `TEMPERATURE_MIN` | °C | [-15, 50] | NASA POWER (`T2M_MIN`), IMD (`min_temp`) | Direct °C |
| `RAINFALL_ACCUMULATION` | mm | [0, 1000] | NASA POWER, IMD, GPM IMERG | Genuine 0.0 preserved |
| `RELATIVE_HUMIDITY` | % | [0, 100] | NASA POWER (`RH2M`), IMD (`rh`) | Direct % |
| `WIND_SPEED` | m/s | [0, 100] | NASA POWER (`WS2M`), IMD (`wind_speed`) | Converted from km/h (/ 3.6) |
| `SOLAR_RADIATION` | MJ/m²/day | [0, 50] | NASA POWER (`ALLSKY_SFC_SW_DWN`) | Direct MJ/m²/day |
| `SOIL_MOISTURE` | cm³/cm³ | [0.0, 0.9] | SMAP L3 (surface), SMAP L4 (root-zone) | Volumetric fraction |
| `NDVI` | dimensionless | [-0.2, 1.0] | MODIS (`MOD13Q1`), Landsat/HLS | Scaled (0.0001 factor) |
| `SOIL_EC` | dS/m | [0.0, 50.0] | Laboratory Soil Tests | Verified lab measurements only |

### Quality Classification States
- **`VALID`**: Parameter within physical bounds with nominal telemetry.
- **`MISSING`**: Upstream fill values (`-999`, `-3000`, `<= -9990`, `NA`) converted strictly to `null`. Never coerced to zero.
- **`OUT_OF_RANGE`**: Values violating physical boundaries flagged as `SUSPECT`.
- **`INSUFFICIENT_SPATIAL_COVERAGE`**: Regional grid cells carry `isSubPixelObservation: true` for smallholder farms (0.5–2.5 ha).

---

## Stage 8: Agricultural Risk Assessment

Evidence-based, explainable agricultural risk assessment engine for West Bengal farming systems.

### Evaluated Risk Categories
1. **Excess Rainfall:** 3-day & 7-day accumulation against regional crop thresholds (> 175 mm / 7 days -> HIGH).
2. **Waterlogging:** Multi-factor synthesis combining rainfall accumulation, heavy clay soil texture, and lowland delta topography.
3. **Drought / Moisture Stress:** 14-day rainfall deficit + SMAP root-zone soil moisture (< 0.15 cm³/cm³) evaluated strictly during active crop growth stages (not during dry fallow).
4. **Heat Stress:** Crop-specific temperature thresholds (e.g. potato > 30°C vs wheat > 32°C) sustained for ≥ 3 consecutive days.
5. **Soil Salinity:** Evaluates verified laboratory ECe in dS/m. Strictly reports `INDETERMINATE` with `INSUFFICIENT_DATA` when lab tests are absent; never assumes salinity from geography alone.
6. **Overall Composite Risk:** Synthesizes individual hazard matrices into an explainable overall status without crude numeric addition.

---

## Stage 9: Crop Intelligence & Planning

Agronomic decision-support for West Bengal agro-ecological zones based on the West Bengal Crop Planning Calendar & ICAR research guidelines.

### Research-Verified Crop Knowledge Base
- **Aman Paddy (Kharif):** Poaceae cereal, high water requirement, suited for Gangetic alluvial and coastal clay soils.
- **Kufri Pukhraj Potato (Rabi):** Solanaceae tuber, short duration (75 days), sensitive to waterlogging and terminal heat > 30°C.
- **Tossa Jute (Pre-Kharif/Kharif):** Malvaceae fiber, medium water, flood tolerant once established.
- **Mustard Binoy B-9 (Rabi):** Brassicaceae oilseed, low water, optimal cool winter temperatures (12–22°C).
- **Grass Pea / Khesari (Rabi Relay):** Fabaceae pulse, very low water, salt tolerant (up to 4.5 dS/m), biologically fixes atmospheric nitrogen (30–50 kg N/ha) via Rhizobium nodules.
- **Summer Sesame (Zaid):** Pedaliaceae oilseed, low water, heat tolerant, breaks continuous monoculture.

### Crop Rotation & Simulation Features
- **Rotation Validation:** Enforces plant family alternation (interferes with pest/pathogen carryover) and legume inclusion.
- **What-If Climate Simulation:** Simulates temperature offsets, rainfall deficits, and sowing delays, outputting vulnerability indices and recommended varietal adaptations.

---

## Stage 10: Report Generation & Multi-Format Exports

Generates comprehensive agricultural advisory reports in JSON, PDF, and CSV formats.

### Export Capabilities
- **PDF Advisory Reports:** Server-side PDF generation using `pdfkit`, incorporating AgroVision branding, metadata tables, hazard risk factors, crop rotation plans, and scientific disclaimers.
- **CSV Data Exports:** RFC 4180 compliant CSV generator with UTF-8 BOM (`\uFEFF`) for Microsoft Excel compatibility and CSV formula injection protection (neutralizing leading `=`, `+`, `-`, `@`).
- **Storage Layer:** Abstracted `StorageService` supporting local filesystem storage in development with safe file streaming downloads via `GET /api/v1/reports/:reportId/download`.

---

## Complete API Route Manifest (Dual-Mount Parity)

All endpoints are accessible via both `/api` and `/api/v1` prefixes:

| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/analyses/:farmId/climate` | Climate snapshot & historical metrics matching frontend `climateService.js` |
| `GET` | `/api/v1/analyses/:farmId/environment` | Standardized multi-source observations with spatial assessments |
| `GET` | `/api/v1/analyses/:farmId/risks` | Agricultural risk assessment & hazard matrix matching frontend `riskService.js` |
| `POST`| `/api/v1/analyses/:farmId/risks/assess` | Trigger on-demand farm risk assessment |
| `GET` | `/api/v1/analyses/:farmId/risks/history` | Historical risk screening records |
| `GET` | `/api/v1/analyses/:farmId/rotation` | Crop rotation recommendations matching frontend `cropService.js` |
| `POST`| `/api/v1/analyses/:farmId/simulate` | What-If climate & sowing delay simulator matching frontend `cropService.js` |
| `GET` | `/api/v1/analyses/:farmId/crop-intelligence` | Multi-criteria crop suitability evaluation |
| `GET` | `/api/v1/analyses/:farmId/crop-calendar` | 12-month phenological crop calendar |
| `GET` | `/api/v1/analyses/:farmId/recovery` | Recovery timeline events matching frontend `recoveryService.js` |
| `GET` | `/api/v1/crops` | Research-verified West Bengal crops catalog |
| `GET` | `/api/v1/crops/:cropId` | Individual crop agronomic profile |
| `GET` | `/api/v1/farms` | Farm registry listing matching frontend `farmService.js` |
| `GET` | `/api/v1/farms/:farmId` | Farm profile details |
| `POST`| `/api/v1/farms/:farmId/observations` | Farmer field observation logging matching frontend `recoveryService.js` |
| `POST`| `/api/v1/reports/generate` | Generate agricultural advisory report (PDF, CSV, JSON) |
| `GET` | `/api/v1/reports` | List generated reports with pagination |
| `GET` | `/api/v1/reports/:reportId` | Retrieve report metadata |
| `GET` | `/api/v1/reports/:reportId/download` | Stream generated PDF or CSV report file |
| `DELETE`| `/api/v1/reports/:reportId` | Delete report and remove stored file |
| `GET` | `/api/v1/integrations/nasa-power/status` | NASA POWER integration capability and operational status |
| `GET` | `/api/v1/integrations/nasa-power/point` | Daily agroclimatology point data (UTC time-standard) |
| `GET` | `/api/v1/integrations/nasa-power/farms/:farmId` | Farm-specific daily agroclimatology observations |
| `GET` | `/api/v1/integrations/imd/status` | IMD operational status & credentials check |
| `GET` | `/api/v1/integrations/imd/current-weather` | IMD surface synoptic observation (`/current_wx`) |
| `GET` | `/api/v1/integrations/imd/district-rainfall` | IMD district rainfall statistics & departure |
| `GET` | `/api/v1/integrations/imd/state-rainfall` | IMD state-level rainfall summary |
| `GET` | `/api/v1/integrations/imd/aws` | IMD Automatic Weather Station telemetry |
| `GET` | `/api/v1/integrations/appeears/status` | NASA AppEEARS operational status |
| `GET` | `/api/v1/integrations/appeears/products` | NASA AppEEARS product catalog discovery (open access) |
| `POST`| `/api/v1/integrations/appeears/tasks` | Submit AppEEARS point/area extraction task (requires Earthdata Login) |
| `GET` | `/api/v1/integrations/appeears/tasks/:taskId` | AppEEARS asynchronous task status tracking |
| `GET` | `/api/v1/integrations/appeears/tasks/:taskId/results` | AppEEARS output bundle file listings |
| `GET` | `/api/v1/integrations/cmr/status` | NASA CMR metadata discovery capability status |
| `GET` | `/api/v1/integrations/cmr/collections` | NASA CMR Earth science collection search |
| `GET` | `/api/v1/integrations/cmr/granules` | NASA CMR observation granule search |
| `GET` | `/api/v1/integrations/earth-engine/status` | Google Earth Engine provider status & GCP project check |
| `GET` | `/api/v1/integrations/earth-engine/config` | Google Earth Engine setup specifications & IAM scopes |
| `GET` | `/api/v1/integrations/earth-engine/discovery` | Google Earth Engine REST API v1 Discovery document schema |

---

## Eight Confirmed External Environmental & Satellite APIs

| Provider & API | Primary Endpoint | Auth Requirement | Upstream Verification Status |
| :--- | :--- | :--- | :--- |
| **NASA POWER** | `https://power.larc.nasa.gov/api/temporal/daily/point` | None (Public open data) | **HTTP 200 OK** (Live data verified for West Bengal) |
| **IMD Current Weather** | `https://api.imd.gov.in/api/v1/current_wx` | API Key / Bearer JWT | **AUTH_REQUIRED** (Returns 401 without key) |
| **IMD District Rainfall** | `https://api.imd.gov.in/api/v1/districtrainfall` | API Key / Bearer JWT | **AUTH_REQUIRED** (Returns 401 without key) |
| **IMD State Rainfall** | `https://api.imd.gov.in/api/v1/staterainfall` | API Key / Bearer JWT | **AUTH_REQUIRED** (Returns 401 without key) |
| **IMD AWS / ARG Data** | `https://api.imd.gov.in/api/v1/aws_data` | API Key / Bearer JWT | **AUTH_REQUIRED** (Returns 401 without key) |
| **NASA AppEEARS** | `https://appeears.earthdatacloud.nasa.gov/api/` | Open discovery; Earthdata Login for tasks | **HTTP 200 OK** on `/api/product`; **AUTH_REQUIRED** for tasks |
| **NASA CMR** | `https://cmr.earthdata.nasa.gov/search/collections.json` | None (Public open data) | **HTTP 200 OK** (Live discovery verified) |
| **Google Earth Engine** | `https://earthengine.googleapis.com/$discovery/rest?version=v1` | Public discovery; GCP Service Account for computations | **HTTP 200 OK** on discovery; **PROJECT_CONFIGURATION_REQUIRED** for compute |

---

## Testing Instructions

The AgroVision backend includes an automated test suite executed with Node.js's native test runner (`node:test`) and Supertest:

```bash
# Run the complete test suite (213 tests across 42 suites)
npm test
```

### Test Coverage Highlights:
- **Unit & Normalization Tests**: Physical parameter validation, boundary conditions, fill value mappings (`-9999.9` -> `null`), MODIS NDVI scale factor (`0.0001`), SMAP soil moisture depth layers (0-5 cm vs 0-100 cm).
- **Service & Domain Intelligence Tests**: Multi-hazard risk screening, phenological crop calendar rules, What-If simulation mechanics, PDF/CSV report generation.
- **Route & Integration Tests**: Dual-mount parity (`/api` and `/api/v1`), HTTP status codes, validation error payloads, upstream timeout and authentication handling.
- **Security & Integrity Tests**: SSRF prevention on external client endpoints, rate limiter enforcement, and production seed block (`runSeed` and `cleanDemoData` abort in production).

---

## Deployment Notes

### Production Environment Setup
1. **Node.js Runtime:** Deploy to a Node.js LTS environment (v20+ or v24+ recommended, e.g., Render, Railway, AWS ECS, or DigitalOcean App Platform).
2. **Environment Variables:**
   - Set `NODE_ENV=production`.
   - Provide `MONGODB_URI` pointing to a production MongoDB Atlas cluster.
   - Configure `FRONTEND_URL` with the production frontend domain (e.g., `https://agrovision.example.com`).
   - Configure `JWT_SECRET` with a cryptographically random string (minimum 32 characters).
   - If utilizing NASA AppEEARS or Google Earth Engine in production, provide `EARTHDATA_USERNAME`, `EARTHDATA_PASSWORD`, `GOOGLE_CLOUD_PROJECT_ID`, and service account credentials.
3. **Storage Configuration:**
   - Reports and temporary exports are written to `backend/storage/reports`. In stateless containerized deployments, configure cloud object storage (`S3_BUCKET_NAME` / `REPORT_STORAGE_BUCKET`) or mount a persistent volume.
4. **Process Management:**
   - Execute with `npm start` (`node src/server.js`).
   - Use a process supervisor like PM2 or container orchestration (Docker/Kubernetes) with liveness checks mapped to `/api/health` and readiness mapped to `/api/ready`.
