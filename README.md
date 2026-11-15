# 🌍 AgroVision — Climate-Informed Crop Rotation & Farm Recovery Decision Support System

> **Developed by Team Innovatrix** | **NASA Space Apps Challenge — Field Shift: Adapting Farms with NASA Data**  
> Transforming multi-mission NASA Earth Observations, regional meteorology, and local soil diagnostics into actionable crop rotation and post-hazard recovery decisions.

---

## 🚀 Overview

**AgroVision** bridges the gap between orbital Earth observation data and everyday farm decisions. It combines **NASA satellite telemetry** (precipitation, surface & root-zone soil moisture, vegetation canopy vigor, and agroclimatology) with **ground-level soil diagnostics** and **seasonal crop calendars** to help farmers optimize water use, restore degraded soils, and build long-term climate resilience.

> **📍 Plot Region & Geographic Scope:**  
> AgroVision is **currently implemented across West Bengal, India** (covering the Gangetic Alluvial Plains, Coastal Sundarbans Delta, and Red Lateritic Uplands) and is **architected to scale globally** across worldwide agricultural regions in future releases using global NASA satellite grids (`NASA POWER`, `SMAP L4`, `GPM IMERG`, `MODIS/HLS`).

### ✨ Key Capabilities

1. **🌾 Dual-Experience Architecture**
   - **Farmer Mode (Active Default):** Clean, jargon-free interface with a 6-step workflow (*My Farm*, *Farm Location*, *Weather & Alerts*, *Crop Planner*, *My Farm Recovery*, *Reports / Help*) and plain-language indicators (*"How green and healthy the crop looks"*, *"Estimated moisture in the soil"*, *"Rainfall difference from usual"*).
   - **Institutional & Field Teams Workspace (`Coming Soon — Phase 2 Preview`):** Multi-farm triage, GIS cluster explorer, and ground-verification logging for **FPOs / Cooperatives**, **Agricultural Extension Officers**, and **NGO Programs**.

2. **🛰️ Full-Width Interactive GIS & Satellite Workbench**
   - Multi-pass seasonal **NDVI Canopy Greenness** overlays (`MOD13Q1` 250m & `HLS` 30m), **SMAP L4 Root-Zone Moisture** (9km), and **GPM IMERG Precipitation** (10km).
   - Horizontal orbit pass selector, seasonal anomaly difference mode ($\Delta$ NDVI), pixel distribution histogram, and **NASA-IBM Prithvi-EO-2.0** open-source geospatial analytics.

3. **📍 Dual-Method Farm Plot Registration & Boundary Validation**
   - **Method 1 — Interactive Map Pinning:** Click-to-pin on satellite/street tiles, GPS auto-detection, or district/village search.
   - **Method 2 — Manual Coordinate Entry:** Direct Latitude/Longitude entry with coordinate boundary validation and unconfirmed default-pin protection.

4. **🛠️ 4-Stage Farm Recovery Tracker**
   - Chronological recovery workflow structured into **1. Before the problem**, **2. During the problem**, **3. Recovery period**, and **4. Current condition**.
   - Persisted 3-state action checklist (`Pending`, `In progress`, `Completed`) and strictly separated evidence streams (*Recorded Recovery Tasks*, *Field Observations*, *Satellite Moisture & Crop*, and *Measured Soil Status*) without artificial score inflation.

5. **🧪 "Try a Soil Test" & Multi-Hazard Risk Matrix**
   - Interactive **Sample Simulation** vs **Verified Lab Report** modes for **Soil pH**, **Soil Salinity ($\text{EC}_e$ in dS/m)**, **Nitrogen (N)**, **Phosphorus (P)**, and **Potassium (K)** with plain-language agronomic advisories.

6. **📅 12-Month Crop Rotation Planner & Climate Simulator**
   - Evaluates Kharif $\rightarrow$ Rabi $\rightarrow$ Zaid sequences for legume nitrogen fixation, plant family alternation, irrigation efficiency, and "What-If" heat/drought stress resilience.

---

## 📡 Confirmed API Endpoints & Data Architecture

All upstream integrations are verified for authentication requirements, spatial resolution, and missing-value sanitization (`-999`, `-3000`, `-9999.9` preserved as `MISSING` flags and never coerced to zero):

