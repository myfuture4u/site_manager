"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    Building2,
    LayoutDashboard,
    MapPin,
    Users,
    LogOut,
    ChevronRight,
    Database,
} from "lucide-react";
import { ROLE_LABELS } from "@/lib/utils";

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["ADMIN", "SITE_MANAGER", "SITE_DEVELOPER", "BOD", "GM", "BOM", "PROJECT_TEAM", "BRAND_TEAM"] },
    { href: "/dashboard/sites", icon: MapPin, label: "Mặt bằng", roles: ["ADMIN", "SITE_MANAGER", "SITE_DEVELOPER", "BOD", "GM", "BOM", "PROJECT_TEAM", "BRAND_TEAM"] },
    { href: "/dashboard/users", icon: Users, label: "Người dùng", roles: ["ADMIN"] },
    { href: "/dashboard/master-data", icon: Database, label: "Dữ liệu chuẩn", roles: ["ADMIN"] },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = session?.user?.role ?? "";

    return (
        <aside className="w-[240px] h-full min-h-screen bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col p-5 shrink-0">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 py-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-[0_4px_16px_rgba(59,130,246,0.3)] shrink-0">
                    <Building2 size={22} className="text-white" />
                </div>
                <div>
                    <div className="font-bold text-[0.9rem] text-[var(--text-primary)] leading-tight">
                        Site Manager
                    </div>
                    <div className="text-[0.7rem] text-[var(--text-muted)]">QSR Vietnam</div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 flex flex-col gap-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                <p className="text-[0.7rem] font-semibold text-[var(--text-muted)] uppercase tracking-wider ml-2 mb-2">
                    Menu
                </p>
                {navItems
                    .filter((item) => item.roles.includes(role))
                    .map((item) => {
                        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`sidebar-link ${active ? "active" : ""}`}
                            >
                                <item.icon size={18} />
                                <span className="flex-1">{item.label}</span>
                                {active && <ChevronRight size={14} />}
                            </Link>
                        );
                    })}
            </nav>

            {/* User Info & Logout */}
            <div className="border-t border-[var(--border)] pt-4 mt-4">
                {session?.user && (
                    <div className="mb-3 p-3 bg-[var(--bg-card)] rounded-lg">
                        <div className="text-[0.8rem] font-semibold text-[var(--text-primary)] truncate">
                            {session.user.name}
                        </div>
                        <div className="text-[0.7rem] text-[var(--text-muted)] truncate mb-1">
                            {session.user.email}
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[0.65rem] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            {ROLE_LABELS[role] || role}
                        </span>
                    </div>
                )}
                <button
                    className="sidebar-link w-full border-none bg-transparent justify-start hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    <LogOut size={18} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}
