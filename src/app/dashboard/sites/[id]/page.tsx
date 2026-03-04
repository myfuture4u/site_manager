import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
    MapPin,
    Building,
    Calendar,
    User,
    MessageSquare,
    Paperclip,
    Edit2,
    ArrowLeft,
    Clock,
    DollarSign,
    Maximize,
    Layers
} from "lucide-react";
import Link from "next/link";
import {
    STATUS_LABELS,
    STATUS_COLORS,
    STATUS_CLASS_MAP,
    SITE_TYPE_LABELS,
    RENT_TYPE_LABELS,
    formatCurrency,
    formatDate
} from "@/lib/utils";
import SiteActions from "@/components/SiteActions";
import CommentSection from "@/components/CommentSection";
import AttachmentSection from "@/components/AttachmentSection";
import SiteAuditLogs from "@/components/SiteAuditLogs";

export default async function SiteDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const { id } = await params;
    const site = await prisma.site.findUnique({
        where: { id },
        include: {
            createdBy: { select: { name: true, email: true } },
            attachments: {
                include: { uploadedBy: { select: { name: true } } },
                orderBy: { createdAt: "desc" }
            },
            comments: {
                include: { user: { select: { name: true } } },
                orderBy: { createdAt: "asc" }
            },
            auditLogs: {
                include: { user: { select: { name: true } } },
                orderBy: { createdAt: "desc" }
            }
        }
    });

    if (!site) notFound();

    const stats = [
        { label: "Loại hình", value: SITE_TYPE_LABELS[site.siteType] || site.siteType, icon: Building },
        { label: "Hình thức thuê", value: RENT_TYPE_LABELS[site.rentType || ""] || site.rentType || "—", icon: Layers },
        { label: "Diện tích", value: site.floorArea ? `${site.floorArea} m²` : "—", icon: Maximize },
        { label: "Giá thuê", value: formatCurrency(site.rentPrice), icon: DollarSign },
    ];

    return (
        <div className="p-8 fade-in">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex-1">
                    <Link href="/dashboard/sites" className="flex items-center gap-2 text-zinc-500 hover:text-white mb-4 transition-colors w-fit">
                        <ArrowLeft size={16} />
                        <span className="text-sm font-medium">Quay lại danh sách</span>
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-white tracking-tight">{site.name}</h1>
                        <span className={`status-badge ${STATUS_CLASS_MAP[site.status]}`}>
                            {STATUS_LABELS[site.status]}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                        <MapPin size={16} />
                        <span className="text-sm">{[site.address, site.street, site.ward, site.city].filter(Boolean).join(", ")}</span>
                    </div>
                </div>
                <SiteActions site={site} />
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <div key={i} className="glass-card p-4">
                                <div className="text-zinc-500 mb-2">
                                    <stat.icon size={18} />
                                </div>
                                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-sm font-semibold text-white mt-1">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Description */}
                    <section className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Mô tả chi tiết</h2>
                        <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {site.description || "Chưa có mô tả chi tiết cho mặt bằng này."}
                        </p>
                    </section>

                    {/* Attachments */}
                    <AttachmentSection siteId={site.id} attachments={site.attachments} />

                    {/* Comments */}
                    <CommentSection siteId={site.id} comments={site.comments} userName={session.user.name} />
                </div>

                {/* Sidebar Info */}
                <aside className="space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Thông tin quy hoạch</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Đường</p>
                                <p className="text-sm text-zinc-300">{site.street || "—"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Phường/Xã</p>
                                <p className="text-sm text-zinc-300">{site.ward || "—"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Quận/Huyện</p>
                                <p className="text-sm text-zinc-300">{site.district || "—"}</p>
                            </div>
                            <div>
                                <Link
                                    href={site.mapsLink || "#"}
                                    target="_blank"
                                    className={`flex items-center gap-2 text-sm ${site.mapsLink ? "text-blue-400 hover:text-blue-300" : "text-zinc-600 pointer-events-none"}`}
                                >
                                    <MapPin size={14} />
                                    <span>Xem trên Google Maps</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <SiteAuditLogs logs={site.auditLogs} />
                </aside>
            </div>
        </div>
    );
}
