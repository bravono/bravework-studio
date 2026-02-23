import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const postsDirectory = path.join(process.cwd(), "content/blog");

export async function GET() {
  try {
    const files = fs.readdirSync(postsDirectory);
    const posts = files.map((file) => ({
      slug: file.replace(/\.md$/, ""),
      filename: file,
    }));
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to list posts" },
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
