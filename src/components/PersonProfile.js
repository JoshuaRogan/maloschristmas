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

export default function PersonProfile() {
  const { person: personParam } = useParams();
  const navigate = useNavigate();
  const [gifts, setGifts] = useState(null);
  const [guesses, setGuesses] = useState(null);
  const [error, setError] = useState(null);
  const [person, setPerson] = useState(personParam ? decodeURIComponent(personParam) : '');
  const [notFound, setNotFound] = useState(false);

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
      const combined = combinePersonYear(
        gifts,
        guesses,
        row.year,
        (giftsYearTotals.find((g) => g.year === row.year) || {}).total || 0,
      );
      const sorted = combined.filter((r) => r.guess != null).sort((a, b) => a.diff - b.diff);
      const rankingOrder = sorted.map((r) => r.person);
      const rank = rankingOrder.indexOf(person) + 1 || null;
      // Determine winners consistent with main app logic
      const nonOver = sorted.filter((r) => r.over === false);
      const winnerPool = nonOver.length ? nonOver : sorted;
      const bestDiff = winnerPool.length ? Math.min(...winnerPool.map((r) => r.diff)) : null;
      const isWinner = winnerPool.some((r) => r.person === person && r.diff === bestDiff);
      return { ...row, rank, isWinner };
    });
  }, [timeline, gifts, guesses, giftsYearTotals, person]);

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
          <Link to="/" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            ← Home
          </Link>
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
        <Link to="/" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
          ← Home
        </Link>
      </div>
      <Title>{person} Profile</Title>
      <GroupWrapper>
        <Card>
          <CardTitle>Choose Person</CardTitle>
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
        </Card>
        <Card>
          <CardTitle>Summary Stats</CardTitle>
          <StatBoxGrid>
            <StatBox>
              <StatLabel>Years Played</StatLabel>
              <StatValue>{stats.participationYears}</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>Avg Guess</StatLabel>
              <StatValue>{Math.round(stats.avgGuess)}</StatValue>
              <StatMeta>Median {Math.round(stats.medianGuess)}</StatMeta>
            </StatBox>
            <StatBox>
              <StatLabel>Avg Abs Diff</StatLabel>
              <StatValue>{stats.avgAbsDiff.toFixed(1)}</StatValue>
              <StatMeta>Median {stats.medianAbsDiff.toFixed(1)}</StatMeta>
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
              <StatLabel>Wins</StatLabel>
              <StatValue>{stats.wins}</StatValue>
              <StatMeta>{winsYears.join(', ') || '—'}</StatMeta>
            </StatBox>
            <StatBox>
              <StatLabel>Spot On</StatLabel>
              <StatValue>{stats.spotOn}</StatValue>
              <StatMeta>{spotOnYears.join(', ') || '—'}</StatMeta>
            </StatBox>
            <StatBox>
              <StatLabel>Best Diff</StatLabel>
              <StatValue>{stats.bestDiff == null ? '—' : stats.bestDiff}</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>Worst Diff</StatLabel>
              <StatValue>{stats.worstDiff == null ? '—' : stats.worstDiff}</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>Total Gifts Given</StatLabel>
              <StatValue>{stats.totalContribution}</StatValue>
              <StatMeta>Avg {Math.round(stats.avgContribution)} / yr</StatMeta>
            </StatBox>
            <StatBox>
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
            <Table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Guess</th>
                  <th>Total</th>
                  <th>Diff</th>
                  <th>Result</th>
                  <th>Rank</th>
                  <th>Gifts Given</th>
                </tr>
              </thead>
              <tbody>
                {timelineWithRanks.map((r) => (
                  <tr key={r.year} className={r.isWinner ? 'highlight' : ''}>
                    <td>{r.year}</td>
                    <td>{r.guess == null ? '—' : r.guess}</td>
                    <td>{r.total}</td>
                    <td>{r.diff == null ? '—' : r.diff}</td>
                    <td>
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
                    <td>{r.rank == null ? '—' : r.rank}</td>
                    <td>{r.contributed}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableScroll>
        </Card>
      </GroupWrapper>
      <Footer>
        <Link to="/">← Back Home</Link>
      </Footer>
    </Wrapper>
  );
}
