import React, { useEffect, useState, useMemo } from 'react';
// REFACTORED: moved styled-components to components/styled.js
import {
  Wrapper,
  Title,
  GroupWrapper,
  YearNav,
  YearArrow,
  YearSelectWrap,
  Select,
  YearGrid,
  Footer,
  Loading,
  AllTimeTotalBar,
} from './components/styled';
// Data / hooks
import { parseCsv, sanitizeRow } from './utils/csv';
import {
  buildYearTotals,
  combinePersonYear,
  compareGuessRows,
  deriveYearStats,
  deriveWinnersByYear,
  deriveOverallWinCounts,
  deriveBestGuessers,
  deriveAllTimeMeta,
  deriveAverageRanks,
} from './utils/data';
import useWindowWidth from './hooks/useWindowWidth';
// Components
import TotalGiftsLineChart from './components/TotalGiftsLineChart';
import WinnerSection from './components/WinnerSection';
import YearStats from './components/YearStats';
import YearLeaderboard from './components/YearLeaderboard';
import YearBarChart from './components/YearBarChart';
import OverallWinners from './components/OverallWinners';
import BestGuessers from './components/BestGuessers';
import WinnerCarousel from './components/WinnerCarousel';
import { winnerImageMap } from './utils/images';
import AllTimeMeta from './components/AllTimeMeta';
import AverageRankLeaderboard from './components/AverageRankLeaderboard';

