import { NextRequest, NextResponse } from "next/server";
import { getLogType, getTechnology } from "@/data";

export async function GET(
  request: NextRequest,
  { params }: { params: { technology: string; logType: string } }
) {
  const { technology: technologyId, logType: logTypeId } = params;

  const technology = getTechnology(technologyId);
  const logType = getLogType(technologyId, logTypeId);

  if (!technology || !logType) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get the default format
  const defaultFormat = logType.formats.find((f) => f.isDefault) || logType.formats[0];

  // Extract grok and regex patterns
  const grokPattern = logType.parsing.grok
    ? Object.values(logType.parsing.grok)[0] || ""
    : "";
  const regexPattern = logType.parsing.regex
    ? Object.values(logType.parsing.regex)[0] || ""
    : "";

  return NextResponse.json({
    technology: {
      id: technology.id,
      name: technology.name,
    },
    logType: {
      id: logType.id,
      name: logType.name,
      description: logType.description,
      defaultPath: logType.quickFacts.defaultPathLinux,
      example: defaultFormat?.example || "",
      structure: defaultFormat?.structure || "",
      grokPattern,
      regexPattern,
    },
  });
}
