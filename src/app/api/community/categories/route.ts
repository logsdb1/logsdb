import { NextResponse } from "next/server";
import { getDiscussionCategories } from "@/lib/github-discussions";

// GET /api/community/categories - List discussion categories
export async function GET() {
  try {
    const categories = await getDiscussionCategories();

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Failed to get categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
