import type { AssigneeSummary } from "@shared/types/index.js";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { ASSIGNEE_COLORS } from "../../lib/chart-colors.js";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart.js";

interface AssigneeBreakdownProps {
  byAssignee: AssigneeSummary[];
}

const chartConfig = {
  count: { label: "Stories", color: ASSIGNEE_COLORS[0]! },
} satisfies ChartConfig;

export function AssigneeBreakdown({ byAssignee }: AssigneeBreakdownProps) {
  const data = useMemo(
    () =>
      byAssignee.map((a, i) => ({
        name: a.name,
        points: a.points,
        count: a.count,
        fill: ASSIGNEE_COLORS[i % ASSIGNEE_COLORS.length]!,
      })),
    [byAssignee],
  );

  return (
    <div
      data-gsap="stat-cell"
      className="bg-bg-card border border-border-subtle rounded-md px-5 py-4"
    >
      <h4 className="mb-2 text-sm font-semibold text-text-secondary tracking-[0.06em] uppercase">
        By Assignee
      </h4>
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid horizontal={false} />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            width={80}
            tick={{ fontSize: 12 }}
          />
          <XAxis type="number" hide />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, _name, item) => (
                  <span>
                    {value} stories ·{" "}
                    {(item.payload as { points: number }).points} pts
                  </span>
                )}
              />
            }
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
