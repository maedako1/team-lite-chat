import { auth } from "@/auth";
import { JoinWorkspaceForm } from "@/components/join-workspace-form";
import { redirect } from "next/navigation";

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/join/${token}`)}`);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <JoinWorkspaceForm token={token} />
    </div>
  );
}
