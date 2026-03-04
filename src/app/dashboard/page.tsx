import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
    MapPin,
    Clock,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Users
} from "lucide-react";
import { ROLE_LABELS, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    // Fetch stats
    const [totalSites, pendingSites, sitesThisMonth, totalUsers] = await Promise.all([
        prisma.site.count(),
        prisma.site.count({ where: { status: "PENDING" } }),
        prisma.site.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            }
        }),
        prisma.user.count({ where: { isActive: true } })
    ]);

    // Fetch recent activity
    const recentLogs = await prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { name: true } },
            site: { select: { name: true } }
        }
    });

    const stats = [
        { label: "Tổng mặt bằng", value: totalSites, icon: MapPin, color: "var(--accent-blue)" },
        { label: "Chờ phê duyệt", value: pendingSites, icon: Clock, color: "#f59e0b" },
        { label: "Mới trong tháng", value: sitesThisMonth, icon: TrendingUp, color: "var(--accent-emerald)" },
        { label: "Nhân sự hoạt động", value: totalUsers, icon: Users, color: "var(--accent-cyan)" },
    ];

    return (
        <div className="p-8 fade-in">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-1">Chào buổi tối, {session?.user?.name} 👋</h1>
                <p className="text-zinc-400">Đây là tóm tắt tình hình quản lý mặt bằng hôm nay.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="glass-card p-6 flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: `${stat.color}15`, color: stat.color }}
                        >
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Hoạt động gần đây</h2>
                        <button className="text-xs font-medium text-blue-400 hover:text-blue-300">Xem tất cả</button>
                    </div>

                    <div className="space-y-6">
                        {recentLogs.map((log: any) => (
                            <Link href={`/dashboard/sites/${log.siteId}`} key={log.id} className="flex gap-4 relative group hover:bg-zinc-800/50 p-2 -mx-2 rounded-xl transition-colors">
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 z-10 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-blue-400 transition-colors">
                                        {log.action === 'CREATE' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                    </div>
                                    <div className="w-px h-full bg-zinc-800 absolute top-8"></div>
                                </div>
                                <div className="pb-4 pt-1">
                                    <p className="text-sm text-zinc-300">
                                        <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">{log.user.name}</span>
                                        {" "}{log.description}
                                        {log.site && <span className="text-blue-400 font-medium"> tại {log.site.name}</span>}
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-1">{formatDate(log.createdAt)}</p>
                                </div>
                            </Link>
                        ))}
                        {recentLogs.length === 0 && (
                            <p className="text-center text-zinc-500 py-8">Chưa có hoạt động nào được ghi lại.</p>
                        )}
                    </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="glass-card p-6 h-fit">
                    <h2 className="text-lg font-semibold text-white mb-6">Lối tắt nhanh</h2>
                    <div className="grid grid-cols-1 gap-3">
                        <a href="/dashboard/sites?status=NEW" className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/50 transition-all group">
                            <p className="font-medium text-sm text-white group-hover:text-blue-400 transition-colors">Duyệt mặt bằng mới</p>
                            <p className="text-xs text-zinc-500 mt-1">Xem danh sách các mặt bằng vừa được thêm.</p>
                        </a>
                        <a href="/dashboard/sites" className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/50 transition-all group">
                            <p className="font-medium text-sm text-white group-hover:text-blue-400 transition-colors">Báo cáo tháng</p>
                            <p className="text-xs text-zinc-500 mt-1">Xuất dữ liệu mặt bằng trong tháng này.</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
