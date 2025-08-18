import React from 'react';
import { Card, CardTitle, TableScroll, Table, Stat } from './styled';

export default function BestGuessers({ bestGuessers }) {
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
              <th>Person</th>
              <th>Index</th>
              <th>Acc%</th>
              <th>Avg Err</th>
              <th>Median Err</th>
              <th>Years</th>
            </tr>
          </thead>
          <tbody>
            {bestGuessers.map((r, i) => (
              <tr key={r.person} className={i === 0 ? 'highlight' : ''}>
                <td>{i + 1}</td>
                <td>
                  {r.person}
                  {i === 0 && ' 🥇'}
                </td>
                <td>{r.index.toFixed(1)}</td>
                <td>{(Math.round(r.baseAccuracyPct * 10) / 10).toFixed(1)}</td>
                <td>{Math.round(r.avgAbsError * 10) / 10}</td>
                <td>{Math.round(r.medianAbsError * 10) / 10}</td>
                <td>{r.yearsParticipated}</td>
              </tr>
            ))}
            {bestGuessers.length === 0 && (
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
