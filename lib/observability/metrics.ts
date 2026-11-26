export interface ApiMetricSample {
  route: string;
  method: string;
  statusCode: number;
  durationMs: number;
  timestamp: number;
}

export interface RouteMetricSummary {
  route: string;
  count: number;
  errorCount: number;
  avgDurationMs: number;
}

export interface ApiMetricsSnapshot {
  responseTime: number;
  p95ResponseTime: number;
  requestCount: number;
  errorCount: number;
  clientErrorCount: number;
  errorRate: number;
  windowSize: number;
  routes: RouteMetricSummary[];
}

const MAX_SAMPLES = 1000;

interface MetricsState {
  samples: ApiMetricSample[];
  totalRequests: number;
  totalErrors: number;
  totalClientErrors: number;
}

const globalForMetrics = globalThis as typeof globalThis & {
  __braveworkApiMetrics?: MetricsState;
};

function getState(): MetricsState {
  if (!globalForMetrics.__braveworkApiMetrics) {
    globalForMetrics.__braveworkApiMetrics = {
      samples: [],
      totalRequests: 0,
      totalErrors: 0,
      totalClientErrors: 0,
    };
  }
  return globalForMetrics.__braveworkApiMetrics;
}

/**
 * Records a completed API request metric into the bounded in-memory ring buffer.
 */
export function recordApiMetric(
  sample: Omit<ApiMetricSample, "timestamp">,
): void {
  const state = getState();
  state.totalRequests += 1;

  if (sample.statusCode >= 500) {
    state.totalErrors += 1;
  } else if (sample.statusCode >= 400) {
    state.totalClientErrors += 1;
  }

  state.samples.push({
    ...sample,
    timestamp: Date.now(),
  });

  if (state.samples.length > MAX_SAMPLES) {
    state.samples.shift();
  }
}

/**
 * Computes a snapshot of API latency, throughput, and error rates.
 */
export function getApiMetricsSnapshot(): ApiMetricsSnapshot {
  const state = getState();
  const { samples, totalRequests, totalErrors, totalClientErrors } = state;

  if (samples.length === 0) {
    return {
      responseTime: 0,
      p95ResponseTime: 0,
      requestCount: totalRequests,
      errorCount: totalErrors,
      clientErrorCount: totalClientErrors,
      errorRate: 0,
      windowSize: 0,
      routes: [],
    };
  }

  const durations = samples.map((s) => s.durationMs).sort((a, b) => a - b);
  const totalDuration = durations.reduce((sum, d) => sum + d, 0);
  const avgDuration = Math.round(totalDuration / durations.length);
  const p95Index = Math.min(
    durations.length - 1,
    Math.floor(durations.length * 0.95),
  );
  const p95Duration = Math.round(durations[p95Index]);

  const routeMap = new Map<
    string,
    { count: number; errorCount: number; totalMs: number }
  >();

  for (const s of samples) {
    const key = `${s.method} ${s.route}`;
    const existing = routeMap.get(key) ?? {
      count: 0,
      errorCount: 0,
      totalMs: 0,
    };
    existing.count += 1;
    if (s.statusCode >= 500) {
      existing.errorCount += 1;
    }
    existing.totalMs += s.durationMs;
    routeMap.set(key, existing);
  }

  const routes: RouteMetricSummary[] = Array.from(routeMap.entries())
    .map(([route, stats]) => ({
      route,
      count: stats.count,
      errorCount: stats.errorCount,
      avgDurationMs: Math.round(stats.totalMs / stats.count),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const errorRate =
    totalRequests > 0
      ? Number(((totalErrors / totalRequests) * 100).toFixed(2))
      : 0;

  return {
    responseTime: avgDuration,
    p95ResponseTime: p95Duration,
    requestCount: totalRequests,
    errorCount: totalErrors,
    clientErrorCount: totalClientErrors,
    errorRate,
    windowSize: samples.length,
    routes,
  };
}

/**
 * Resets all recorded in-memory API metrics (intended for unit tests).
 */
export function resetApiMetrics(): void {
  const state = getState();
  state.samples = [];
  state.totalRequests = 0;
  state.totalErrors = 0;
  state.totalClientErrors = 0;
}
