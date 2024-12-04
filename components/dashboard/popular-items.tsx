"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const data = [
  {
    name: "Margherita Pizza",
    total: 234,
  },
  {
    name: "Caesar Salad",
    total: 178,
  },
  {
    name: "Beef Burger",
    total: 156,
  },
  {
    name: "Pasta Carbonara",
    total: 134,
  },
  {
    name: "Fish & Chips",
    total: 109,
  },
];

export function PopularItems() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Bar
          dataKey="total"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}