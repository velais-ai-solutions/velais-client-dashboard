import type { SprintSummary } from "@shared/types/index.js";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { type ChartConfig, ChartContainer } from "../ui/chart.js";

interface ProgressSummaryProps {
  summary: SprintSummary;
}

const chartConfig = {
  progress: { label: "Progress", color: "var(--color-status-live)" },
} satisfies ChartConfig;

export function ProgressSummary({ summary }: ProgressSummaryProps) {
  const { storyPoints, progress } = summary;

  const data = [{ progress, fill: "var(--color-progress)" }];

  return (
    <div className="bg-bg-card border border-border-subtle rounded-md px-5 py-4">
      <h4 className="mb-2 font-mono text-sm font-semibold text-text-secondary tracking-[0.06em] uppercase">
        Story Points
      </h4>
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
            background={{ fill: "var(--color-bg-surface)" }}
            cornerRadius={10}
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-text-primary text-2xl font-bold"
          >
            {progress}%
          </text>
        </RadialBarChart>
      </ChartContainer>
      <p className="mt-1 text-center font-mono text-sm text-text-secondary">
        {storyPoints.completed}/{storyPoints.total} points
      </p>
      <div className="mt-1 text-center font-mono text-xs text-text-tertiary">
        <span>In progress: {storyPoints.inProgress}</span>
        {" · "}
        <span>Remaining: {storyPoints.remaining}</span>
      </div>
    </div>
  );
}
