type ProductCategory = {
  category_Id: number;
  category_name: string;

}
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {category_name: "Web Development", category_Id: 1 },
  {category_name: "Mobile App", category_Id: 2 },
  {category_name: "3D Modeling & Animation", category_Id: 3 },
  {category_name: "Game Development", category_Id: 4 },
  {category_name: "UI/UX Design", category_Id: 5 },
  {category_name: "Video & Voice Over", category_Id: 6 },
  {category_name: "Training Services", category_Id: 7 },
];

export const seedProductCategories = async (prisma) => {
  await prisma.product_categories.createMany({
    data: PRODUCT_CATEGORIES,
    skipDuplicates: true,
  });
};
