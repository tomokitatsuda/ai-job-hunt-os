import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const responseHeaders = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return Response.json(
      { status: "ok", checks: { database: "ok" } },
      { headers: responseHeaders },
    );
  } catch {
    return Response.json(
      { status: "unavailable", checks: { database: "unavailable" } },
      { status: 503, headers: responseHeaders },
    );
  }
}
