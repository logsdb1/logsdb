import { NextResponse } from "next/server";
import { searchDiscussions } from "@/lib/github-discussions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tech = searchParams.get("tech");
    const log = searchParams.get("log");
    const category = searchParams.get("category");

    if (!tech && !log) {
      return NextResponse.json({ discussions: [] });
    }

    // Build search query
    const searchTerms: string[] = [];

    if (tech) {
      searchTerms.push(tech);
    }
    if (log) {
      searchTerms.push(log);
    }
    if (category) {
      // Map category slug to search terms
      if (category === "sample-requests") {
        searchTerms.push("sample OR request");
      } else if (category === "troubleshooting") {
        searchTerms.push("help OR troubleshooting OR issue");
      }
    }

    const query = searchTerms.join(" ");
    const discussions = await searchDiscussions(query);

    // Filter discussions that are relevant to the tech/log
    const filteredDiscussions = discussions.filter((d) => {
      const titleLower = d.title.toLowerCase();
      const bodyLower = d.body.toLowerCase();
      const techLower = tech?.toLowerCase() || "";
      const logLower = log?.toLowerCase() || "";

      // Check if discussion is about this technology/log
      const matchesTech = !tech || titleLower.includes(techLower) || bodyLower.includes(techLower);
      const matchesLog = !log || titleLower.includes(logLower) || bodyLower.includes(logLower);

      return matchesTech && matchesLog;
    });

    return NextResponse.json({ discussions: filteredDiscussions });
  } catch (error) {
    console.error("Failed to search discussions:", error);
    return NextResponse.json({ error: "Failed to search discussions" }, { status: 500 });
  }
}
