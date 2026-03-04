"use client";
import { useState, useRef } from "react";
import { Paperclip, Loader2, X, Upload, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

interface AttachmentSectionProps {
    siteId: string;
    attachments: any[];
}

export default function AttachmentSection({ siteId, attachments }: AttachmentSectionProps) {
    const { data: session } = useSession();
    const role = session?.user?.role as string;

    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const toastId = toast.loading("Đang tải tệp lên...");
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`/api/sites/${siteId}/attachments`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Tải lên thất bại");

            toast.success("Tải tệp lên thành công", { id: toastId });
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra khi tải lên tệp", { id: toastId });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDelete = async (attachmentId: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa tệp này không?")) return;

        setDeletingId(attachmentId);
        const toastId = toast.loading("Đang xóa tệp...");
        try {
            const res = await fetch(`/api/sites/${siteId}/attachments?attachmentId=${attachmentId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Xóa tệp thất bại");

            toast.success("Xóa tệp thành công", { id: toastId });
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra khi xóa tệp", { id: toastId });
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <section className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Paperclip size={20} className="text-blue-400" />
                    Tài liệu & Hình ảnh ({attachments.length})
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 disabled:opacity-50"
                    >
                        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        Tải lên
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {attachments.map((file) => (
                    <div key={file.id} className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 hover:border-blue-500/50 transition-all fade-in">
                        {file.fileType === 'image' ? (
                            <img
                                src={file.fileUrl}
                                alt={file.fileName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                <Paperclip size={32} className="text-zinc-600 mb-2" />
                                <p className="text-[10px] text-zinc-500 text-center line-clamp-2">{file.fileName}</p>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                            <a
                                href={file.fileUrl}
                                target="_blank"
                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-medium uppercase tracking-widest rounded transition-colors"
                            >
                                Xem file
                            </a>
                            {(role === "ADMIN" || role === "SITE_TEAM" || file.uploadedById === session?.user?.id) && (
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(file.id); }}
                                    disabled={deletingId === file.id}
                                    className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/50 text-[10px] font-medium uppercase tracking-widest rounded transition-colors flex items-center gap-1"
                                >
                                    {deletingId === file.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                    Xóa
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {attachments.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-600">
                        <Paperclip size={32} className="mb-2" />
                        <p className="text-sm">Chưa có tệp đính kèm nào.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
