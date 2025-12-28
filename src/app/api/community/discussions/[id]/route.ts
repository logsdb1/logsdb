import { NextRequest, NextResponse } from "next/server";
import { getDiscussion } from "@/lib/github-discussions";

// GET /api/community/discussions/[id] - Get a single discussion
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const discussionNumber = parseInt(params.id, 10);

    if (isNaN(discussionNumber)) {
      return NextResponse.json(
        { error: "Invalid discussion ID" },
        { status: 400 }
      );
    }

    const discussion = await getDiscussion(discussionNumber);

    if (!discussion) {
      return NextResponse.json(
        { error: "Discussion not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ discussion });
  } catch (error) {
    console.error("Failed to get discussion:", error);
    return NextResponse.json(
      { error: "Failed to fetch discussion" },
      { status: 500 }
    );
  }
}
