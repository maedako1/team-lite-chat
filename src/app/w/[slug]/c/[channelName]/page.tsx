import { auth } from "@/auth";
import type { ChatMessage } from "@/components/channel-chat";
import { ChannelChat } from "@/components/channel-chat";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ slug: string; channelName: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { slug, channelName } = await params;

  const workspace = await prisma.workspace.findFirst({
    where: { slug, memberships: { some: { userId: session.user.id } } },
  });
  if (!workspace) {
    notFound();
  }

  const channel = await prisma.channel.findFirst({
    where: { workspaceId: workspace.id, name: channelName },
  });
  if (!channel) {
    notFound();
  }

  const raw = await prisma.message.findMany({
    where: { channelId: channel.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { author: { select: { id: true, name: true, email: true } } },
  });
  raw.reverse();

  const initialMessages: ChatMessage[] = raw.map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    author: m.author,
  }));

  return (
    <ChannelChat
      channelId={channel.id}
      workspaceSlug={slug}
      channelName={channel.name}
      initialMessages={initialMessages}
    />
  );
}
