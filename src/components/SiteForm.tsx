"use client";
import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { SITE_TYPE_LABELS, RENT_TYPE_LABELS } from "@/lib/utils";

interface SiteFormProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export default function SiteForm({ onClose, onSuccess, initialData }: SiteFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const url = initialData ? `/api/sites/${initialData.id}` : "/api/sites";
            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Có lỗi xảy ra");
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] fade-in">
                <header className="p-6 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {initialData ? "Chỉnh sửa mặt bằng" : "Thêm mặt bằng mới"}
                        </h2>
                        <p className="text-sm text-zinc-500">Nhập thông tin chi tiết về địa điểm khảo sát.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
                        <X size={20} />
                    </button>
                </header>

                <form id="site-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="label">Tên mặt bằng *</label>
                            <input name="name" defaultValue={initialData?.name} required className="input-field" placeholder="Ví dụ: QSR - Nguyễn Huệ" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="label">Địa chỉ *</label>
                            <input name="address" defaultValue={initialData?.address} required className="input-field" placeholder="Số nhà, tên đường..." />
                        </div>

                        <div>
                            <label className="label">Thành phố *</label>
                            <select name="city" defaultValue={initialData?.city || "Hồ Chí Minh"} required className="select-field">
                                <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                                <option value="Hà Nội">Hà Nội</option>
                                <option value="Đà Nẵng">Đà Nẵng</option>
                            </select>
                        </div>

                        <div>
                            <label className="label">Loại hình *</label>
                            <select name="siteType" defaultValue={initialData?.siteType || "STREET"} required className="select-field">
                                {Object.entries(SITE_TYPE_LABELS).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="label">Mô tả chi tiết</label>
                            <textarea name="description" defaultValue={initialData?.description} className="input-field min-h-[100px]" placeholder="Các đặc điểm nổi bật, lưu ý..." />
                        </div>

                        <div>
                            <label className="label">Giá thuê dự kiến</label>
                            <input name="rentPrice" defaultValue={initialData?.rentPrice} type="number" step="0.01" className="input-field" placeholder="Số tiền" />
                        </div>

                        <div>
                            <label className="label">Đơn vị</label>
                            <input name="rentUnit" defaultValue={initialData?.rentUnit || "VND/tháng"} className="input-field" />
                        </div>

                        <div>
                            <label className="label">Hình thức thuê</label>
                            <select name="rentType" defaultValue={initialData?.rentType || "FIX_RENT"} className="select-field">
                                {Object.entries(RENT_TYPE_LABELS).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label">Diện tích sàn (m2)</label>
                            <input name="floorArea" defaultValue={initialData?.floorArea} type="number" step="0.1" className="input-field" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="label flex items-center gap-1">
                                Google Maps Link
                            </label>
                            <input
                                name="mapsLink"
                                type="url"
                                defaultValue={initialData?.mapsLink}
                                className="input-field"
                                placeholder="https://maps.google.com/..."
                            />
                            <p className="text-[10px] text-zinc-500 mt-1">Dán đường dẫn Google Maps của mặt bằng để dễ dàng xem vị trí sau này.</p>
                        </div>
                    </div>
                </form>

                <footer className="p-6 border-t border-zinc-800 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
                    <button
                        form="site-form"
                        type="submit"
                        disabled={loading}
                        className="btn-primary min-w-[120px]"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        <span>{initialData ? "Cập nhật" : "Tạo mới"}</span>
                    </button>
                </footer>
            </div>
        </div>
    );
}
