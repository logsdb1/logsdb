import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addDiscussionComment, getDiscussion } from "@/lib/github-discussions";

// POST /api/community/discussions/[id]/comments - Add a comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const discussionNumber = parseInt(params.id, 10);

    if (isNaN(discussionNumber)) {
      return NextResponse.json(
        { error: "Invalid discussion ID" },
        { status: 400 }
      );
    }

    // Get the discussion to get its GraphQL ID
    const discussion = await getDiscussion(discussionNumber, session.accessToken);

    if (!discussion) {
      return NextResponse.json(
        { error: "Discussion not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const comment = await addDiscussionComment({
      discussionId: discussion.id,
      body: content,
      token: session.accessToken,
    });

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("Failed to add comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
