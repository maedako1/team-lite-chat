import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ workspaceId: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId } = await params;

  const membership = await prisma.membership.findFirst({
    where: { workspaceId, userId: session.user.id },
  });
  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let expiresInDays = 7;
  try {
    const body = await req.json().catch(() => ({}));
    if (typeof body?.expiresInDays === "number" && body.expiresInDays >= 1 && body.expiresInDays <= 30) {
      expiresInDays = body.expiresInDays;
    }
  } catch {
    /* use default */
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  const invite = await prisma.invite.create({
    data: { workspaceId, token, expiresAt },
  });

  const origin = new URL(req.url).origin;
  const url = `${origin}/join/${invite.token}`;

  return NextResponse.json({
    url,
    token: invite.token,
    expiresAt: invite.expiresAt?.toISOString() ?? null,
  });
}
