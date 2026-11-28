import { prisma } from "../client";
import { Prisma } from "@prisma/client";

export async function seedRentals() {
  const host1 = await prisma.users.findUnique({
    where: { email: "ahbideeny@gmail.com" },
  });
  const host2 = await prisma.users.findUnique({
    where: { email: "yusufahbideen@yahoo.com" },
  });
  const client1 = await prisma.users.findUnique({
    where: { email: "newbuddy@gmail.com" },
  });
  const client2 = await prisma.users.findUnique({
    where: { email: "lastbody@gmail.com" },
  });

  if (!host1 || !host2 || !client1 || !client2) {
    console.warn("Skipping rentals seed: One or more required users not found");
    return;
  }

  // 1. Seed Rentals
  const rentalsData = [
    {
      user_id: host1.user_id,
      device_type: "Workstation",
      device_name: "High-End Creator Workstation",
      description: "A high-performance workstation optimized for 3D animation, rendering, and video editing.",
      specs: "GPU: RTX 4090, CPU: Threadripper 3960X, Liquid Cooled",
      ram: "128GB DDR5",
      storage: "2TB NVMe SSD",
      processor: "AMD Ryzen Threadripper 3960X",
      system_type: "Desktop",
      location_city: "Lagos",
      location_address: "123 Herbert Macaulay Way, Yaba",
      location_lat: new Prisma.Decimal(6.5059),
      location_lng: new Prisma.Decimal(3.3782),
      has_internet: true,
      has_backup_power: true,
      is_active: true,
      approval_status: "approved",
      hourly_rate_kobo: 50000,
      rental_type: "p2p",
      is_partner: false,
      is_office: false,
    },
    {
      user_id: host2.user_id,
      device_type: "Laptop",
      device_name: "MacBook Pro M2 Max",
      description: "Supercharged laptop for developers, designers, and mobile creators.",
      specs: "Apple M2 Max chip, 12-core CPU, 30-core GPU",
      ram: "32GB",
      storage: "1TB SSD",
      processor: "Apple M2 Max",
      system_type: "Laptop",
      location_city: "Lekki",
      location_address: "45 Admiralty Way, Lekki Phase 1",
      location_lat: new Prisma.Decimal(6.4361),
      location_lng: new Prisma.Decimal(3.4682),
      has_internet: true,
      has_backup_power: true,
      is_active: true,
      approval_status: "approved",
      hourly_rate_kobo: 30000,
      rental_type: "p2p",
      is_partner: false,
      is_office: false,
    },
    {
      user_id: host1.user_id,
      device_type: "VR Headset",
      device_name: "Meta Quest 3",
      description: "Mixed reality headset for testing immersive 3D/VR experiences.",
      specs: "Snapdragon XR2 Gen 2, 8GB RAM, 128GB Storage",
      ram: "8GB",
      storage: "128GB",
      processor: "Snapdragon XR2 Gen 2",
      system_type: "VR",
      location_city: "Lagos",
      location_address: "123 Herbert Macaulay Way, Yaba",
      location_lat: new Prisma.Decimal(6.5059),
      location_lng: new Prisma.Decimal(3.3782),
      has_internet: false,
      has_backup_power: false,
      is_active: true,
      approval_status: "pending",
      hourly_rate_kobo: 15000,
      rental_type: "p2p",
      is_partner: false,
      is_office: false,
    },
  ];

  const seededRentals = [];

  for (const rental of rentalsData) {
    const existing = await prisma.rentals.findFirst({
      where: {
        user_id: rental.user_id,
        device_name: rental.device_name,
      },
    });

    if (existing) {
      const updated = await prisma.rentals.update({
        where: { rental_id: existing.rental_id },
        data: rental,
      });
      seededRentals.push(updated);
    } else {
      const created = await prisma.rentals.create({
        data: rental,
      });
      seededRentals.push(created);
    }
  }

  const workstation = seededRentals.find(r => r.device_name === "High-End Creator Workstation");
  const macbook = seededRentals.find(r => r.device_name === "MacBook Pro M2 Max");
  const quest = seededRentals.find(r => r.device_name === "Meta Quest 3");

  if (!workstation || !macbook || !quest) {
    console.warn("Skipping bookings seed: One or more seeded rentals not found");
    return;
  }

  // 2. Seed Bookings
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

  const bookingsData = [
    {
      rental_id: workstation.rental_id,
      client_id: client1.user_id,
      start_time: new Date(twoDaysAgo.setHours(10, 0, 0, 0)),
      end_time: new Date(twoDaysAgo.setHours(15, 0, 0, 0)),
      total_amount_kobo: 250000,
      payment_reference: "pay_ref_workstation_1",
      status: "completed",
      escrow_released: true,
    },
    {
      rental_id: macbook.rental_id,
      client_id: client2.user_id,
      start_time: new Date(oneDayAgo.setHours(9, 0, 0, 0)),
      end_time: new Date(oneDayAgo.setHours(18, 0, 0, 0)),
      total_amount_kobo: 270000,
      payment_reference: "pay_ref_macbook_1",
      status: "completed",
      escrow_released: true,
    },
    {
      rental_id: quest.rental_id,
      client_id: client1.user_id,
      start_time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      end_time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      total_amount_kobo: 30000,
      payment_reference: "pay_ref_quest_1",
      status: "pending",
      escrow_released: false,
    },
  ];

  const seededBookings = [];

  for (const booking of bookingsData) {
    const existing = await prisma.rental_bookings.findFirst({
      where: {
        rental_id: booking.rental_id,
        client_id: booking.client_id,
        start_time: booking.start_time,
      },
    });

    if (existing) {
      const updated = await prisma.rental_bookings.update({
        where: { rental_booking_id: existing.rental_booking_id },
        data: booking,
      });
      seededBookings.push(updated);
    } else {
      const created = await prisma.rental_bookings.create({
        data: booking,
      });
      seededBookings.push(created);
    }
  }

  const workstationBooking = seededBookings.find(b => b.payment_reference === "pay_ref_workstation_1");
  const macbookBooking = seededBookings.find(b => b.payment_reference === "pay_ref_macbook_1");

  if (!workstationBooking || !macbookBooking) {
    console.warn("Skipping reviews seed: Completed bookings not found");
    return;
  }

  // 3. Seed Reviews
  const reviewsData = [
    {
      rental_booking_id: workstationBooking.rental_booking_id,
      reviewer_id: client1.user_id,
      reviewee_id: host1.user_id,
      rating: 5,
      comment: "Excellent machine! Worked like a charm for my Blender rendering tasks.",
    },
    {
      rental_booking_id: macbookBooking.rental_booking_id,
      reviewer_id: client2.user_id,
      reviewee_id: host2.user_id,
      rating: 4,
      comment: "MacBook was clean and functions perfectly. Host was very accommodating.",
    },
  ];

  for (const review of reviewsData) {
    const existing = await prisma.rental_reviews.findFirst({
      where: {
        rental_booking_id: review.rental_booking_id,
        reviewer_id: review.reviewer_id,
      },
    });

    if (existing) {
      await prisma.rental_reviews.update({
        where: { rental_review_id: existing.rental_review_id },
        data: review,
      });
    } else {
      await prisma.rental_reviews.create({
        data: review,
      });
    }
  }
}
