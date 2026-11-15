import React from 'react';
import { Database, Radio } from 'lucide-react';

export default function DemoBadge({ label = 'DEMO SEED', isLive = false }) {
  if (isLive) {
    return (
      <span
        className="badge badge-live"
        title="Live telemetry retrieved from backend service"
      >
        <Radio size={11} />
        {label === 'DEMO SEED' ? 'LIVE TELEMETRY' : label}
      </span>
    );
  }

  return (
    <span
      className="badge badge-demo"
      title="Scientifically calibrated West Bengal seed data representing real NASA / ICAR formats"
    >
      <Database size={11} />
      {label}
    </span>
  );
}
