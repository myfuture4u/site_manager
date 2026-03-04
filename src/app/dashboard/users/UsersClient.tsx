"use client";
import { useState } from "react";
import { ROLE_LABELS, formatDate } from "@/lib/utils";
import { Mail, Shield, Calendar, Edit2, UserPlus, Search } from "lucide-react";
import UserActions from "@/components/UserActions";
import UserForm from "@/components/UserForm";
import Link from "next/link";

interface UsersClientProps {
    users: any[];
    currentUserId: string;
}

export default function UsersClient({ users, currentUserId }: UsersClientProps) {
    const [editingUser, setEditingUser] = useState<any>(null);

    return (
        <div className="p-8 fade-in h-full flex flex-col">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Quản lý người dùng</h1>
                    <p className="text-zinc-400">Danh sách nhân sự và phân quyền truy cập hệ thống.</p>
                </div>
                <button className="btn-primary">
                    <UserPlus size={18} />
                    <span>Thêm thành viên</span>
                </button>
            </header>

            <div className="glass-card p-4 mb-6 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input type="text" placeholder="Tìm theo tên hoặc email..." className="input-field pl-10" />
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-900/50">
                                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Thành viên</th>
                                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Vai trò</th>
                                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ngày tham gia</th>
                                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {users.map((u: any) => (
                                <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 font-bold text-zinc-400">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-white">{u.name}</div>
                                                <div className="text-xs text-zinc-500 flex items-center gap-1">
                                                    <Mail size={12} />
                                                    {u.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                                            <Shield size={14} className="text-blue-400" />
                                            {ROLE_LABELS[u.role] || u.role}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                                            <Calendar size={14} />
                                            {formatDate(u.createdAt)}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {u.isActive ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                Đang hoạt động
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                                Bị vô hiệu
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setEditingUser(u)}
                                                className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <UserActions userId={u.id} isActive={u.isActive} isSelf={u.id === currentUserId} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {editingUser && (
                <UserForm
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSuccess={() => {
                        setEditingUser(null);
                        window.location.reload(); // Quick refresh for now
                    }}
                />
            )}
        </div>
    );
}
