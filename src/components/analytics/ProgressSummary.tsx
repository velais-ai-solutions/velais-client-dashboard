import type { SprintSummary } from "@shared/types/index.js";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { type ChartConfig, ChartContainer } from "../ui/chart.js";

interface ProgressSummaryProps {
  summary: SprintSummary;
}

const chartConfig = {
  progress: { label: "Progress", color: "hsl(142, 71%, 45%)" },
} satisfies ChartConfig;

export function ProgressSummary({ summary }: ProgressSummaryProps) {
  const { storyPoints, progress } = summary;

  const data = [{ progress, fill: "var(--color-progress)" }];

  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <h4 className="mb-2 text-sm font-semibold">Story Points</h4>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[160px]"
      >
        <RadialBarChart
          data={data}
          startAngle={90}
          endAngle={90 - 360}
          innerRadius="75%"
          outerRadius="100%"
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            dataKey="progress"
            background={{ fill: "hsl(220, 9%, 93%)" }}
            cornerRadius={10}
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-foreground text-2xl font-bold"
          >
            {progress}%
          </text>
        </RadialBarChart>
      </ChartContainer>
      <p className="mt-1 text-center text-sm text-gray-600">
        {storyPoints.completed}/{storyPoints.total} points
      </p>
      <div className="mt-1 text-center text-xs text-gray-400">
        <span>In progress: {storyPoints.inProgress}</span>
        {" · "}
        <span>Remaining: {storyPoints.remaining}</span>
      </div>
    </div>
  );
}
