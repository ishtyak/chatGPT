import type { ChartDataPoint } from "@/types/admin";
import { adminApi } from "./api";

export async function getStats(): Promise<Record<string, number>> {
  const response = await adminApi.get("/analytics/stats");
  return response.data as Record<string, number>;
}

export async function getChartData(): Promise<
  Record<string, ChartDataPoint[]>
> {
  const response = await adminApi.get("/analytics/charts");
  // Backend returns { date, value } — normalise to { label, value }
  const raw = response.data as Record<
    string,
    { date?: string; label?: string; value: number }[]
  >;
  const result: Record<string, ChartDataPoint[]> = {};
  for (const [key, series] of Object.entries(raw)) {
    result[key] = series.map((point) => ({
      label: point.label ?? point.date ?? "",
      value: point.value,
    }));
  }
  return result;
}

export async function exportChartCsv(
  points: ChartDataPoint[],
): Promise<string> {
  const header = ["Label", "Value"];
  return [header, ...points.map((point) => [point.label, String(point.value)])]
    .map((row) => row.join(","))
    .join("\n");
}