### Verified Direct APIs

| # | Service / Mission | Confirmed Endpoint | Auth / Status | Role in AgroVision |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **NASA POWER** | `https://power.larc.nasa.gov/api/temporal/daily/point` | **Public (`HTTP 200 LIVE`)** | Daily temperature (`T2M`, `T2M_MAX`, `T2M_MIN`), rainfall (`PRECTOTCORR`), humidity (`RH2M`), wind (`WS2M`), and solar radiation (`ALLSKY_SFC_SW_DWN`). |
| **2** | **IMD Current Weather** | `https://api.imd.gov.in/api/v1/current_wx` | `IMD_API_KEY` + IP Whitelist | Synoptic station weather observations (reports `AWAITING_CREDENTIALS` when key is absent). |
| **3** | **IMD District Rainfall** | `https://api.imd.gov.in/api/v1/districtrainfall` | `IMD_API_KEY` + IP Whitelist | District-level daily and cumulative rainfall departures. |
| **4** | **IMD State Rainfall** | `https://api.imd.gov.in/api/v1/staterainfall` | `IMD_API_KEY` + IP Whitelist | State-wide meteorological subdivision rainfall summaries. |
| **5** | **IMD AWS Data** | `https://api.imd.gov.in/api/v1/aws_data` | `IMD_API_KEY` + IP Whitelist | Automatic Weather Station (AWS) sub-hourly telemetry. |
| **6** | **NASA AppEEARS** | `https://appeears.earthdatacloud.nasa.gov/api/` | **Public Catalog (`HTTP 200 LIVE`)** / Bearer Token for `/task` | Indexes 190+ NASA Earthdata products (`MOD13Q1`, `SPL4SMGP`, `ECO3ETPTJPL`) and extracts point time-series. |
| **7** | **NASA CMR** | `https://cmr.earthdata.nasa.gov/search/collections.json` | **Public (`HTTP 200 LIVE`)** | Queries official collection and granule metadata (`MOD13Q1 v061`, `SPL4SMGP`, `GPM_3IMERGDF`). |
| **8** | **Google Earth Engine REST** | `https://earthengine.googleapis.com/$discovery/rest?version=v1` | **Public Discovery (`HTTP 200 LIVE`)** / GCP Key for compute | REST v1 service discovery and high-resolution optical/SAR raster pipelines. |

### Supporting Reference Portals (Non-Direct APIs)

