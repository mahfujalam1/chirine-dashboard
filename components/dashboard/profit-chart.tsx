"use client";

import { useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ProfitChartProps {
  data?: { month: string; earning: number }[];
}

const DEFAULT_PROFIT_DATA = [
  { month: "Jan", earning: 25000 },
  { month: "Feb", earning: 35000 },
  { month: "Mar", earning: 30000 },
  { month: "Apr", earning: 45000 },
  { month: "May", earning: 73940 },
  { month: "Jun", earning: 55000 },
  { month: "Jul", earning: 40000 },
  { month: "Aug", earning: 48000 },
  { month: "Sep", earning: 52000 },
  { month: "Oct", earning: 38000 },
  { month: "Nov", earning: 42000 },
  { month: "Dec", earning: 50000 },
];

function ProfitChartInner({ data: apiData }: ProfitChartProps) {
  const chartData = useMemo(() => {
    if (apiData && apiData.length > 0) {
      return apiData.map((item) => ({ month: item.month, earning: item.earning }));
    }
    return DEFAULT_PROFIT_DATA;
  }, [apiData]);

  const { totalEarning, maxEarning } = useMemo(() => {
    const total = chartData.reduce((acc, curr) => acc + curr.earning, 0);
    const max = chartData.length > 0 ? Math.max(...chartData.map((item) => item.earning)) : 0;
    return { totalEarning: total, maxEarning: max };
  }, [chartData]);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-medium">Total Earning Overview</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-semibold">
              ${totalEarning.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#00ACA7]" />
            <span className="text-xs text-muted-foreground">Total Earning</span>
          </div>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#737373" }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#737373" }}
                tickFormatter={(value: number) => (value >= 1000 ? `${value / 1000}k` : `${value}`)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#00ACA7",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                labelFormatter={(label: any) => `${label} 2026`}
              />
              <Bar dataKey="earning" radius={[4, 4, 0, 0]} maxBarSize={20} animationDuration={300}>
                {chartData.map((entry, index) => {
                  const isMax = maxEarning > 0 && entry.earning === maxEarning;
                  return <Cell key={`earning-${index}`} fill={isMax ? "#00ACA7" : "#e5e5e5"} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export const ProfitChart = memo(ProfitChartInner);
