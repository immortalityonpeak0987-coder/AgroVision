import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFarm } from '../../context/FarmContext';
import {
  Menu,
  Bell,
  CheckCircle,
  ChevronDown,
  MapPin,
  Layers,
  Globe,
  Radio,
  Satellite,
  PlusCircle
} from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const {
    activeFarm,
    farms,
    switchFarm,
    notifications,
    dismissNotification,
    language,
    toggleLanguage,
    t,
    formatArea,
    backendConnected
  } = useFarm();
  const [showFarmDropdown, setShowFarmDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const farmDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (farmDropdownRef.current && !farmDropdownRef.current.contains(event.target)) {
        setShowFarmDropdown(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const isDashboardView = location.pathname.startsWith('/app');

  return (
    <header
      className="no-print"
      style={{
        height: 'var(--navbar-height)',
        backgroundColor: 'rgba(6, 20, 38, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        color: 'var(--color-white)',
        borderBottom: '1px solid rgba(53, 197, 244, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 8px 28px rgba(2, 8, 19, 0.65)'
      }}
    >
      <div className="container flex items-center justify-between" style={{ height: '100%' }}>
        {/* Left: Brand & Sidebar Trigger */}
        <div className="flex items-center gap-3">
          {isDashboardView && (
            <button
              onClick={onToggleSidebar}
              style={{
                color: 'var(--color-bright-cyan)',
                padding: '0.45rem',
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(53, 197, 244, 0.08)',
                border: '1px solid rgba(53, 197, 244, 0.25)',
                borderRadius: 'var(--radius-md)'
              }}
              aria-label="Toggle Dashboard Sidebar"
            >
              <Menu size={20} />
            </button>
          )}

          <Link to="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                borderRadius: '10px',
                background: 'radial-gradient(circle, rgba(53, 197, 244, 0.18) 0%, transparent 70%)'
              }}
            >
              <img
                src="/assets/agrovision-logo.png"
                alt="AgroVision Emblem"
                style={{ height: '44px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: '#F8FAFC',
                    lineHeight: 1,
                    letterSpacing: '-0.02em'
                  }}
                >
                  Agro<span style={{ color: 'var(--color-lime-green)' }}>Vision</span>
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--color-text-muted)',
                  letterSpacing: '0.04em',
                  fontWeight: 600,
                  marginTop: '3px'
                }}
              >
                {t('Space Data to Farm Recovery Decisions', 'মহাকাশ তথ্য থেকে কৃষি পুনরুদ্ধার সিদ্ধান্ত')}
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav
          className="flex items-center"
          style={{ display: 'none', gap: '1.35rem' }}
          id="desktop-nav"
        >
          <Link
            to="/"
            style={{
              color: location.pathname === '/' ? 'var(--color-lime-green)' : '#E2E8F0',
              fontWeight: 600,
              fontSize: '0.88rem'
            }}
          >
            {t('Mission Home', 'হোম পেজ')}
          </Link>
          <Link
            to="/app/overview"
            style={{
              color: location.pathname === '/app/overview' ? 'var(--color-lime-green)' : '#E2E8F0',
              fontWeight: 600,
              fontSize: '0.88rem'
            }}
          >
            {t('Command Center', 'কমান্ড সেন্টার')}
          </Link>
          <Link
            to="/app/satellite"
            style={{
              color: location.pathname === '/app/satellite' ? 'var(--color-lime-green)' : '#E2E8F0',
              fontWeight: 600,
              fontSize: '0.88rem'
            }}
          >
            {t('GIS & Satellite', 'জিআইএস ও উপগ্রহ')}
          </Link>
          <Link
            to="/app/crop-planner"
            style={{
              color: location.pathname === '/app/crop-planner' ? 'var(--color-lime-green)' : '#E2E8F0',
              fontWeight: 600,
              fontSize: '0.88rem'
            }}
          >
            {t('Crop Planner', 'ফসল আবর্তন')}
          </Link>
          <Link
            to="/about"
            style={{
              color: location.pathname === '/about' ? 'var(--color-lime-green)' : '#E2E8F0',
              fontWeight: 600,
              fontSize: '0.88rem'
            }}
          >
            {t('Architecture', 'প্রকল্পের বিবরণ')}
          </Link>
        </nav>

        {/* Right: Controls, Active Farm Switcher, Notifications */}
        <div className="flex items-center gap-2">
          {/* Active Farm Selector */}
          {activeFarm && (
            <div ref={farmDropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowFarmDropdown(!showFarmDropdown)}
                aria-label="Switch Active Farm"
                className="flex items-center gap-2"
                style={{
                  background: 'rgba(11, 31, 58, 0.95)',
                  border: '1px solid rgba(181, 230, 29, 0.38)',
                  padding: '0.38rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  color: '#F8FAFC',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <MapPin size={14} style={{ color: 'var(--color-lime-green)', flexShrink: 0 }} />
                <span
                  style={{
                    maxWidth: '150px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {activeFarm.district} • {formatArea(activeFarm)}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--color-bright-cyan)' }} />
              </button>

              {/* Farm Switcher Dropdown Menu */}
              {showFarmDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '310px',
                    background: 'rgba(9, 25, 48, 0.98)',
                    backdropFilter: 'blur(20px)',
                    color: '#F8FAFC',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 20px 45px rgba(2, 8, 20, 0.85)',
                    border: '1px solid rgba(53, 197, 244, 0.35)',
                    zIndex: 250,
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      padding: '0.7rem 0.95rem',
                      background: 'rgba(6, 20, 38, 0.9)',
                      borderBottom: '1px solid rgba(53, 197, 244, 0.18)',
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: 'var(--color-bright-cyan)',
                      letterSpacing: '0.06em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{t('SELECT MONITORED FARM PLOT', 'পর্যবেক্ষণকৃত খামার নির্বাচন করুন')}</span>
                    <span>{farms.length} PLOTS</span>
                  </div>
                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {farms.map((f) => {
                      const isSelected = f.id === activeFarm.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() => {
                            switchFarm(f.id);
                            setShowFarmDropdown(false);
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '0.75rem 0.95rem',
                            borderBottom: '1px solid rgba(53, 197, 244, 0.12)',
                            background: isSelected
                              ? 'linear-gradient(90deg, rgba(56, 168, 50, 0.2), rgba(22, 139, 206, 0.12))'
                              : 'transparent',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.2rem',
                            cursor: 'pointer'
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <strong
                              style={{
                                fontSize: '0.85rem',
                                color: isSelected ? 'var(--color-lime-green)' : '#F8FAFC'
                              }}
                            >
                              {f.name}
                            </strong>
                            {isSelected && (
                              <CheckCircle size={15} style={{ color: 'var(--color-lime-green)' }} />
                            )}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {f.district} • {f.agroClimaticZone}
                          </span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--color-bright-cyan)'
                            }}
                          >
                            {Number(f.latitude).toFixed(4)}°N, {Number(f.longitude).toFixed(4)}°E •{' '}
                            {formatArea(f)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div
                    style={{
                      padding: '0.65rem 0.95rem',
                      textAlign: 'center',
                      background: 'rgba(6, 20, 38, 0.95)',
                      borderTop: '1px solid rgba(53, 197, 244, 0.18)'
                    }}
                  >
                    <Link
                      to="/app/register-farm"
                      onClick={() => setShowFarmDropdown(false)}
                      className="flex items-center justify-center gap-1"
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--color-lime-green)'
                      }}
                    >
                      <PlusCircle size={14} />
                      <span>{t('Register New Farm Plot', 'নতুন খামার নিবন্ধন করুন')}</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications Dropdown */}
          <div ref={notifDropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              style={{
                background: 'rgba(15, 36, 66, 0.85)',
                border: '1px solid rgba(53, 197, 244, 0.25)',
                color: '#F8FAFC',
                padding: '0.45rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                cursor: 'pointer'
              }}
              aria-label="Notifications"
            >
              <Bell size={17} />
              {notifications.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    width: '9px',
                    height: '9px',
                    background: 'var(--color-lime-green)',
                    borderRadius: '50%',
                    boxShadow: '0 0 8px var(--color-lime-green)'
                  }}
                />
              )}
            </button>

            {showNotifDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '320px',
                  background: 'rgba(9, 25, 48, 0.98)',
                  backdropFilter: 'blur(20px)',
                  color: '#F8FAFC',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 20px 45px rgba(2, 8, 20, 0.85)',
                  border: '1px solid rgba(53, 197, 244, 0.35)',
                  zIndex: 250,
                  maxHeight: '380px',
                  overflowY: 'auto'
                }}
              >
                <div
                  style={{
                    padding: '0.7rem 1rem',
                    background: 'rgba(6, 20, 38, 0.95)',
                    borderBottom: '1px solid rgba(53, 197, 244, 0.18)',
                    fontSize: '0.74rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: 'var(--color-bright-cyan)',
                    letterSpacing: '0.06em'
                  }}
                >
                  {t('SATELLITE & AGRONOMIC ALERTS', 'উপগ্রহ ও কৃষি সতর্কবার্তা')}
                </div>
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: '1.25rem',
                      textAlign: 'center',
                      fontSize: '0.84rem',
                      color: 'var(--color-text-muted)'
                    }}
                  >
                    {t('No unread telemetry alerts.', 'কোনো অপঠিত সতর্কবার্তা নেই।')}
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '0.8rem 1rem',
                        borderBottom: '1px solid rgba(53, 197, 244, 0.12)',
                        fontSize: '0.82rem'
                      }}
                    >
                      <div
                        className="flex items-center justify-between"
                        style={{ marginBottom: '0.25rem' }}
                      >
                        <strong style={{ color: 'var(--color-lime-green)', fontSize: '0.83rem' }}>
                          {n.title}
                        </strong>
                        <button
                          onClick={() => dismissNotification(n.id)}
                          aria-label={`Dismiss ${n.title}`}
                          style={{
                            color: 'var(--color-text-muted)',
                            fontSize: '0.9rem',
                            padding: '0 0.25rem'
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          color: 'var(--color-text-dark)',
                          fontSize: '0.78rem',
                          lineHeight: 1.45
                        }}
                      >
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Quick Dashboard Action */}
          {!isDashboardView && (
            <Link
              to="/app/overview"
              className="btn btn-sm btn-accent"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Satellite size={14} />
              <span>{t('Command Center', 'কমান্ড সেন্টার')}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
