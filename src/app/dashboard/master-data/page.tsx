"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, Search, Loader2, Download, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

const DATA_TYPES = [
    { value: "CITY", label: "Tỉnh/Thành phố" },
    { value: "DISTRICT", label: "Quận/Huyện" },
    { value: "WARD", label: "Phường/Xã" },
    { value: "SITE_TYPE", label: "Loại hình mặt bằng" },
    { value: "STATUS", label: "Trạng thái mặt bằng" },
    { value: "ROLE", label: "Vai trò người dùng" },
    { value: "BRAND", label: "Thương hiệu" },
];

const PARENT_REQUIRED = ["WARD", "DISTRICT"];
const HAS_PARENT = ["WARD", "DISTRICT"];

function getExcelHeaders(type: string) {
    const base = ["Giá trị (value) *", "Thứ tự (order)", "Trạng thái (isActive: TRUE/FALSE)"];
    if (HAS_PARENT.includes(type)) return ["Giá trị (value) *", "Trực thuộc (parentValue)", ...base.slice(1)];
    return base;
}

export default function MasterDataPage() {
    const { data: session } = useSession();
    const role = session?.user?.role;
    const [activeTab, setActiveTab] = useState("CITY");

    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [importing, setImporting] = useState(false);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formLoading, setFormLoading] = useState(false);

    const importRef = useRef<HTMLInputElement>(null);

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

    // ─── Excel Export ────────────────────────────────────────────────────────
    const handleExport = () => {
        const tabLabel = DATA_TYPES.find(t => t.value === activeTab)?.label ?? activeTab;

        // Build worksheet rows
        const rows = data.map(item => {
            if (HAS_PARENT.includes(activeTab)) {
                return {
                    "Giá trị (value) *": item.value,
                    "Trực thuộc (parentValue)": item.parentValue ?? "",
                    "Thứ tự (order)": item.order,
                    "Trạng thái (isActive: TRUE/FALSE)": item.isActive ? "TRUE" : "FALSE",
                };
            }
            return {
                "Giá trị (value) *": item.value,
                "Thứ tự (order)": item.order,
                "Trạng thái (isActive: TRUE/FALSE)": item.isActive ? "TRUE" : "FALSE",
            };
        });

        // If no data, export an empty template
        if (rows.length === 0) {
            const headers = getExcelHeaders(activeTab);
            rows.push(Object.fromEntries(headers.map(h => [h, ""])) as any);
        }

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, tabLabel.slice(0, 31));

        // Style header row width
        const colWidths = Object.keys(rows[0]).map(k => ({ wch: Math.max(k.length, 20) }));
        ws["!cols"] = colWidths;

        XLSX.writeFile(wb, `master-data_${activeTab.toLowerCase()}.xlsx`);
        toast.success(`Đã xuất file Excel cho "${tabLabel}"`);
    };

    // ─── Excel Import ────────────────────────────────────────────────────────
    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = ""; // reset input

        setImporting(true);
        const toastId = toast.loading("Đang đọc file Excel...");
        try {
            const buffer = await file.arrayBuffer();
            const wb = XLSX.read(buffer);
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows: any[] = XLSX.utils.sheet_to_json(ws);

            if (rows.length === 0) throw new Error("File Excel không có dữ liệu.");

            toast.loading(`Đang nhập ${rows.length} dòng...`, { id: toastId });

            let successCount = 0;
            let errorCount = 0;

            for (const row of rows) {
                const value =
                    row["Giá trị (value) *"] ??
                    row["value"] ??
                    "";
                if (!value) { errorCount++; continue; }

                const parentValue =
                    row["Trực thuộc (parentValue)"] ??
                    row["parentValue"] ??
                    null;

                const order = parseInt(row["Thứ tự (order)"] ?? row["order"] ?? 0) || 0;

                const isActiveRaw =
                    row["Trạng thái (isActive: TRUE/FALSE)"] ??
                    row["isActive"] ??
                    "TRUE";
                const isActive = String(isActiveRaw).toUpperCase() !== "FALSE";

                const payload = { type: activeTab, value: String(value).trim(), parentValue: parentValue ? String(parentValue).trim() : null, order, isActive };

                const res = await fetch("/api/master-data", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (res.ok) successCount++; else errorCount++;
            }

            toast.success(`Nhập thành công ${successCount} dòng${errorCount > 0 ? `, ${errorCount} dòng lỗi` : ""}.`, { id: toastId });
            fetchData();
        } catch (err: any) {
            toast.error(err.message ?? "Lỗi khi đọc file", { id: toastId });
        } finally {
            setImporting(false);
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
                <div className="flex items-center gap-2">
                    {/* Import */}
                    <input
                        ref={importRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={handleImport}
                    />
                    <button
                        onClick={() => importRef.current?.click()}
                        disabled={importing}
                        className="btn-secondary flex items-center gap-2"
                        title="Import từ Excel"
                    >
                        {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        <span>Import</span>
                    </button>

                    {/* Export */}
                    <button
                        onClick={handleExport}
                        className="btn-secondary flex items-center gap-2"
                        title="Xuất ra Excel"
                    >
                        <Download size={16} />
                        <span>Export</span>
                    </button>

                    {/* Add new */}
                    <button
                        className="btn-primary flex items-center gap-2"
                        onClick={() => { setEditingItem(null); setShowModal(true); }}
                    >
                        <Plus size={18} />
                        <span>Thêm mới</span>
                    </button>
                </div>
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
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field pl-9"
                        />
                    </div>
                    <span className="text-xs text-zinc-500 whitespace-nowrap">
                        {filteredData.length} mục
                    </span>
                </div>

                <div className="flex-1 overflow-auto">
                    {loading ? (
                        <div className="p-12 flex justify-center text-zinc-500"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800/50 bg-zinc-900/50">
                                    <th className="p-4 text-xs font-semibold text-zinc-500 uppercase">Giá trị</th>
                                    {HAS_PARENT.includes(activeTab) && (
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
                                        {HAS_PARENT.includes(activeTab) && (
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
                                            Chưa có dữ liệu cho mục này. Nhấn &quot;Thêm mới&quot; hoặc &quot;Import&quot; để bắt đầu.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Import hint */}
            <p className="mt-3 text-[11px] text-zinc-600">
                💡 Tip: Nhấn <strong className="text-zinc-500">Export</strong> để tải file Excel mẫu, điền dữ liệu rồi nhấn <strong className="text-zinc-500">Import</strong> để nhập hàng loạt.
            </p>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 fade-in">
                    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden scale-in">
                        <header className="p-5 border-b border-zinc-800 bg-zinc-900/50">
                            <h3 className="text-lg font-semibold text-white">
                                {editingItem ? "Cập nhật dữ liệu" : `Thêm mới — ${DATA_TYPES.find(t => t.value === activeTab)?.label}`}
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

                            {PARENT_REQUIRED.includes(activeTab) && (
                                <div>
                                    <label className="label">Cấp trực thuộc (Parent — Tùy chọn)</label>
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