function App() {
  const [gifts, setGifts] = useState(null);
  const [guesses, setGuesses] = useState(null);
  const [year, setYear] = useState('2024');
  const [error, setError] = useState(null);
  const [showCarousel, setShowCarousel] = useState(false);
  const [carouselYear, setCarouselYear] = useState(null);
  const winWidth = useWindowWidth();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [giftsRaw, guessesRaw] = await Promise.all([
          parseCsv('/gifts_count.csv'),
          parseCsv('/guess_counts.csv'),
        ]);
        if (cancelled) return;
        setGifts(giftsRaw.map(sanitizeRow));
        setGuesses(guessesRaw.map(sanitizeRow));
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const giftsYearTotals = useMemo(() => (gifts ? buildYearTotals(gifts) : []), [gifts]);
  const allTimeTotalGifts = useMemo(
    () => giftsYearTotals.reduce((sum, y) => sum + (y.total || 0), 0),
    [giftsYearTotals],
  );
  const allYears = useMemo(() => giftsYearTotals.map((d) => d.year), [giftsYearTotals]);
  useEffect(() => {
    if (allYears.length && !allYears.includes(year)) setYear(allYears[allYears.length - 1]);
  }, [allYears, year]);
  const totalGiftsSelectedYear = useMemo(
    () => (giftsYearTotals.find((d) => d.year === year) || {}).total ?? null,
    [giftsYearTotals, year],
  );
  const personYear = useMemo(
    () =>
      gifts && guesses && year
        ? combinePersonYear(gifts, guesses, year, totalGiftsSelectedYear || 0)
        : [],
    [gifts, guesses, year, totalGiftsSelectedYear],
  );
  const sortedPersonYear = useMemo(
    () =>
      personYear
        .filter((r) => r.guess != null)
        .slice()
        .sort(compareGuessRows),
    [personYear],
  );
  const { winnerDiff, anyNonOver } = useMemo(() => {
    const valid = personYear.filter((p) => p.guess != null);
    if (!valid.length) return { winnerDiff: null, anyNonOver: false };
    const nonOver = valid.filter((p) => !p.over);
    if (nonOver.length) {
      const d = Math.min(...nonOver.map((p) => p.diff));
      return { winnerDiff: d, anyNonOver: true };
    }
    const d = Math.min(...valid.map((p) => p.diff));
    return { winnerDiff: d, anyNonOver: false };
  }, [personYear]);
  const currentYearWinners = useMemo(() => {
    if (winnerDiff == null) return [];
    return personYear.filter(
      (p) =>
        p.guess != null &&
        ((anyNonOver && !p.over && p.diff === winnerDiff) ||
          (!anyNonOver && p.over && p.diff === winnerDiff)),
    );
  }, [personYear, winnerDiff, anyNonOver]);
  const yearAgg = useMemo(() => deriveYearStats(personYear), [personYear]);
  const winnersByYear = useMemo(
    () => deriveWinnersByYear(gifts, guesses, giftsYearTotals),
    [gifts, guesses, giftsYearTotals],
  );
  const overallWinCounts = useMemo(() => deriveOverallWinCounts(winnersByYear), [winnersByYear]);
  const bestGuessers = useMemo(
    () => deriveBestGuessers(guesses, giftsYearTotals),
    [guesses, giftsYearTotals],
  );
  // derive years that had at least one exact (non-over) guess
  const exactYearSet = useMemo(() => {
    if (!winnersByYear.length) return new Set();
    return new Set(
      winnersByYear
        .filter((y) => y.winners.some((w) => w.diff === 0 && w.over === false))
        .map((y) => y.year),
    );
  }, [winnersByYear]);
  const allTimeMeta = useMemo(
    () => deriveAllTimeMeta(winnersByYear, gifts, guesses, giftsYearTotals),
    [winnersByYear, gifts, guesses, giftsYearTotals],
  );
  const averageRanks = useMemo(
    () => deriveAverageRanks(gifts, guesses, giftsYearTotals),
    [gifts, guesses, giftsYearTotals],
  );

  const yearIndex = allYears.indexOf(year);
  const prevYear = yearIndex > 0 ? allYears[yearIndex - 1] : null;
  const nextYear =
    yearIndex >= 0 && yearIndex < allYears.length - 1 ? allYears[yearIndex + 1] : null;

  const openCarouselForYear = (y) => {
    setCarouselYear(y);
    setShowCarousel(true);
  };
  const closeCarousel = () => setShowCarousel(false);

  if (error)
    return (
      <Wrapper>
        <Loading>Error: {error}</Loading>
      </Wrapper>
    );
  if (!gifts || !guesses)
    return (
      <Wrapper>
        <Loading>Loading Christmas Magic...</Loading>
      </Wrapper>
    );

  return (
    <Wrapper>
      <Title>Malos Family Christmas</Title>
      <AllTimeTotalBar>
        <span className="emoji" role="img" aria-label="Christmas Tree">
          🎄
        </span>
        <div className="label">All-Time Gifts</div>
        <strong>{allTimeTotalGifts.toLocaleString()}</strong>
        <span className="emoji" role="img" aria-label="Gift">
          🎁
        </span>
      </AllTimeTotalBar>
      <TotalGiftsLineChart
        data={giftsYearTotals}
        year={year}
        winWidth={winWidth}
        totalGiftsSelectedYear={totalGiftsSelectedYear}
        onSelectYear={setYear}
        exactYearSet={exactYearSet}
      />
      <GroupWrapper>
        <YearNav style={{ margin: '0.5rem 0 0.75rem' }}>
          <YearArrow onClick={() => prevYear && setYear(prevYear)} disabled={!prevYear}>
            ‹
          </YearArrow>
          <YearSelectWrap>
            <Select value={year} onChange={(e) => setYear(e.target.value)} aria-label="Select Year">
              {allYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </YearSelectWrap>
          <YearArrow onClick={() => nextYear && setYear(nextYear)} disabled={!nextYear}>
            ›
          </YearArrow>
        </YearNav>
        <YearGrid>
          <WinnerSection
            year={year}
            winners={currentYearWinners}
            winnerDiff={winnerDiff}
            anyNonOver={anyNonOver}
            winnerImageMap={winnerImageMap}
            onOpenCarousel={openCarouselForYear}
          />
          <YearStats
            totalGifts={totalGiftsSelectedYear}
            personYear={personYear}
            winnerDiff={winnerDiff}
            anyNonOver={anyNonOver}
            yearAgg={yearAgg}
            year={year}
          />
          <YearLeaderboard
            sortedPersonYear={sortedPersonYear}
            winnerDiff={winnerDiff}
            anyNonOver={anyNonOver}
            year={year}
          />
          <YearBarChart
            year={year}
            personYear={personYear}
            anyNonOver={anyNonOver}
            winnerDiff={winnerDiff}
            totalGiftsSelectedYear={totalGiftsSelectedYear}
            winWidth={winWidth}
          />
        </YearGrid>
      </GroupWrapper>
      <GroupWrapper>
        <OverallWinners winnersByYear={winnersByYear} overallWinCounts={overallWinCounts} />
        <BestGuessers bestGuessers={bestGuessers} />
        <AverageRankLeaderboard averageRanks={averageRanks} />
        <AllTimeMeta meta={allTimeMeta} />
      </GroupWrapper>
      <Footer>
        Data visualizations generated with Recharts. CSV parsed client-side. &copy;{' '}
        {new Date().getFullYear()} Malos Family.
      </Footer>
      {showCarousel && (
        <WinnerCarousel
          year={carouselYear}
          onClose={closeCarousel}
          winnerImageMap={winnerImageMap}
        />
      )}
    </Wrapper>
  );
}

export default App;
