import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/blog");

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const slug = params.slug;
    const filePath = path.join(postsDirectory, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);

    return NextResponse.json({
      slug,
      title: data.title || "",
      date: data.date || "",
      excerpt: data.excerpt || "",
      category: data.category || "General",
      author: data.author || "Bravework Team",
      tags: Array.isArray(data.tags) ? data.tags.join(", ") : data.tags || "",
      coverImage: data.coverImage || data.thumbnail || "/assets/DOF0160.png",
      content: content.trim(),
    });
  } catch (error) {
    console.error("Fetch post error:", error);
    return NextResponse.json(
      { error: "Failed to fetch post content" },
      { status: 500 },
    );
  }
}
