import React from 'react';
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
    spotOnDetails = [], // detailed list with years
    totalSpotOn = 0,
    backToBackSequences = [],
    worstGuesses = [], // still used for stat box summary
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
  } = meta;
  const longestStreak = backToBackSequences.length
    ? Math.max(...backToBackSequences.map((s) => s.length))
    : 0;
  const longestStreaks = backToBackSequences.filter((s) => s.length === longestStreak);
  const worstDiff = worstGuesses.length ? worstGuesses[0].diff : 0;
  const formatPeopleYears = (arr) =>
    arr
      .map((g) => `${g.person}${g.year ? ' ' + g.year : ''}`)
      .slice(0, 3)
      .join(', ') + (arr.length > 3 ? '…' : '') || '—';
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
          <StatMeta>{topGifters.length ? topGifters.join(', ') : '—'}</StatMeta>
        </StatBox>
        <StatBox>
          <StatLabel>Max Single-Year Gifts</StatLabel>
          <StatValue>{maxSingleYearContribution || '—'}</StatValue>
          <StatMeta>
            {maxSingleYearContributors.length
              ? maxSingleYearContributors
                  .map((c) => `${c.person} ${c.year}`)
                  .slice(0, 3)
                  .join(', ') + (maxSingleYearContributors.length > 3 ? '…' : '')
              : '—'}
          </StatMeta>
        </StatBox>
        <StatBox>
          <StatLabel>Biggest Guess</StatLabel>
          <StatValue>{biggestGuessValue || '—'}</StatValue>
          <StatMeta>
            {biggestGuesses.length
              ? biggestGuesses
                  .map((g) => `${g.person} ${g.year}`)
                  .slice(0, 3)
                  .join(', ') + (biggestGuesses.length > 3 ? '…' : '')
              : '—'}
          </StatMeta>
        </StatBox>
        <StatBox>
          <StatLabel>Smallest Guess</StatLabel>
          <StatValue>{smallestGuessValue || '—'}</StatValue>
          <StatMeta>
            {smallestGuesses.length
              ? smallestGuesses
                  .map((g) => `${g.person} ${g.year}`)
                  .slice(0, 3)
                  .join(', ') + (smallestGuesses.length > 3 ? '…' : '')
              : '—'}
          </StatMeta>
        </StatBox>
      </StatBoxGrid>
      <div style={{ marginTop: '0.9rem' }}>
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
                <th>#</th>
                <th>Person</th>
                <th>Exact</th>
                <th>Years</th>
              </tr>
            </thead>
            <tbody>
              {spotOnDetails.map((r, i) => (
                <tr key={r.person} className={i === 0 ? 'highlight' : ''}>
                  <td>{i + 1}</td>
                  <td>{r.person}</td>
                  <td style={{ fontWeight: 600 }}>{r.count}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
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
                  <td colSpan={4} style={{ padding: 6, opacity: 0.6 }}>
                    None yet.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableScroll>
      </div>
    </Card>
  );
}
