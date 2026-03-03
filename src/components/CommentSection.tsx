"use client";
import { useState } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CommentSectionProps {
    siteId: string;
    comments: any[];
    userName: string;
}

export default function CommentSection({ siteId, comments, userName }: CommentSectionProps) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || loading) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/sites/${siteId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });

            if (!res.ok) throw new Error("Gửi bình luận thất bại");

            setContent("");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra khi gửi bình luận");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <MessageSquare size={20} className="text-blue-400" />
                Thảo luận ({comments.length})
            </h2>
            <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 fade-in">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 font-bold text-zinc-400 text-sm flex-shrink-0">
                            {comment.user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-white text-sm truncate">{comment.user.name}</span>
                                <span className="text-[10px] text-zinc-500 whitespace-nowrap">{formatDate(comment.createdAt)}</span>
                            </div>
                            <p className="text-sm text-zinc-300 break-words">{comment.content}</p>
                        </div>
                    </div>
                ))}
                {comments.length === 0 && (
                    <p className="text-center text-zinc-600 py-4 text-sm italic">Chưa có bình luận nào.</p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-4 pt-4 border-t border-zinc-800">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 font-bold text-blue-400 text-sm flex-shrink-0">
                    {userName.charAt(0)}
                </div>
                <div className="flex-1">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="input-field min-h-[80px] bg-zinc-950/50 resize-none"
                        placeholder="Viết phản hồi hoặc ghi chú của bạn..."
                        disabled={loading}
                    />
                    <div className="flex justify-end mt-2">
                        <button
                            type="submit"
                            disabled={!content.trim() || loading}
                            className="btn-primary disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                            <span>Gửi đi</span>
                        </button>
                    </div>
                </div>
            </form>
        </section>
    );
}
