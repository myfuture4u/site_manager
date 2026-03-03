"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserActionsProps {
    userId: string;
    isActive: boolean;
    isSelf: boolean;
}

export default function UserActions({ userId, isActive, isSelf }: UserActionsProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const toggleStatus = async () => {
        if (isSelf) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !isActive }),
            });

            if (!res.ok) throw new Error("Cập nhật trạng thái người dùng thất bại");

            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra khi cập nhật trạng thái");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleStatus}
            className={`p-1 px-3 text-xs font-medium border rounded-lg transition-all min-w-[100px] flex items-center justify-center gap-2 ${isActive
                    ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                    : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                }`}
            disabled={isSelf || loading}
        >
            {loading ? (
                <Loader2 size={12} className="animate-spin" />
            ) : (
                isActive ? "Vô hiệu hóa" : "Kích hoạt"
            )}
        </button>
    );
}
