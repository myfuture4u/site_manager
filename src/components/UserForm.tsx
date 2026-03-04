"use client";
import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { ROLE_LABELS } from "@/lib/utils";

interface UserFormProps {
    onClose: () => void;
    onSuccess: () => void;
    user: any;
}

export default function UserForm({ onClose, onSuccess, user }: UserFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch(`/api/users/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Có lỗi xảy ra");
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] fade-in">
                <header className="p-6 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Chỉnh sửa người dùng</h2>
                        <p className="text-sm text-zinc-500">Cập nhật thông tin và phân quyền.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
                        <X size={20} />
                    </button>
                </header>

                <form id="edit-user-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="label">Email</label>
                        <input type="text" value={user.email} disabled className="input-field opacity-50 cursor-not-allowed" />
                        <p className="text-[10px] text-zinc-500 mt-1">Email không thể thay đổi sau khi tạo.</p>
                    </div>

                    <div>
                        <label className="label">Họ và tên *</label>
                        <input name="name" defaultValue={user.name} required className="input-field" placeholder="Nhập họ và tên..." />
                    </div>

                    <div>
                        <label className="label">Vai trò (Role) *</label>
                        <select name="role" defaultValue={user.role} required className="select-field">
                            {Object.entries(ROLE_LABELS).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-2 border-t border-zinc-800">
                        <label className="label text-zinc-400">Đổi mật khẩu (Tuỳ chọn)</label>
                        <input name="password" type="password" className="input-field mt-2" placeholder="Nhập để đổi mật khẩu mới" minLength={6} />
                        <p className="text-[10px] text-zinc-500 mt-1">Bỏ trống nếu không muốn thay đổi mật khẩu.</p>
                    </div>
                </form>

                <footer className="p-6 border-t border-zinc-800 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
                    <button
                        form="edit-user-form"
                        type="submit"
                        disabled={loading}
                        className="btn-primary min-w-[120px]"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        <span>Cập nhật</span>
                    </button>
                </footer>
            </div>
        </div>
    );
}
