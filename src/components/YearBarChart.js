import React, { useMemo, useRef, useState, useLayoutEffect, useEffect } from 'react';
import { Card, CardTitle } from './styled';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell } from 'recharts';
import CustomTooltip from './CustomTooltip';

export default function YearBarChart({ year, personYear, anyNonOver, winnerDiff, totalGiftsSelectedYear, winWidth }) {
  const barData = useMemo(()=> {
    const data = personYear.filter(p=>p.guess!=null).map(p=> ({ ...p, distance: p.diff, sortKey: p.diff }));
    return data.sort((a,b)=>{
      const aWin = (anyNonOver ? (!a.over && a.diff===winnerDiff) : (a.over && a.diff===winnerDiff));
      const bWin = (anyNonOver ? (!b.over && b.diff===winnerDiff) : (b.over && b.diff===winnerDiff));
      if (aWin !== bWin) return aWin ? -1 : 1;
      if (a.over !== b.over) return a.over ? 1 : -1;
      if (a.diff !== b.diff) return a.diff - b.diff;
      return a.person.localeCompare(b.person);
    });
  }, [personYear, anyNonOver, winnerDiff]);

  const barChartHeight = winWidth < 600 ? 320 : 400;
  const xTickAngle = winWidth < 500 ? -70 : -45;
  const xTickFontSize = winWidth < 500 ? 9 : 11;
  const baseBarSlot = winWidth < 600 ? 34 : 40;
  const requiredBarWidth = (barData.length * baseBarSlot) + 120;
  const barOuterRef = useRef(null);
  const [barOuterWidth, setBarOuterWidth] = useState(0);
  useLayoutEffect(()=>{
    const el = barOuterRef.current; if(!el) return; let frame=null;
    const update=()=>{ frame=null; const w=el.clientWidth; if(w && Math.abs(w-barOuterWidth)>1) setBarOuterWidth(w); };
    const ro = new ResizeObserver(()=>{ if(frame==null) frame=requestAnimationFrame(update); });
    ro.observe(el); update();
    return ()=>{ ro.disconnect(); if(frame) cancelAnimationFrame(frame); };
  }, [barOuterWidth]);
  const HYST = 16;
  const needScroll = barOuterWidth ? (requiredBarWidth > (barOuterWidth + HYST)) : false;
  const canDisableScroll = barOuterWidth ? (requiredBarWidth < (barOuterWidth - HYST)) : false;
  const [scrollMode, setScrollMode] = useState(false);
  useEffect(()=>{ if(scrollMode){ if(canDisableScroll) setScrollMode(false); } else { if(needScroll) setScrollMode(true); } }, [needScroll, canDisableScroll, scrollMode]);
  const innerBarWidth = scrollMode && barOuterWidth ? Math.max(requiredBarWidth, barOuterWidth) : '100%';

  return (
    <Card style={{position:'relative', gridColumn:'1 / -1'}}>
      <CardTitle>Guesses ({year}) vs Total Gifts</CardTitle>
      <div style={{fontSize:'.6rem', opacity:.6, margin:'-0.25rem 0 .35rem'}}>Sorted by closest guess (winner group first)</div>
      {totalGiftsSelectedYear!=null && (
        <div style={{position:'absolute', top:10, right:12, background:'rgba(255,107,107,0.15)', border:'1px solid #ff6b6b', padding:'.35rem .55rem', borderRadius:8, fontSize:'.6rem', letterSpacing:'.5px', backdropFilter:'blur(4px)'}}>
          Total: <strong style={{color:'#ffb3b3'}}>{totalGiftsSelectedYear}</strong>
        </div>
      )}
      <div style={{width: '100%', height: barChartHeight, overflowX: scrollMode ? 'auto':'hidden'}} ref={barOuterRef}>
        <div style={{width: innerBarWidth, height:'100%'}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{top:8,right:12,left:0,bottom:32}} barCategoryGap={winWidth<600? '8%':'10%'} barGap={-2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#244356" />
              <XAxis dataKey="person" stroke="#aac2d8" angle={xTickAngle} textAnchor="end" interval={0} height={winWidth<500?105:95} tick={{fontSize: xTickFontSize}} />
              <YAxis stroke="#aac2d8" tick={{fontSize: xTickFontSize}} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="guess" name="Guess" barSize={winWidth<600?12:16} radius={[3,3,0,0]}>
                {barData.map((entry, idx)=>{
                  const isWinner = entry.guess!=null && ((anyNonOver && !entry.over && entry.diff===winnerDiff) || (!anyNonOver && entry.over && entry.diff===winnerDiff));
                  let fill = '#4dabf7';
                  if (entry.over) fill = '#b3541e';
                  if (isWinner) fill = entry.over ? '#ff922b' : '#2b9348';
                  else if (!entry.over) {
                    const ratio = Math.min(1, entry.diff / ((totalGiftsSelectedYear||1)));
                    const g = Math.round(180 + (30 * (1-ratio)));
                    fill = `rgb(${50+Math.round(40*ratio)}, ${g}, 230)`;
                  }
                  return <Cell key={`cell-${idx}`} fill={fill} stroke={isWinner? '#fff' : undefined} strokeWidth={isWinner? 1.5: 0} />;
                })}
              </Bar>
              <ReferenceLine y={totalGiftsSelectedYear || 0} stroke="#ff6b6b" strokeWidth={6} ifOverflow="extendDomain" strokeOpacity={0.12} />
              <ReferenceLine y={totalGiftsSelectedYear || 0} stroke="#ff6b6b" strokeDasharray="6 4" strokeWidth={2} label={{value:'Total Gifts', position:'insideTop', fill:'#fff', fontSize:10}} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

