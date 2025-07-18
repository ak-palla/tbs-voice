// Google Analytics types
export interface GAMetric {
  name: string;
  value: string;
  formatted: string;
}

export interface GADimension {
  name: string;
  value: string;
}

export interface GARow {
  dimensionValues: GADimension[];
  metricValues: GAMetric[];
}

export interface GAResponse {
  rows: GARow[];
  totals: GAMetric[];
  maximums: GAMetric[];
  minimums: GAMetric[];
  rowCount: number;
}

export interface AnalyticsData {
  totalUsers: number;
  totalSessions: number;
  totalPageviews: number;
  bounceRate: number;
  sessionDuration: number;
  topPages: Array<{
    page: string;
    pageviews: number;
  }>;
  usersByCountry: Array<{
    country: string;
    users: number;
  }>;
  usersByDevice: Array<{
    device: string;
    users: number;
  }>;
  dailyUsers: Array<{
    date: string;
    users: number;
  }>;
}

export interface GAConfig {
  measurementId: string;
  propertyId: string;
  credentialsPath?: string;
}

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: any
    ) => void;
    dataLayer: any[];
  }
} 