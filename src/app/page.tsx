import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-zinc-950 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex border border-zinc-800 p-8 rounded-2xl bg-zinc-900/50 backdrop-blur-xl">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tighter">Site Manager</h1>
          <p className="text-zinc-400">Hệ thống quản lý mặt bằng kinh doanh QSR Vietnam.</p>
          <a
            href="/login"
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-all w-fit pointer-events-auto"
          >
            Đăng nhập để bắt đầu
          </a>
        </div>
      </div>
    </div>
  );
}
