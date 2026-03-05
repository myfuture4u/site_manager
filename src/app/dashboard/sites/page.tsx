"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
    Search,
    Filter,
    Plus,
    MapPin,
    Building,
    Clock,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    ExternalLink
} from "lucide-react";
import Link from "next/link";
import { STATUS_LABELS, STATUS_COLORS, SITE_TYPE_LABELS } from "@/lib/utils";

import SiteForm from "@/components/SiteForm";

export default function SitesPage() {
    const { data: session } = useSession();
    const role = session?.user?.role as string;

    const [sites, setSites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [city, setCity] = useState("");
    const [timeRange, setTimeRange] = useState("");
    const [showForm, setShowForm] = useState(false);

    const fetchSites = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                search,
                status,
                city,
                timeRange,
                limit: "10"
            });
            const res = await fetch(`/api/sites?${params}`);
            const data = await res.json();
            setSites(data.sites);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch sites:", error);
        } finally {
            setLoading(false);
        }
    }, [page, search, status, city, timeRange]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSites();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchSites]);

    return (
        <div className="p-8 fade-in h-full flex flex-col">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Quản lý mặt bằng</h1>
                    <p className="text-zinc-400">Danh sách các địa điểm đang được theo dõi và đánh giá.</p>
                </div>
                {(role === "ADMIN" || role === "SITE_MANAGER" || role === "SITE_DEVELOPER") && (
                    <button onClick={() => setShowForm(true)} className="btn-primary" type="button">
                        <Plus size={18} />
                        <span>Thêm mặt bằng</span>
                    </button>
                )}
            </header>

            {/* Filters */}
            <div className="glass-card p-4 mb-6 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc địa chỉ..."
                        className="input-field pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="w-48">
                    <select
                        className="select-field"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        {Object.entries(STATUS_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                        ))}
                    </select>
                </div>

                <div className="w-48">
                    <select
                        className="select-field"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    >
                        <option value="">Tất cả thành phố</option>
                        <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                    </select>
                </div>

                <div className="w-48">
                    <select
                        className="select-field"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <option value="">Tất cả thời gian</option>
                        <option value="7d">7 ngày qua</option>
                        <option value="14d">14 ngày qua</option>
                        <option value="1m">1 tháng qua</option>
                        <option value="3m">1 quý qua</option>
                        <option value="1y">1 năm qua</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-900/50">
                                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Thông tin</th>
                                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Loại hình</th>
                                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Vị trí</th>
                                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Người tạo</th>
                                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {sites.map((site, index) => (
                                <tr key={site.id} className="hover:bg-zinc-800/30 transition-colors animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-zinc-800 overflow-hidden border border-zinc-700 flex-shrink-0 flex items-center justify-center text-zinc-600">
                                                {site.attachments?.[0]?.fileUrl ? (
                                                    <img src={site.attachments[0].fileUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Building size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-white">{site.name}</div>
                                                <div className="text-xs text-zinc-500 truncate max-w-[200px]">{site.address}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                                            <Building size={14} className="text-zinc-500" />
                                            {SITE_TYPE_LABELS[site.siteType] || site.siteType}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                                            <MapPin size={14} className="text-zinc-500" />
                                            {site.city}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className="status-badge"
                                            style={{
                                                backgroundColor: `${STATUS_COLORS[site.status]}15`,
                                                color: STATUS_COLORS[site.status],
                                                borderColor: `${STATUS_COLORS[site.status]}30`
                                            }}
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[site.status] }}></div>
                                            {STATUS_LABELS[site.status] || site.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-zinc-400">
                                        {site.createdBy?.name}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link
                                            href={`/dashboard/sites/${site.id}`}
                                            className="p-2 hover:bg-zinc-700 rounded-lg inline-flex text-zinc-400 hover:text-white transition-colors"
                                        >
                                            <ExternalLink size={18} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {loading && sites.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-zinc-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            )}
                            {!loading && sites.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-zinc-500">
                                        Không tìm thấy mặt bằng nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-zinc-800 flex items-center justify-between mt-auto">
                    <p className="text-sm text-zinc-500">
                        Trang {page} / {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            className="p-2 border border-zinc-800 rounded-lg hover:bg-zinc-800 disabled:opacity-50"
                            disabled={page === 1 || loading}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            className="p-2 border border-zinc-800 rounded-lg hover:bg-zinc-800 disabled:opacity-50"
                            disabled={page === totalPages || loading}
                            onClick={() => setPage(p => p + 1)}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {showForm && (
                <SiteForm
                    onClose={() => setShowForm(false)}
                    onSuccess={() => {
                        setPage(1);
                        fetchSites();
                    }}
                />
            )}
        </div>
    );
}
