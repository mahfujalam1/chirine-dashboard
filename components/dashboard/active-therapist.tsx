"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const chatData = [
  { member: "Active Therapist ", value: 90, color: "#00ACA7" },
  { member: "All Therapist ", value: 100, color: "#f1a64c" },
]

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chatData[0] }> }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-card px-3 py-2 rounded-lg shadow-lg text-xs font-medium border border-border">
        <p className="font-semibold">{data.member}</p>
        <p style={{ color: data.color }}>{data.value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export function ActiveTherapist() {

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chatData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chatData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

