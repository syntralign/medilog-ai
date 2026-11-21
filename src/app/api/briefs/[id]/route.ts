import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { briefs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  if (!UUID.test(id)) return Response.json({ error: "Not found" }, { status: 404 });
  await db.delete(briefs).where(and(eq(briefs.id, id), eq(briefs.userId, user.id)));
  return Response.json({ ok: true });
}
