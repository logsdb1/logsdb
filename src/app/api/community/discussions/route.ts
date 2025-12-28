import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listDiscussions, createDiscussion } from "@/lib/github-discussions";

// GET /api/community/discussions - List discussions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") || undefined;
    const first = parseInt(searchParams.get("first") || "20", 10);
    const after = searchParams.get("after") || undefined;

    const result = await listDiscussions({
      categorySlug: category,
      first,
      after,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to list discussions:", error);
    return NextResponse.json(
      { error: "Failed to fetch discussions" },
      { status: 500 }
    );
  }
}

// POST /api/community/discussions - Create a new discussion
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, category } = body;

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: "Title, content, and category are required" },
        { status: 400 }
      );
    }

    const result = await createDiscussion({
      title,
      body: content,
      categorySlug: category,
      token: session.accessToken,
    });

    return NextResponse.json({
      success: true,
      discussion: result.discussion,
      url: result.url,
    });
  } catch (error) {
    console.error("Failed to create discussion:", error);
    return NextResponse.json(
      { error: "Failed to create discussion" },
      { status: 500 }
    );
  }
}
