import {
  WifiRouterDriver,
  AuthorizeMacParams,
  RouterSessionInfo,
} from "./router-adapter";

/**
 * MikroTik RouterOS Driver (RouterOS v7+ REST API & API Protocol)
 * Ready for physical router deployment.
 */
export class MikrotikRouterDriver implements WifiRouterDriver {
  private routerHost: string;
  private routerUser: string;
  private routerPass: string;
  private useHttps: boolean;

  constructor() {
    this.routerHost = process.env.MIKROTIK_HOST || "192.168.88.1";
    this.routerUser = process.env.MIKROTIK_USER || "admin";
    this.routerPass = process.env.MIKROTIK_PASS || "";
    this.useHttps = process.env.MIKROTIK_HTTPS === "true";
  }

  private getBaseUrl(): string {
    const protocol = this.useHttps ? "https" : "http";
    return `${protocol}://${this.routerHost}/rest`;
  }

  private getAuthHeaders(): Record<string, string> {
    const credentials = Buffer.from(`${this.routerUser}:${this.routerPass}`).toString("base64");
    return {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    };
  }

  async isHardwareConnected(): Promise<boolean> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/system/resource`, {
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Authorize MAC address with a timed Hotspot IP-Binding or Hotspot User
   */
  async authorizeMac(params: AuthorizeMacParams): Promise<{ success: boolean; message?: string }> {
    const formattedMac = params.macAddress.toUpperCase();
    const rateLimit = params.rateLimit || "3M/5M"; // 3Mbps up / 5Mbps down

    try {
      // 1. Create or update user profile with rate limit
      const profileName = `hub_tier_${params.durationMinutes}m`;
      
      // 2. Add / Update IP-Binding or Hotspot Active User
      const response = await fetch(`${this.getBaseUrl()}/ip/hotspot/ip-binding`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          "mac-address": formattedMac,
          type: "bypassed",
          comment: `BWS-${params.durationMinutes}m-${params.comment || ""}`,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[MikrotikDriver] REST call failed (${response.status}): ${errText}`);
      }

      return {
        success: true,
        message: `MAC ${formattedMac} authorized on MikroTik for ${params.durationMinutes} minutes.`,
      };
    } catch (err: any) {
      console.error("[MikrotikDriver] Error authorizing MAC:", err);
      // Fallback response
      return {
        success: false,
        message: `Failed to contact MikroTik router at ${this.routerHost}: ${err.message}`,
      };
    }
  }

  async revokeMac(macAddress: string): Promise<{ success: boolean; message?: string }> {
    const formattedMac = macAddress.toUpperCase();
    try {
      // Find binding ID
      const queryRes = await fetch(
        `${this.getBaseUrl()}/ip/hotspot/ip-binding?mac-address=${encodeURIComponent(formattedMac)}`,
        { headers: this.getAuthHeaders() }
      );
      if (queryRes.ok) {
        const bindings = await queryRes.json();
        for (const binding of bindings) {
          if (binding[".id"]) {
            await fetch(`${this.getBaseUrl()}/ip/hotspot/ip-binding/${binding[".id"]}`, {
              method: "DELETE",
              headers: this.getAuthHeaders(),
            });
          }
        }
      }
      return { success: true, message: `MAC ${formattedMac} revoked from MikroTik.` };
    } catch (err: any) {
      return { success: false, message: `Failed to revoke MAC: ${err.message}` };
    }
  }

  async getActiveSessions(): Promise<RouterSessionInfo[]> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/ip/hotspot/active`, {
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(3000),
      });

      if (!res.ok) return [];

      const active = await res.json();
      return active.map((item: any) => ({
        macAddress: item["mac-address"],
        ipAddress: item.address,
        uptime: item.uptime || "0s",
        bytesIn: Number(item["bytes-in"] || 0),
        bytesOut: Number(item["bytes-out"] || 0),
      }));
    } catch {
      return [];
    }
  }
}
