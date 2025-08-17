// components/PieChart.tsx
import React from "react";
import { PieChart as RePieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
    { name: "Fire", value: 40 },
    { name: "Medical", value: 30 },
    { name: "Police", value: 30 },
];

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56"];

export default function PieChart() {
    return (
        <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </RePieChart>
        </ResponsiveContainer>
    );
}
