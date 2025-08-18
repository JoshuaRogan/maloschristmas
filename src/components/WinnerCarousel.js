import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { CarouselOverlay, CarouselContent, CarouselImageWrap, CarouselNavButton, CarouselCloseButton, CarouselYear } from './styled';
import { buildImageUrl, buildSrcSet } from '../utils/images';

export default function WinnerCarousel({ year, onClose, winnerImageMap }) {
  const images = useMemo(()=> Object.entries(winnerImageMap)
    .filter(([,src])=> !!src)
    .map(([y,src])=>({ year:y, src }))
    .sort((a,b)=> b.year.localeCompare(a.year)), [winnerImageMap]);

  const initialIndex = useMemo(()=> images.findIndex(i=> i.year === year), [images, year]);
  const [index, setIndex] = useState(initialIndex >=0 ? initialIndex : 0);
  useEffect(()=>{ if(initialIndex>=0) setIndex(initialIndex); }, [initialIndex]);

  const current = images[index];
  const mainImage = useMemo(()=>{
    if(!current) return null;
    return {
      src: buildImageUrl(current.src, { w: 1200, fit: 'contain', q: 80 }),
      srcSet: buildSrcSet(current.src, [400,640,800,1000,1200], { fit: 'contain', q:75 }),
      sizes: '(max-width: 900px) 90vw, 1100px'
    };
  }, [current]);

  const goPrev = useCallback(()=> setIndex(i=> i>0 ? i-1 : i), []);
  const goNext = useCallback(()=> setIndex(i=> i<images.length-1 ? i+1 : i), [images.length]);

  useEffect(()=>{
    const handler = (e)=>{
      if(e.key === 'Escape') onClose();
      else if(e.key === 'ArrowLeft') goPrev();
      else if(e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return ()=> window.removeEventListener('keydown', handler);
  }, [onClose, goPrev, goNext]);

  useEffect(()=>{
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return ()=> { document.body.style.overflow = prev; };
  }, []);

  if(!images.length) return null;

  return (
    <CarouselOverlay onClick={onClose} role="dialog" aria-modal="true" aria-label="Winner photos carousel">
      <CarouselContent onClick={e=> e.stopPropagation()}>
        <CarouselImageWrap>
          {index > 0 && (
            <CarouselNavButton style={{left: '12px'}} onClick={goPrev} aria-label="Previous photo">‹</CarouselNavButton>
          )}
          {index < images.length-1 && (
            <CarouselNavButton style={{right: '12px'}} onClick={goNext} aria-label="Next photo">›</CarouselNavButton>
          )}
          {mainImage && (
            <img
              src={mainImage.src}
              srcSet={mainImage.srcSet}
              sizes={mainImage.sizes}
              alt={`Winner ${current.year}`}
              loading="eager"
              decoding="async"
            />
          )}
          <CarouselYear style={{position:'absolute', left:16, top:14}}>{current.year}</CarouselYear>
          <CarouselCloseButton onClick={onClose} aria-label="Close carousel">×</CarouselCloseButton>
        </CarouselImageWrap>
        <div style={{display:'flex', gap:6, flexWrap:'wrap', justifyContent:'center', maxWidth:'100%'}}>
          {images.map((img,i)=> {
            const thumb = {
              src: buildImageUrl(img.src, { w: 96, h: 96, fit: 'cover', q: 60 }),
              srcSet: buildSrcSet(img.src, [64,96,128], { h: 96, fit: 'cover', q: 55 }),
              sizes: '96px'
            };
            return (
              <button key={img.year} onClick={()=> setIndex(i)} style={{
                width:64, height:64, borderRadius:10, overflow:'hidden', border: i===index? '2px solid #ffce3a':'1px solid rgba(255,255,255,0.25)', padding:0, cursor:'pointer', background:'#0d2d1d'
              }} aria-label={`Jump to ${img.year}`}>
                <img
                  src={thumb.src}
                  srcSet={thumb.srcSet}
                  sizes={thumb.sizes}
                  alt={img.year}
                  style={{width:'100%', height:'100%', objectFit:'cover', filter: i===index? 'none':'brightness(.6)'}}
                  loading="lazy"
                  decoding="async"
                />
              </button>
            );
          })}
        </div>
        <div style={{fontSize:'.6rem', opacity:.6}}>Use arrow keys • ESC to close</div>
      </CarouselContent>
    </CarouselOverlay>
  );
}

