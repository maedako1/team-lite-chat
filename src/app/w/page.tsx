import { auth } from "@/auth";
import { CreateWorkspaceForm } from "@/components/create-workspace-form";
import { SignOutButton } from "@/components/sign-out-button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function WorkspacesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/w");
  }

  const rows = await prisma.membership.findMany({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { workspace: { name: "asc" } },
  });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">ワークスペース</h1>
          <p className="text-sm text-zinc-400">{session.user.email}</p>
        </div>
        <SignOutButton />
      </header>

      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-zinc-500">まだワークスペースがありません。下のフォームから作成してください。</p>
        ) : (
          rows.map((m) => (
            <Link
              key={m.workspaceId}
              href={`/w/${m.workspace.slug}`}
              className="block rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 hover:border-violet-500/50"
            >
              <span className="font-medium text-white">{m.workspace.name}</span>
              <span className="ml-2 text-sm text-zinc-500">/{m.workspace.slug}</span>
            </Link>
          ))
        )}
      </div>

      <CreateWorkspaceForm />

      <p className="text-center text-sm text-zinc-600">
        <Link href="/" className="hover:text-zinc-400">
          トップへ
        </Link>
      </p>
    </div>
  );
}
