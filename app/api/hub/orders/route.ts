import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateVoucherCode } from "@/lib/wifi/wifi-service";
import { getRouterDriver } from "@/lib/wifi/router-adapter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { items, guestName, guestPhone, userId, paymentReference, macAddress } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Order must contain at least one item." },
        { status: 400 }
      );
    }

    // Fetch DB items to compute verified price
    const itemIds = items.map((i: any) => Number(i.itemId));
    const dbItems = await prisma.hub_snack_items.findMany({
      where: { item_id: { in: itemIds } },
    });

    const dbItemMap = new Map(dbItems.map((i) => [i.item_id, i]));

    let totalAmountKobo = 0;
    let totalWifiRewardMinutes = 0;

    const orderItemRecords: { itemId: number; quantity: number; unitPriceKobo: number }[] = [];

    for (const item of items) {
      const dbItem = dbItemMap.get(Number(item.itemId));
      if (!dbItem) continue;

      const qty = Math.max(1, Number(item.quantity) || 1);
      const itemTotalKobo = dbItem.price_kobo * qty;
      totalAmountKobo += itemTotalKobo;
      totalWifiRewardMinutes += (dbItem.wifi_minutes_reward || 30) * qty;

      orderItemRecords.push({
        itemId: dbItem.item_id,
        quantity: qty,
        unitPriceKobo: dbItem.price_kobo,
      });
    }

    // Apply Tiered Spending floor:
    // Low (< ₦1,500) -> 30 mins
    // Mid (₦1,500 - ₦3,500) -> min 60 mins
    // High (₦3,500 - ₦5,000) -> min 120 mins
    // Super (> ₦5,000) -> min 180 mins
    let tierMinutes = 30;
    if (totalAmountKobo >= 500000) {
      tierMinutes = 180;
    } else if (totalAmountKobo >= 350000) {
      tierMinutes = 120;
    } else if (totalAmountKobo >= 150000) {
      tierMinutes = 60;
    }

    const finalWifiMinutes = Math.max(totalWifiRewardMinutes, tierMinutes);

    // Create Hub Order
    const order = await prisma.hub_orders.create({
      data: {
        user_id: userId ? Number(userId) : null,
        guest_name: guestName || "Lounge Guest",
        guest_phone: guestPhone || null,
        total_amount_kobo: totalAmountKobo,
        payment_status: "PAID",
        payment_reference: paymentReference || `RECEIPT-${Date.now()}`,
        wifi_minutes_awarded: finalWifiMinutes,
        hub_order_items: {
          create: orderItemRecords.map((rec) => ({
            item_id: rec.itemId,
            quantity: rec.quantity,
            unit_price_kobo: rec.unitPriceKobo,
          })),
        },
      },
    });

    // Update lead spend profile if phone or userId provided
    if (guestPhone || userId) {
      const existingLead = await prisma.hub_lead_profiles.findFirst({
        where: {
          OR: [
            ...(guestPhone ? [{ phone_number: guestPhone }] : []),
            ...(userId ? [{ user_id: Number(userId) }] : []),
          ],
        },
      });

      if (existingLead) {
        await prisma.hub_lead_profiles.update({
          where: { lead_id: existingLead.lead_id },
          data: {
            total_spend_kobo: existingLead.total_spend_kobo + BigInt(totalAmountKobo),
            // High spend leads can be updated towards Investor/Wholesale segments
            interest_segment:
              existingLead.interest_segment === "GENERAL" && totalAmountKobo >= 300000
                ? "INVESTOR_CLIENT"
                : existingLead.interest_segment,
          },
        });
      }
    }

    // Generate Wi-Fi Voucher
    const voucherCode = generateVoucherCode("FOOD");
    const formattedMac = macAddress ? macAddress.trim().toUpperCase() : null;

    const voucher = await prisma.wifi_vouchers.create({
      data: {
        code: voucherCode,
        duration_minutes: finalWifiMinutes,
        source_type: "SNACK_ORDER",
        user_id: userId ? Number(userId) : null,
        phone_number: guestPhone || null,
        mac_address: formattedMac,
        order_id: order.hub_order_id,
        status: formattedMac ? "ACTIVE" : "AVAILABLE",
        activated_at: formattedMac ? new Date() : null,
        expires_at: formattedMac ? new Date(Date.now() + finalWifiMinutes * 60 * 1000) : null,
      },
    });

    // Activate immediately if MAC provided
    if (formattedMac) {
      const router = getRouterDriver();
      
      const activeSession = await prisma.wifi_sessions.findFirst({
        where: {
          mac_address: formattedMac,
          status: "ACTIVE",
          expires_at: { gt: new Date() },
        },
        orderBy: { expires_at: "desc" },
      });

      let newExpiry: Date;
      let totalDurationMinutes = finalWifiMinutes;

      if (activeSession) {
        newExpiry = new Date(activeSession.expires_at.getTime() + finalWifiMinutes * 60 * 1000);
        totalDurationMinutes = Math.ceil((newExpiry.getTime() - Date.now()) / (60 * 1000));
        await prisma.wifi_sessions.update({
          where: { session_id: activeSession.session_id },
          data: {
            expires_at: newExpiry,
            duration_minutes: activeSession.duration_minutes + finalWifiMinutes,
          },
        });
      } else {
        newExpiry = new Date(Date.now() + finalWifiMinutes * 60 * 1000);
        await prisma.wifi_sessions.create({
          data: {
            voucher_id: voucher.voucher_id,
            mac_address: formattedMac,
            duration_minutes: finalWifiMinutes,
            expires_at: newExpiry,
            status: "ACTIVE",
          },
        });
      }

      await router.authorizeMac({
        macAddress: formattedMac,
        durationMinutes: totalDurationMinutes,
        rateLimit: "5M/5M",
        comment: `Snack Order #${order.hub_order_id}: ${voucherCode}`,
      });
    }

    return NextResponse.json({
      success: true,
      orderId: order.hub_order_id,
      totalAmountKobo,
      wifiMinutesAwarded: finalWifiMinutes,
      voucherCode: voucher.code,
      message: `Order completed! You have received ${finalWifiMinutes} minutes of high-speed Starlink Wi-Fi.`,
    });
  } catch (error: any) {
    console.error("[API Hub Order Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process order." },
      { status: 500 }
    );
  }
}
