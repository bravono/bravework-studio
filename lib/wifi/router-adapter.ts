/**
 * Router Driver Interface & Mock Adapter
 * Allows seamless switching between Mock/Development mode and MikroTik Hardware RouterOS.
 */

export interface AuthorizeMacParams {
  macAddress: string;
  durationMinutes: number;
  rateLimit?: string; // e.g. "3M/5M" (upload/download)
  comment?: string;
}

export interface RouterSessionInfo {
  macAddress: string;
  ipAddress?: string;
  uptime: string;
  bytesIn: number;
  bytesOut: number;
  expiresAt?: Date;
}

export interface WifiRouterDriver {
  authorizeMac(params: AuthorizeMacParams): Promise<{ success: boolean; message?: string }>;
  revokeMac(macAddress: string): Promise<{ success: boolean; message?: string }>;
  getActiveSessions(): Promise<RouterSessionInfo[]>;
  isHardwareConnected(): Promise<boolean>;
}

/**
 * In-Memory Mock Driver for development, testing, and pre-hardware deployment
 */
class MockRouterDriver implements WifiRouterDriver {
  private activeAuthorizations = new Map<string, { expiresAt: Date; rateLimit: string; comment?: string }>();

  async authorizeMac(params: AuthorizeMacParams): Promise<{ success: boolean; message?: string }> {
    const expiresAt = new Date(Date.now() + params.durationMinutes * 60 * 1000);
    this.activeAuthorizations.set(params.macAddress.toUpperCase(), {
      expiresAt,
      rateLimit: params.rateLimit || "5M/5M",
      comment: params.comment || "Mock Authorized Session",
    });

    console.log(
      `[MockRouterDriver] Authorized MAC: ${params.macAddress} for ${params.durationMinutes} mins (Rate limit: ${params.rateLimit || "5M/5M"}). Expires: ${expiresAt.toISOString()}`
    );

    return {
      success: true,
      message: `MAC ${params.macAddress} authorized for ${params.durationMinutes} minutes in Mock Hotspot.`,
    };
  }

  async revokeMac(macAddress: string): Promise<{ success: boolean; message?: string }> {
    this.activeAuthorizations.delete(macAddress.toUpperCase());
    console.log(`[MockRouterDriver] Revoked MAC: ${macAddress}`);
    return { success: true, message: `MAC ${macAddress} revoked.` };
  }

  async getActiveSessions(): Promise<RouterSessionInfo[]> {
    const now = new Date();
    const sessions: RouterSessionInfo[] = [];

    this.activeAuthorizations.forEach((data, mac) => {
      if (data.expiresAt > now) {
        const remainingSec = Math.floor((data.expiresAt.getTime() - now.getTime()) / 1000);
        sessions.push({
          macAddress: mac,
          uptime: `${remainingSec}s remaining`,
          bytesIn: 1024 * 1024 * 12, // 12MB mock
          bytesOut: 1024 * 1024 * 48, // 48MB mock
          expiresAt: data.expiresAt,
        });
      } else {
        // Expired
        this.activeAuthorizations.delete(mac);
      }
    });

    return sessions;
  }

  async isHardwareConnected(): Promise<boolean> {
    return false; // Mock driver indicates simulated hardware
  }
}

// Singleton instances
let mockInstance: MockRouterDriver | null = null;

export function getRouterDriver(): WifiRouterDriver {
  if (process.env.ROUTER_DRIVER === "mikrotik") {
    // Lazy load MikrotikDriver once configured
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { MikrotikRouterDriver } = require("./mikrotik-driver");
      return new MikrotikRouterDriver();
    } catch {
      console.warn("[RouterAdapter] MikroTik driver not ready or failed to load. Falling back to MockDriver.");
    }
  }

  if (!mockInstance) {
    mockInstance = new MockRouterDriver();
  }
  return mockInstance;
}
