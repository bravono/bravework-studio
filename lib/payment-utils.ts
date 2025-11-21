import { PoolClient } from "pg";

interface OrderStatusMap {
  [statusName: string]: number;
}

export async function getOrderStatusMap(client: PoolClient): Promise<OrderStatusMap> {
  const result = await client.query("SELECT * FROM order_statuses");
  const map: OrderStatusMap = {};
  result.rows.forEach((row: { order_status_id: number; name: string }) => {
    map[row.name] = row.order_status_id;
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
  productId: number
) {
  // 1. Fetch current order state
  const orderRows = await client.query(
    "SELECT * FROM orders WHERE order_id = $1",
    [orderId]
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
         order_status_id = $2,
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
    ]
  );

  // 4. Update Custom Offer Status if applicable
  if (serviceType === "custom-offer") {
    await client.query(
      `UPDATE custom_offers
       SET status_id = (SELECT offer_status_id FROM custom_offer_statuses WHERE name = 'accepted'),
       updated_at = NOW()
       WHERE offer_id = $1`,
      [productId]
    );
  }
  
  // 5. Update Course Enrollment if applicable (Full payment usually required for access, but logic depends on business rule)
  // Assuming if status is 'paid', we grant access.
  if (serviceType === "course" && newStatusId === orderStatusMap["paid"]) {
     await client.query(
      `UPDATE course_enrollments
       SET payment_status = $1
       WHERE course_id = $2 AND user_id = $3`,
      [newStatusId, productId, order.user_id]
    );
  }

  return { success: true, newStatusId, newAmountPaid };
}
