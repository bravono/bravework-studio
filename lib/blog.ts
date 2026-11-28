import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  coverImage: string;
  content: string;
}

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(
  slug: string,
  fields: string[] = [],
): Partial<BlogPost> {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = path.join(postsDirectory, `${realSlug}.md`);

  if (!fs.existsSync(fullPath)) {
    return {};
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const items: Partial<BlogPost> = {};

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === "slug") {
      items.slug = realSlug;
    }
    if (field === "content") {
      items.content = content;
    }

    if (typeof data[field] !== "undefined") {
      items[field as keyof BlogPost] = data[field];
    }
  });

  return items;
}

export function getAllPosts(fields: string[] = []): Partial<BlogPost>[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date! > post2.date! ? -1 : 1));
  return posts;
}

export function getPostsByCategory(
  category: string,
  fields: string[] = [],
): Partial<BlogPost>[] {
  return getAllPosts(["category", ...fields]).filter(
    (post) => post.category?.toLowerCase() === category.toLowerCase(),
  );
}

export function getPostsByTag(
  tag: string,
  fields: string[] = [],
): Partial<BlogPost>[] {
  return getAllPosts(["tags", ...fields]).filter((post) =>
    post.tags?.some((t) => t.toLowerCase() === tag.toLowerCase()),
  );
}
