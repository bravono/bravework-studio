(process.env as any).NODE_ENV = "development";

import { queryDatabase, withTransaction } from "../lib/db";

async function testRentals() {
  console.log("Starting rental tests...");

  try {
    // 1. Create a test user if not exists (mocking session user)
    // In a real integration test we'd need to mock the session or use a real user
    // For this script, we'll assume a user exists or create a dummy one directly in DB for testing
    
    let userId;
    const userRes = await queryDatabase("SELECT user_id FROM users LIMIT 1");
    if (userRes.length > 0) {
        userId = userRes[0].user_id;
        console.log(`Using existing user ID: ${userId}`);
    } else {
        console.log("No users found. Please create a user first.");
        return;
    }

    // 2. Test Creating a Rental (Direct DB insertion to simulate API)
    // We can't easily call Next.js API routes from a script without running the server
    // So we will test the DB logic directly which is what the API uses
    
    console.log("Testing Rental Creation...");
    const rentalId = await withTransaction(async (client) => {
      const res = await client.query(
        `INSERT INTO rentals (
          user_id, device_type, device_name, description, specs, hourly_rate,
          location_city, location_address, location_lat, location_lng,
          has_internet, has_backup_power
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING rental_id`,
        [
          userId,
          "PC",
          "Test Gaming PC",
          "A powerful gaming rig",
          "RTX 3080",
          5000,
          "Lagos",
          "123 Tech Street",
          6.5244,
          3.3792,
          true,
          true,
        ]
      );
      return res.rows[0].rental_id;
    });
    console.log(`Rental created with ID: ${rentalId}`);

    // 3. Test Fetching Rentals
    console.log("Testing Fetching Rentals...");
    const rentals = await queryDatabase(
        "SELECT * FROM rentals WHERE rental_id = $1",
        [rentalId]
    );
    if (rentals.length > 0 && rentals[0].device_name === "Test Gaming PC") {
        console.log("Fetch Rental: SUCCESS");
    } else {
        console.error("Fetch Rental: FAILED");
    }

    // 4. Test Booking Availability Logic
    console.log("Testing Booking Availability...");
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    const conflicts = await queryDatabase(
      `SELECT rental_booking_id FROM rental_bookings
       WHERE rental_id = $1
       AND status NOT IN ('cancelled', 'rejected')
       AND (
         (start_time <= $2 AND end_time >= $2) OR
         (start_time <= $3 AND end_time >= $3) OR
         (start_time >= $2 AND end_time <= $3)
       )`,
      [rentalId, startTime, endTime]
    );

    if (conflicts.length === 0) {
        console.log("Availability Check: SUCCESS (No conflicts)");
    } else {
        console.error("Availability Check: FAILED (Unexpected conflict)");
    }

    // 5. Test Creating a Booking
    console.log("Testing Booking Creation...");
    // Ensure order status exists
    let orderStatusId;
    const statusRes = await queryDatabase("SELECT order_status_id FROM order_statuses WHERE name = 'pending'");
    if (statusRes.length > 0) {
        orderStatusId = statusRes[0].order_status_id;
    } else {
        // Create pending status if missing (for test environment)
        const newStatus = await withTransaction(async (client) => {
            const res = await client.query("INSERT INTO order_statuses (name) VALUES ('pending') RETURNING order_status_id");
            return res.rows[0].order_status_id;
        });
        orderStatusId = newStatus;
    }

    const bookingId = await withTransaction(async (client) => {
        const res = await client.query(
          `INSERT INTO rental_bookings (
            rental_id, client_id, start_time, end_time, total_amount, order_status_id
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING rental_booking_id`,
          [
            rentalId,
            userId, // Booking for self for test
            startTime,
            endTime,
            10000,
            orderStatusId,
          ]
        );
        return res.rows[0].rental_booking_id;
      });
      console.log(`Booking created with ID: ${bookingId}`);

      // 6. Verify Booking Conflict
      console.log("Testing Booking Conflict...");
      const conflictsAfter = await queryDatabase(
        `SELECT rental_booking_id FROM rental_bookings
         WHERE rental_id = $1
         AND status NOT IN ('cancelled', 'rejected')
         AND (
           (start_time <= $2 AND end_time >= $2) OR
           (start_time <= $3 AND end_time >= $3) OR
           (start_time >= $2 AND end_time <= $3)
         )`,
        [rentalId, startTime, endTime]
      );
  
      if (conflictsAfter.length > 0) {
          console.log("Conflict Check: SUCCESS (Conflict detected)");
      } else {
          console.error("Conflict Check: FAILED (No conflict detected)");
      }

    console.log("All tests completed.");
    process.exit(0);

  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

testRentals();
