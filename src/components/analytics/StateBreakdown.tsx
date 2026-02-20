import type { StoryState } from "@shared/types/index.js";
import { useMemo } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { STATE_CHART_COLORS } from "../../lib/chart-colors.js";
import { STATE_ORDER } from "../../lib/constants.js";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart.js";

interface StateBreakdownProps {
  byState: Record<StoryState, number>;
}

const chartConfig = Object.fromEntries(
  STATE_ORDER.map((state) => [
    state,
    { label: state, color: STATE_CHART_COLORS[state] },
  ]),
) as ChartConfig;

export function StateBreakdown({ byState }: StateBreakdownProps) {
  const data = useMemo(
    () =>
      STATE_ORDER.filter((state) => byState[state] > 0).map((state) => ({
        name: state,
        value: byState[state],
        fill: STATE_CHART_COLORS[state],
      })),
    [byState],
  );

  return (
    <div
      data-gsap="stat-cell"
      className="bg-bg-card border border-border-subtle rounded-md px-5 py-4"
    >
      <h4 className="mb-2 text-sm font-semibold text-text-secondary tracking-[0.06em] uppercase">
        By State
      </h4>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-w-[90%] max-md:max-w-full"
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="50%"
            outerRadius="80%"
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
          <ChartLegend
            content={
              <ChartLegendContent
                nameKey="name"
                className="flex-wrap gap-x-3 gap-y-1"
              />
            }
          />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
