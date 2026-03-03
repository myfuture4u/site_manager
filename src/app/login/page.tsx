"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });
        setLoading(false);
        if (result?.error) {
            setError("Email hoặc mật khẩu không đúng, hoặc tài khoản không hợp lệ.");
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #0a0f1e 0%, #0f1629 50%, #0a0f1e 100%)",
                padding: "1rem",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Background effects */}
            <div style={{
                position: "absolute", width: "600px", height: "600px",
                borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
                top: "-200px", left: "-200px", pointerEvents: "none",
            }} />
            <div style={{
                position: "absolute", width: "400px", height: "400px",
                borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)",
                bottom: "-100px", right: "-100px", pointerEvents: "none",
            }} />

            <div className="glass-card fade-in" style={{ width: "100%", maxWidth: "420px", padding: "2.5rem" }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: "64px", height: "64px", borderRadius: "16px",
                        background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                        marginBottom: "1rem", boxShadow: "0 8px 32px rgba(59,130,246,0.3)",
                    }}>
                        <Building2 size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                        Site Manager
                    </h1>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                        QSR Vietnam | Site Development
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "1.25rem" }}>
                        <label className="label">Email công ty</label>
                        <div style={{ position: "relative" }}>
                            <Mail size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                            <input
                                type="email"
                                className="input-field"
                                style={{ paddingLeft: "2.5rem" }}
                                placeholder="ten@qsrvietnam.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: "1.5rem" }}>
                        <label className="label">Mật khẩu</label>
                        <div style={{ position: "relative" }}>
                            <Lock size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                            <input
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: "2.5rem" }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                            borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1.25rem",
                            fontSize: "0.8rem", color: "#f87171",
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                </form>

                <p style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "1.5rem" }}>
                    Chỉ dành cho nhân viên có email @qsrvietnam.com
                </p>
            </div>
        </div>
    );
}
