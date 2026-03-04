"use client";
import { useState } from "react";
import { Edit2, Loader2, ChevronDown } from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import SiteForm from "./SiteForm";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface SiteActionsProps {
    site: any;
}

export default function SiteActions({ site }: SiteActionsProps) {
    const { data: session } = useSession();
    const role = session?.user?.role as string;

    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === site.status) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/sites/${site.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error("Cập nhật trạng thái thất bại");

            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra khi cập nhật trạng thái");
        } finally {
            setLoading(false);
        }
    };

    if (role !== "ADMIN" && role !== "SITE_TEAM") return null;

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={() => setShowForm(true)}
                className="btn-secondary"
            >
                <Edit2 size={16} />
                <span>Chỉnh sửa</span>
            </button>

            <div className="relative">
                <select
                    className="select-field !w-auto !pr-10 appearance-none"
                    value={site.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={loading}
                >
                    {Object.entries(STATUS_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <ChevronDown size={14} />}
                </div>
            </div>

            {showForm && (
                <SiteForm
                    initialData={site}
                    onClose={() => setShowForm(false)}
                    onSuccess={() => router.refresh()}
                />
            )}
        </div>
    );
}
