import React from 'react';
import { TooltipBox } from './styled';

export default function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const items = payload.filter(p=>p.value!=null);
  return (
    <TooltipBox>
      <div style={{fontWeight:600, marginBottom:4}}>{label}</div>
      {items.map(it => (
        <div key={it.dataKey} style={{display:'flex', justifyContent:'space-between', gap:8}}>
          <span style={{color:it.color}}>{it.name}</span>
          <span style={{fontWeight:500}}>{it.value}</span>
        </div>
      ))}
    </TooltipBox>
  );
}

