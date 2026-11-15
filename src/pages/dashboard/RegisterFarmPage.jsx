import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarm } from '../../context/FarmContext';
import { farmService } from '../../services/farmService';
import FarmLocationPicker from '../../components/map/FarmLocationPicker';
import { ShieldCheck, ArrowRight, MapPin, Compass, Edit3, CheckCircle2, AlertCircle } from 'lucide-react';

// West Bengal geographic bounding box
const WB_BOUNDS = {
  minLat: 21.4,
  maxLat: 27.3,
  minLng: 85.8,
  maxLng: 89.9
};

export default function RegisterFarmPage() {
  const { addFarm, t } = useFarm();
  const navigate = useNavigate();
  const districts = farmService.getDistricts();

  // Location entry method: 'map' (Method 1) | 'manual' (Method 2)
  const [locationMethod, setLocationMethod] = useState('map');
  // Do NOT silently treat default map center as user-confirmed coordinates
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [confirmationMethodLabel, setConfirmationMethodLabel] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    farmerName: '',
    state: 'West Bengal',
    district: 'Purba Bardhaman',
    block: '',
    village: '',
    area: '',
    areaUnit: 'Bigha',
    farmType: 'Irrigated Alluvial',
    mainCrop: 'Aman Paddy',
    latitude: 23.2324,
    longitude: 87.8615
  });

  const [manualLatInput, setManualLatInput] = useState('');
  const [manualLngInput, setManualLngInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Conversion calculations for West Bengal standard: 1 Bigha = 0.3306 Acre = 0.1338 Hectare
  const numArea = parseFloat(formData.area) || 0;
  let convertedAcres = 0;
  let convertedHectares = 0;
  let convertedBigha = 0;

  if (formData.areaUnit === 'Bigha') {
    convertedBigha = numArea;
    convertedAcres = (numArea * 0.3306).toFixed(2);
    convertedHectares = (numArea * 0.1338).toFixed(2);
  } else if (formData.areaUnit === 'Acre') {
    convertedAcres = numArea;
    convertedBigha = (numArea * 3.025).toFixed(2);
    convertedHectares = (numArea * 0.4047).toFixed(2);
  } else {
    convertedHectares = numArea;
    convertedBigha = (numArea * 7.475).toFixed(2);
    convertedAcres = (numArea * 2.471).toFixed(2);
  }

  const handleMapLocationSelect = (lat, lng, sourceLabel = 'Map pin selection') => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    setManualLatInput(String(lat));
    setManualLngInput(String(lng));
    setLocationConfirmed(true);
    setConfirmationMethodLabel(sourceLabel);
    setErrors((prev) => ({ ...prev, coordinates: undefined }));
  };

  const handleManualCoordChange = (field, rawVal) => {
    if (field === 'latitude') {
      setManualLatInput(rawVal);
      const parsed = parseFloat(rawVal);
      if (!Number.isNaN(parsed)) {
        setFormData((prev) => ({ ...prev, latitude: parsed }));
      }
    } else {
      setManualLngInput(rawVal);
      const parsed = parseFloat(rawVal);
      if (!Number.isNaN(parsed)) {
        setFormData((prev) => ({ ...prev, longitude: parsed }));
      }
    }
    const latCheck = field === 'latitude' ? parseFloat(rawVal) : parseFloat(manualLatInput);
    const lngCheck = field === 'longitude' ? parseFloat(rawVal) : parseFloat(manualLngInput);
    if (!Number.isNaN(latCheck) && !Number.isNaN(lngCheck)) {
      setLocationConfirmed(true);
      setConfirmationMethodLabel('Manual coordinate entry');
      setErrors((prev) => ({ ...prev, coordinates: undefined }));
    }
  };

  const validate = () => {
    const err = {};
    if (!formData.name.trim()) {
      err.name = 'Please enter a name for your farm plot.';
    }
    if (!formData.district) {
      err.district = 'Please select your district in West Bengal.';
    }
    if (!formData.area || numArea <= 0) {
      err.area = 'Please enter a valid farm area greater than 0.';
    }

    const lat = Number(formData.latitude);
    const lng = Number(formData.longitude);

    if (!locationConfirmed) {
      err.coordinates =
        locationMethod === 'map'
          ? 'Please click on the map, drag the pin, use GPS, or click "Confirm Selected Map Pin" so we do not save an unconfirmed default map center.'
          : 'Please enter your farm Latitude and Longitude coordinates manually.';
    } else if (
      Number.isNaN(lat) ||
      Number.isNaN(lng) ||
      lat < WB_BOUNDS.minLat ||
      lat > WB_BOUNDS.maxLat ||
      lng < WB_BOUNDS.minLng ||
      lng > WB_BOUNDS.maxLng
    ) {
      err.coordinates = `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(
        4
      )}) must be inside West Bengal (${WB_BOUNDS.minLat}°N–${WB_BOUNDS.maxLat}°N, ${
        WB_BOUNDS.minLng
      }°E–${WB_BOUNDS.maxLng}°E).`;
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        area: numArea,
        areaInAcres: parseFloat(convertedAcres) || numArea,
        coordinates: {
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude)
        },
        soilType: formData.district.includes('24 Parganas')
          ? 'Coastal Saline Alluvium (Clay)'
          : formData.district.includes('Bankura') || formData.district.includes('Purulia')
          ? 'Red & Lateritic Sandy Loam'
          : 'Gangetic Alluvium (Clay Loam)'
      };

      await addFarm(payload);
      navigate('/app/overview');
    } catch (err) {
      console.error('Registration failed:', err);
      setErrors({ submit: err.message || 'Could not register farm plot.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.35rem' }}>
        <h1 style={{ fontSize: '1.85rem', color: '#F8FAFC', marginBottom: '0.25rem' }}>
          {t('Register New Farm Plot', 'নতুন খামার নিবন্ধন করুন')}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Choose how you want to set your farm location in West Bengal: pick your plot on the interactive map or type your coordinates and village details manually.
        </p>
      </div>

      {/* Two Clear Methods Selector Banner */}
      <div
        className="card"
        style={{
          marginBottom: '1.35rem',
          padding: '1rem 1.25rem',
          background: 'rgba(9, 25, 48, 0.94)',
          border: '1px solid rgba(53, 197, 244, 0.28)'
        }}
      >
        <div
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--color-bright-cyan)',
            marginBottom: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          Choose How to Provide Your Farm Location:
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '0.85rem'
          }}
        >
          <button
            type="button"
            onClick={() => setLocationMethod('map')}
            style={{
              textAlign: 'left',
              padding: '0.9rem 1rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              background:
                locationMethod === 'map'
                  ? 'linear-gradient(135deg, rgba(56, 168, 50, 0.22), rgba(22, 139, 206, 0.18))'
                  : 'rgba(6, 20, 38, 0.8)',
              border:
                locationMethod === 'map'
                  ? '2px solid var(--color-lime-green)'
                  : '1px solid rgba(53, 197, 244, 0.2)',
              color: '#F8FAFC'
            }}
          >
            <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
              <Compass size={18} style={{ color: 'var(--color-lime-green)' }} />
              <strong style={{ fontSize: '0.95rem' }}>Method 1 — Select location on map</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Click on the interactive map, drag the farm pin, or use your phone/device GPS.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setLocationMethod('manual');
              if (!manualLatInput && locationConfirmed) {
                setManualLatInput(String(formData.latitude));
                setManualLngInput(String(formData.longitude));
              }
            }}
            style={{
              textAlign: 'left',
              padding: '0.9rem 1rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              background:
                locationMethod === 'manual'
                  ? 'linear-gradient(135deg, rgba(22, 139, 206, 0.25), rgba(53, 197, 244, 0.16))'
                  : 'rgba(6, 20, 38, 0.8)',
              border:
                locationMethod === 'manual'
                  ? '2px solid var(--color-bright-cyan)'
                  : '1px solid rgba(53, 197, 244, 0.2)',
              color: '#F8FAFC'
            }}
          >
            <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
              <Edit3 size={18} style={{ color: 'var(--color-bright-cyan)' }} />
              <strong style={{ fontSize: '0.95rem' }}>Method 2 — Enter location manually</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Type Latitude & Longitude numbers directly along with your District, Block, and Village.
            </p>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1.5rem'
          }}
        >
          {/* Column 1: Farm Details */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.15rem' }}>
              <MapPin size={18} style={{ color: 'var(--color-lime-green)' }} />
              <span>1. Farm & Crop Details</span>
            </h3>

            <div className="form-group">
              <label className="form-label" htmlFor="farm-name-input">
                Farm / Plot Name *
              </label>
              <input
                id="farm-name-input"
                type="text"
                className="form-input"
                placeholder="e.g., Dakshin Math Plot #4"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="farmer-name-input">
                Farmer / Member Name (Optional)
              </label>
              <input
                id="farmer-name-input"
                type="text"
                className="form-input"
                placeholder="e.g., Animesh Mondal"
                value={formData.farmerName}
                onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.state}
                  disabled
                  style={{ opacity: 0.7 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="district-select">
                  District in West Bengal *
                </label>
                <select
                  id="district-select"
                  className="form-select"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                >
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {errors.district && <span className="form-error">{errors.district}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="block-input">
                  Block / Tehsil
                </label>
                <input
                  id="block-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Memari / Gosaba"
                  value={formData.block}
                  onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="village-input">
                  Village / Gram Panchayat
                </label>
                <input
                  id="village-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Bagila"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                />
              </div>
            </div>

            {/* Farm Area & Unit Conversion */}
            <div
              style={{
                borderTop: '1px solid rgba(53, 197, 244, 0.16)',
                paddingTop: '1rem',
                marginTop: '0.5rem'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="area-input">
                    Farm Size / Area *
                  </label>
                  <input
                    id="area-input"
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="form-input"
                    placeholder="e.g., 4.5"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  />
                  {errors.area && <span className="form-error">{errors.area}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="unit-select">
                    Area Unit
                  </label>
                  <select
                    id="unit-select"
                    className="form-select"
                    value={formData.areaUnit}
                    onChange={(e) => setFormData({ ...formData, areaUnit: e.target.value })}
                  >
                    <option value="Bigha">Bigha (বিঘা)</option>
                    <option value="Acre">Acre</option>
                    <option value="Hectare">Hectare</option>
                  </select>
                </div>
              </div>

              {numArea > 0 && (
                <div
                  style={{
                    background: 'rgba(56, 168, 50, 0.16)',
                    border: '1px solid rgba(181, 230, 29, 0.35)',
                    padding: '0.55rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    color: 'var(--color-lime-green)'
                  }}
                >
                  <strong>Converted Area:</strong> {convertedBigha} Bigha ≈ {convertedAcres} Acres (
                  {convertedHectares} Hectares)
                </div>
              )}
            </div>

            {/* Farm Type & Main Crop */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginTop: '1rem'
              }}
            >
              <div className="form-group">
                <label className="form-label" htmlFor="farm-type-select">
                  Land Type
                </label>
                <select
                  id="farm-type-select"
                  className="form-select"
                  value={formData.farmType}
                  onChange={(e) => setFormData({ ...formData, farmType: e.target.value })}
                >
                  <option value="Irrigated Alluvial">Irrigated Alluvial (Canal/Tubewell)</option>
                  <option value="Rainfed Medium Land">Rainfed Medium Land</option>
                  <option value="Coastal Saline Lowland">Coastal Saline Lowland (Sundarbans)</option>
                  <option value="Red Laterite Upland">Red Laterite Upland</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="main-crop-select">
                  Current Crop
                </label>
                <select
                  id="main-crop-select"
                  className="form-select"
                  value={formData.mainCrop}
                  onChange={(e) => setFormData({ ...formData, mainCrop: e.target.value })}
                >
                  <option value="Aman Paddy">Aman Paddy (Kharif)</option>
                  <option value="Boro Paddy">Boro Paddy (Summer)</option>
                  <option value="Potato">Potato (Rabi)</option>
                  <option value="Mustard">Mustard (Rabi)</option>
                  <option value="Jute">Jute (Pre-Kharif)</option>
                  <option value="Sesame">Sesame / Til</option>
                  <option value="Pulses">Pulses (Moong / Lentil)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Column 2: Location Confirmation (Method 1 Map vs Method 2 Manual) */}
          <div className="card">
            <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 className="card-title" style={{ margin: 0 }}>
                {locationMethod === 'map'
                  ? '2. Select Location on Map (Method 1)'
                  : '2. Enter Coordinates Manually (Method 2)'}
              </h3>
              {locationConfirmed ? (
                <span className="badge badge-live" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle2 size={12} />
                  <span>CONFIRMED ({confirmationMethodLabel})</span>
                </span>
              ) : (
                <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <AlertCircle size={12} />
                  <span>AWAITING LOCATION CONFIRMATION</span>
                </span>
              )}
            </div>

            {locationMethod === 'map' ? (
              <>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '0.85rem' }}>
                  Click anywhere on the map to place your farm marker, drag the marker to adjust, or use GPS. Default map center is not saved until you place or confirm your pin.
                </p>

                <FarmLocationPicker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  district={formData.district}
                  onLocationChange={(lat, lng) =>
                    handleMapLocationSelect(lat, lng, 'Interactive map pin')
                  }
                />

                <div
                  style={{
                    marginTop: '0.85rem',
                    padding: '0.75rem',
                    background: locationConfirmed
                      ? 'rgba(56, 168, 50, 0.14)'
                      : 'rgba(245, 158, 11, 0.12)',
                    border: locationConfirmed
                      ? '1px solid rgba(181, 230, 29, 0.38)'
                      : '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.6rem'
                  }}
                >
                  <div style={{ fontSize: '0.79rem', color: '#F8FAFC' }}>
                    {locationConfirmed ? (
                      <>
                        <strong style={{ color: 'var(--color-lime-green)' }}>✓ Farm Pin Confirmed:</strong>{' '}
                        {Number(formData.latitude).toFixed(4)}°N, {Number(formData.longitude).toFixed(4)}°E
                      </>
                    ) : (
                      <>
                        <strong style={{ color: '#FBBF24' }}>Action Needed:</strong> Click the map or press confirm to lock{' '}
                        {Number(formData.latitude).toFixed(4)}°N, {Number(formData.longitude).toFixed(4)}°E
                      </>
                    )}
                  </div>
                  {!locationConfirmed && (
                    <button
                      type="button"
                      onClick={() =>
                        handleMapLocationSelect(
                          formData.latitude,
                          formData.longitude,
                          'Confirmed current map pin'
                        )
                      }
                      className="btn btn-xs btn-primary"
                    >
                      <CheckCircle2 size={13} />
                      <span>Confirm Selected Map Pin</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  Enter your farm plot’s exact Latitude and Longitude within West Bengal ({WB_BOUNDS.minLat}°N–{WB_BOUNDS.maxLat}°N, {WB_BOUNDS.minLng}°E–{WB_BOUNDS.maxLng}°E).
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="manual-lat-input">
                      Latitude (°N) *
                    </label>
                    <input
                      id="manual-lat-input"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 23.2324"
                      className="form-input"
                      value={manualLatInput}
                      onChange={(e) => handleManualCoordChange('latitude', e.target.value)}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      Valid range: 21.4°N to 27.3°N
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="manual-lng-input">
                      Longitude (°E) *
                    </label>
                    <input
                      id="manual-lng-input"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 87.8615"
                      className="form-input"
                      value={manualLngInput}
                      onChange={(e) => handleManualCoordChange('longitude', e.target.value)}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      Valid range: 85.8°E to 89.9°E
                    </span>
                  </div>
                </div>

                {/* Quick District Coordinate Presets for Manual Convenience */}
                <div
                  style={{
                    padding: '0.85rem',
                    background: 'rgba(6, 20, 38, 0.85)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(53, 197, 244, 0.2)',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-bright-cyan)', marginBottom: '0.45rem' }}>
                    Don’t know your exact decimal coordinates? Fill a West Bengal district benchmark:
                  </div>
                  <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                    {[
                      { label: 'Purba Bardhaman (23.2324, 87.8615)', lat: 23.2324, lng: 87.8615, dist: 'Purba Bardhaman' },
                      { label: 'Singur, Hooghly (22.8126, 88.2312)', lat: 22.8126, lng: 88.2312, dist: 'Hooghly' },
                      { label: 'Gosaba, Sundarbans (22.1648, 88.8062)', lat: 22.1648, lng: 88.8062, dist: 'South 24 Parganas' },
                      { label: 'Bishnupur, Bankura (23.0679, 87.3165)', lat: 23.0679, lng: 87.3165, dist: 'Bankura' }
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            district: preset.dist,
                            latitude: preset.lat,
                            longitude: preset.lng
                          }));
                          setManualLatInput(String(preset.lat));
                          setManualLngInput(String(preset.lng));
                          setLocationConfirmed(true);
                          setConfirmationMethodLabel(`Manual preset (${preset.dist})`);
                          setErrors((prev) => ({ ...prev, coordinates: undefined }));
                        }}
                        style={{
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.72rem',
                          borderRadius: '6px',
                          background: 'rgba(15, 36, 66, 0.9)',
                          color: '#E2E8F0',
                          border: '1px solid rgba(53, 197, 244, 0.28)',
                          cursor: 'pointer'
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {errors.coordinates && (
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(239, 68, 68, 0.16)',
                  border: '1px solid rgba(239, 68, 68, 0.45)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#FCA5A5',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                {errors.coordinates}
              </div>
            )}

            {/* Privacy Guarantee */}
            <div
              className="flex items-start gap-2"
              style={{
                marginTop: '1.15rem',
                padding: '0.8rem',
                background: 'rgba(6, 20, 38, 0.8)',
                border: '1px solid rgba(53, 197, 244, 0.2)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                color: 'var(--color-text-muted)'
              }}
            >
              <ShieldCheck
                size={16}
                style={{ color: 'var(--color-lime-green)', flexShrink: 0, marginTop: '2px' }}
              />
              <span>
                <strong style={{ color: '#F8FAFC' }}>Coordinate Privacy:</strong> Plot coordinates are used strictly to retrieve regional NASA weather, soil moisture, and crop health data for your farm.
              </span>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div
          className="card flex items-center justify-between"
          style={{ padding: '1.25rem 1.5rem', flexWrap: 'wrap', gap: '1rem' }}
        >
          <div style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
            * Farm name, district, area, and a confirmed location inside West Bengal are required.
            {errors.submit && (
              <div style={{ color: '#F87171', marginTop: '0.25rem' }}>{errors.submit}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-lg btn-primary"
            style={{ minWidth: '240px' }}
          >
            <span>{isSubmitting ? 'Registering Plot...' : 'Save Farm & Open Dashboard'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
