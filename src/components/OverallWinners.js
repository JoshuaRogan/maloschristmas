import React from 'react';
import { Link } from 'react-router-dom';
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
                <th className="table-rank">#</th>
                <th className="table-person">Person</th>
                <th className="table-num">Wins</th>
                <th className="table-text">Years</th>
              </tr>
            </thead>
            <tbody>
              {overallWinCounts.map((r, i) => (
                <tr key={r.person} className={i === 0 ? 'highlight' : ''}>
                  <td className="table-rank">{i + 1}</td>
                  <td className="table-person">
                    <Link
                      to={`/profile/${encodeURIComponent(r.person)}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      {r.person}
                    </Link>
                    {i === 0 && ' 🏆'}
                  </td>
                  <td className="table-num">{r.wins}</td>
                  <td className="table-text" style={{ whiteSpace: 'nowrap' }}>
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
                  <td className="table-text" colSpan={4} style={{ padding: '6px', opacity: 0.6 }}>
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
