"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, Check, MapPin } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Notification {
    id: string;
    siteId: string | null;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationsDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            const data = await res.json();
            if (data.notifications) setNotifications(data.notifications);
            if (data.unreadCount !== undefined) setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Optional: Poll every minute for new notifications
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}`, { method: "PUT" });
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const markAllAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            await fetch(`/api/notifications/all`, { method: "PUT" });
            fetchNotifications();
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--accent-blue)] hover:bg-[rgba(59,130,246,0.1)] transition-all duration-300 hover:scale-110 active:scale-95 relative"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border border-[var(--bg-secondary)] text-[8px] font-bold text-white flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden animate-slide-up">
                    <div className="p-3 sm:p-4 border-b border-[var(--border)] flex items-center justify-between bg-zinc-900/50">
                        <h3 className="font-semibold text-[var(--text-primary)]">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                            >
                                <Check size={14} /> Đánh dấu đã đọc
                            </button>
                        )}
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500 flex flex-col items-center">
                                <Bell size={32} className="mb-2 opacity-20" />
                                <p className="text-sm">Bạn chưa có thông báo mới nào</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[var(--border)]">
                                {notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 transition-colors relative block ${notification.isRead ? 'bg-transparent' : 'bg-blue-500/5'}`}
                                    >
                                        {!notification.isRead && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                        )}
                                        <div className="flex gap-3">
                                            <div className="mt-1 flex-shrink-0">
                                                <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)]">
                                                    <MapPin size={14} />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`text-sm mb-1 ${notification.isRead ? 'text-zinc-300 font-medium' : 'text-white font-semibold'}`}>
                                                    {notification.title}
                                                </h4>
                                                <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-2 leading-relaxed">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-zinc-600 font-medium">
                                                        {formatDate(notification.createdAt)}
                                                    </span>

                                                    <div className="flex items-center gap-2">
                                                        {notification.siteId && (
                                                            <Link
                                                                href={`/dashboard/sites/${notification.siteId}`}
                                                                className="text-[10px] font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-1 rounded"
                                                                onClick={() => {
                                                                    setIsOpen(false);
                                                                    if (!notification.isRead) markAsRead(notification.id);
                                                                }}
                                                            >
                                                                Xem chi tiết
                                                            </Link>
                                                        )}
                                                        {!notification.isRead && (
                                                            <button
                                                                onClick={() => markAsRead(notification.id)}
                                                                className="text-zinc-400 hover:text-blue-400 p-1 rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
                                                                title="Đánh dấu đã đọc"
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-3 text-center border-t border-[var(--border)] bg-zinc-900/30">
                            <span className="text-[10px] text-zinc-500">Hiển thị tối đa 10 thông báo gần nhất</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
