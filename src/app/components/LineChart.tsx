// components/LineChart.tsx
import React from "react";
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { time: "00:00", calls: 10 },
    { time: "04:00", calls: 20 },
    { time: "08:00", calls: 30 },
    { time: "12:00", calls: 50 },
    { time: "16:00", calls: 40 },
    { time: "20:00", calls: 30 },
    { time: "24:00", calls: 20 },
];

export default function LineChart() {
    return (
        <ResponsiveContainer width="100%" height={250}>
            <ReLineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#ffffff" />
                <YAxis stroke="#ffffff" />
                <Tooltip />
                <Line type="monotone" dataKey="calls" stroke="#36A2EB" strokeWidth={3} />
            </ReLineChart>
        </ResponsiveContainer>
    );
}
