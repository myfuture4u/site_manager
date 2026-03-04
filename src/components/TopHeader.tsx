"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Menu, Bell, User } from "lucide-react";

interface TopHeaderProps {
    onMenuClick: () => void;
}

export default function TopHeader({ onMenuClick }: TopHeaderProps) {
    const { data: session } = useSession();

    return (
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border)] shadow-sm">
            {/* Left side */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] md:hidden transition-colors"
                >
                    <Menu size={24} />
                </button>
                <div className="hidden sm:block">
                    <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                        Chào mừng quay lại, {session?.user?.name?.split(' ')[0] || "bạn"}!
                    </h1>
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                <button className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--accent-blue)] hover:bg-[rgba(59,130,246,0.1)] transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg-secondary)]"></span>
                </button>

                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-[2px]">
                    <div className="h-full w-full rounded-full bg-[var(--bg-secondary)] flex items-center justify-center overflow-hidden">
                        {session?.user?.image ? (
                            <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User size={18} className="text-[var(--text-secondary)]" />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
