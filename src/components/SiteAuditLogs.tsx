"use client";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Activity, Edit2, Plus, RefreshCw, Trash2, Upload } from "lucide-react";

interface AuditLog {
    id: string;
    action: string;
    fieldChanged: string | null;
    oldValue: string | null;
    newValue: string | null;
    description: string | null;
    createdAt: any;
    user: {
        name: string;
    };
}

interface SiteAuditLogsProps {
    logs: AuditLog[];
}

export default function SiteAuditLogs({ logs }: SiteAuditLogsProps) {
    if (!logs || logs.length === 0) {
        return (
            <div className="glass-card p-6 border-l-4 border-l-blue-500">
                <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Lịch sử bản ghi</h3>
                <p className="text-sm text-zinc-500 text-center py-4">Chưa có dữ liệu lịch sử.</p>
            </div>
        );
    }

    const getActionIcon = (action: string) => {
        switch (action) {
            case "CREATE": return <Plus size={14} className="text-green-400" />;
            case "UPDATE": return <Edit2 size={14} className="text-blue-400" />;
            case "STATUS_CHANGE": return <RefreshCw size={14} className="text-orange-400" />;
            case "UPLOAD_ATTACHMENT": return <Upload size={14} className="text-indigo-400" />;
            case "DELETE_ATTACHMENT": return <Trash2 size={14} className="text-red-400" />;
            default: return <Activity size={14} className="text-zinc-400" />;
        }
    };

    return (
        <div className="glass-card p-6 border-l-4 border-l-blue-500 flex flex-col max-h-[500px]">
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider sticky top-0 bg-[#141824] z-10 pb-2">Lịch sử hoạt động</h3>
            <div className="relative border-l border-zinc-800 ml-3 space-y-6 overflow-y-auto custom-scrollbar pr-2 flex-1 pb-4">
                {logs.map((log) => (
                    <div key={log.id} className="relative pl-6 fade-in">
                        <span className="absolute -left-[13px] top-1 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                            {getActionIcon(log.action)}
                        </span>
                        <div className="flex flex-col gap-1">
                            <p className="text-[10px] text-zinc-500 font-medium">
                                {format(new Date(log.createdAt), "HH:mm - dd/MM/yyyy", { locale: vi })}
                            </p>
                            <p className="text-xs text-white">
                                <span className="font-semibold text-blue-400">{log.user.name}</span>{" "}
                                <span className="text-zinc-400">{log.description}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
