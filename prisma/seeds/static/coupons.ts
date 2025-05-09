type Coupon = {
  coupon_Id: number;
  coupon_code: string;
  discount_amount: number;
  expiration_date: Date;
  created_date: Date;
  usage_limit: number;
};

export const COUPONS: Coupon[] = [
  {
    coupon_Id: 1,
    coupon_code: "COUPON1",
    discount_amount: 10.0,
    expiration_date: new Date("2024-12-31"),
    created_date: new Date("2023-01-01"),
    usage_limit: 100,
  },
  {
    coupon_Id: 2,
    coupon_code: "COUPON2",
    discount_amount: 20.0,
    expiration_date: new Date("2024-12-31"),
    created_date: new Date("2023-01-01"),
    usage_limit: 50,
  },
  {
    coupon_Id: 3,
    coupon_code: "COUPON3",
    discount_amount: 30.0,
    expiration_date: new Date("2024-12-31"),
    created_date: new Date("2023-01-01"),
    usage_limit: 25,
  },
];

export const seedCoupons = async (prisma) => {
  await prisma.coupons.createMany({
    data: COUPONS,
    skipDuplicates: true, // Critical for static data!
  });
};
