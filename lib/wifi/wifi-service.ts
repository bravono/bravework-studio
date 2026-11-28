import crypto from "crypto";
import prisma from "@/lib/prisma";
import { getRouterDriver } from "./router-adapter";

export function generateVoucherCode(prefix: string = "BW"): string {
  const randomChars = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${randomChars}`;
}

export interface ClaimWebLeadParams {
  fullName: string;
  email: string;
  phone?: string;
  interestSegment?: string;
  macAddress?: string;
  marketingConsent?: boolean;
}

export async function claimWebLeadVoucher(params: ClaimWebLeadParams) {
  const router = getRouterDriver();
  const email = params.email.trim().toLowerCase();
  const fullName = params.fullName?.trim() || "Web Guest";
  const phone = params.phone?.trim() || null;
  const interestSegment = params.interestSegment || "ACADEMY_STUDENT";

  if (!email) {
    throw new Error("Email is required to claim the free web pass.");
  }

  // Find existing lead by email
  let lead = await prisma.hub_lead_profiles.findUnique({
    where: { email },
  });

  if (lead && lead.web_lead_claimed) {
    const existingVoucher = await prisma.wifi_vouchers.findFirst({
      where: {
        source_type: "WEB_SIGNUP",
        email,
      },
      orderBy: { created_at: "desc" },
    });

    return {
      success: true,
      alreadyClaimed: true,
      voucher: existingVoucher,
      message: "Web signup pass has already been claimed for this email.",
    };
  }

  if (!lead) {
    lead = await prisma.hub_lead_profiles.create({
      data: {
        full_name: fullName,
        email,
        phone_number: phone,
        interest_segment: interestSegment,
        marketing_consent: params.marketingConsent ?? true,
        web_lead_claimed: true,
      },
    });
  } else {
    lead = await prisma.hub_lead_profiles.update({
      where: { lead_id: lead.lead_id },
      data: {
        full_name: fullName,
        web_lead_claimed: true,
        ...(phone && !lead.phone_number ? { phone_number: phone } : {}),
      },
    });
  }

  // Generate 30-minute voucher
  const voucherCode = generateVoucherCode("WEB30");
  const voucher = await prisma.wifi_vouchers.create({
    data: {
      code: voucherCode,
      duration_minutes: 30,
      source_type: "WEB_SIGNUP",
      email,
      phone_number: phone,
      mac_address: params.macAddress ? params.macAddress.toUpperCase() : null,
      status: params.macAddress ? "ACTIVE" : "AVAILABLE",
      activated_at: params.macAddress ? new Date() : null,
      expires_at: params.macAddress ? new Date(Date.now() + 30 * 60 * 1000) : null,
    },
  });

  if (params.macAddress) {
    const formattedMac = params.macAddress.toUpperCase();
    await router.authorizeMac({
      macAddress: formattedMac,
      durationMinutes: 30,
      rateLimit: "5M/5M",
      comment: `Web Signup Voucher: ${voucherCode} (${email})`,
    });

    await prisma.wifi_sessions.create({
      data: {
        voucher_id: voucher.voucher_id,
        mac_address: formattedMac,
        duration_minutes: 30,
        expires_at: new Date(Date.now() + 30 * 60 * 1000),
        status: "ACTIVE",
      },
    });
  }

  return {
    success: true,
    alreadyClaimed: false,
    voucherCode: voucher.code,
    durationMinutes: 30,
    voucher,
    message: "🎉 30 minutes of free Starlink Wi-Fi granted for signing up on Bravework Hub!",
  };
}

export interface ClaimWelcomeParams {
  userId?: number;
  phone?: string;
  fullName?: string;
  interestSegment?: string;
  macAddress?: string;
  marketingConsent?: boolean;
}

export async function claimAppDownloadVoucher(params: ClaimWelcomeParams) {
  const router = getRouterDriver();
  const phone = params.phone?.trim();

  // Find or create lead profile
  let lead = null;
  if (phone) {
    lead = await prisma.hub_lead_profiles.findUnique({
      where: { phone_number: phone },
    });
  } else if (params.userId) {
    lead = await prisma.hub_lead_profiles.findUnique({
      where: { user_id: params.userId },
    });
  }

  if (lead && lead.welcome_claimed) {
    // Already claimed welcome voucher
    // Find active or available welcome voucher
    const existingVoucher = await prisma.wifi_vouchers.findFirst({
      where: {
        source_type: "APP_DOWNLOAD",
        OR: [
          ...(params.userId ? [{ user_id: params.userId }] : []),
          ...(phone ? [{ phone_number: phone }] : []),
        ],
      },
      orderBy: { created_at: "desc" },
    });

    return {
      success: true,
      alreadyClaimed: true,
      voucher: existingVoucher,
      message: "App download bonus has already been claimed for this account.",
    };
  }

  // Create or update lead
  const fullName = params.fullName || "Valued Guest";
  const interestSegment = params.interestSegment || "ACADEMY_STUDENT";

  if (!lead && phone) {
    lead = await prisma.hub_lead_profiles.create({
      data: {
        user_id: params.userId || null,
        phone_number: phone,
        full_name: fullName,
        interest_segment: interestSegment,
        marketing_consent: params.marketingConsent ?? true,
        app_downloaded: true,
        welcome_claimed: true,
      },
    });
  } else if (lead) {
    lead = await prisma.hub_lead_profiles.update({
      where: { lead_id: lead.lead_id },
      data: {
        app_downloaded: true,
        welcome_claimed: true,
        ...(params.userId && !lead.user_id ? { user_id: params.userId } : {}),
      },
    });
  }

  // Generate 30-minute voucher
  const voucherCode = generateVoucherCode("APP30");
  const voucher = await prisma.wifi_vouchers.create({
    data: {
      code: voucherCode,
      duration_minutes: 30,
      source_type: "APP_DOWNLOAD",
      user_id: params.userId || null,
      phone_number: phone || null,
      mac_address: params.macAddress ? params.macAddress.toUpperCase() : null,
      status: params.macAddress ? "ACTIVE" : "AVAILABLE",
      activated_at: params.macAddress ? new Date() : null,
      expires_at: params.macAddress ? new Date(Date.now() + 30 * 60 * 1000) : null,
    },
  });

  // If MAC provided, activate immediately in router
  if (params.macAddress) {
    const formattedMac = params.macAddress.toUpperCase();
    await router.authorizeMac({
      macAddress: formattedMac,
      durationMinutes: 30,
      rateLimit: "5M/5M",
      comment: `App Download Voucher: ${voucherCode}`,
    });

    await prisma.wifi_sessions.create({
      data: {
        voucher_id: voucher.voucher_id,
        mac_address: formattedMac,
        duration_minutes: 30,
        expires_at: new Date(Date.now() + 30 * 60 * 1000),
        status: "ACTIVE",
      },
    });
  }

  return {
    success: true,
    alreadyClaimed: false,
    voucherCode: voucher.code,
    durationMinutes: 30,
    voucher,
    message: "🎉 30 minutes of free Starlink Wi-Fi granted for downloading our app!",
  };
}

export interface ClaimContactBonusParams {
  phone: string;
  userId?: number;
  fullName?: string;
  macAddress?: string;
}

export async function claimContactAccessBonus(params: ClaimContactBonusParams) {
  const router = getRouterDriver();
  const phone = params.phone.trim();

  if (!phone) {
    throw new Error("A valid phone number is required to claim the contact bonus.");
  }

  // Find or create lead profile
  let lead = await prisma.hub_lead_profiles.findUnique({
    where: { phone_number: phone },
  });

  if (lead && lead.contact_bonus_claimed) {
    return {
      success: true,
      alreadyClaimed: true,
      message: "Contact access bonus (+30m) has already been granted for this phone number.",
    };
  }

  if (!lead) {
    lead = await prisma.hub_lead_profiles.create({
      data: {
        user_id: params.userId || null,
        phone_number: phone,
        full_name: params.fullName || "Valued Guest",
        contact_verified: true,
        contact_bonus_claimed: true,
      },
    });
  } else {
    lead = await prisma.hub_lead_profiles.update({
      where: { lead_id: lead.lead_id },
      data: {
        contact_verified: true,
        contact_bonus_claimed: true,
        ...(params.userId && !lead.user_id ? { user_id: params.userId } : {}),
      },
    });
  }

  // Generate additional 30-minute voucher
  const voucherCode = generateVoucherCode("CTC30");
  const voucher = await prisma.wifi_vouchers.create({
    data: {
      code: voucherCode,
      duration_minutes: 30,
      source_type: "CONTACT_ACCESS",
      user_id: params.userId || null,
      phone_number: phone,
      mac_address: params.macAddress ? params.macAddress.toUpperCase() : null,
      status: params.macAddress ? "ACTIVE" : "AVAILABLE",
      activated_at: params.macAddress ? new Date() : null,
      expires_at: params.macAddress ? new Date(Date.now() + 30 * 60 * 1000) : null,
    },
  });

  if (params.macAddress) {
    const formattedMac = params.macAddress.toUpperCase();
    
    // Check if there is an active session to extend
    const activeSession = await prisma.wifi_sessions.findFirst({
      where: {
        mac_address: formattedMac,
        status: "ACTIVE",
        expires_at: { gt: new Date() },
      },
      orderBy: { expires_at: "desc" },
    });

    let newExpiry: Date;
    let extensionMinutes = 30;

    if (activeSession) {
      newExpiry = new Date(activeSession.expires_at.getTime() + 30 * 60 * 1000);
      const totalRemainingMinutes = Math.ceil((newExpiry.getTime() - Date.now()) / (60 * 1000));
      extensionMinutes = totalRemainingMinutes;

      await prisma.wifi_sessions.update({
        where: { session_id: activeSession.session_id },
        data: {
          expires_at: newExpiry,
          duration_minutes: activeSession.duration_minutes + 30,
        },
      });
    } else {
      newExpiry = new Date(Date.now() + 30 * 60 * 1000);
      await prisma.wifi_sessions.create({
        data: {
          voucher_id: voucher.voucher_id,
          mac_address: formattedMac,
          duration_minutes: 30,
          expires_at: newExpiry,
          status: "ACTIVE",
        },
      });
    }

    await router.authorizeMac({
      macAddress: formattedMac,
      durationMinutes: extensionMinutes,
      rateLimit: "5M/5M",
      comment: `Contact Bonus Extended: ${voucherCode}`,
    });
  }

  return {
    success: true,
    alreadyClaimed: false,
    voucherCode: voucher.code,
    durationMinutes: 30,
    voucher,
    message: "🚀 +30 minutes bonus added! You now have total 60 minutes free Starlink Wi-Fi.",
  };
}

export async function redeemVoucher(params: {
  code: string;
  macAddress: string;
  ipAddress?: string;
  deviceInfo?: string;
}) {
  const router = getRouterDriver();
  const code = params.code.trim().toUpperCase();
  const formattedMac = params.macAddress.trim().toUpperCase();

  const voucher = await prisma.wifi_vouchers.findUnique({
    where: { code },
  });

  if (!voucher) {
    throw new Error("Invalid voucher code. Please check the code and try again.");
  }

  if (voucher.status === "EXPIRED" || (voucher.expires_at && voucher.expires_at < new Date())) {
    throw new Error("This voucher code has already expired.");
  }

  const expiresAt = new Date(Date.now() + voucher.duration_minutes * 60 * 1000);

  // Update voucher
  await prisma.wifi_vouchers.update({
    where: { voucher_id: voucher.voucher_id },
    data: {
      status: "ACTIVE",
      mac_address: formattedMac,
      activated_at: new Date(),
      expires_at: expiresAt,
    },
  });

  // Authorize in router
  await router.authorizeMac({
    macAddress: formattedMac,
    durationMinutes: voucher.duration_minutes,
    rateLimit: "5M/5M",
    comment: `Voucher: ${voucher.code}`,
  });

  // Create session
  const session = await prisma.wifi_sessions.create({
    data: {
      voucher_id: voucher.voucher_id,
      mac_address: formattedMac,
      ip_address: params.ipAddress,
      device_info: params.deviceInfo,
      duration_minutes: voucher.duration_minutes,
      expires_at: expiresAt,
      status: "ACTIVE",
    },
  });

  return {
    success: true,
    session,
    durationMinutes: voucher.duration_minutes,
    expiresAt,
    message: `Connected! You have ${voucher.duration_minutes} minutes of high-speed Wi-Fi access.`,
  };
}

export async function getActiveWifiSession(macAddress?: string) {
  if (!macAddress) return null;
  const formattedMac = macAddress.trim().toUpperCase();

  const session = await prisma.wifi_sessions.findFirst({
    where: {
      mac_address: formattedMac,
      status: "ACTIVE",
      expires_at: { gt: new Date() },
    },
    include: {
      wifi_vouchers: true,
    },
    orderBy: { expires_at: "desc" },
  });

  if (!session) return null;

  const remainingSeconds = Math.max(
    0,
    Math.floor((session.expires_at.getTime() - Date.now()) / 1000)
  );

  return {
    sessionId: session.session_id,
    macAddress: session.mac_address,
    durationMinutes: session.duration_minutes,
    remainingSeconds,
    remainingMinutes: Math.ceil(remainingSeconds / 60),
    expiresAt: session.expires_at,
    voucherCode: session.wifi_vouchers.code,
    voucherSource: session.wifi_vouchers.source_type,
    rateLimit: "5 Mbps",
  };
}
