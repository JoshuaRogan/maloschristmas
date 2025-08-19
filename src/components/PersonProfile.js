import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Wrapper,
  Title,
  GroupWrapper,
  Card,
  CardTitle,
  Table,
  TableScroll,
  StatBoxGrid,
  StatBox,
  StatLabel,
  StatValue,
  StatMeta,
  Footer,
  Loading,
  Select,
  RankBadge,
  HomeLink,
} from './styled';
import { parseCsv, sanitizeRow } from '../utils/csv';
import { buildYearTotals, combinePersonYear } from '../utils/data';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { matchPersonByParam } from '../utils/people';
import { deriveWinnersByYear, deriveOverallWinCounts, deriveAllTimeMeta } from '../utils/data';
import { winnerImageMap, buildImageUrl } from '../utils/images';
import WinnerCarousel from './WinnerCarousel';
import usePageTitle from '../hooks/usePageTitle';

export default function PersonProfile() {
  const { person: personParam } = useParams();
  const navigate = useNavigate();
  const [gifts, setGifts] = useState(null);
  const [guesses, setGuesses] = useState(null);
  const [error, setError] = useState(null);
  const [person, setPerson] = useState(personParam ? decodeURIComponent(personParam) : '');
  const [notFound, setNotFound] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const [carouselYear, setCarouselYear] = useState(null);

  // Load CSV data (simple duplication vs context refactor for now)
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
  const allYears = useMemo(() => giftsYearTotals.map((d) => d.year), [giftsYearTotals]);

  // Determine allPeople
  const allPeople = useMemo(() => {
    const giftPeople = gifts ? gifts.map((r) => r.Person) : [];
    const guessPeople = guesses ? guesses.map((r) => r.Person) : [];
    return Array.from(new Set([...giftPeople, ...guessPeople]))
      .filter(Boolean)
      .sort();
  }, [gifts, guesses]);

  // Resolve person from route param robustly (case-insensitive + slug) once data loaded
  useEffect(() => {
    if (!gifts || !guesses || !allPeople.length) return;
    if (!personParam) {
      if (!person && allPeople.length) setPerson(allPeople[0]);
      setNotFound(false);
      return;
    }
    const resolved = matchPersonByParam(allPeople, personParam);
    if (resolved) {
      setNotFound(false);
      if (resolved !== person) setPerson(resolved);
    } else {
      setNotFound(true);
    }
  }, [personParam, allPeople, gifts, guesses, person]); // removed person from deps to avoid re-trigger loop after set

  // Per-year data for the person
  const timeline = useMemo(() => {
    if (!gifts || !guesses || !person) return [];
    const guessRow = guesses.find((r) => r.Person === person) || {};
    const contribRow = gifts.find((r) => r.Person === person) || {};
    return allYears.map((year) => {
      const total = (giftsYearTotals.find((g) => g.year === year) || {}).total || 0;
      const guessRaw = guessRow[year];
      const guess = guessRaw === 0 || guessRaw === '0' ? null : guessRaw;
      const contributed = contribRow[year] || 0;
      if (guess == null || guess === '') {
        return { year, guess: null, total, contributed, diff: null, over: null, rank: null };
      }
      const over = guess > total;
      const diff = over ? guess - total : total - guess;
      return { year, guess, total, contributed, diff, over, rank: null };
    });
  }, [gifts, guesses, person, allYears, giftsYearTotals]);

  // Compute ranks and winner flags by reusing combinePersonYear per year
  const timelineWithRanks = useMemo(() => {
    if (!gifts || !guesses) return timeline;
    return timeline.map((row) => {
      if (row.guess == null) return row;
      const yearTotal = (giftsYearTotals.find((g) => g.year === row.year) || {}).total || 0;
      const combined = combinePersonYear(gifts, guesses, row.year, yearTotal);
      const sorted = combined.filter((r) => r.guess != null);
      const rankingOrder = sorted.map((r) => r.person);
      const rankIndex = rankingOrder.indexOf(person);
      const rank = rankIndex === -1 ? null : rankIndex + 1;
      const nonOver = sorted.filter((r) => r.over === false);
      const winnerPool = nonOver.length ? nonOver : sorted;
      const bestDiff = winnerPool.length ? Math.min(...winnerPool.map((r) => r.diff)) : null;
      const isWinner = winnerPool.some((r) => r.person === person && r.diff === bestDiff);
      return { ...row, rank, isWinner };
    });
  }, [timeline, gifts, guesses, giftsYearTotals, person]);

  // Precompute per-year ranking orders for avg rank calculations across all people
  const perYearRankingOrders = useMemo(() => {
    if (!gifts || !guesses) return {};
    const map = {};
    allYears.forEach((year) => {
      const total = (giftsYearTotals.find((g) => g.year === year) || {}).total || 0;
      const combined = combinePersonYear(gifts, guesses, year, total);
      map[year] = combined.filter((r) => r.guess != null).map((r) => r.person); // already ordered closest without going over
    });
    return map;
  }, [gifts, guesses, allYears, giftsYearTotals]);

  // Overall wins & spot-on rankings
  const winnersByYear = useMemo(
    () => deriveWinnersByYear(gifts, guesses, giftsYearTotals),
    [gifts, guesses, giftsYearTotals],
  );
  const overallWinCounts = useMemo(() => deriveOverallWinCounts(winnersByYear), [winnersByYear]);
  // Competition ranking for wins (ties share rank, skip subsequent positions)
  const winRankMap = useMemo(() => {
    let prevVal = null;
    let prevRank = 0;
    let processed = 0;
    const map = {};
    overallWinCounts.forEach((w) => {
      processed += 1;
      if (prevVal !== null && w.wins === prevVal) {
        map[w.person] = prevRank;
      } else {
        prevRank = processed;
        map[w.person] = prevRank;
        prevVal = w.wins;
      }
    });
    return map;
  }, [overallWinCounts]);
  const personWinRank = winRankMap[person] || null;
  const totalWinPlayers = overallWinCounts.length;

  const allTimeMeta = useMemo(
    () => deriveAllTimeMeta(winnersByYear, gifts, guesses, giftsYearTotals),
    [winnersByYear, gifts, guesses, giftsYearTotals],
  );
  const spotOnCounts = useMemo(() => allTimeMeta.spotOnCounts || [], [allTimeMeta]);
  const spotOnRankMap = useMemo(() => {
    let prevVal = null;
    let prevRank = 0;
    let processed = 0;
    const map = {};
    spotOnCounts.forEach((s) => {
      processed += 1;
      if (prevVal !== null && s.count === prevVal) {
        map[s.person] = prevRank;
      } else {
        prevRank = processed;
        map[s.person] = prevRank;
        prevVal = s.count;
      }
    });
    return map;
  }, [spotOnCounts]);
  const personSpotOnRank = spotOnRankMap[person] || null;
  const totalSpotPlayers = spotOnCounts.length;

  // Build per-person stats for additional rankings
  const allPeopleStats = useMemo(() => {
    if (!gifts || !guesses || !giftsYearTotals.length) return [];
    return allPeople.map((p) => {
      const guessRow = guesses.find((r) => r.Person === p) || {};
      const contribRow = gifts.find((r) => r.Person === p) || {};
      let yearsPlayed = 0;
      const diffs = [];
      let biggestContribution = 0;
      const ranks = [];
      allYears.forEach((year) => {
        const total = (giftsYearTotals.find((g) => g.year === year) || {}).total || 0;
        const guessRaw = guessRow[year];
        const guess = guessRaw === 0 || guessRaw === '0' ? null : guessRaw;
        const contributed = contribRow[year] || 0;
        if (contributed > biggestContribution) biggestContribution = contributed;
        if (guess == null || guess === '') return;
        yearsPlayed += 1;
        const over = guess > total;
        const diff = over ? guess - total : total - guess;
        diffs.push(diff);
        const order = perYearRankingOrders[year] || [];
        const idx = order.indexOf(p);
        if (idx !== -1) ranks.push(idx + 1);
      });
      diffs.sort((a, b) => a - b);
      const avgAbsDiff = diffs.length ? diffs.reduce((a, b) => a + b, 0) / diffs.length : null;
      const bestDiff = diffs.length ? diffs[0] : null;
      const worstDiff = diffs.length ? diffs[diffs.length - 1] : null;
      const avgRank = ranks.length ? ranks.reduce((a, b) => a + b, 0) / ranks.length : null;
      return {
        person: p,
        yearsPlayed,
        avgAbsDiff,
        bestDiff,
        worstDiff,
        biggestContribution,
        avgRank,
      };
    });
  }, [gifts, guesses, giftsYearTotals, allPeople, allYears, perYearRankingOrders]);

  // Helper to build competition rank map
  const buildRankMap = (items, getVal, direction = 'asc') => {
    const filtered = items.filter((it) => getVal(it) != null && !Number.isNaN(getVal(it)));
    filtered.sort((a, b) => {
      const av = getVal(a);
      const bv = getVal(b);
      if (av === bv) return a.person.localeCompare(b.person);
      return direction === 'desc' ? bv - av : av - bv;
    });
    let prevVal = null;
    let prevRank = 0;
    let processed = 0;
    const map = {};
    filtered.forEach((it) => {
      processed += 1;
      const v = getVal(it);
      if (prevVal !== null && v === prevVal) {
        map[it.person] = prevRank;
      } else {
        prevRank = processed;
        map[it.person] = prevRank;
        prevVal = v;
      }
    });
    return { map, total: filtered.length };
  };

  const { map: yearsPlayedRankMap, total: totalYearsPlayedRanked } = useMemo(
    () => buildRankMap(allPeopleStats, (s) => s.yearsPlayed, 'desc'),
    [allPeopleStats],
  );
  const { map: avgAbsDiffRankMap, total: totalAvgAbsDiffRanked } = useMemo(
    () => buildRankMap(allPeopleStats, (s) => s.avgAbsDiff, 'asc'),
    [allPeopleStats],
  );
  const { map: bestDiffRankMap, total: totalBestDiffRanked } = useMemo(
    () => buildRankMap(allPeopleStats, (s) => s.bestDiff, 'asc'),
    [allPeopleStats],
  );
  const { map: worstDiffRankMap, total: totalWorstDiffRanked } = useMemo(
    () => buildRankMap(allPeopleStats, (s) => s.worstDiff, 'asc'),
    [allPeopleStats],
  );
  const { map: biggestContributionRankMap, total: totalBiggestContributionRanked } = useMemo(
    () => buildRankMap(allPeopleStats, (s) => s.biggestContribution, 'desc'),
    [allPeopleStats],
  );
  const { map: avgRankRankMap, total: totalAvgRankRanked } = useMemo(
    () => buildRankMap(allPeopleStats, (s) => s.avgRank, 'asc'),
    [allPeopleStats],
  );

  const personYearsPlayedRank = yearsPlayedRankMap[person] || null;
  const personAvgAbsDiffRank = avgAbsDiffRankMap[person] || null;
  const personBestDiffRank = bestDiffRankMap[person] || null;
  const personWorstDiffRank = worstDiffRankMap[person] || null;
  const personBiggestContributionRank = biggestContributionRankMap[person] || null;
  const personAvgRankRank = avgRankRankMap[person] || null;

  const personAvgRank = useMemo(() => {
    const ranks = timelineWithRanks.filter((r) => r.rank != null).map((r) => r.rank);
    if (!ranks.length) return null;
    return Math.round((ranks.reduce((a, b) => a + b, 0) / ranks.length) * 10) / 10;
  }, [timelineWithRanks]);

  const stats = useMemo(() => {
    const withGuess = timelineWithRanks.filter((r) => r.guess != null);
    if (!withGuess.length)
      return {
        participationYears: 0,
        avgGuess: 0,
        medianGuess: 0,
        avgAbsDiff: 0,
        medianAbsDiff: 0,
        bias: 0,
        wins: 0,
        spotOn: 0,
        bestDiff: null,
        worstDiff: null,
        totalContribution: 0,
        avgContribution: 0,
        biggestContribution: 0,
      };
    const guessesArr = withGuess.map((r) => r.guess).sort((a, b) => a - b);
    const diffs = withGuess.map((r) => r.diff).sort((a, b) => a - b);
    const avgGuess = guessesArr.reduce((a, b) => a + b, 0) / guessesArr.length;
    const medianGuess =
      guessesArr.length % 2
        ? guessesArr[(guessesArr.length - 1) / 2]
        : (guessesArr[guessesArr.length / 2 - 1] + guessesArr[guessesArr.length / 2]) / 2;
    const avgAbsDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    const medianAbsDiff =
      diffs.length % 2
        ? diffs[(diffs.length - 1) / 2]
        : (diffs[diffs.length / 2 - 1] + diffs[diffs.length / 2]) / 2;
    const signedErrors = withGuess.map((r) => r.guess - r.total);
    const bias = signedErrors.reduce((a, b) => a + b, 0) / signedErrors.length; // + means over bias
    const wins = timelineWithRanks.filter((r) => r.isWinner).length;
    const spotOn = timelineWithRanks.filter(
      (r) => r.isWinner && r.diff === 0 && r.over === false,
    ).length;
    const bestDiff = Math.min(...withGuess.map((r) => r.diff));
    const worstDiff = Math.max(...withGuess.map((r) => r.diff));
    const totalContribution = timelineWithRanks.reduce((a, b) => a + (b.contributed || 0), 0);
    const avgContribution = totalContribution / timelineWithRanks.length;
    const biggestContribution = Math.max(...timelineWithRanks.map((r) => r.contributed || 0));
    return {
      participationYears: withGuess.length,
      avgGuess,
      medianGuess,
      avgAbsDiff,
      medianAbsDiff,
      bias,
      wins,
      spotOn,
      bestDiff,
      worstDiff,
      totalContribution,
      avgContribution,
      biggestContribution,
    };
  }, [timelineWithRanks]);

  const winsYears = useMemo(
    () => timelineWithRanks.filter((r) => r.isWinner).map((r) => r.year),
    [timelineWithRanks],
  );
  const spotOnYears = useMemo(
    () =>
      timelineWithRanks
        .filter((r) => r.isWinner && r.diff === 0 && r.over === false)
        .map((r) => r.year),
    [timelineWithRanks],
  );

  const chartData = useMemo(
    () =>
      timelineWithRanks.map((r) => ({
        year: r.year,
        Guess: r.guess,
        Total: r.total,
        Contribution: r.contributed,
        Diff: r.diff,
      })),
    [timelineWithRanks],
  );

  usePageTitle(person ? `${person} Profile` : 'Profile');

  if (error)
    return (
      <Wrapper>
        <Loading>Error: {error}</Loading>
      </Wrapper>
    );
  if (!gifts || !guesses || !person)
    return (
      <Wrapper>
        <Loading>Loading Profile...</Loading>
      </Wrapper>
    );

  // If we flagged notFound after data load
  if (notFound) {
    return (
      <Wrapper>
        <div style={{ margin: '0 0 0.5rem' }}>
          <HomeLink to="/" aria-label="Return to Home">
            <span className="emoji">🏠</span> Home
          </HomeLink>
        </div>
        <Title>Profile</Title>
        <Card>
          <CardTitle>Not Found</CardTitle>
          <p>
            Could not find a person matching "{decodeURIComponent(personParam || '')}".{' '}
            <Link to="/">Return home</Link>.
          </p>
        </Card>
      </Wrapper>
    );
  }

  const personExists = allPeople.includes(person);
  if (!personExists)
    return (
      <Wrapper>
        <Title>Profile</Title>
        <Card>
          <CardTitle>Not Found</CardTitle>
          <p>
            Person not found. <Link to="/">Return home</Link>.
          </p>
        </Card>
      </Wrapper>
    );

  return (
    <Wrapper>
      <div style={{ margin: '0 0 0.5rem' }}>
        <HomeLink to="/" aria-label="Return to Home">
          <span className="emoji">🏠</span> Home
        </HomeLink>
      </div>
      <Title>{person} Profile</Title>
      <GroupWrapper>
        <Card>
          <CardTitle>Choose Person</CardTitle>
          <div
            style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flexWrap: 'wrap' }}
          >
            <Select
              value={person}
              onChange={(e) => {
                const val = e.target.value;
                setPerson(val);
                navigate(`/profile/${encodeURIComponent(val)}`, { replace: true });
              }}
              aria-label="Select Person"
            >
              {allPeople.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
            {winsYears.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  maxWidth: '540px',
                  alignItems: 'flex-start',
                }}
                aria-label="Winning year images"
              >
                {winsYears
                  .slice()
                  .sort((a, b) => b.localeCompare(a))
                  .map((yr) => {
                    const src = winnerImageMap[yr];
                    if (!src) return null;
                    const imgUrl = buildImageUrl(src, { w: 90, h: 70, fit: 'cover', q: 60 });
                    return (
                      <button
                        key={yr}
                        onClick={() => {
                          setCarouselYear(yr);
                          setShowCarousel(true);
                        }}
                        style={{
                          position: 'relative',
                          width: 90,
                          height: 70,
                          borderRadius: 10,
                          overflow: 'hidden',
                          border: '1px solid rgba(255,255,255,0.25)',
                          boxShadow: '0 3px 8px -3px rgba(0,0,0,0.6)',
                          background: '#0f2e1d',
                          flex: '0 0 auto',
                          padding: 0,
                          cursor: 'pointer',
                        }}
                        title={`Winner ${yr} (click to view larger)`}
                        aria-label={`Winner ${yr} photo (open fullscreen)`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Winner ${yr}`}
                          loading="lazy"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '2px 4px 3px',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0))',
                            fontSize: '0.55rem',
                            fontWeight: 600,
                            letterSpacing: '0.8px',
                            textAlign: 'center',
                          }}
                        >
                          {yr}
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        </Card>
        <Card>
          <CardTitle>Summary Stats</CardTitle>
          <StatBoxGrid>
            {/* Wins moved to first position */}
            <StatBox>
              {personWinRank && (
                <RankBadge
                  className={personWinRank <= 3 ? `rank-${personWinRank}` : ''}
                  aria-label={`Wins rank #${personWinRank} of ${totalWinPlayers}`}
                  title={`Wins rank #${personWinRank} of ${totalWinPlayers}`}
                >
                  #{personWinRank}
                </RankBadge>
              )}
              <StatLabel>Wins</StatLabel>
              <StatValue>{stats.wins}</StatValue>
              <StatMeta>{winsYears.join(', ') || '—'}</StatMeta>
            </StatBox>
            <StatBox>
              {personYearsPlayedRank && (
                <RankBadge
                  className={personYearsPlayedRank <= 3 ? `rank-${personYearsPlayedRank}` : ''}
                  aria-label={`Years Played rank #${personYearsPlayedRank} of ${totalYearsPlayedRanked}`}
                  title={`Years Played rank #${personYearsPlayedRank} of ${totalYearsPlayedRanked}`}
                >
                  #{personYearsPlayedRank}
                </RankBadge>
              )}
              <StatLabel>Years Played</StatLabel>
              <StatValue>{stats.participationYears}</StatValue>
            </StatBox>
            <StatBox>
              {personAvgAbsDiffRank && (
                <RankBadge
                  className={personAvgAbsDiffRank <= 3 ? `rank-${personAvgAbsDiffRank}` : ''}
                  aria-label={`Avg Abs Diff rank #${personAvgAbsDiffRank} of ${totalAvgAbsDiffRanked}`}
                  title={`Avg Abs Diff rank #${personAvgAbsDiffRank} of ${totalAvgAbsDiffRanked}`}
                >
                  #{personAvgAbsDiffRank}
                </RankBadge>
              )}
              <StatLabel>Avg Abs Diff</StatLabel>
              <StatValue>{stats.avgAbsDiff.toFixed(1)}</StatValue>
              <StatMeta>Median {stats.medianAbsDiff.toFixed(1)}</StatMeta>
            </StatBox>
            <StatBox>
              {personAvgRankRank && (
                <RankBadge
                  className={personAvgRankRank <= 3 ? `rank-${personAvgRankRank}` : ''}
                  aria-label={`Avg Rank position #${personAvgRankRank} of ${totalAvgRankRanked}`}
                  title={`Avg Rank position #${personAvgRankRank} of ${totalAvgRankRanked}`}
                >
                  #{personAvgRankRank}
                </RankBadge>
              )}
              <StatLabel>Average Rank</StatLabel>
              <StatValue>{personAvgRank == null ? '—' : personAvgRank.toFixed(1)}</StatValue>
              <StatMeta>
                {personAvgRank == null ? '—' : `Across ${stats.participationYears} yrs`}
              </StatMeta>
            </StatBox>
            <StatBox>
              <StatLabel>Bias</StatLabel>
              <StatValue>
                {stats.bias > 0 ? '+' : ''}
                {Math.round(stats.bias)}
              </StatValue>
              <StatMeta>+ over / - under</StatMeta>
            </StatBox>
            <StatBox>
              {personSpotOnRank && (
                <RankBadge
                  className={personSpotOnRank <= 3 ? `rank-${personSpotOnRank}` : ''}
                  aria-label={`Spot-on rank #${personSpotOnRank} of ${totalSpotPlayers}`}
                  title={`Spot-on rank #${personSpotOnRank} of ${totalSpotPlayers}`}
                >
                  #{personSpotOnRank}
                </RankBadge>
              )}
              <StatLabel>Spot On</StatLabel>
              <StatValue>{stats.spotOn}</StatValue>
              <StatMeta>{spotOnYears.join(', ') || '—'}</StatMeta>
            </StatBox>
            <StatBox>
              {personBestDiffRank && (
                <RankBadge
                  className={personBestDiffRank <= 3 ? `rank-${personBestDiffRank}` : ''}
                  aria-label={`Best Diff rank #${personBestDiffRank} of ${totalBestDiffRanked}`}
                  title={`Best Diff rank #${personBestDiffRank} of ${totalBestDiffRanked}`}
                >
                  #{personBestDiffRank}
                </RankBadge>
              )}
              <StatLabel>Best Diff</StatLabel>
              <StatValue>{stats.bestDiff == null ? '—' : stats.bestDiff}</StatValue>
            </StatBox>
            <StatBox>
              {personWorstDiffRank && (
                <RankBadge
                  className={personWorstDiffRank <= 3 ? `rank-${personWorstDiffRank}` : ''}
                  aria-label={`Worst Diff rank #${personWorstDiffRank} of ${totalWorstDiffRanked}`}
                  title={`Worst Diff rank #${personWorstDiffRank} of ${totalWorstDiffRanked}`}
                >
                  #{personWorstDiffRank}
                </RankBadge>
              )}
              <StatLabel>Worst Diff</StatLabel>
              <StatValue>{stats.worstDiff == null ? '—' : stats.worstDiff}</StatValue>
            </StatBox>
            <StatBox>
              {personBiggestContributionRank && (
                <RankBadge
                  className={
                    personBiggestContributionRank <= 3
                      ? `rank-${personBiggestContributionRank}`
                      : ''
                  }
                  aria-label={`Biggest Gift rank #${personBiggestContributionRank} of ${totalBiggestContributionRanked}`}
                  title={`Biggest Gift rank #${personBiggestContributionRank} of ${totalBiggestContributionRanked}`}
                >
                  #{personBiggestContributionRank}
                </RankBadge>
              )}
              <StatLabel>Biggest Single Year Gift</StatLabel>
              <StatValue>{stats.biggestContribution}</StatValue>
            </StatBox>
          </StatBoxGrid>
        </Card>
        <Card style={{ minHeight: 360 }}>
          <CardTitle>Guess History</CardTitle>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                <XAxis dataKey="year" interval={0} angle={-35} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip formatter={(v, name) => [v, name]} />
                <Legend verticalAlign="top" height={36} />
                <ReferenceLine y={0} stroke="#666" />
                <Line
                  type="monotone"
                  dataKey="Total"
                  stroke="#ffcf4d"
                  strokeWidth={2}
                  dot={false}
                />
                <Line type="monotone" dataKey="Guess" stroke="#2b9348" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardTitle>Year Breakdown</CardTitle>
          <TableScroll $maxHeight={420}>
            <Table className="profile-table">
              <thead>
                <tr>
                  <th className="year">Year</th>
                  <th className="num">Guess</th>
                  <th className="num">Total</th>
                  <th className="result">Result</th>
                  <th className="rank">Rank</th>
                  <th className="num">Gifts Given</th>
                </tr>
              </thead>
              <tbody>
                {timelineWithRanks
                  .slice()
                  .sort((a, b) => Number(b.year) - Number(a.year))
                  .map((r) => (
                    <tr key={r.year} className={r.isWinner ? 'highlight' : ''}>
                      <td className="year">{r.year}</td>
                      <td className="num">{r.guess == null ? '—' : r.guess}</td>
                      <td className="num">{r.total}</td>
                      <td className="result">
                        {r.guess == null
                          ? '—'
                          : r.over
                            ? r.isWinner && r.diff !== null && r.over
                              ? `Over by ${r.diff}`
                              : `Over by ${r.diff}`
                            : r.diff === 0
                              ? 'Exact'
                              : `Under by ${r.diff}`}
                        {r.isWinner && ' 🎯'}
                      </td>
                      <td className="rank">{r.rank == null ? '—' : r.rank}</td>
                      <td className="num">{r.contributed}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </TableScroll>
        </Card>
      </GroupWrapper>
      <Footer>
        <HomeLink to="/" aria-label="Return to Home">
          <span className="emoji">🏠</span> Home
        </HomeLink>
      </Footer>
      {showCarousel && (
        <WinnerCarousel
          year={carouselYear}
          onClose={() => setShowCarousel(false)}
          winnerImageMap={winnerImageMap}
        />
      )}
    </Wrapper>
  );
}
