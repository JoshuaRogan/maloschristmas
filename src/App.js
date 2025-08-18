import React, { useEffect, useState, useMemo, useRef, useLayoutEffect, useCallback } from 'react';
import styled from 'styled-components';
import Papa from 'papaparse';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%; /* was 100vw causing horizontal bleed */
  box-sizing: border-box;
  padding: 1.2rem 1.75rem 4.5rem;
  background: radial-gradient(circle at 20% 15%, rgba(220,40,40,0.15), transparent 60%),
              radial-gradient(circle at 80% 85%, rgba(220,40,40,0.08), transparent 55%),
              linear-gradient(135deg,#0c2817,#0f3a22 55%, #102c33 85%);
  color: #f6fbf7;
  font-family: "Helvetica Neue", Arial, sans-serif;
  font-size: 19px; /* increased base font size */
  overflow-x: hidden; /* prevent minor sub-pixel overflow */
  @media (max-width: 700px) {
    padding: 1rem 1rem 3.5rem;
    font-size: 17px;
  }
`;

const Title = styled.h1`
  margin: 0 0 1.1rem;
  font-size: 3rem; /* bigger */
  text-align: center;
  letter-spacing: 1.5px;
  font-weight: 700;
  background: linear-gradient(90deg,#e8d5a6,#f5f1e3);
  -webkit-background-clip: text;
  color: transparent;
  text-shadow: 0 2px 6px rgba(0,0,0,0.45);
  @media (max-width: 900px) { font-size: 2.55rem; }
  @media (max-width: 700px) { font-size: 2.25rem; }
  @media (max-width: 420px) { font-size: 1.9rem; }
`;

const Card = styled.div`
  background: linear-gradient(155deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04));
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 16px;
  padding: 1.05rem 1.35rem 1.35rem;
  box-shadow: 0 6px 18px -6px rgba(0,0,0,0.55);
  display: flex;
  flex-direction: column;
  @media (max-width: 700px) {
    padding: .95rem 1rem 1.05rem;
    border-radius: 14px;
  }
`;

const CardTitle = styled.h2`
  font-size: 1.3rem;
  margin: 0 0 .85rem;
  font-weight: 600;
  letter-spacing: .75px;
  display: flex;
  align-items: center;
  gap: .55rem;
  color: #f3f8f4;
`;

const Select = styled.select`
  background: linear-gradient(140deg,#185c38,#134d30);
  color: #f7fff9;
  border: 1px solid #2a7a4d;
  padding: .75rem 2.75rem .75rem 1rem; /* extra right space for arrow */
  border-radius: 14px;
  font-size: 1.05rem; /* bigger */
  font-weight: 600;
  outline: none;
  margin-left: 0;
  box-shadow: 0 0 0 2px rgba(255,255,255,0.05) inset, 0 2px 6px -2px rgba(0,0,0,.5);
  cursor: pointer;
  line-height: 1.1;
  appearance: none;
  -webkit-appearance: none;
  transition: background .3s, box-shadow .3s, border-color .3s;
  &:hover { background: linear-gradient(140deg,#1d7146,#155836); }
  &:focus { box-shadow: 0 0 0 2px #2fa567, 0 2px 8px -2px rgba(0,0,0,.55); }
`;

// Custom wrapper & arrow for select
const YearSelectWrap = styled.div`
  position: relative;
  display: inline-flex;
  align-items: stretch;
  &:after {
    content: '';
    position: absolute;
    pointer-events: none;
    right: 14px;
    top: 50%;
    width: 10px; height: 10px;
    margin-top: -5px;
    background: linear-gradient(135deg,#f0f9f2,#d3efe0);
    clip-path: polygon(50% 65%, 0 0, 100% 0);
    opacity: .9;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,.4));
    transition: transform .25s;
  }
  &:focus-within:after { transform: translateY(2px) rotate(180deg); }
`;

const YearNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: center; /* center horizontally */
  gap: .65rem;
  flex-wrap: wrap;
`;
const YearArrow = styled.button`
  background: linear-gradient(140deg,#1d6d42,#155232);
  color: #fff;
  border: 1px solid #248553;
  width: 38px; height: 38px;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px -2px rgba(0,0,0,.5);
  transition: background .25s, transform .15s, box-shadow .25s;
  &:hover:not(:disabled){ background:#208a52; box-shadow:0 4px 10px -4px rgba(0,0,0,.55); }
  &:active:not(:disabled){ transform: scale(.92); }
  &:disabled { opacity:.35; cursor: default; }
`;

const WinnerHighlight = styled.div`
  grid-column: 1 / -1;
  position: relative;
  padding: 1rem 1.2rem 1.1rem;
  border-radius: 18px;
  background:
    radial-gradient(circle at 78% 22%, rgba(255,255,255,0.15), transparent 65%),
    linear-gradient(120deg,#246a3e,#1c5230 55%, #154427);
  border: 1px solid rgba(255,255,255,0.18);
  box-shadow: 0 10px 28px -10px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.08) inset;
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  align-items: flex-start; /* allow tall image to expand */
  overflow: visible; /* no cropping */
  &:before, &:after {
    content: '';
    position: absolute;
    width: 260px; height: 260px;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 70%);
    top: -140px; right: -120px;
    opacity: .25;
    pointer-events: none;
    filter: blur(2px);
  }
  &:after { top: auto; bottom: -150px; left: -120px; right: auto; background: radial-gradient(circle at 70% 70%, rgba(255,255,255,0.18), transparent 75%); }
`;
const WinnerTitle = styled.div`
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: .8px;
  display: flex;
  align-items: center;
  gap: .55rem;
  background: linear-gradient(90deg,#ffe8a3,#fff1c9);
  -webkit-background-clip: text;
  color: transparent;
  text-shadow: 0 2px 10px rgba(0,0,0,0.4);
`;
const WinnerNames = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  gap: .9rem;
  flex-wrap: wrap;
`;
const WinnerBadge = styled.span`
  background: linear-gradient(145deg,#ffcf4d,#ffb347);
  color: #2b2b1a;
  padding: .4rem .75rem .45rem;
  border-radius: 999px;
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: .45rem;
  box-shadow: 0 4px 10px -4px rgba(0,0,0,0.6);
`;
const WinnerPerson = styled.div`
  position: relative;
  padding: .55rem .85rem .6rem 1rem;
  border-radius: 14px;
  background: linear-gradient(135deg,#2b9348,#1d6d34);
  font-size: .95rem;
  line-height: 1.2;
  display: flex;
  flex-direction: column;
  gap: .3rem;
  box-shadow: 0 6px 14px -6px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.08) inset;
  min-width: 160px;
`;
const WinnerMeta = styled.div`
  font-size: .6rem;
  letter-spacing: .6px;
  opacity: .8;
  text-transform: uppercase;
  font-weight: 600;
`;
const WinnerGuess = styled.div`
  font-size: .85rem;
  font-weight: 600;
  letter-spacing: .5px;
  display: flex;
  align-items: baseline;
  gap: .35rem;
`;
const WinnersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(420px,1fr));
  gap: 1rem 1.1rem;
`;
const StatBoxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(140px,1fr));
  gap: .65rem .75rem;
  margin-top: .4rem;
`;
const StatBox = styled.div`
  background: linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  padding: .55rem .6rem .6rem;
  display: flex;
  flex-direction: column;
  gap: .25rem;
  position: relative;
  overflow: hidden;
  min-height: 70px;
  &:before {
    content: '';
    position: absolute;
    top:0; right:0;
    width: 42px; height:42px;
    background: radial-gradient(circle at 65% 35%, rgba(255,255,255,0.18), transparent 70%);
    opacity:.35;
    pointer-events:none;
  }
`;
const StatLabel = styled.div`
  font-size: .7rem;
  letter-spacing: 1px;
  font-weight: 600;
  text-transform: uppercase;
  opacity: .7;
`;
const StatValue = styled.div`
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: .6px;
  display: flex;
  align-items: baseline;
  gap: .45rem;
  flex-wrap: wrap;
  @media (max-width:600px){ font-size: 1.15rem; }
`;
const StatMeta = styled.div`
  font-size: .7rem;
  opacity: .6;
  line-height: 1.25;
  letter-spacing: .5px;
`;
// Re-added simple stat / footer / loading components used later
const Stat = styled.div`
  font-size: 1rem;
  margin-top: .35rem;
  opacity: .9;
`;
// Removed FormulaNote to keep style consistent with simple Stat usage
const Footer = styled.footer`
  text-align: center;
  margin-top: 2.4rem;
  font-size: .75rem;
  opacity: .65;
  letter-spacing: .5px;
`;
const Loading = styled.div`
  text-align: center;
  padding: 3.25rem 1rem;
  font-size: 1.25rem;
  letter-spacing: 1.2px;
`;
const TableScroll = styled.div`
  overflow-y: auto;
  max-height: ${props=>props.$maxHeight || 320}px;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: #2c6d89 transparent;
  &::-webkit-scrollbar { width: 10px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: linear-gradient(#245a72,#1d485b); border-radius: 20px; }
`;
const Table = styled.table`
  width:100%;
  border-collapse: collapse;
  font-size:.85rem;
  th, td { padding:6px 8px; }
  thead tr { position:sticky; top:0; z-index:5; background:#10344c; box-shadow:0 2px 4px -2px rgba(0,0,0,.55); }
  thead th { font-weight:600; font-size:.7rem; letter-spacing:.5px; text-transform:uppercase; opacity:.9; }
  tbody tr:nth-child(even) { background: rgba(255,255,255,0.035); }
  tbody tr:hover { background: rgba(255,255,255,0.06); }
  tbody tr.highlight { background: linear-gradient(90deg,#2b9348,#1d6d34); }
  tbody tr.highlight.over { background: linear-gradient(90deg,#b3541e,#8a3f15); }
`;

// Custom tooltip component for better contrast
const TooltipBox = styled.div`
  background:#114229;
  color:#fff;
  border:1px solid #2d7a4d;
  padding:.6rem .7rem .65rem;
  font-size:.8rem; /* bigger tooltip */
  line-height:1.25;
  border-radius:10px;
  box-shadow:0 6px 16px -4px rgba(0,0,0,.6);
  max-width:200px;
`;
function CustomTooltip({ active, payload, label }) {
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

// Hook for window width
function useWindowWidth() {
  const [w,setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(()=>{
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return ()=> window.removeEventListener('resize', h);
  },[]);
  return w;
}

function parseCsv(url) {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: reject
    });
  });
}

function sanitizeRow(row) {
  const clean = { Person: (row.Person || row['Person '] || '').trim() };
  Object.keys(row).forEach(k => {
    if (k === 'Person' || k === 'Person ') return;
    const v = row[k];
    if (v === undefined || v === null || v === '') return;
    const num = Number(String(v).replace(/[^0-9.-]/g,''));
    if (!isNaN(num)) clean[k.trim()] = num;
  });
  return clean;
}

function buildYearTotals(rows) {
  const totals = {};
  rows.forEach(r => {
    Object.entries(r).forEach(([year, val]) => {
      if (year === 'Person') return;
      if (typeof val === 'number') {
        totals[year] = (totals[year] || 0) + val;
      }
    });
  });
  return Object.entries(totals)
    .map(([year, total]) => ({ year, total }))
    .sort((a,b)=>a.year.localeCompare(b.year));
}

function combinePersonYear(giftsRows, guessRows, year, totalYearGifts) {
  const contributions = {};
  giftsRows.forEach(r => { contributions[r.Person] = r[year] || 0; });
  const guessesByPerson = {};
  guessRows.forEach(r => { const v = r[year]; if (v === 0 || v === '0') return; guessesByPerson[r.Person] = v; });
  const people = Array.from(new Set([...Object.keys(contributions), ...Object.keys(guessesByPerson)])).filter(p=>p);
  const rows = people.map(p => {
    const guessRaw = guessesByPerson[p];
    const guess = (guessRaw === 0 || guessRaw === '0') ? null : guessRaw; // ensure 0 ignored
    if (guess == null || guess === '') {
      return { person: p, guess: null, contributed: contributions[p] || 0, total: totalYearGifts, over: null, diff: null };
    }
    const over = guess > totalYearGifts;
    const diff = over ? (guess - totalYearGifts) : (totalYearGifts - guess); // distance (over or under)
    return { person: p, guess, contributed: contributions[p] || 0, total: totalYearGifts, over, diff };
  });
  // Sort: valid (not over) first by smallest diff (closest without going over), then over guesses by smallest overage.
  // Add stable alphabetical tiebreaker so ties are deterministically ordered.
  rows.sort((a,b)=>{
    // Put rows with no guess (over === null) at the bottom no matter what
    const rankOver = (r)=> r.over === false ? 0 : (r.over === true ? 1 : 2); // 0=valid under,1=over,2=no guess
    const roA = rankOver(a);
    const roB = rankOver(b);
    if (roA !== roB) return roA - roB;
    // Both have same over-rank; if no guesses, keep relative order (return 0)
    if (roA === 2) return 0;
    // Now both have guesses (either under or over)
    if (a.diff !== b.diff) return a.diff - b.diff;
    return a.person.localeCompare(b.person);
  });
  return rows;
}

// Comparator reused for leaderboard safety
function compareGuessRows(a,b){
  const rankOver = (r)=> r.over === false ? 0 : (r.over === true ? 1 : 2); // 0=valid under,1=over,2=no guess
  const roA = rankOver(a); const roB = rankOver(b);
  if (roA !== roB) return roA - roB;
  if (roA === 2) return 0;
  if (a.diff !== b.diff) return a.diff - b.diff;
  return a.person.localeCompare(b.person);
}

const GroupWrapper = styled.div`
  margin-top: 1.25rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 1rem 1.1rem 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  @media (max-width:700px){
    padding: .85rem .75rem 1rem;
    border-radius: 12px;
  }
`;
const YearGrid = styled.div`
  display: grid;
  /* Flexible responsive layout: two columns when space allows, otherwise stack */
  grid-template-columns: repeat(auto-fit,minmax(340px,1fr));
  align-items: stretch; /* stretch items so columns share tallest height */
  gap: 1rem 1.1rem;
  @media (min-width: 1200px) {
    /* Prefer a narrower stats column + wide chart when plenty of space */
    grid-template-columns: minmax(320px,380px) 1fr;
  }
`;
// New layout + image box for yearly leaderboard
const YearLeaderboardLayout = styled.div`
  display: flex;
  gap: 1.1rem;
  align-items: stretch; /* stretch image & table to full card height */
  flex: 1 1 auto;
  min-height: 0; /* allow children to shrink for scroll */
`;
// Re-added WinnerImageBox (was removed in refactor)
const WinnerImageBox = styled.div`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 4px;
  background: linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.18);
  box-shadow: 0 6px 14px -6px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset;
  border-radius: 18px;
  cursor: pointer;
  transition: transform .25s ease, box-shadow .25s ease;
  width: 170px; /* base width */
  color: rgba(255,255,255,0.7);
  font-size: .65rem;
  letter-spacing: .5px;
  &:hover { transform: scale(1.02); box-shadow:0 8px 18px -6px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.1) inset; }
  &:active { transform: scale(.97); }
  &.portrait { width: 130px; } /* narrower for tall images so height not excessive */
  @media (max-width:600px){ width:140px; &.portrait { width:120px; } }
`;
const WinnerImage = styled.img`
  display:block;
  width:100%;
  height:auto;
  object-fit:contain;
  max-width:100%;
`;
// Helper wrapper so table can flex-grow
const LeaderboardTableCol = styled.div`
  flex: 1 1 320px;
  min-width: 0; /* prevent overflow */
  display: flex;
  flex-direction: column;
  min-height: 0; /* enable TableScroll flex overflow */
`;
// Carousel styled components
const CarouselOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.2rem;
`;
const CarouselContent = styled.div`
  position: relative;
  max-width: 95vw;
  max-height: 90vh;
  width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .75rem;
`;
const CarouselImageWrap = styled.div`
  position: relative;
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 18px;
  border:1px solid rgba(255,255,255,0.15);
  background: #0b2416;
  box-shadow:0 12px 32px -10px rgba(0,0,0,0.75);
  img { max-width:100%; max-height:75vh; object-fit: contain; }
`;
const CarouselNavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.15);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.35);
  width: 54px; height: 54px;
  border-radius: 50%;
  font-size: 1.8rem;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: background .25s, transform .25s;
  &:hover { background: rgba(255,255,255,0.25); }
  &:active { transform: translateY(-50%) scale(.9); }
  &:disabled { opacity: .3; cursor: default; }
`;
const CarouselCloseButton = styled.button`
  position: absolute;
  top: -14px; right: -14px;
  background: #e04242;
  color:#fff;
  border:none;
  width:46px; height:46px;
  border-radius:50%;
  font-size:1.2rem;
  font-weight:700;
  cursor:pointer;
  box-shadow:0 6px 16px -6px rgba(0,0,0,.7);
  display:flex; align-items:center; justify-content:center;
  transition: background .25s, transform .25s;
  &:hover { background:#ff5d5d; }
  &:active { transform: scale(.9); }
`;
const CarouselYear = styled.div`
  font-size: .8rem;
  letter-spacing: 1px;
  font-weight: 600;
  text-transform: uppercase;
  color: #ffe6a8;
  text-shadow:0 2px 4px rgba(0,0,0,.6);
`;

function App() {
  const [gifts, setGifts] = useState(null);
  const [guesses, setGuesses] = useState(null);
  const [year, setYear] = useState('2024');
  const [error, setError] = useState(null);
  const [winnerImageOrientation, setWinnerImageOrientation] = useState('landscape');
  // define image load handler (was missing)
  const onWinnerImgLoad = (e) => {
    const img = e && e.target;
    if(!img) return;
    const { naturalWidth: nw, naturalHeight: nh } = img;
    if(nw && nh) {
      setWinnerImageOrientation(nh > nw * 1.15 ? 'portrait' : 'landscape');
    }
  };
  // Removed sortMode state (always sorted by closest now)
  const winWidth = useWindowWidth();

  useEffect(()=>{
    let cancelled = false;
    (async () => {
      try {
        const [giftsRaw, guessesRaw] = await Promise.all([
          parseCsv('/gifts_count.csv'),
          parseCsv('/guess_counts.csv')
        ]);
        if (cancelled) return;
        const giftsClean = giftsRaw.map(sanitizeRow);
        const guessesClean = guessesRaw.map(sanitizeRow);
        setGifts(giftsClean);
        setGuesses(guessesClean);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load');
      }
    })();
    return ()=>{ cancelled = true; };
  }, []);

  const giftsYearTotals = useMemo(()=> gifts ? buildYearTotals(gifts) : [], [gifts]);
  const allYears = useMemo(()=> giftsYearTotals.map(d=>d.year), [giftsYearTotals]);
  useEffect(()=>{
    if (allYears.length && !allYears.includes(year)) {
      setYear(allYears[allYears.length - 1]);
    }
  }, [allYears, year]);

  const personYear = useMemo(()=> (gifts && guesses && year) ? combinePersonYear(gifts, guesses, year, (giftsYearTotals.find(d=>d.year===year)||{}).total || 0) : [], [gifts, guesses, year, giftsYearTotals]);
  const sortedPersonYear = useMemo(()=> personYear.filter(r=>r.guess!=null).slice().sort(compareGuessRows), [personYear]);
  const totalGiftsSelectedYear = useMemo(()=> {
    const y = giftsYearTotals.find(d=>d.year===year);
    return y ? y.total : null;
  }, [giftsYearTotals, year]);
  const { winnerDiff, anyNonOver } = useMemo(()=>{
    const valid = personYear.filter(p=>p.guess!=null);
    if (!valid.length) return { winnerDiff: null, anyNonOver: false };
    const nonOver = valid.filter(p=>!p.over);
    if (nonOver.length) {
      const d = Math.min(...nonOver.map(p=>p.diff));
      return { winnerDiff: d, anyNonOver: true };
    }
    // All guesses are over: winner is smallest overage
    const d = Math.min(...valid.map(p=>p.diff));
    return { winnerDiff: d, anyNonOver: false };
  }, [personYear]);
  // NEW: derive the current year's winners (handles ties & all-over years)
  const currentYearWinners = useMemo(()=>{
    if (winnerDiff == null) return [];
    return personYear.filter(p=>p.guess!=null && ((anyNonOver && !p.over && p.diff===winnerDiff) || (!anyNonOver && p.over && p.diff===winnerDiff)));
  }, [personYear, winnerDiff, anyNonOver]);

  // NEW: Year statistics aggregation
  const yearAgg = useMemo(()=>{
    const withGuess = personYear.filter(p=>p.guess!=null);
    if (!withGuess.length) return null;
    const worstDiff = Math.max(...withGuess.map(p=>p.diff));
    const worstPeople = withGuess.filter(p=>p.diff === worstDiff).map(p=>p.person);
    const guesses = withGuess.map(p=>p.guess).sort((a,b)=>a-b);
    const avgGuess = guesses.reduce((a,b)=>a+b,0)/guesses.length;
    const medianGuess = guesses.length % 2 ? guesses[(guesses.length-1)/2] : (guesses[guesses.length/2 -1] + guesses[guesses.length/2])/2;
    const overCount = withGuess.filter(p=>p.over).length;
    const perfectCount = withGuess.filter(p=>!p.over && p.diff===0).length;
    const meanAbsDiff = withGuess.reduce((a,b)=>a+b.diff,0)/withGuess.length;
    const range = `${guesses[0]} - ${guesses[guesses.length-1]}`; // ASCII hyphen
    return { worstDiff, worstPeople, avgGuess, medianGuess, overCount, perfectCount, meanAbsDiff, range, totalGuesses: withGuess.length };
  }, [personYear]);

  // UPDATED winnersByYear to support all-over years
  const winnersByYear = useMemo(()=>{
    if (!gifts || !guesses || !giftsYearTotals.length) return [];
    return giftsYearTotals.map(({year, total}) => {
      const rows = combinePersonYear(gifts, guesses, year, total);
      const withGuesses = rows.filter(r=>r.guess!=null);
      if (!withGuesses.length) return { year, winners: [] };
      const nonOver = withGuesses.filter(r=>!r.over);
      const candidatePool = nonOver.length ? nonOver : withGuesses; // all over fallback
      const best = Math.min(...candidatePool.map(r=>r.diff));
      const winners = candidatePool.filter(r=>r.diff === best).map(r=>({ person: r.person, diff: r.diff, over: r.over }));
      return { year, winners, best, allOver: !nonOver.length };
    }).filter(y=>y.winners.length);
  }, [gifts, guesses, giftsYearTotals]);
  const overallWinCounts = useMemo(()=>{
    const map = {};
    winnersByYear.forEach(y=> y.winners.forEach(w=> {
      if(!map[w.person]) map[w.person] = { person: w.person, wins: 0, yearsExactMap: {} };
      map[w.person].wins += 1;
      // store whether this year was an exact (spot-on) guess (diff 0 and not over)
      const isExact = (w.diff === 0 && !w.over);
      // If multiple winners tied exact, this keeps true if any exact occurrence
      if(map[w.person].yearsExactMap[y.year] !== true) {
        map[w.person].yearsExactMap[y.year] = isExact;
      }
    }));
    return Object.values(map).map(entry => {
      const yearsDetailed = Object.keys(entry.yearsExactMap).sort().map(yr=> ({ year: yr, exact: !!entry.yearsExactMap[yr] }));
      return {
        person: entry.person,
        wins: entry.wins,
        yearsDetailed
      };
    }).sort((a,b)=> b.wins - a.wins || a.person.localeCompare(b.person));
  }, [winnersByYear]);

  // Best Guesser Index (accuracy regardless of over/under):
  // For each person-year with a guess we compute absolute error and relative error (abs/total).
  // Score per year = 1 - relativeError (clamped at 0). Index = average(score)*100.
  // Provides: years participated, avg abs error, median abs error, avg relative error, index.
  const bestGuessers = useMemo(()=>{
    if(!guesses || !giftsYearTotals.length) return [];
    const totalMap = Object.fromEntries(giftsYearTotals.map(g=>[g.year, g.total]));
    const stats = [];
    guesses.forEach(row => {
      const person = row.Person;
      if(!person) return;
      const absErrors = [];
      const relScores = [];
      Object.entries(row).forEach(([yr, val]) => {
        if(yr === 'Person') return;
        if(val == null || val === '' || Number(val) === 0) return; // skip zero guesses
        const total = totalMap[yr];
        if(!total || total === 0) return;
        const guessVal = Number(val);
        if(isNaN(guessVal)) return;
        const absErr = Math.abs(guessVal - total);
        absErrors.push(absErr);
        const relErr = absErr / total;
        const score = Math.max(0, 1 - relErr); // accuracy score 0..1
        relScores.push(score);
      });
      if(!absErrors.length) return;
      absErrors.sort((a,b)=>a-b);
      const yearsParticipated = absErrors.length;
      const avgAbs = absErrors.reduce((a,b)=>a+b,0)/yearsParticipated;
      const medianAbs = yearsParticipated % 2 ? absErrors[(yearsParticipated-1)/2] : (absErrors[yearsParticipated/2 -1] + absErrors[yearsParticipated/2]) / 2;
      const avgScore = relScores.reduce((a,b)=>a+b,0)/relScores.length; // accuracy component 0..1
      stats.push({ person, yearsParticipated, avgAbsError: avgAbs, medianAbsError: medianAbs, avgScore });
    });
    // Require 6+ years
    const eligible = stats.filter(s=>s.yearsParticipated >= 6);
    if(!eligible.length) return [];
    const maxYears = Math.max(...eligible.map(s=>s.yearsParticipated));
    const CAP_YEARS = 10; // cap participation benefit at 10 years
    const denom = Math.min(maxYears, CAP_YEARS);
    const scored = eligible.map(s=>{
      const participationRatio = Math.min(s.yearsParticipated, CAP_YEARS) / denom; // capped ratio 0..1
      const finalIndex = s.avgScore * participationRatio * 100; // 0..100
      return {
        ...s,
        baseAccuracyPct: s.avgScore * 100,
        index: Math.round(finalIndex * 10) / 10
      };
    });
    return scored.sort((a,b)=> b.index - a.index || a.avgAbsError - b.avgAbsError || a.person.localeCompare(b.person));
  }, [guesses, giftsYearTotals]);
  // Mapping year -> image path (add more entries as photos are added in /public/christmas_winners)
  const winnerImageMap = useMemo(() => ({
    '2024': '/christmas_winners/winner_2024.jpg',
    '2023': '/christmas_winners/winner_2023.jpg',
    '2022': '/christmas_winners/winner_2022.jpg',
    '2021': '/christmas_winners/winner_2021.jpg',
    '2020': '/christmas_winners/winner_2020.jpg',

    '2016': '/christmas_winners/winner_2016.jpg',
    '2015': '/christmas_winners/winner_2015.jpg',

    '2013': '/christmas_winners/winner_2013.jpg',
    '2012': '/christmas_winners/winner_2012.jpg',

    '2008': '/christmas_winners/winner_2008.jpg',
    '2007': '/christmas_winners/winner_2007.jpg',

    '2004': '/christmas_winners/winner_2004.jpg',
    '2001': '/christmas_winners/winner_2001.jpg',

    '1997': '/christmas_winners/winner_1997.jpg',

    '1994': '/christmas_winners/winner_1994.jpg',
    '1993': '/christmas_winners/winner_1993.jpg',
    '1992': '/christmas_winners/winner_1992.jpg',
    '1990': '/christmas_winners/winner_1990.jpg',

    '1989': '/christmas_winners/winner_1989.jpg',
  }), []);
  // Carousel data derived from map
  const carouselImages = useMemo(() => Object.entries(winnerImageMap)
      .filter(([,src])=> !!src)
      .map(([year, src]) => ({ year, src }))
      .sort((a,b)=> b.year.localeCompare(a.year)), [winnerImageMap]);
  const [showCarousel, setShowCarousel] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const openCarouselForYear = (yr) => {
    const idx = carouselImages.findIndex(i=>i.year === yr);
    setCarouselIndex(idx >=0 ? idx : 0);
    setShowCarousel(true);
  };
  const closeCarousel = useCallback(() => setShowCarousel(false), []);
  const goPrev = useCallback(() => setCarouselIndex(i=> i>0 ? i-1 : i), []);
  const goNext = useCallback(() => setCarouselIndex(i=> i<carouselImages.length-1 ? i+1 : i), [carouselImages.length]);
  // Keyboard navigation & ESC
  useEffect(()=>{
    if(!showCarousel) return;
    const h = (e)=>{
      if(e.key === 'Escape') closeCarousel();
      else if(e.key === 'ArrowLeft') goPrev();
      else if(e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', h);
    return ()=> window.removeEventListener('keydown', h);
  }, [showCarousel, carouselImages.length, closeCarousel, goPrev, goNext]);
  // Prevent body scroll while open
  useEffect(()=>{
    if(showCarousel) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return ()=> { document.body.style.overflow = prev; };
    }
  }, [showCarousel]);
  // Chart + layout calculations (restored)
  const barData = useMemo(()=> {
    const data = personYear.filter(p=>p.guess!=null).map(p=> ({
      ...p,
      distance: p.diff,
      sortKey: p.diff,
    }));
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
  const lineChartHeight = winWidth < 600 ? 230 : 300;
  const xTickAngle = winWidth < 500 ? -70 : -45;
  const xTickFontSize = winWidth < 500 ? 9 : 11;
  const baseBarSlot = winWidth < 600 ? 34 : 40;
  const requiredBarWidth = (barData.length * baseBarSlot) + 120;
  const barOuterRef = useRef(null);
  const [barOuterWidth, setBarOuterWidth] = useState(0);
  useLayoutEffect(()=>{
    const el = barOuterRef.current;
    if(!el) return;
    let frame = null;
    const update = () => {
      frame = null;
      const w = el.clientWidth;
      if (w && Math.abs(w - barOuterWidth) > 1) setBarOuterWidth(w);
    };
    const ro = new ResizeObserver(()=>{ if(frame==null) frame = requestAnimationFrame(update); });
    ro.observe(el);
    update();
    return ()=> { ro.disconnect(); if(frame) cancelAnimationFrame(frame); };
  }, [barOuterWidth]);
  const HYST = 16;
  const needScroll = barOuterWidth ? (requiredBarWidth > (barOuterWidth + HYST)) : false;
  const canDisableScroll = barOuterWidth ? (requiredBarWidth < (barOuterWidth - HYST)) : false;
  const [scrollMode, setScrollMode] = useState(false);
  useEffect(()=>{
    if(scrollMode) {
      if(canDisableScroll) setScrollMode(false);
    } else {
      if(needScroll) setScrollMode(true);
    }
  }, [needScroll, canDisableScroll, scrollMode]);
  const innerBarWidth = scrollMode && barOuterWidth ? Math.max(requiredBarWidth, barOuterWidth) : '100%';
  const yearIndex = allYears.indexOf(year);
  const prevYear = yearIndex > 0 ? allYears[yearIndex - 1] : null;
  const nextYear = yearIndex >= 0 && yearIndex < allYears.length - 1 ? allYears[yearIndex + 1] : null;
  if (error) return <Wrapper><Loading>Error: {error}</Loading></Wrapper>;
  if (!gifts || !guesses) return <Wrapper><Loading>Loading Christmas Magic...</Loading></Wrapper>;
  return (
    <Wrapper>
      <Title>Malos Family Christmas Gift & Guess Dashboard</Title>
      <Card style={{gridColumn:'1/-1'}}>
        <CardTitle>
          Total Gifts Over Years
          <span style={{fontSize: '.65rem', fontWeight: 400, opacity: .7}}> (Sum of individual gift counts)</span>
        </CardTitle>
        <div style={{width: '100%', height: lineChartHeight}}>
          <ResponsiveContainer>
            <LineChart data={giftsYearTotals} margin={{top:10,right:20,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#244356" />
              <XAxis dataKey="year" stroke="#aac2d8" angle={-35} textAnchor="end" height={winWidth<600?50:60} interval={Math.ceil(giftsYearTotals.length/12)} tick={{fontSize: winWidth<500?9:11}} />
              <YAxis stroke="#aac2d8" tick={{fontSize: winWidth<500?9:11}} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="total" stroke="#ffbb33" strokeWidth={2.5} dot={{r:winWidth<500?2:3}} activeDot={{r:winWidth<500?4:5}} name="Total Gifts" />
              {totalGiftsSelectedYear && (
                <ReferenceLine x={year} stroke="#ff6b6b" label={{value:`${year}`, position:'insideTop', fill:'#fff', fontSize:10}} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      {/* Grouped Year Section */}
      <GroupWrapper>
        <YearNav style={{margin:'0.5rem 0 0.75rem'}}>
          <YearArrow onClick={()=> prevYear && setYear(prevYear)} disabled={!prevYear} aria-label="Previous Year">‹</YearArrow>
          <YearSelectWrap>
            <Select value={year} onChange={e=>setYear(e.target.value)} aria-label="Select Year">
              {allYears.map(y=> <option key={y} value={y}>{y}</option>)}
            </Select>
          </YearSelectWrap>
          <YearArrow onClick={()=> nextYear && setYear(nextYear)} disabled={!nextYear} aria-label="Next Year">›</YearArrow>
        </YearNav>
        <YearGrid>
          {/* WinnerHighlight now always rendered (no lazy conditional) */}
          <WinnerHighlight>
            <WinnerImageBox className={winnerImageOrientation} onClick={()=> currentYearWinners.length>0 && winnerImageMap[year] && openCarouselForYear(year)} title={currentYearWinners.length>0 ? 'View winner photos' : undefined} aria-label="Winner photo (open carousel)">
              {currentYearWinners.length>0 && winnerImageMap[year] ? (
                <WinnerImage src={winnerImageMap[year]} onLoad={onWinnerImgLoad} alt={`${currentYearWinners[0].person} winner ${year}`} />
              ) : (
                <span style={{fontSize:'.6rem', textAlign:'center', padding:'0 .4rem'}}>{currentYearWinners.length>0 ? 'Add winner photo' : 'No winner yet'}</span>
              )}
            </WinnerImageBox>
            <div style={{display:'flex', flexDirection:'column', gap:'.55rem'}}>
              <WinnerTitle>🏆 {currentYearWinners.length>1? 'Year Winners' : (currentYearWinners.length===1 ? 'Year Winner' : 'Year Winner (TBD)')}</WinnerTitle>
              <WinnerBadge>
                {currentYearWinners.length===0 ? 'Awaiting Guesses' : (anyNonOver ? (winnerDiff===0 ? 'Exact Guess' : 'Closest Without Going Over') : 'All Over – Smallest Overage')}
              </WinnerBadge>
            </div>
            <WinnerNames>
              {currentYearWinners.length>0 ? currentYearWinners.map(w => (
                <WinnerPerson key={w.person}>
                  <div style={{fontWeight:700, letterSpacing:'.5px'}}>{w.person}</div>
                  <WinnerGuess>
                    <span style={{fontSize:'.65rem', opacity:.65}}>Guess</span>
                    <span>{w.guess}</span>
                  </WinnerGuess>
                  <WinnerMeta>{w.diff===0 ? 'Perfect!' : (w.over ? `Over by ${w.diff}` : `Under by ${w.diff}`)}</WinnerMeta>
                </WinnerPerson>
              )) : (
                <div style={{fontSize:'.75rem', opacity:.7}}>No valid guesses yet.</div>
              )}
            </WinnerNames>
          </WinnerHighlight>
          <Card /* Year Stats card in first column */ style={{/* removed height:100% (grid stretch handles) */}}>
            <CardTitle>Year Stats</CardTitle>
            {/* Year selector moved above; stats start directly */}
            <StatBoxGrid>
              <StatBox>
                <StatLabel>Total Gifts</StatLabel>
                <StatValue>{totalGiftsSelectedYear ?? '—'}</StatValue>
                <StatMeta>Sum of all contributions</StatMeta>
              </StatBox>
              <StatBox>
                <StatLabel>Guessers</StatLabel>
                <StatValue>{personYear.filter(p=>p.guess!=null).length}</StatValue>
                <StatMeta>With at least one guess</StatMeta>
              </StatBox>
              <StatBox style={{background: winnerDiff===0? 'linear-gradient(145deg,#2b9348,#1d6d34)':undefined}}>
                <StatLabel>Closest Offset</StatLabel>
                <StatValue>{winnerDiff != null ? winnerDiff : '—'}</StatValue>
                <StatMeta>{!anyNonOver && winnerDiff!=null ? 'All guesses over' : 'Closest without going over'}</StatMeta>
              </StatBox>
              {yearAgg && (
                <>
                  <StatBox>
                    <StatLabel>Avg / Median</StatLabel>
                    <StatValue>{Math.round(yearAgg.avgGuess*10)/10}<span style={{fontSize:'.65rem', opacity:.55}}>/ {yearAgg.medianGuess}</span></StatValue>
                    <StatMeta>Average & median guess</StatMeta>
                  </StatBox>
                  <StatBox>
                    <StatLabel>Range</StatLabel>
                    <StatValue style={{fontSize:'.9rem'}}>{yearAgg.range}</StatValue>
                    <StatMeta>Lowest – Highest guess</StatMeta>
                  </StatBox>
                  <StatBox>
                    <StatLabel>Mean Abs Diff</StatLabel>
                    <StatValue>{Math.round(yearAgg.meanAbsDiff*10)/10}</StatValue>
                    <StatMeta>Average distance from total</StatMeta>
                  </StatBox>
                  <StatBox>
                    <StatLabel>Over Guesses</StatLabel>
                    <StatValue>{yearAgg.overCount}<span style={{fontSize:'.6rem', opacity:.55}}>({Math.round(yearAgg.overCount/yearAgg.totalGuesses*100)}%)</span></StatValue>
                    <StatMeta>Above total gift count</StatMeta>
                  </StatBox>
                  <StatBox style={yearAgg.perfectCount>0?{background:'linear-gradient(145deg,#ffce3a,#ffb347)', color:'#142433'}:undefined}>
                    <StatLabel style={yearAgg.perfectCount>0 ? { color: '#142433' } : undefined}>Perfect</StatLabel>
                    <StatValue style={yearAgg.perfectCount>0 ? { color: '#142433' } : undefined}>{yearAgg.perfectCount}</StatValue>
                    <StatMeta style={yearAgg.perfectCount>0 ? { color: '#142433', opacity: .7 } : undefined}>Exact matches</StatMeta>
                  </StatBox>
                  <StatBox>
                    <StatLabel>Worst Offset</StatLabel>
                    <StatValue>{yearAgg.worstDiff}</StatValue>
                    <StatMeta style={{whiteSpace:'normal'}}>Furthest: {yearAgg.worstPeople.slice(0,3).join(', ')}{yearAgg.worstPeople.length>3?'...':''}</StatMeta>
                  </StatBox>
                </>
              )}
            </StatBoxGrid>
          </Card>
          {/* Swapped: Leaderboard now comes before Bar Chart and occupies the second column */}
          <Card style={{display:'flex', flexDirection:'column'}}>
            <CardTitle>Leaderboard (Closest Without Going Over)</CardTitle>
            <YearLeaderboardLayout>
              <LeaderboardTableCol>
                <TableScroll style={{flex:1, maxHeight:'none'}}>
                  <Table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Person</th>
                        <th>Guess</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPersonYear.map((r,i)=>{
                        const isWinner = ((anyNonOver && !r.over && r.diff===winnerDiff) || (!anyNonOver && r.over && r.diff===winnerDiff));
                        return (
                        <tr key={r.person} className={isWinner ? `highlight${r.over?' over':''}` : ''}>
                          <td>{i+1}</td>
                          <td>{r.person}{isWinner && ' 🏆'}</td>
                          <td>{r.guess}</td>
                          <td>{r.over ? (isWinner && !anyNonOver ? `All over – over by ${r.diff}` : `Over by ${r.diff}`) : (r.diff===0 ? 'Exact!' : `Under by ${r.diff}`)}</td>
                        </tr>
                      );})}
                    </tbody>
                  </Table>
                </TableScroll>
              </LeaderboardTableCol>
            </YearLeaderboardLayout>
          </Card>
          {/* Bar Chart moved after leaderboard and now spans full width */}
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
        </YearGrid>
      </GroupWrapper>
      {/* Overall Winners Section */}
      <GroupWrapper>
        <div style={{fontSize:'.75rem', letterSpacing:'.5px', opacity:.65, fontWeight:600}}>ALL-TIME LEADERBOARD</div>
        <WinnersGrid>
          <Card style={{margin:0}}>
            <CardTitle>Overall Winners (All Years)</CardTitle>
            <Stat>Total years with winners: <strong>{winnersByYear.length}</strong></Stat>
            <div style={{fontSize:'.6rem', opacity:.65, marginTop:4}}>Gold ★ year = exact spot-on guess</div>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Person</th>
                    <th>Wins</th>
                    <th>Years</th>
                  </tr>
                </thead>
                <tbody>
                  {overallWinCounts.map((r,i)=>(
                    <tr key={r.person} className={i===0 ? 'highlight' : ''}>
                      <td>{i+1}</td>
                      <td>{r.person}{i===0 && ' 🏆'}</td>
                      <td>{r.wins}</td>
                      <td style={{whiteSpace:'nowrap'}}>
                        {r.yearsDetailed.map((yObj, idx) => (
                          <span key={yObj.year} style={yObj.exact ? {color:'#ffce3a', fontWeight:600} : {opacity:.85}}>
                            {yObj.exact && '★'}{yObj.year}{idx < r.yearsDetailed.length-1 && ', '}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                  {overallWinCounts.length===0 && (
                    <tr><td colSpan={4} style={{padding:'6px', opacity:.6}}>No winners yet.</td></tr>
                  )}
                </tbody>
              </Table>
            </TableScroll>
          </Card>
          {/* Best Guesser Index Table */}
          <Card style={{margin:0}}>
            <CardTitle>Best Guesser Index (All Years)</CardTitle>
            <Stat><strong>Index</strong> = Accuracy × Participation</Stat>
            <div style={{fontSize:'.6rem', opacity:.65, marginTop:4}}>Participation needs 6+ years (capped at 10). Accuracy ignores over/under rule.</div>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Person</th>
                    <th>Index</th>
                    <th>Acc%</th>
                    <th>Avg Err</th>
                    <th>Median Err</th>
                    <th>Years</th>
                  </tr>
                </thead>
                <tbody>
                  {bestGuessers.map((r,i)=>{
                    return (
                      <tr key={r.person} className={i===0 ? 'highlight' : ''}>
                        <td>{i+1}</td>
                        <td>{r.person}{i===0 && ' 🎯'}</td>
                        <td>{r.index.toFixed(1)}</td>
                        <td>{(Math.round(r.baseAccuracyPct*10)/10).toFixed(1)}</td>
                        <td>{Math.round(r.avgAbsError*10)/10}</td>
                        <td>{Math.round(r.medianAbsError*10)/10}</td>
                        <td>{r.yearsParticipated}</td>
                      </tr>
                    );
                  })}
                  {bestGuessers.length===0 && (
                    <tr><td colSpan={7} style={{padding:'6px', opacity:.6}}>No eligible guessers (need 6+ years).</td></tr>
                  )}
                </tbody>
              </Table>
            </TableScroll>
          </Card>
        </WinnersGrid>
      </GroupWrapper>
      <Footer>
        Data visualizations generated with Recharts. CSV parsed client-side. &copy; {new Date().getFullYear()} Malos Family.
      </Footer>
      {showCarousel && carouselImages.length > 0 && (
        <CarouselOverlay onClick={closeCarousel} role="dialog" aria-modal="true" aria-label="Winner photos carousel">
          <CarouselContent onClick={e=> e.stopPropagation()}>
            <CarouselImageWrap>
              {carouselIndex > 0 && (
                <CarouselNavButton style={{left: '12px'}} onClick={goPrev} aria-label="Previous photo">‹</CarouselNavButton>
              )}
              {carouselIndex < carouselImages.length-1 && (
                <CarouselNavButton style={{right: '12px'}} onClick={goNext} aria-label="Next photo">›</CarouselNavButton>
              )}
              <img src={carouselImages[carouselIndex].src} alt={`Winner ${carouselImages[carouselIndex].year}`} />
              <CarouselYear style={{position:'absolute', left:16, top:14}}>{carouselImages[carouselIndex].year}</CarouselYear>
              <CarouselCloseButton onClick={closeCarousel} aria-label="Close carousel">×</CarouselCloseButton>
            </CarouselImageWrap>
            <div style={{display:'flex', gap:6, flexWrap:'wrap', justifyContent:'center', maxWidth:'100%'}}>
              {carouselImages.map((img,i)=> (
                <button key={img.year} onClick={()=> setCarouselIndex(i)} style={{
                  width:64, height:64, borderRadius:10, overflow:'hidden', border: i===carouselIndex? '2px solid #ffce3a':'1px solid rgba(255,255,255,0.25)', padding:0, cursor:'pointer', background:'#0d2d1d'
                }} aria-label={`Jump to ${img.year}`}>
                  <img src={img.src} alt={img.year} style={{width:'100%', height:'100%', objectFit:'cover', filter: i===carouselIndex? 'none':'brightness(.6)'}} />
                </button>
              ))}
            </div>
            <div style={{fontSize:'.6rem', opacity:.6}}>Use arrow keys • ESC to close</div>
          </CarouselContent>
        </CarouselOverlay>
      )}
    </Wrapper>
  );
}

export default App;
