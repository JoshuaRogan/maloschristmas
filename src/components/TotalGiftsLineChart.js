import React from 'react';
import { Card, CardTitle } from './styled';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import CustomTooltip from './CustomTooltip';

export default function TotalGiftsLineChart({ data, year, winWidth, totalGiftsSelectedYear }) {
  const lineChartHeight = winWidth < 600 ? 230 : 300;
  return (
    <Card style={{gridColumn:'1 / -1'}}>
      <CardTitle>
        Total Gifts Over Years
        <span style={{fontSize: '.65rem', fontWeight: 400, opacity: .7}}> (Sum of individual gift counts)</span>
      </CardTitle>
      <div style={{width: '100%', height: lineChartHeight}}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{top:10,right:20,left:0,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#244356" />
            <XAxis dataKey="year" stroke="#aac2d8" angle={-35} textAnchor="end" height={winWidth<600?50:60} interval={Math.ceil((data?.length||0)/12)} tick={{fontSize: winWidth<500?9:11}} />
            <YAxis stroke="#aac2d8" tick={{fontSize: winWidth<500?9:11}} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="total" stroke="#ffbb33" strokeWidth={2.5} dot={{r:winWidth<500?2:3}} activeDot={{r:winWidth<500?4:5}} name="Total Gifts" />
            {totalGiftsSelectedYear && (
              <ReferenceLine x={year} stroke="#ff6b6b" label={{value:`${year}`, position:'insideTop', fill:'#fff', fontSize:10}} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