- **BHOOMI Geoportal (ICAR-NBSS&LUP):** [https://bhoomigeoportal-nbsslup.in/](https://bhoomigeoportal-nbsslup.in/) — Regional soil landform and taxonomy reference.
- **Matir Katha (Dept. of Agriculture, WB):** [https://matirkatha.net/](https://matirkatha.net/) — Regional crop calendar and seasonal extension reference.
- **Soil Health Card Portal (DAC&FW):** [https://soilhealth.dac.gov.in/](https://soilhealth.dac.gov.in/) — Standard laboratory soil parameter reference (`pH`, `EC`, `N`, `P`, `K`, `OC`).

---

## 🗺️ Future Roadmap: Global-Scale Expansion & Multilingual Intelligence

AgroVision is architected to scale beyond regional pilot zones into a **globally deployable, multilingual agricultural decision-support platform**:

### 🌐 1. Global Agro-Ecological Expansion (Worldwide Coverage)
- **Universal Coordinate Support:** Because **NASA POWER (0.5° global grid)**, **NASA SMAP L4 (9km global EASE-Grid)**, **NASA GPM IMERG (0.1° global)**, and **NASA MODIS/HLS** cover the entire Earth, AgroVision’s ingestion pipeline can evaluate farms across **South Asia, Sub-Saharan Africa, Latin America, Southeast Asia, and North America**.
- **Global Soil & Crop Knowledge Plug-ins:** Integration with global **ISRIC SoilGrids 250m**, **FAO GAEZ v4 (Global Agro-Ecological Zones)**, and **NASA Harvest / GEOGLAM Global Crop Monitor** calendars to unlock region-specific crop rotations for arid, tropical, temperate, and coastal deltaic farming systems worldwide.
- **NASA-IBM Prithvi-EO-2.0 Global Inference:** Automated zero-shot crop boundary segmentation, flood inundation mapping, and burn-scar/drought detection at 30m resolution anywhere on Earth.

### 🗣️ 2. Next-Generation Multilingual & Voice Accessibility
- **Expanded Language Packs (NASA GLOBE & Harvest Terminology):** Extending the current **English + Bengali (`বাংলা`)** glossary to **Hindi (`हिन्दी`)**, **Marathi**, **Tamil**, **Telugu**, **Spanish (`Español`)**, **French (`Français`)**, and **Swahili (`Kiswahili`)**.
- **Voice-First Farmer Advisory (Offline-Ready TTS/ASR):** Audio readouts of weather alerts, soil test interpretations, and recovery checklists for low-literacy rural communities.
- **Localized Units & Calendars:** Dynamic unit conversion (`Bigha`, `Acre`, `Hectare`, `Guntha`, `Katha`) and local seasonal naming (`Kharif/Rabi/Zaid`, `Long Rains/Short Rains`, `Primera/Postrera`).

### 🏢 3. Phase-2 Institutional Sector Rollout
- Full activation of the **Institutional & Field Teams Workspace** for **Farmer Producer Organizations (FPOs)**, **District Extension Officers**, and **Climate Adaptation NGOs**, featuring bulk GeoJSON plot imports, regional seed/fertilizer demand forecasting, and verifiable soil-carbon recovery dossiers.

---

## 🛠️ Tech Stack & Project Structure

```text
├── api/
│   └── index.js                     # Vercel Serverless API entry point
├── AgroVision_backend-main/         # Express.js Backend & Scientific Engine
│   ├── src/
│   │   ├── controllers/             # Climate, Satellite, Risk, Crop, Farm & Report controllers
│   │   ├── integrations/            # NASA POWER, CMR, AppEEARS, IMD & Earth Engine clients
│   │   ├── models/                  # Mongoose schemas (Farm, Crop, Soil, Recovery, Risk)
│   │   ├── routes/                  # Dual-mounted REST routes (/api/* and /api/v1/*)
│   │   ├── seed/                    # Deterministic runtime store & pilot station baselines
│   │   └── services/                # FAO-56, Risk Matrix, Crop Rotation & PDF/CSV generators
│   └── tests/                       # 213 automated unit & integration tests (node:test)
├── src/                             # React 18 + Vite + Tailwind CSS Frontend
│   ├── components/                  # GIS Map (Leaflet), Navbar, Sidebar, DataSourceCard
│   ├── context/                     # FarmContext & NASA GLOBE/Harvest Multilingual Glossary
│   ├── layouts/                     # MainLayout & DashboardLayout
│   ├── pages/                       # Overview, Satellite, Climate, Risk, CropPlanner, Recovery
│   └── services/                    # Frontend API clients with resilient fallback
├── server.ts                        # Unified full-stack dev/production server (Port 3000)
├── vercel.json                      # Vercel full-stack SPA + Serverless API configuration
└── .env.example                     # Confirmed API endpoints & environment template
```

---

## ⚡ Quick Start & Deployment

### 1. Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start full-stack development server (Frontend + Backend on http://localhost:3000)
npm run dev
```

### 2. Run Automated Test Suite (213 Unit & Integration Tests)

```bash
node --test AgroVision_backend-main/tests/*.test.js
```

### 3. Deploy to Vercel (Zero-Config Full-Stack)

This repository is pre-configured for **Vercel** via `vercel.json` and `api/index.js`:
1. Push the repository to GitHub.
2. Import the project in **Vercel** (`Framework Preset: Vite`).
3. Add optional environment variables (`EARTHDATA_TOKEN`, `MONGODB_URI`, `IMD_API_KEY`) in the Vercel dashboard.
4. Click **Deploy** — Vercel builds the Vite SPA to `dist/` and serves all `/api/*` routes via `/api/index.js`.

---

## 📄 License & Attribution

- **Satellite & Climate Data:** Courtesy of **NASA Langley Research Center (POWER)**, **NASA Goddard Space Flight Center (GPM IMERG & SMAP L4)**, **NASA LP DAAC (MODIS, HLS, ECOSTRESS & AppEEARS)**, and **NASA Earthdata CMR**.
- **Team Innovatrix** — Built for the **NASA Space Apps Challenge**.
