import React from 'react';
import { Card, CardTitle, StatBoxGrid, StatBox, StatLabel, StatValue, StatMeta } from './styled';

export default function YearStats({ totalGifts, personYear, winnerDiff, anyNonOver, yearAgg }) {
  return (
    <Card>
      <CardTitle>Year Stats</CardTitle>
      <StatBoxGrid>
        <StatBox>
          <StatLabel>Total Gifts</StatLabel>
          <StatValue>{totalGifts ?? '—'}</StatValue>
          <StatMeta>Sum of all contributions</StatMeta>
        </StatBox>
        <StatBox>
          <StatLabel>Guessers</StatLabel>
          <StatValue>{personYear.filter((p) => p.guess != null).length}</StatValue>
          <StatMeta>With at least one guess</StatMeta>
        </StatBox>
        <StatBox
          style={{
            background: winnerDiff === 0 ? 'linear-gradient(145deg,#2b9348,#1d6d34)' : undefined,
          }}
        >
          <StatLabel>Closest Offset</StatLabel>
          <StatValue>{winnerDiff != null ? winnerDiff : '—'}</StatValue>
          <StatMeta>
            {!anyNonOver && winnerDiff != null ? 'All guesses over' : 'Closest without going over'}
          </StatMeta>
        </StatBox>
        {yearAgg && (
          <>
            <StatBox>
              <StatLabel>Avg / Median</StatLabel>
              <StatValue>
                {Math.round(yearAgg.avgGuess * 10) / 10}
                <span style={{ fontSize: '.65rem', opacity: 0.55 }}>/ {yearAgg.medianGuess}</span>
              </StatValue>
              <StatMeta>Average & median guess</StatMeta>
            </StatBox>
            <StatBox>
              <StatLabel>Range</StatLabel>
              <StatValue style={{ fontSize: '.9rem' }}>{yearAgg.range}</StatValue>
              <StatMeta>Lowest – Highest guess</StatMeta>
            </StatBox>
            <StatBox>
              <StatLabel>Mean Abs Diff</StatLabel>
              <StatValue>{Math.round(yearAgg.meanAbsDiff * 10) / 10}</StatValue>
              <StatMeta>Average distance from total</StatMeta>
            </StatBox>
            <StatBox>
              <StatLabel>Over Guesses</StatLabel>
              <StatValue>
                {yearAgg.overCount}
                <span style={{ fontSize: '.6rem', opacity: 0.55 }}>
                  ({Math.round((yearAgg.overCount / yearAgg.totalGuesses) * 100)}%)
                </span>
              </StatValue>
              <StatMeta>Above total gift count</StatMeta>
            </StatBox>
            <StatBox
              style={
                yearAgg.perfectCount > 0
                  ? { background: 'linear-gradient(145deg,#ffce3a,#ffb347)', color: '#142433' }
                  : undefined
              }
            >
              <StatLabel style={yearAgg.perfectCount > 0 ? { color: '#142433' } : undefined}>
                Perfect
              </StatLabel>
              <StatValue style={yearAgg.perfectCount > 0 ? { color: '#142433' } : undefined}>
                {yearAgg.perfectCount}
              </StatValue>
              <StatMeta
                style={yearAgg.perfectCount > 0 ? { color: '#142433', opacity: 0.7 } : undefined}
              >
                Exact matches
              </StatMeta>
            </StatBox>
            <StatBox>
              <StatLabel>Worst Offset</StatLabel>
              <StatValue>{yearAgg.worstDiff}</StatValue>
              <StatMeta style={{ whiteSpace: 'normal' }}>
                Furthest: {yearAgg.worstPeople.slice(0, 3).join(', ')}
                {yearAgg.worstPeople.length > 3 ? '...' : ''}
              </StatMeta>
            </StatBox>
          </>
        )}
      </StatBoxGrid>
    </Card>
  );
}
