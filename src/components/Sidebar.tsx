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
} from "lucide-react";
import { ROLE_LABELS } from "@/lib/utils";

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["ADMIN", "SITE_TEAM", "BRAND_TEAM", "OTHER"] },
    { href: "/dashboard/sites", icon: MapPin, label: "Mặt bằng", roles: ["ADMIN", "SITE_TEAM", "BRAND_TEAM", "OTHER"] },
    { href: "/dashboard/users", icon: Users, label: "Người dùng", roles: ["ADMIN"] },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = session?.user?.role ?? "";

    return (
        <aside
            style={{
                width: "240px",
                minHeight: "100vh",
                background: "var(--bg-secondary)",
                borderRight: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                padding: "1.25rem",
                flexShrink: 0,
            }}
        >
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem", padding: "0.25rem 0" }}>
                <div style={{
                    width: "40px", height: "40px", borderRadius: "10px",
                    background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
                    flexShrink: 0,
                }}>
                    <Building2 size={22} color="white" />
                </div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", lineHeight: 1.2 }}>
                        Site Manager
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>QSR Vietnam</div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.5rem 0.5rem" }}>
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
                                <span style={{ flex: 1 }}>{item.label}</span>
                                {active && <ChevronRight size={14} />}
                            </Link>
                        );
                    })}
            </nav>

            {/* User Info & Logout */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", marginTop: "1rem" }}>
                {session?.user && (
                    <div style={{ marginBottom: "0.75rem", padding: "0.75rem", background: "var(--bg-card)", borderRadius: "8px" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {session.user.name}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {session.user.email}
                        </div>
                        <span style={{
                            display: "inline-block", marginTop: "0.35rem", padding: "0.15rem 0.5rem",
                            borderRadius: "999px", fontSize: "0.65rem", fontWeight: 600,
                            background: "rgba(59,130,246,0.2)", color: "#60a5fa",
                            border: "1px solid rgba(59,130,246,0.3)",
                        }}>
                            {ROLE_LABELS[role] || role}
                        </span>
                    </div>
                )}
                <button
                    className="sidebar-link"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    style={{ width: "100%", background: "none", border: "none", color: "var(--text-secondary)" }}
                >
                    <LogOut size={18} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}
