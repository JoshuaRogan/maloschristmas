import React from 'react';
import {
  Card,
  CardTitle,
  YearLeaderboardLayout,
  LeaderboardTableCol,
  TableScroll,
  Table,
} from './styled';

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
                  <th>#</th>
                  <th>Person</th>
                  <th>Guess</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {sortedPersonYear.map((r, i) => {
                  const isWinner =
                    (anyNonOver && !r.over && r.diff === winnerDiff) ||
                    (!anyNonOver && r.over && r.diff === winnerDiff);
                  return (
                    <tr
                      key={r.person}
                      className={isWinner ? `highlight${r.over ? ' over' : ''}` : ''}
                    >
                      <td>{i + 1}</td>
                      <td>
                        {r.person}
                        {isWinner && ' 🎯'}
                      </td>
                      <td>{r.guess}</td>
                      <td>
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
