import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
    if (amount == null) return "—";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
}

export function formatDate(date: Date | string | null | undefined): string {
    if (!date) return "—";
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
}

export const SITE_STATUS_LABELS: Record<string, string> = {
    NEW: "Khảo sát mới",
    REVIEWING: "Đang đánh giá",
    PENDING: "Chờ duyệt",
    SIGNED: "Đã chốt",
    CANCELLED: "Đã hủy",
};

export const SITE_STATUS_COLORS: Record<string, string> = {
    NEW: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    REVIEWING: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    PENDING: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    SIGNED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    CANCELLED: "bg-red-500/20 text-red-300 border-red-500/30",
};

export const SITE_TYPE_LABELS: Record<string, string> = {
    SHOPHOUSE: "Shop House",
    MALL: "Mall / Trung tâm thương mại",
    STREET: "Mặt phố",
    OFFICE: "Văn phòng",
    OTHER: "Khác",
};

export const RENT_TYPE_LABELS: Record<string, string> = {
    TOS: "TOS (Turnover Sales)",
    FIX_RENT: "Fix Rent (Thuê cố định)",
};

export const ROLE_LABELS: Record<string, string> = {
    ADMIN: "Admin",
    SITE_TEAM: "Site Team",
    BRAND_TEAM: "Brand Team",
    OTHER: "Other",
};

export function canEditSite(role: string) {
    return role === "ADMIN" || role === "SITE_TEAM";
}

export function canManageUsers(role: string) {
    return role === "ADMIN";
}

export function canChangeStatus(role: string) {
    return role === "ADMIN" || role === "SITE_TEAM";
}
