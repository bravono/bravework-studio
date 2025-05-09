type Product = {
  product_Id: number;
  name: string;
  description: string;
  price: number;
  category_Id: number;
};

export const PRODUCTS: Product[] = [
  {
    product_Id: 1,
    name: "Product 1",
    description: "Description for Product 1",
    price: 19.99,
    category_Id: 1,
  },
  {
    product_Id: 2,
    name: "Product 2",
    description: "Description for Product 2",
    price: 29.99,
    category_Id: 2,
  },
  {
    product_Id: 3,
    name: "Product 3",
    description: "Description for Product 3",
    price: 39.99,
    category_Id: 3,
  },
];

export const seedProducts = async (prisma) => {
  await prisma.products.createMany({
    data: PRODUCTS,
    skipDuplicates: true, // Critical for static data!
  });
};
