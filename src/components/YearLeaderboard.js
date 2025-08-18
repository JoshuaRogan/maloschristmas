import React from 'react';
import {
  Card,
  CardTitle,
  YearLeaderboardLayout,
  LeaderboardTableCol,
  TableScroll,
  Table,
} from './styled';
import { Link } from 'react-router-dom';

export default function YearLeaderboard({ sortedPersonYear, winnerDiff, anyNonOver, year }) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column' }}>
      <CardTitle>{year} Leaderboard </CardTitle>
      <YearLeaderboardLayout>
        <LeaderboardTableCol>
          <TableScroll style={{ flex: 1, maxHeight: 'none' }}>
            <Table>
              <thead>
                <tr>
                  <th className="table-rank">#</th>
                  <th className="table-person">Person</th>
                  <th className="table-num">Guess</th>
                  <th className="table-text">Result</th>
                </tr>
              </thead>
              <tbody>
                {sortedPersonYear.map((r, i) => {
                  const isWinner =
                    (anyNonOver && !r.over && r.diff === winnerDiff) ||
                    (!anyNonOver && r.over && r.diff === winnerDiff);
                  // Highlight any over guess that was actually closer than the winning non-over guess
                  const isCloserOver = anyNonOver && r.over && r.diff < winnerDiff;
                  const rowClass = isWinner
                    ? `highlight${r.over ? ' over' : ''}`
                    : isCloserOver
                      ? 'highlight-closer-over'
                      : '';
                  return (
                    <tr
                      key={r.person}
                      className={rowClass}
                      title={isCloserOver ? 'Closer than winner but went over' : undefined}
                    >
                      <td className="table-rank">{i + 1}</td>
                      <td className="table-person">
                        <Link
                          to={`/profile/${encodeURIComponent(r.person)}`}
                          style={{ color: 'inherit', textDecoration: 'none' }}
                          title={`View ${r.person} profile`}
                        >
                          {r.person}
                        </Link>
                        {isWinner && ' 🎯'}
                        {isCloserOver && ' ⚠️'}
                      </td>
                      <td className="table-num">{r.guess}</td>
                      <td className="table-text">
                        {r.over
                          ? isWinner && !anyNonOver
                            ? `All over – over by ${r.diff}`
                            : `Over by ${r.diff}`
                          : r.diff === 0
                            ? 'Exact!'
                            : `Under by ${r.diff}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableScroll>
        </LeaderboardTableCol>
      </YearLeaderboardLayout>
    </Card>
  );
}
