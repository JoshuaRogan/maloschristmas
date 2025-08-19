import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { winnerImageMap, buildImageUrl } from '../utils/images';
import { parseCsv, sanitizeRow } from '../utils/csv';
import { buildYearTotals, deriveWinnersByYear } from '../utils/data';
import usePageTitle from '../hooks/usePageTitle';
import WinnerCarousel from './WinnerCarousel';

const PageWrap = styled.div`
  min-height: 100vh;
  box-sizing: border-box;
  padding: 1.4rem 1.6rem 3.5rem;
  background:
    radial-gradient(circle at 20% 15%, rgba(220, 40, 40, 0.15), transparent 60%),
    radial-gradient(circle at 80% 85%, rgba(220, 40, 40, 0.08), transparent 55%),
    linear-gradient(135deg, #0c2817, #0f3a22 55%, #102c33 85%);
  color: #f6fbf7;
  font-family: 'Helvetica Neue', Arial, sans-serif;
`;
const TitleBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin: 0 0 1.1rem;
  h1 {
    margin: 0;
    font-size: 2.2rem;
    letter-spacing: 1.5px;
    font-weight: 700;
    background: linear-gradient(90deg, #e8d5a6, #f5f1e3);
    -webkit-background-clip: text;
    color: transparent;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
  }
  a {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1.4px;
    font-weight: 700;
    text-decoration: none;
    background: linear-gradient(140deg, #1d6d42, #155232);
    color: #fff;
    padding: 0.55rem 0.95rem 0.6rem;
    border-radius: 12px;
    border: 1px solid #248553;
    box-shadow: 0 2px 6px -2px rgba(0, 0, 0, 0.5);
  }
`;
const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem 1rem;
`;
const Cell = styled.div`
  position: relative;
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.04));
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  padding: 0; /* square tile, inner elements handle padding */
  display: block;
  aspect-ratio: 1 / 1; /* enforce square */
  overflow: hidden;
  box-shadow: 0 6px 18px -6px rgba(0, 0, 0, 0.55);
  cursor: default;
  &:has(img) {
    cursor: pointer;
  }
`;
const YearTag = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.35);
  padding: 0.35rem 0.55rem 0.4rem;
  border-radius: 999px;
  align-self: flex-start;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 6px -3px rgba(0, 0, 0, 0.6);
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 3;
`;
const ImgWrap = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
  background: repeating-linear-gradient(135deg, #163d26, #163d26 10px, #1b4d31 10px, #1b4d31 20px);
  outline: 1px solid rgba(255, 255, 255, 0.1);
  &:hover img {
    filter: brightness(1.05);
  }
  img {
    transition: filter 0.25s;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .missing {
    font-size: 0.7rem;
    opacity: 0.7;
    text-align: center;
    padding: 0.5rem;
    line-height: 1.3;
  }
`;
const WinnerNames = styled.div`
  position: absolute;
  bottom: 4px;
  left: 4px;
  right: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 0.4rem;
  justify-content: flex-start;
  background: rgba(0, 0, 0, 0.38);
  backdrop-filter: blur(4px);
  padding: 0.35rem 0.45rem 0.4rem;
  border-radius: 10px;
  font-size: 0.55rem;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  line-height: 1.15;
  z-index: 2;
  max-height: 55%;
  overflow: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;
const Loading = styled.div`
  font-size: 1rem;
  opacity: 0.8;
`;

export default function WinnerImagesGallery() {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [winnersByYearMap, setWinnersByYearMap] = useState({});
  const [showCarousel, setShowCarousel] = useState(false);
  const [carouselYear, setCarouselYear] = useState(null);

  usePageTitle('Winner Images');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [giftsRowsRaw, guessesRowsRaw] = await Promise.all([
          parseCsv('/gifts_count.csv'),
          parseCsv('/guess_counts.csv'),
        ]);
        if (cancelled) return;
        const giftsRows = giftsRowsRaw.map(sanitizeRow);
        const guessesRows = guessesRowsRaw.map(sanitizeRow);
        // Pull every 4-digit year header from first rows of BOTH CSVs so that
        // years present in only one file (e.g. current year with guesses but no gifts yet)
        // are still represented.
        const giftsHeader = giftsRows[0] || {};
        const guessesHeader = guessesRows[0] || {};
        const headerYears = new Set();
        Object.keys(giftsHeader).forEach((k) => /^(19|20)\d{2}$/.test(k) && headerYears.add(k));
        Object.keys(guessesHeader).forEach((k) => /^(19|20)\d{2}$/.test(k) && headerYears.add(k));
        // Start with union of header years
        const yearSet = new Set(headerYears);
        // Include any years that have images but might not appear in CSV headers
        Object.keys(winnerImageMap).forEach((y) => yearSet.add(String(y)));
        // Always include current year so a placeholder tile shows even before data exists
        yearSet.add(String(new Date().getFullYear()));
        // Fill any missing intermediate years so the gallery shows a continuous range
        const numericYears = Array.from(yearSet)
          .map((y) => Number(y))
          .filter((n) => !isNaN(n));
        if (numericYears.length) {
          const minY = Math.min(...numericYears);
          const maxY = Math.max(...numericYears);
          for (let y = minY; y <= maxY; y++) yearSet.add(String(y));
        }
        const list = Array.from(yearSet)
          .map(String)
          .sort((a, b) => Number(b) - Number(a));
        setYears(list);
        // Derive winners (only years with winners will populate names; others show placeholder)
        const giftsYearTotals = buildYearTotals(giftsRows);
        const winnersByYear = deriveWinnersByYear(giftsRows, guessesRows, giftsYearTotals);
        const map = {};
        winnersByYear.forEach((y) => {
          map[y.year] = y.winners.map((w) => w.person);
        });
        setWinnersByYearMap(map);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cells = useMemo(
    () =>
      years.map((y) => {
        const src = winnerImageMap[y];
        return { year: y, src, winners: winnersByYearMap[y] || [] };
      }),
    [years, winnersByYearMap],
  );

  const openCarousel = (y) => {
    setCarouselYear(y);
    setShowCarousel(true);
  };
  const closeCarousel = () => setShowCarousel(false);

  return (
    <PageWrap>
      <TitleBar>
        <h1>Winner Images</h1>
        <a href="/">← Back</a>
      </TitleBar>
      {loading && <Loading>Loading...</Loading>}
      {error && <Loading>Error: {error}</Loading>}
      {!loading && !error && (
        <GalleryGrid>
          {cells.map(({ year, src, winners }) => (
            <Cell
              key={year}
              onClick={() => src && openCarousel(year)}
              title={src ? 'Open full size' : undefined}
              aria-label={src ? `Open ${year} winner image` : `No image for ${year}`}
            >
              <ImgWrap>
                {src ? (
                  <img
                    src={buildImageUrl(src, { w: 400, h: 400 })}
                    srcSet={
                      buildImageUrl(src, { w: 200, h: 200 }) +
                      ' 200w, ' +
                      buildImageUrl(src, { w: 400, h: 400 }) +
                      ' 400w'
                    }
                    sizes="(max-width: 600px) 50vw, 160px"
                    alt={`Winner ${year}${winners.length ? ' - ' + winners.join(', ') : ''}`}
                    loading="lazy"
                  />
                ) : (
                  <div className="missing">No image uploaded yet.</div>
                )}
                <YearTag>{year}</YearTag>
                <WinnerNames>
                  {winners.length ? (
                    winners.map((w) => <span key={w}>{w}</span>)
                  ) : (
                    <span style={{ opacity: 0.55 }}>No winners</span>
                  )}
                </WinnerNames>
              </ImgWrap>
            </Cell>
          ))}
        </GalleryGrid>
      )}
      {showCarousel && (
        <WinnerCarousel
          year={carouselYear}
          onClose={closeCarousel}
          winnerImageMap={winnerImageMap}
        />
      )}
    </PageWrap>
  );
}
