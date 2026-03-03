"use client";
import { useState, useRef } from "react";
import { Paperclip, Loader2, X, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

interface AttachmentSectionProps {
    siteId: string;
    attachments: any[];
}

export default function AttachmentSection({ siteId, attachments }: AttachmentSectionProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // Note: This is an simplified implementation. 
            // In a real app, you would upload to S3/Cloudinary first.
            // For now, let's assume the API handles it or we use a data URL (not recommended for production).
            // I'll simulate a fetch to the attachment API.

            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`/api/sites/${siteId}/attachments`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Tải lên thất bại");

            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra khi tải lên tệp");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <section className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Paperclip size={20} className="text-blue-400" />
                    Tài liệu & Hình ảnh ({attachments.length})
                </h2>
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
                />
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
                        <a
                            href={file.fileUrl}
                            target="_blank"
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                            <p className="text-[10px] text-white font-medium uppercase tracking-widest">Xem file</p>
                        </a>
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
