import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardTitle, TableScroll, Table } from './styled';
import { Link } from 'react-router-dom';

export default function AverageRankLeaderboard({ averageRanks }) {
  const MIN_YEARS = 5;
  const [sort, setSort] = useState({ key: 'avgRank', dir: 'asc' });
  const sortConfig = useMemo(
    () => ({
      person: { get: (r) => r.person.toLowerCase(), defaultDir: 'asc', type: 'string' },
      avgRank: { get: (r) => r.avgRank, defaultDir: 'asc', type: 'number' },
      medianRank: { get: (r) => r.medianRank, defaultDir: 'asc', type: 'number' },
      bestRank: { get: (r) => r.bestRank, defaultDir: 'asc', type: 'number' },
      worstRank: { get: (r) => r.worstRank, defaultDir: 'asc', type: 'number' },
      years: { get: (r) => r.yearsParticipated, defaultDir: 'desc', type: 'number' },
    }),
    [],
  );

  const handleSort = useCallback(
    (key) => {
      setSort((prev) =>
        prev.key === key
          ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
          : { key, dir: sortConfig[key].defaultDir },
      );
    },
    [sortConfig],
  );

  const sorted = useMemo(() => {
    if (!averageRanks) return [];
    const filteredSource = averageRanks.filter((r) => r.yearsParticipated >= MIN_YEARS);
    const cfg = sortConfig[sort.key];
    const arr = filteredSource.slice();
    arr.sort((a, b) => {
      const av = cfg.get(a);
      const bv = cfg.get(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (cfg.type === 'number') {
        if (av !== bv) return sort.dir === 'asc' ? av - bv : bv - av;
      } else if (av !== bv) {
        return sort.dir === 'asc' ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
      }
      // tie breakers: more years, then person name
      if (a.yearsParticipated !== b.yearsParticipated)
        return b.yearsParticipated - a.yearsParticipated;
      return a.person.localeCompare(b.person);
    });
    return arr;
  }, [averageRanks, sort, sortConfig]);

  const rankMap = useMemo(() => {
    const map = {};
    sorted.forEach((r, i) => {
      map[r.person] = i + 1;
    });
    return map;
  }, [sorted]);

  const arrowFor = (key) => (sort.key === key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : '');
  const Header = ({ label, keyName }) => (
    <th
      onClick={() => handleSort(keyName)}
      style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
      aria-sort={sort.key === keyName ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
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
      <CardTitle>Average Rank (All Years)</CardTitle>
      <div style={{ fontSize: '.6rem', opacity: 0.65, marginTop: 4 }}>
        Lower is better. Includes only years with a guess. Uses closest-without-going-over rule for
        per-year order. Requires {MIN_YEARS}+ years.
      </div>
      <TableScroll>
        <Table>
          <thead>
            <tr>
              <th className="table-rank">#</th>
              <Header label="Person" keyName="person" />
              <Header label="Avg Rank" keyName="avgRank" />
              <Header label="Median" keyName="medianRank" />
              <Header label="Best" keyName="bestRank" />
              <Header label="Worst" keyName="worstRank" />
              <Header label="Years" keyName="years" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.person} className={rankMap[r.person] === 1 ? 'highlight' : ''}>
                <td className="table-rank">{rankMap[r.person]}</td>
                <td className="table-person">
                  <Link
                    to={`/profile/${encodeURIComponent(r.person)}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {r.person}
                    {rankMap[r.person] === 1 && ' 🥇'}
                  </Link>
                </td>
                <td className="table-num">{r.avgRank.toFixed(2)}</td>
                <td className="table-num">{r.medianRank}</td>
                <td className="table-num">{r.bestRank}</td>
                <td className="table-num">{r.worstRank}</td>
                <td className="table-num">{r.yearsParticipated}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td className="table-text" colSpan={7} style={{ padding: '6px', opacity: 0.6 }}>
                  No average rank data.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableScroll>
    </Card>
  );
}
