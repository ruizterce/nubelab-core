const API_BASE = "/api/monitor";

export interface HealthData {
  lastUpdated: number;
  stale: boolean;
  data: {
    cpu: { utilizationPercent: number; status: string };
    memory: { utilizationPercent: number; status: string };
    containers: { running: number };
    summary: { healthy: number; degraded: number; unhealthy: number };
  };
}

export interface ServiceEntry {
  name: string;
  status: string;
  cpuPercent?: number;
  memoryPercent?: number;
  memoryUsageMB?: number;
  memoryLimitMB?: number;
  networkRx?: number;
  networkTx?: number;
  uptime?: string;
}

export interface ServicesData {
  lastUpdated: number;
  stale: boolean;
  data: {
    services: ServiceEntry[];
  };
}

export interface StorageEntry {
  label: string;
  totalBytes: number;
  usedBytes: number;
  utilizationPercent: number;
  status: string;
}

export interface StorageData {
  lastUpdated: number;
  stale: boolean;
  data: {
    volumes: StorageEntry[];
  };
}

export interface UptimeData {
  lastUpdated: number;
  stale: boolean;
  data: {
    uptimeSeconds: number;
    uptimeHuman: string;
    status: string;
  };
}

export interface HealthcheckData {
  lastUpdated: number;
  stale: boolean;
  data: {
    providers: {
      providerId: string;
      status: string;
      lastCollectedAt: number;
    }[];
  };
}

export interface HistoryEntry {
  timestamp: number;
  value: number;
}

export interface HistoryData {
  lastUpdated: number;
  stale: boolean;
  data: {
    cpu: HistoryEntry[];
    memory: HistoryEntry[];
  };
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
  return res.json();
}

export const api = {
  health: () => fetchJson<HealthData>("/health"),
  services: () => fetchJson<ServicesData>("/services"),
  storage: () => fetchJson<StorageData>("/storage"),
  uptime: () => fetchJson<UptimeData>("/uptime"),
  healthcheck: () => fetchJson<HealthcheckData>("/healthcheck"),
  history: (range = "60m", step = "30s") =>
    fetchJson<HistoryData>(`/metrics/history?range=${range}&step=${step}`),
};
