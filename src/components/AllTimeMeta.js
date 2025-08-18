import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardTitle,
  TableScroll,
  Table,
  StatBoxGrid,
  StatBox,
  StatLabel,
  StatValue,
  StatMeta,
} from './styled';

export default function AllTimeMeta({ meta }) {
  if (!meta) return null;
  const {
    spotOnDetails = [],
    totalSpotOn = 0,
    backToBackSequences = [],
    worstGuesses = [],
    maxYearGiftTotal = 0,
    maxYearGiftYears = [],
    topGifterTotal = 0,
    topGifters = [],
    biggestGuessValue = 0,
    biggestGuesses = [],
    smallestGuessValue = 0,
    smallestGuesses = [],
    maxSingleYearContribution = 0,
    maxSingleYearContributors = [],
    closerOverBeatsCount = 0,
    closerOverBeats = [],
  } = meta;
  const longestStreak = backToBackSequences.length
    ? Math.max(...backToBackSequences.map((s) => s.length))
    : 0;
  const longestStreaks = backToBackSequences.filter((s) => s.length === longestStreak);
  const worstDiff = worstGuesses.length ? worstGuesses[0].diff : 0;
  const formatPeopleYears = (arr) =>
    arr.length
      ? arr.slice(0, 3).map((g, idx) => (
          <span key={`${g.person}-${g.year || idx}`}>
            <Link
              to={`/profile/${encodeURIComponent(g.person)}`}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              {g.person}
            </Link>
            {g.year ? ' ' + g.year : ''}
            {idx < Math.min(arr.length, 3) - 1 ? ', ' : ''}
          </span>
        ))
      : '—';
  return (
    <Card>
      <CardTitle>All-Time Extra Stats ✨</CardTitle>
      <StatBoxGrid>
        <StatBox>
          <StatLabel>Spot-On Wins</StatLabel>
          <StatValue>{totalSpotOn}</StatValue>
          <StatMeta>Exact (non-over) winning guesses</StatMeta>
        </StatBox>
        <StatBox>
          <StatLabel>Over Closer Misses</StatLabel>
          <StatValue>{closerOverBeatsCount}</StatValue>
          <StatMeta>Over guesses closer than winner</StatMeta>
        </StatBox>
        <StatBox>
          <StatLabel>Longest Streak</StatLabel>
          <StatValue>
            {longestStreak || '—'}
            {longestStreak > 1 && (
              <span style={{ fontSize: '0.55rem', fontWeight: 600 }}> yrs</span>
            )}
          </StatValue>
          <StatMeta>
            {longestStreaks.length
              ? longestStreaks
                  .map((s) => `${s.person} (${s.years[0]}–${s.years[s.years.length - 1]})`)
                  .join(', ')
              : 'No consecutive wins yet'}
          </StatMeta>
        </StatBox>
        <StatBox>
          <StatLabel>Worst Diff</StatLabel>
          <StatValue>
            {worstDiff || '—'}
            {worstDiff > 0 && <span style={{ fontSize: '0.55rem', fontWeight: 600 }}> off</span>}
          </StatValue>
          <StatMeta>{formatPeopleYears(worstGuesses)}</StatMeta>
        </StatBox>
        <StatBox>
          <StatLabel>Most Gifts / Yr</StatLabel>
          <StatValue>{maxYearGiftTotal || '—'}</StatValue>
          <StatMeta>{maxYearGiftYears.length ? maxYearGiftYears.join(', ') : '—'}</StatMeta>
        </StatBox>
        <StatBox>
          <StatLabel>Top Gifter Total</StatLabel>
          <StatValue>{topGifterTotal || '—'}</StatValue>
          <StatMeta>
            {topGifters.length
              ? topGifters.slice(0, 3).map((p, idx) => (
                  <span key={p}>
                    <Link
                      to={`/profile/${encodeURIComponent(p)}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      {p}
                    </Link>
                    {idx < Math.min(topGifters.length, 3) - 1 ? ', ' : ''}
                  </span>
                ))
              : '—'}
          </StatMeta>
        </StatBox>
        <StatBox>
          <StatLabel>Max Single-Year Gifts</StatLabel>
          <StatValue>{maxSingleYearContribution || '—'}</StatValue>
          <StatMeta>
            {maxSingleYearContributors.length
              ? maxSingleYearContributors.slice(0, 3).map((c, idx) => (
                  <span key={c.person + '-' + c.year}>
                    <Link
                      to={`/profile/${encodeURIComponent(c.person)}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      {c.person}
                    </Link>{' '}
                    {c.year}
                    {idx < Math.min(maxSingleYearContributors.length, 3) - 1 ? ', ' : ''}
                  </span>
                ))
              : '—'}
          </StatMeta>
        </StatBox>
        <StatBox>
          <StatLabel>Biggest Guess</StatLabel>
          <StatValue>{biggestGuessValue || '—'}</StatValue>
          <StatMeta>
            {biggestGuesses.length
              ? biggestGuesses.slice(0, 3).map((g, idx) => (
                  <span key={g.person + g.year}>
                    <Link
                      to={`/profile/${encodeURIComponent(g.person)}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      {g.person}
                    </Link>{' '}
                    {g.year}
                    {idx < Math.min(biggestGuesses.length, 3) - 1 ? ', ' : ''}
                  </span>
                ))
              : '—'}
          </StatMeta>
        </StatBox>
        <StatBox>
          <StatLabel>Smallest Guess</StatLabel>
          <StatValue>{smallestGuessValue || '—'}</StatValue>
          <StatMeta>
            {smallestGuesses.length
              ? smallestGuesses.slice(0, 3).map((g, idx) => (
                  <span key={g.person + g.year}>
                    <Link
                      to={`/profile/${encodeURIComponent(g.person)}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      {g.person}
                    </Link>{' '}
                    {g.year}
                    {idx < Math.min(smallestGuesses.length, 3) - 1 ? ', ' : ''}
                  </span>
                ))
              : '—'}
          </StatMeta>
        </StatBox>
      </StatBoxGrid>
      <div style={{ marginTop: '0.9rem' }}>
        {/* Spot-On Winners */}
        <div
          style={{
            fontSize: '.7rem',
            letterSpacing: '.8px',
            fontWeight: 600,
            opacity: 0.75,
            textTransform: 'uppercase',
            margin: '0 0 4px',
          }}
        >
          Spot-On Winners
        </div>
        <TableScroll $maxHeight={240}>
          <Table>
            <thead>
              <tr>
                <th className="table-rank">#</th>
                <th className="table-person">Person</th>
                <th className="table-num">Exact</th>
                <th className="table-text">Years</th>
              </tr>
            </thead>
            <tbody>
              {spotOnDetails.map((r, i) => (
                <tr key={r.person} className={i === 0 ? 'highlight' : ''}>
                  <td className="table-rank">{i + 1}</td>
                  <td className="table-person">
                    <Link
                      to={`/profile/${encodeURIComponent(r.person)}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      {r.person}
                    </Link>
                  </td>
                  <td className="table-num" style={{ fontWeight: 600 }}>
                    {r.count}
                  </td>
                  <td className="table-text" style={{ whiteSpace: 'nowrap' }}>
                    {r.years.map((y, idx) => (
                      <span key={y} style={idx === r.years.length - 1 ? {} : {}}>
                        {y}
                        {idx < r.years.length - 1 && ', '}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
              {spotOnDetails.length === 0 && (
                <tr>
                  <td className="table-text" colSpan={4} style={{ padding: 6, opacity: 0.6 }}>
                    None yet.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableScroll>
      </div>
      {closerOverBeatsCount > 0 && (
        <div style={{ marginTop: '1.2rem' }}>
          <div
            style={{
              fontSize: '.7rem',
              letterSpacing: '.8px',
              fontWeight: 600,
              opacity: 0.75,
              textTransform: 'uppercase',
              margin: '0 0 4px',
            }}
          >
            Over Closer Misses
          </div>
          <TableScroll $maxHeight={260}>
            <Table>
              <thead>
                <tr>
                  <th className="table-num">Year</th>
                  <th className="table-person">Over Guesser</th>
                  <th className="table-num">Guess</th>
                  <th className="table-text">Over Diff</th>
                  <th className="table-num">Winner Diff</th>
                  <th className="table-text">Winners</th>
                  <th className="table-num">Total</th>
                </tr>
              </thead>
              <tbody>
                {closerOverBeats
                  .slice()
                  .sort(
                    (a, b) => Number(b.year) - Number(a.year) || a.person.localeCompare(b.person),
                  )
                  .map((r) => (
                    <tr key={`${r.year}-${r.person}`}>
                      <td className="table-num">{r.year}</td>
                      <td className="table-person">
                        <Link
                          to={`/profile/${encodeURIComponent(r.person)}`}
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {r.person}
                        </Link>
                      </td>
                      <td className="table-num">{r.guess}</td>
                      <td className="table-text" style={{ whiteSpace: 'nowrap' }}>
                        over by {r.overDiff}
                      </td>
                      <td className="table-num" style={{ whiteSpace: 'nowrap' }}>
                        {r.winnerDiff}
                      </td>
                      <td className="table-text" style={{ whiteSpace: 'nowrap' }}>
                        {r.winners.map((w, idx) => (
                          <span key={w + idx}>
                            <Link
                              to={`/profile/${encodeURIComponent(w)}`}
                              style={{ color: 'inherit', textDecoration: 'none' }}
                            >
                              {w}
                            </Link>
                            {idx < r.winners.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </td>
                      <td className="table-num">{r.total}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </TableScroll>
        </div>
      )}
    </Card>
  );
}
