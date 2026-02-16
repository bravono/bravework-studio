import { PoolClient } from "pg";
import { createTrackingId } from "./utils/tracking";
import { getOrCreateSenderGroup, subscribeToSender } from "./sender";

interface OrderStatusMap {
  [statusName: string]: number;
}

export async function getOrderStatusMap(
  client: PoolClient,
): Promise<OrderStatusMap> {
  const result = await client.query("SELECT * FROM payment_statuses");
  const map: OrderStatusMap = {};
  result.rows.forEach((row: { payment_status_id: number; name: string }) => {
    map[row.name] = row.payment_status_id;
  });
  return map;
}

export async function processSuccessfulOrder(
  client: PoolClient,
  orderId: number,
  amountPaidKobo: number,
  totalExpectedAmountKobo: number,
  orderTitle: string,
  projectDurationDays: number | null,
  serviceType: string,
  productId: number,
) {
  // 1. Fetch current order state
  const orderRows = await client.query(
    "SELECT * FROM orders WHERE order_id = $1",
    [orderId],
  );
  if (orderRows.rows.length === 0) {
    throw new Error(`Order with ID ${orderId} not found.`);
  }
  const order = orderRows.rows[0];
  const currentAmountPaid = Number(order.amount_paid_to_date_kobo || 0);

  // 2. Calculate new status
  const newAmountPaid = currentAmountPaid + amountPaidKobo;
  const orderStatusMap = await getOrderStatusMap(client);

  let newStatusId: number;
  if (newAmountPaid >= totalExpectedAmountKobo) {
    newStatusId = orderStatusMap["paid"];
  } else if (newAmountPaid > 0) {
    newStatusId = orderStatusMap["partially_paid"];
  } else {
    newStatusId = orderStatusMap["pending"];
  }

  // 3. Update Order
  await client.query(
    `UPDATE orders
     SET amount_paid_to_date_kobo = $1,
         payment_status_id = $2,
         title = $3,
         start_date = NOW(),
         end_date = CASE WHEN $4::int IS NOT NULL THEN NOW() + ($4 || ' days')::interval ELSE end_date END,
         total_expected_amount_kobo = $5,
         updated_at = NOW()
     WHERE order_id = $6`,
    [
      newAmountPaid,
      newStatusId,
      orderTitle,
      projectDurationDays,
      totalExpectedAmountKobo,
      orderId,
    ],
  );

  // 4. Update Custom Offer Status if applicable
  if (serviceType === "custom-offer") {
    await client.query(
      `UPDATE custom_offers
       SET status_id = (SELECT offer_status_id FROM custom_offer_statuses WHERE name = 'accepted'),
       updated_at = NOW()
       WHERE offer_id = $1`,
      [productId],
    );
  }

  // 5. Update Course Enrollment if applicable (Full payment usually required for access, but logic depends on business rule)
  // Assuming if status is 'paid', we grant access.
  if (serviceType === "course" && newStatusId === orderStatusMap["paid"]) {
    // 5a. Update Enrollment
    await client.query(
      `UPDATE course_enrollments
       SET payment_status = $1
       WHERE course_id = $2 AND user_id = $3`,
      [newStatusId, productId, order.user_id],
    );

    // 5b. Subscribe to Sender
    try {
      // Fetch user details
      const userRes = await client.query(
        "SELECT email, first_name, last_name FROM users WHERE user_id = $1",
        [order.user_id],
      );

      if (userRes.rows.length > 0) {
        const { email, first_name, last_name } = userRes.rows[0];
        const fullName = `${first_name} ${last_name}`;

        // Ensure group exists
        const groupId = await getOrCreateSenderGroup(orderTitle);

        if (groupId) {
          await subscribeToSender(email, fullName, [groupId]);
          console.log(`Subscribed ${email} to Sender group: ${orderTitle}`);
        }
      }
    } catch (senderError) {
      console.error(
        "Error subscribing to Sender during payment processing:",
        senderError,
      );
      // Don't block the order completion if Sender fails
    }
  }

  return { success: true, newStatusId, newAmountPaid };
}

export async function processSuccessfulRentalBooking(
  client: PoolClient,
  bookingId: number,
  amountPaidKobo: number,
  paymentStatusName: string = "paid",
) {
  // Get status map
  const orderStatusMap = await getOrderStatusMap(client);
  const statusId = orderStatusMap[paymentStatusName] || orderStatusMap["paid"];

  // 1. Update Rental Booking Status
  const bookingUpdateRes = await client.query(
    `UPDATE rental_bookings
     SET payment_status_id = $1,
         updated_at = NOW()
     WHERE rental_booking_id = $2
     RETURNING client_id, rental_id, total_amount_kobo`,
    [statusId, bookingId],
  );

  if (bookingUpdateRes.rows.length === 0) {
    throw new Error(`Booking ${bookingId} not found.`);
  }

  const booking = bookingUpdateRes.rows[0];

  // 2. Fetch Rental Details for Order Title
  const rentalRes = await client.query(
    "SELECT device_name FROM rentals WHERE rental_id = $1",
    [booking.rental_id],
  );
  const deviceName = rentalRes.rows[0]?.device_name || "Device";

  // 3. Ensure "Hardware Rental" category exists or get ID
  let categoryRes = await client.query(
    "SELECT category_id FROM product_categories WHERE category_name = $1",
    ["Hardware Rental"],
  );

  let categoryId: number;
  if (categoryRes.rows.length === 0) {
    const newCategory = await client.query(
      "INSERT INTO product_categories (category_name, category_description) VALUES ($1, $2) RETURNING category_id",
      ["Hardware Rental", "Rental of hardware devices and equipment."],
    );
    categoryId = newCategory.rows[0].category_id;
  } else {
    categoryId = categoryRes.rows[0].category_id;
  }

  // 4. Create an Order record
  const trackingId = createTrackingId("Rental");
  await client.query(
    `INSERT INTO orders (
      user_id, 
      category_id, 
      payment_status_id, 
      total_expected_amount_kobo, 
      amount_paid_to_date_kobo, 
      title, 
      tracking_id,
      start_date,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
    [
      booking.client_id,
      categoryId,
      statusId,
      booking.total_amount_kobo,
      amountPaidKobo,
      `Rental: ${deviceName}`,
      trackingId,
    ],
  );

  return { success: true };
}
