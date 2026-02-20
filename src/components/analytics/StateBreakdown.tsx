import type { StoryState } from "@shared/types/index.js";
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
  const data = STATE_ORDER.filter((state) => byState[state] > 0).map(
    (state) => ({
      name: state,
      value: byState[state],
      fill: STATE_CHART_COLORS[state],
    }),
  );

  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <h4 className="mb-2 text-sm font-semibold">By State</h4>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[220px]"
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
          <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
