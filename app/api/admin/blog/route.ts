import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const postsDirectory = path.join(process.cwd(), "content/blog");

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const filePath = path.join(postsDirectory, `${slug}.md`);
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf8");
        // We'll use a simple regex to parse out frontmatter for the admin
        const match = fileContent.match(/^---([\s\S]*?)---([\s\S]*)$/);
        if (match) {
          const yaml = match[1];
          const content = match[2].trim();

          const title = yaml.match(/title:\s*"(.*?)"/)?.[1] || "";
          const date = yaml.match(/date:\s*"(.*?)"/)?.[1] || "";
          const excerpt = yaml.match(/excerpt:\s*"(.*?)"/)?.[1] || "";
          const category = yaml.match(/category:\s*"(.*?)"/)?.[1] || "General";
          const author =
            yaml.match(/author:\s*"(.*?)"/)?.[1] || "Bravework Team";
          const coverImage = yaml.match(/coverImage:\s*"(.*?)"/)?.[1] || "";
          const tagsMatch = yaml.match(/tags:\s*\[(.*?)\]/);
          const tags = tagsMatch
            ? tagsMatch[1]
                .split(",")
                .map((t) => t.replace(/"/g, "").trim())
                .join(", ")
            : "";

          return NextResponse.json({
            slug,
            title,
            date,
            excerpt,
            category,
            author,
            tags,
            content,
            coverImage,
          });
        }
      }
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const files = fs.readdirSync(postsDirectory);
    const posts = files.map((file) => ({
      slug: file.replace(/\.md$/, ""),
      filename: file,
    }));
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      slug,
      title,
      date,
      excerpt,
      category,
      author,
      tags,
      content,
      coverImage,
    } = await req.json();

    if (!slug || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const fileName = `${slug}.md`;
    const filePath = path.join(postsDirectory, fileName);

    const frontmatter = `---
title: "${title}"
date: "${date || new Date().toISOString().split("T")[0]}"
excerpt: "${excerpt}"
category: "${category}"
author: "${author || "Bravework Team"}"
tags: ${JSON.stringify(tags || [])}
coverImage: "${coverImage || "/assets/DOF0160.png"}"
---

${content}`;

    fs.writeFileSync(filePath, frontmatter, "utf8");

    return NextResponse.json({ message: "Post saved successfully", slug });
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { slug } = await req.json();
    const filePath = path.join(postsDirectory, `${slug}.md`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return NextResponse.json({ message: "Post deleted" });
    }
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 },
    );
  }
}
