export interface DashboardStat {
  [key: string]: unknown;
}

export interface ChartDataPoint {
  name?: string;
  value?: number;
  [key: string]: unknown;
}
