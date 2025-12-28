import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addReaction, removeReaction, ReactionType, REACTION_TYPES } from "@/lib/github-discussions";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { subjectId, content, action } = await request.json();

    if (!subjectId || !content) {
      return NextResponse.json({ error: "subjectId and content are required" }, { status: 400 });
    }

    // Validate reaction type
    if (!Object.keys(REACTION_TYPES).includes(content)) {
      return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
    }

    console.log("Reaction request:", { subjectId, content, action, hasToken: !!session.accessToken });

    if (action === "remove") {
      await removeReaction({
        subjectId,
        content: content as ReactionType,
        token: session.accessToken,
      });
      console.log("Reaction removed successfully");
    } else {
      await addReaction({
        subjectId,
        content: content as ReactionType,
        token: session.accessToken,
      });
      console.log("Reaction added successfully");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to toggle reaction:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to toggle reaction", details: errorMessage }, { status: 500 });
  }
}
