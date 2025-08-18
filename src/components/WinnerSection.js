import React, { useState, useMemo } from 'react';
import { WinnerHighlight, WinnerImageBox, WinnerImage, WinnerTitle, WinnerBadge, WinnerNames, WinnerPerson, WinnerGuess, WinnerMeta } from './styled';
import { buildImageUrl, buildSrcSet } from '../utils/images';

export default function WinnerSection({ year, winners, winnerDiff, anyNonOver, winnerImageMap, onOpenCarousel }) {
  const [orientation, setOrientation] = useState('landscape');
  const imgSrc = winnerImageMap[year];
  const optimized = useMemo(()=>{
    if(!imgSrc || !winners.length) return null;
    return {
      src: buildImageUrl(imgSrc, { w: 420, fit: 'contain', q: 75 }),
      srcSet: buildSrcSet(imgSrc, [160, 240, 320, 420, 640], { fit: 'contain', q: 70 }),
      sizes: '(max-width: 600px) 60vw, 320px'
    };
  }, [imgSrc, winners]);
  const onLoad = e => {
    const { naturalWidth: w, naturalHeight: h } = e.target;
    if(w && h) setOrientation(h > w * 1.15 ? 'portrait' : 'landscape');
  };
  return (
    <WinnerHighlight>
      <WinnerImageBox className={orientation} onClick={()=> winners.length>0 && imgSrc && onOpenCarousel(year)} title={winners.length>0 ? 'View winner photos' : undefined} aria-label="Winner photo (open carousel)">
        {winners.length>0 && imgSrc ? (
          <WinnerImage {...optimized} onLoad={onLoad} loading="lazy" decoding="async" alt={`${winners[0].person} winner ${year}`} />
        ) : (
          <span style={{fontSize:'.6rem', textAlign:'center', padding:'0 .4rem'}}>{winners.length>0 ? 'Add winner photo' : 'No winner yet'}</span>
        )}
      </WinnerImageBox>
      <div style={{display:'flex', flexDirection:'column', gap:'.55rem'}}>
        <WinnerTitle>🏆 {winners.length>1? 'Year Winners' : (winners.length===1 ? 'Year Winner' : 'Year Winner (TBD)')}</WinnerTitle>
        <WinnerBadge>
          {winners.length===0 ? 'Awaiting Guesses' : (anyNonOver ? (winnerDiff===0 ? 'Exact Guess' : 'Closest Without Going Over') : 'All Over – Smallest Overage')}
        </WinnerBadge>
      </div>
      <WinnerNames>
        {winners.length>0 ? winners.map(w => (
          <WinnerPerson key={w.person}>
            <div style={{fontWeight:700, letterSpacing:'.5px'}}>{w.person}</div>
            <WinnerGuess><span style={{fontSize:'.65rem', opacity:.65}}>Guess</span><span>{w.guess}</span></WinnerGuess>
            <WinnerMeta>{w.diff===0 ? 'Perfect!' : (w.over ? `Over by ${w.diff}` : `Under by ${w.diff}`)}</WinnerMeta>
          </WinnerPerson>
        )) : <div style={{fontSize:'.75rem', opacity:.7}}>No valid guesses yet.</div>}
      </WinnerNames>
    </WinnerHighlight>
  );
}

