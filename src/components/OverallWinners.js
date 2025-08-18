import React from 'react';
import { Card, CardTitle, WinnersGrid, TableScroll, Table, Stat } from './styled';

export default function OverallWinners({ winnersByYear, overallWinCounts }) {
  return (
    <WinnersGrid>
      <Card style={{ margin: 0 }}>
        <CardTitle>Overall Winners (All Years)</CardTitle>
        <Stat>
          Total years with winners: <strong>{winnersByYear.length}</strong>
        </Stat>
        <div style={{ fontSize: '.6rem', opacity: 0.65, marginTop: 4 }}>
          Gold ★ year = exact spot-on guess
        </div>
        <TableScroll>
          <Table>
            <thead>
              <tr>
                <th>#</th>
                <th>Person</th>
                <th>Wins</th>
                <th>Years</th>
              </tr>
            </thead>
            <tbody>
              {overallWinCounts.map((r, i) => (
                <tr key={r.person} className={i === 0 ? 'highlight' : ''}>
                  <td>{i + 1}</td>
                  <td>
                    {r.person}
                    {i === 0 && ' 🏆'}
                  </td>
                  <td>{r.wins}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {r.yearsDetailed.map((yObj, idx) => (
                      <span
                        key={yObj.year}
                        style={
                          yObj.exact ? { color: '#ffce3a', fontWeight: 600 } : { opacity: 0.85 }
                        }
                      >
                        {yObj.exact && '★'}
                        {yObj.year}
                        {idx < r.yearsDetailed.length - 1 && ', '}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
              {overallWinCounts.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '6px', opacity: 0.6 }}>
                    No winners yet.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableScroll>
      </Card>
    </WinnersGrid>
  );
}
