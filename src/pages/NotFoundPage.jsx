import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div
      style={{
        padding: '6rem 1rem',
        textAlign: 'center',
        backgroundColor: 'var(--color-soft-bg)',
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <div className="container" style={{ maxWidth: '520px' }}>
        <h1
          style={{
            fontSize: '4.5rem',
            color: 'var(--color-bright-cyan)',
            marginBottom: '0.4rem',
            fontFamily: 'var(--font-mono)'
          }}
        >
          404
        </h1>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.85rem', color: '#F8FAFC' }}>
          Coordinates Outside Orbital Sector
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          The farm coordinate or portal route you requested does not exist or has been relocated.
        </p>
        <Link
          to="/"
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Home size={18} />
          <span>Return to AgroVision Mission Home</span>
        </Link>
      </div>
    </div>
  );
}
