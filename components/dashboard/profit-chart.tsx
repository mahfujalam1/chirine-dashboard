"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

const data = [
  { month: "Jan", sales: 25000 },
  { month: "Feb", sales: 35000 },
  { month: "Mar", sales: 30000 },
  { month: "Apr", sales: 45000 },
  { month: "May", sales: 73940 },
  { month: "Jun", sales: 55000 },
  { month: "Jul", sales: 40000 },
  { month: "Aug", sales: 48000 },
  { month: "Sep", sales: 52000 },
  { month: "Oct", sales: 38000 },
  { month: "Nov", sales: 42000 },
  { month: "Dec", sales: 50000 },
]

export function ProfitChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-medium">Total Earning Overview</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-semibold">$98,643.24</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-gray" />
            <span className="text-xs text-muted-foreground">Total Earning</span>
          </div>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#737373" }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#737373" }}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#00ACA7",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => [
                  name === "sales" ? value.toLocaleString() : `$${value.toLocaleString()}`,
                  name === "sales" ? "Sales" : "Revenue",
                ]}
                labelFormatter={(label) => `${label} 2026`}
              />
              <Bar dataKey="sales" radius={[4, 4, 0, 0]} maxBarSize={20}>
                {data.map((entry, index) => (
                  <Cell key={`sales-${index}`} fill={entry.month === "May" ? "#00ACA7" : "#e5e5e5"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
