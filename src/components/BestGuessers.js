import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardTitle, TableScroll, Table, Stat } from './styled';
import { Link } from 'react-router-dom';

export default function BestGuessers({ bestGuessers }) {
  const [sort, setSort] = useState({ key: 'index', dir: 'desc' });
  const rankMap = useMemo(() => {
    if (!bestGuessers) return {};
    const ordered = bestGuessers.slice().sort((a, b) => {
      if (b.index !== a.index) return b.index - a.index;
      // tie-breaker stability (optional): higher accuracy, then name
      if (b.baseAccuracyPct !== a.baseAccuracyPct) return b.baseAccuracyPct - a.baseAccuracyPct;
      return a.person.localeCompare(b.person);
    });
    const map = {};
    ordered.forEach((r, i) => {
      map[r.person] = i + 1; // sequential rank based on Index order
    });
    return map;
  }, [bestGuessers]);

  const sortConfig = useMemo(
    () => ({
      person: { get: (r) => r.person.toLowerCase(), defaultDir: 'asc', type: 'string' },
      index: { get: (r) => r.index, defaultDir: 'desc', type: 'number' },
      accuracy: { get: (r) => r.baseAccuracyPct, defaultDir: 'desc', type: 'number' },
      avgErr: { get: (r) => r.avgAbsError, defaultDir: 'asc', type: 'number' },
      medianErr: { get: (r) => r.medianAbsError, defaultDir: 'asc', type: 'number' },
      years: { get: (r) => r.yearsParticipated, defaultDir: 'desc', type: 'number' },
    }),
    [],
  );

  const handleSort = useCallback(
    (key) => {
      setSort((prev) => {
        if (prev.key === key) {
          return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
        }
        return { key, dir: sortConfig[key].defaultDir };
      });
    },
    [sortConfig],
  ); // sortConfig keys static

  const sorted = useMemo(() => {
    if (!bestGuessers) return [];
    const cfg = sortConfig[sort.key];
    const arr = bestGuessers.slice();
    arr.sort((a, b) => {
      const av = cfg.get(a);
      const bv = cfg.get(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (cfg.type === 'number') {
        if (av !== bv) return sort.dir === 'asc' ? av - bv : bv - av;
      } else {
        if (av !== bv) return sort.dir === 'asc' ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
      }
      // tie-breaker: higher index, then name
      if (a.index !== b.index) return b.index - a.index;
      return a.person.localeCompare(b.person);
    });
    return arr;
  }, [bestGuessers, sort, sortConfig]);

  const arrowFor = (key) => (sort.key === key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : '');

  const Header = ({ label, keyName }) => (
    <th
      onClick={() => handleSort(keyName)}
      style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
      aria-sort={sort.key === keyName ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      role="columnheader"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSort(keyName);
        }
      }}
    >
      {label}
      {arrowFor(keyName)}
    </th>
  );

  return (
    <Card style={{ margin: 0 }}>
      <CardTitle>Best Guesser Index (All Years)</CardTitle>
      <Stat>
        <strong>Index</strong> = Accuracy × Participation
      </Stat>
      <div style={{ fontSize: '.6rem', opacity: 0.65, marginTop: 4 }}>
        Participation needs 6+ years (capped at 10). Accuracy ignores over/under rule.
      </div>
      <TableScroll>
        <Table>
          <thead>
            <tr>
              <th>#</th>
              <Header label="Person" keyName="person" />
              <Header label="Index" keyName="index" />
              <Header label="Acc%" keyName="accuracy" />
              <Header label="Avg Err" keyName="avgErr" />
              <Header label="Median Err" keyName="medianErr" />
              <Header label="Years" keyName="years" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.person} className={rankMap[r.person] === 1 ? 'highlight' : ''}>
                <td>{rankMap[r.person]}</td>
                <td>
                  <Link
                    to={`/profile/${encodeURIComponent(r.person)}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {r.person}
                  </Link>
                  {rankMap[r.person] === 1 && ' 🥇'}
                </td>
                <td>{r.index.toFixed(1)}</td>
                <td>{(Math.round(r.baseAccuracyPct * 10) / 10).toFixed(1)}</td>
                <td>{Math.round(r.avgAbsError * 10) / 10}</td>
                <td>{Math.round(r.medianAbsError * 10) / 10}</td>
                <td>{r.yearsParticipated}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '6px', opacity: 0.6 }}>
                  No eligible guessers (need 6+ years).
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableScroll>
    </Card>
  );
}
