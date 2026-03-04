"use client";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const DATA_TYPES = [
    { value: "CITY", label: "Tỉnh/Thành phố" },
    { value: "DISTRICT", label: "Quận/Huyện" },
    { value: "WARD", label: "Phường/Xã" },
    { value: "SITE_TYPE", label: "Loại hình mặt bằng" },
    { value: "STATUS", label: "Trạng thái măt bằng" },
];

export default function MasterDataPage() {
    const { data: session } = useSession();
    const role = session?.user?.role;
    const [activeTab, setActiveTab] = useState("CITY");

    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formLoading, setFormLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/master-data?type=${activeTab}`);
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormLoading(true);
        const formData = new FormData(e.currentTarget);
        const payload = {
            type: activeTab,
            value: formData.get("value"),
            parentValue: formData.get("parentValue") || null,
            order: formData.get("order") ? parseInt(formData.get("order") as string) : 0,
            isActive: formData.get("isActive") === "on",
        };

        try {
            const url = editingItem ? `/api/master-data/${editingItem.id}` : "/api/master-data";
            const method = editingItem ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Thao tác thất bại");

            toast.success("Lưu thành công");
            setShowModal(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa mục này không?")) return;
        try {
            const res = await fetch(`/api/master-data/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Xóa thất bại");
            toast.success("Xóa thành công");
            fetchData();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (role !== "ADMIN") return <div className="p-8">Không có quyền truy cập</div>;

    const filteredData = data.filter(item =>
        item.value.toLowerCase().includes(search.toLowerCase()) ||
        (item.parentValue && item.parentValue.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="p-8 h-full flex flex-col fade-in">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">Dữ liệu chuẩn (Master Data)</h1>
                    <p className="text-zinc-400 mt-1">Cấu hình danh mục hệ thống để sử dụng tại các form nhập thông tin.</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => { setEditingItem(null); setShowModal(true); }}
                >
                    <Plus size={18} />
                    <span>Thêm mới</span>
                </button>
            </header>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-zinc-800 mb-6 overflow-x-auto pb-2 custom-scrollbar">
                {DATA_TYPES.map(type => (
                    <button
                        key={type.value}
                        onClick={() => setActiveTab(type.value)}
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === type.value
                                ? "border-blue-500 text-blue-400"
                                : "border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-700"
                            }`}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="glass-card flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-zinc-800 relative">
                    <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field pl-10 max-w-sm"
                    />
                </div>

                <div className="flex-1 overflow-auto">
                    {loading ? (
                        <div className="p-12 flex justify-center text-zinc-500"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800/50 bg-zinc-900/50">
                                    <th className="p-4 text-xs font-semibold text-zinc-500 uppercase">Giá trị</th>
                                    {["WARD", "DISTRICT"].includes(activeTab) && (
                                        <th className="p-4 text-xs font-semibold text-zinc-500 uppercase">Trực thuộc (Parent)</th>
                                    )}
                                    <th className="p-4 text-xs font-semibold text-zinc-500 uppercase text-center w-24">Thứ tự</th>
                                    <th className="p-4 text-xs font-semibold text-zinc-500 uppercase text-center w-28">Trạng thái</th>
                                    <th className="p-4 text-xs font-semibold text-zinc-500 uppercase text-right w-32">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {filteredData.map(item => (
                                    <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors group">
                                        <td className="p-4 text-sm font-medium text-zinc-200">{item.value}</td>
                                        {["WARD", "DISTRICT"].includes(activeTab) && (
                                            <td className="p-4 text-sm text-zinc-400">{item.parentValue || "—"}</td>
                                        )}
                                        <td className="p-4 text-sm text-zinc-400 text-center">{item.order}</td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${item.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {item.isActive ? "Hoạt động" : "Tạm khóa"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setEditingItem(item); setShowModal(true); }}
                                                    className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredData.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-zinc-500">
                                            Chưa có dữ liệu cho mục này.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 fade-in">
                    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden scale-in">
                        <header className="p-5 border-b border-zinc-800 bg-zinc-900/50">
                            <h3 className="text-lg font-semibold text-white">
                                {editingItem ? "Cập nhật dữ liệu" : "Thêm mới dữ liệu"}
                            </h3>
                        </header>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="label">Giá trị hiển thị *</label>
                                <input
                                    name="value"
                                    defaultValue={editingItem?.value}
                                    required
                                    className="input-field"
                                    placeholder="Nhập giá trị..."
                                    autoFocus
                                />
                            </div>

                            {["WARD", "DISTRICT"].includes(activeTab) && (
                                <div>
                                    <label className="label">Cấp trực thuộc (Parent - Tùy chọn)</label>
                                    <input
                                        name="parentValue"
                                        defaultValue={editingItem?.parentValue || ""}
                                        className="input-field"
                                        placeholder="Ví dụ: tên Tỉnh/Thành phố hoặc Quận/Huyện..."
                                    />
                                    <p className="text-[10px] text-zinc-500 mt-1">Dành cho Phường/Xã để xác định thuộc Quận/Huyện nào.</p>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="label">Thứ tự ưu tiên</label>
                                    <input
                                        name="order"
                                        type="number"
                                        defaultValue={editingItem?.order || 0}
                                        className="input-field"
                                    />
                                </div>
                                <div className="flex items-center pt-8">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-300">
                                        <input
                                            name="isActive"
                                            type="checkbox"
                                            defaultChecked={editingItem ? editingItem.isActive : true}
                                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-blue-500/20 focus:ring-offset-0"
                                        />
                                        Kích hoạt
                                    </label>
                                </div>
                            </div>

                            <footer className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Hủy</button>
                                <button type="submit" disabled={formLoading} className="btn-primary min-w-[100px]">
                                    {formLoading ? <Loader2 size={16} className="animate-spin" /> : "Lưu lại"}
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
