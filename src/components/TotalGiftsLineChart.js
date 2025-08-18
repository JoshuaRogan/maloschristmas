import React from 'react';
import { Card, CardTitle } from './styled';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import CustomTooltip from './CustomTooltip';

export default function TotalGiftsLineChart({
  data,
  year,
  winWidth,
  totalGiftsSelectedYear,
  onSelectYear,
  exactYearSet = new Set(),
}) {
  const lineChartHeight = winWidth < 600 ? 230 : 300;
  const handleClick = (d) => {
    if (onSelectYear && d && d.year) onSelectYear(String(d.year));
  };
  // custom dot to ensure click area
  const renderDot = (props) => {
    const { cx, cy, payload } = props;
    const isActive = String(payload.year) === String(year);
    const isExact = exactYearSet.has(String(payload.year));
    const baseR = isActive ? (winWidth < 500 ? 6 : 7) : winWidth < 500 ? 4 : 5;
    if (isExact) {
      const outerR = baseR + (winWidth < 500 ? 3 : 4);
      const midR = outerR * 0.62;
      const innerR = outerR * 0.32;
      const strokeMain = isActive ? '#ff6b6b' : '#ffbb33';
      return (
        <g style={{ cursor: 'pointer' }} onClick={() => handleClick(payload)}>
          {/* outer halo */}
          <circle cx={cx} cy={cy} r={outerR + 2} fill="rgba(255,255,255,0.15)" />
          {/* outer ring */}
          <circle
            cx={cx}
            cy={cy}
            r={outerR}
            fill="#102c3a"
            stroke={strokeMain}
            strokeWidth={isActive ? 3 : 2}
          />
          {/* mid ring */}
          <circle
            cx={cx}
            cy={cy}
            r={midR}
            fill={isActive ? '#ffbb33' : '#102c3a'}
            stroke={strokeMain}
            strokeWidth={isActive ? 2 : 1.5}
          />
          {/* inner dot */}
          <circle cx={cx} cy={cy} r={innerR} fill={isActive ? '#ff6b6b' : '#ffbb33'} />
          {/* subtle crosshair to emphasize */}
          <line
            x1={cx - outerR}
            x2={cx + outerR}
            y1={cy}
            y2={cy}
            stroke={strokeMain}
            strokeWidth={1}
            opacity={0.55}
          />
          <line
            x1={cx}
            x2={cx}
            y1={cy - outerR}
            y2={cy + outerR}
            stroke={strokeMain}
            strokeWidth={1}
            opacity={0.55}
          />
          <title>Exact guess year</title>
        </g>
      );
    }
    return (
      <circle
        cx={cx}
        cy={cy}
        r={isActive ? (winWidth < 500 ? 5 : 6) : winWidth < 500 ? 3 : 4}
        stroke={isActive ? '#ff6b6b' : '#ffbb33'}
        strokeWidth={isActive ? 2 : 1}
        fill={isActive ? '#ffbb33' : '#102c3a'}
        style={{ cursor: 'pointer' }}
        onClick={() => handleClick(payload)}
      />
    );
  };
  return (
    <Card style={{ gridColumn: '1 / -1' }}>
      <CardTitle>
        Total Gifts Over Years
        <span style={{ fontSize: '.65rem', fontWeight: 400, opacity: 0.7 }}>
          {' '}
          (Sum of individual gift counts)
        </span>
      </CardTitle>
      <div style={{ width: '100%', height: lineChartHeight }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            onClick={(e) => e && e.activePayload && handleClick(e.activePayload[0].payload)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#244356" />
            <XAxis
              dataKey="year"
              stroke="#aac2d8"
              angle={-35}
              textAnchor="end"
              height={winWidth < 600 ? 50 : 60}
              interval={Math.ceil((data?.length || 0) / 12)}
              tick={{ fontSize: winWidth < 500 ? 9 : 11 }}
            />
            <YAxis stroke="#aac2d8" tick={{ fontSize: winWidth < 500 ? 9 : 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#ffbb33"
              strokeWidth={2.5}
              dot={renderDot}
              activeDot={{
                r: winWidth < 500 ? 6 : 7,
                onClick: (e) => e && e.payload && handleClick(e.payload),
              }}
              name="Total Gifts"
            />
            {totalGiftsSelectedYear && (
              <ReferenceLine
                x={year}
                stroke="#ff6b6b"
                label={{ value: `${year}`, position: 'insideTop', fill: '#fff', fontSize: 10 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
