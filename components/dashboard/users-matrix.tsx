"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock data for multiple years
const yearlyData = {
  "2026": [
    { month: "Jan", users: 4000 },
    { month: "Feb", users: 3000 },
    { month: "Mar", users: 5000 },
    { month: "Apr", users: 4500 },
    { month: "May", users: 6000 },
    { month: "Jun", users: 5500 },
    { month: "Jul", users: 7000 },
    { month: "Aug", users: 6800 },
    { month: "Sep", users: 8000 },
    { month: "Oct", users: 7500 },
    { month: "Nov", users: 8500 },
    { month: "Dec", users: 9000 },
  ],
  "2025": [
    { month: "Jan", users: 3000 },
    { month: "Feb", users: 2500 },
    { month: "Mar", users: 3500 },
    { month: "Apr", users: 4000 },
    { month: "May", users: 4200 },
    { month: "Jun", users: 4800 },
    { month: "Jul", users: 5200 },
    { month: "Aug", users: 5000 },
    { month: "Sep", users: 6000 },
    { month: "Oct", users: 6500 },
    { month: "Nov", users: 7000 },
    { month: "Dec", users: 7500 },
  ],
  "2024": [
    { month: "Jan", users: 2000 },
    { month: "Feb", users: 1800 },
    { month: "Mar", users: 2400 },
    { month: "Apr", users: 2800 },
    { month: "May", users: 3200 },
    { month: "Jun", users: 3500 },
    { month: "Jul", users: 4000 },
    { month: "Aug", users: 3800 },
    { month: "Sep", users: 4500 },
    { month: "Oct", users: 4800 },
    { month: "Nov", users: 5000 },
    { month: "Dec", users: 5500 },
  ],
}

type YearKey = keyof typeof yearlyData

export function UsersMatrix() {
  const [selectedYear, setSelectedYear] = useState<YearKey>("2026")

  const data = yearlyData[selectedYear]
  const totalUsers = data.reduce((acc, curr) => acc + curr.users, 0)

  return (
    <Card className="bg-card border-border h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">Users Growth Matrix</CardTitle>
          <p className="text-xs text-muted-foreground">Monthly user acquisition</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedYear}
            onValueChange={(value) => setSelectedYear(value as YearKey)}
          >
            <SelectTrigger className="h-8 w-[100px] text-xs">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <div className="mb-4">
          <p className="text-3xl font-semibold tracking-tight">
            {totalUsers.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Total users in {selectedYear}</p>
        </div>
        <div className="h-[150px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ACA7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ACA7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  fontSize: "12px",
                }}
                itemStyle={{ color: "#111827", fontWeight: 500 }}
                formatter={(value: number) => [value.toLocaleString(), "Users"]}
                labelStyle={{ color: "#6B7280", marginBottom: "4px" }}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#00ACA7"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorUsers)"
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
