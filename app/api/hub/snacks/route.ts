import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DEFAULT_SNACK_ITEMS = [
  {
    name: "Roasted Gourmet Peanuts",
    description: "Crunchy salted peanuts in a sealed pouch. Perfect coding snack.",
    category: "SNACKS",
    price_kobo: 50000, // ₦500
    wifi_minutes_reward: 30,
    is_available: true,
  },
  {
    name: "Pure Natural Bottled Water",
    description: "Chilled 75cl spring water to keep you refreshed.",
    category: "BEVERAGES",
    price_kobo: 30000, // ₦300
    wifi_minutes_reward: 30,
    is_available: true,
  },
  {
    name: "Crispy Small Chops Platter",
    description: "Hot spring rolls, samosas, puff puff & gizzard.",
    category: "SNACKS",
    price_kobo: 200000, // ₦2,000
    wifi_minutes_reward: 60,
    is_available: true,
  },
  {
    name: "Chilled Soft Drinks & Malt",
    description: "Choice of Coke, Sprite, Malt, or Energy drinks.",
    category: "BEVERAGES",
    price_kobo: 80000, // ₦800
    wifi_minutes_reward: 30,
    is_available: true,
  },
  {
    name: "Spicy Catfish / Goat Pepper Soup",
    description: "Aromatic, steaming hot local pepper soup.",
    category: "MEALS",
    price_kobo: 350000, // ₦3,500
    wifi_minutes_reward: 120,
    is_available: true,
  },
  {
    name: "Bravework Special Jollof Rice Combo",
    description: "Smoky party Jollof rice with grilled chicken & plantain.",
    category: "MEALS",
    price_kobo: 500000, // ₦5,000
    wifi_minutes_reward: 180,
    is_available: true,
  },
];

export async function GET() {
  try {
    let items = await prisma.hub_snack_items.findMany({
      where: { is_available: true },
      orderBy: { price_kobo: "asc" },
    });

    // Auto-seed if empty
    if (items.length === 0) {
      await prisma.hub_snack_items.createMany({
        data: DEFAULT_SNACK_ITEMS,
      });
      items = await prisma.hub_snack_items.findMany({
        where: { is_available: true },
        orderBy: { price_kobo: "asc" },
      });
    }

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error("[API Get Snacks Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch snack items." },
      { status: 500 }
    );
  }
}
