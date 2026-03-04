"use client";
import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { SITE_TYPE_LABELS, RENT_TYPE_LABELS } from "@/lib/utils";
import toast from "react-hot-toast";

interface SiteFormProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export default function SiteForm({ onClose, onSuccess, initialData }: SiteFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

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
                let errorMessage = "Có lỗi xảy ra";
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const err = await res.json();
                    errorMessage = err.error || errorMessage;
                } else {
                    const text = await res.text();
                    errorMessage = text || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const savedSite = await res.json();

            // Upload files if any
            if (selectedFiles.length > 0) {
                toast.loading("Đang tải dữ liệu đính kèm...", { id: "uploading-files" });
                for (let i = 0; i < selectedFiles.length; i++) {
                    const fileData = new FormData();
                    fileData.append("file", selectedFiles[i]);
                    await fetch(`/api/sites/${savedSite.id}/attachments`, {
                        method: "POST",
                        body: fileData
                    });
                }
                toast.dismiss("uploading-files");
            }

            toast.success(initialData ? "Cập nhật mặt bằng thành công" : "Tạo mới mặt bằng thành công");
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
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
                            <label className="label">Số nhà / Địa chỉ chi tiết *</label>
                            <input name="address" defaultValue={initialData?.address} required className="input-field" placeholder="Ví dụ: 123 Toà nhà ABC..." />
                        </div>

                        <div>
                            <label className="label">Đường</label>
                            <input name="street" defaultValue={initialData?.street} className="input-field" placeholder="Tên đường..." />
                        </div>

                        <div>
                            <label className="label">Phường/Xã</label>
                            <input name="ward" defaultValue={initialData?.ward} className="input-field" placeholder="Tên phường/xã..." />
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
                                className="input-field border-blue-500/50 bg-blue-500/5 focus:border-blue-400 focus:bg-transparent transition-all"
                                placeholder="https://maps.google.com/..."
                            />
                            <p className="text-[10px] text-zinc-500 mt-1">Dán đường dẫn Google Maps của mặt bằng để dễ dàng xem vị trí sau này.</p>
                        </div>

                        {!initialData && (
                            <div className="md:col-span-2 pt-2 border-t border-zinc-800">
                                <label className="label">Đính kèm hình ảnh/tài liệu (Tùy chọn)</label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-zinc-400
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-xs file:font-semibold
                                        file:bg-zinc-800 file:text-white
                                        hover:file:bg-zinc-700 transition-colors"
                                />
                                {selectedFiles.length > 0 && (
                                    <p className="text-xs text-blue-400 mt-2">Đã chọn {selectedFiles.length} tệp.</p>
                                )}
                            </div>
                        )}
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
