"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  api,
  type HealthData,
  type ServicesData,
  type StorageData,
  type UptimeData,
  type HealthcheckData,
  type HistoryData,
} from "@/lib/api";

const POLL_INTERVAL = 15_000;

export interface MonitorSnapshot {
  health: HealthData | null;
  services: ServicesData | null;
  storage: StorageData | null;
  uptime: UptimeData | null;
  healthcheck: HealthcheckData | null;
  history: HistoryData | null;
  error: string | null;
}

function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function useMonitorData(enabled: boolean) {
  const [data, setData] = useState<MonitorSnapshot>({
    health: null,
    services: null,
    storage: null,
    uptime: null,
    healthcheck: null,
    history: null,
    error: null,
  });

  const fetchAll = useCallback(async () => {
    try {
      const [health, services, storage, uptime, healthcheck, history] =
        await Promise.all([
          api.health(),
          api.services(),
          api.storage(),
          api.uptime(),
          api.healthcheck(),
          api.history(),
        ]);

      setData({
        health,
        services,
        storage,
        uptime,
        healthcheck,
        history,
        error: null,
      });
    } catch (e) {
      setData((prev) => ({
        ...prev,
        error: e instanceof Error ? e.message : "API error",
      }));
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    fetchAll();
    const id = setInterval(fetchAll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [enabled, fetchAll]);

  return data;
}

export { fmtTime };
