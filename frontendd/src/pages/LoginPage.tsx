import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

type Step = "login" | "forgot" | "otp" | "reset";

const LoginPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>("login");

    // Login state
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);

    // Forgot password state
    const [fpEmail, setFpEmail] = useState("");
    const [fpOtp, setFpOtp] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [showNewPwd, setShowNewPwd] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Login failed");
            localStorage.setItem("secularai-token", data.token);
            localStorage.setItem("secularai-username", data.username);
            navigate("/home");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fpEmail.trim()) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: fpEmail }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Failed to send code");
            setStep("otp");
            setSuccess("Reset code sent to your email.");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fpOtp.trim() || !newPwd.trim()) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: fpEmail, otp_code: fpOtp, new_password: newPwd }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Reset failed");
            setSuccess("Password reset! Please log in.");
            setStep("login");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#090318] bg-gradient-to-b from-[#0b081d] via-[#120b30] to-[#05050c] flex items-center justify-center px-4 py-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(224,180,50,0.12),_transparent_30%),radial-gradient(circle_at_20%_20%,_rgba(125,84,255,0.12),_transparent_25%),radial-gradient(circle_at_80%_10%,_rgba(246,140,0,0.12),_transparent_22%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(129,140,248,0.06),_transparent_20%)]" />
            <div className="absolute top-4 left-4 z-10">
                <button
                    onClick={() => navigate("/")}
                    className="p-2 rounded-2xl bg-slate-900/70 text-slate-100 hover:bg-slate-800 transition"
                    aria-label="Go back"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
            </div>
            <button
                onClick={() => navigate("/")}
                aria-label="Close"
                className="absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 h-24 w-4 rounded-r-full bg-amber-400/20 hover:bg-amber-400/35 transition-colors shadow-lg shadow-amber-500/10"
            />
            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-sm relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <button onClick={() => navigate("/")} className="text-3xl font-bold tracking-tight text-slate-100 hover:opacity-90 transition-opacity">
                        Secular<span className="text-amber-300">AI</span>
                    </button>
                    <p className="text-slate-400 text-sm mt-1">Explore the wisdom of all traditions</p>
                </div>

                <div className="relative overflow-hidden rounded-[32px] border border-amber-400/15 bg-[#100725]/95 p-8 shadow-[0_40px_90px_-45px_rgba(15,23,42,0.9)] ring-1 ring-amber-300/10 backdrop-blur-xl">
                    {/* Login */}
                    {step === "login" && (
                        <>
                            <h2 className="text-xl font-semibold text-slate-100 mb-5">Welcome back</h2>
                            {error && <p className="text-red-300 text-sm mb-4 p-3 bg-red-500/10 rounded-lg">{error}</p>}
                            {success && <p className="text-amber-200 text-sm mb-4 p-3 bg-amber-500/10 rounded-lg">{success}</p>}
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-1.5 block">Username or Email</label>
                                    <input
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter username or email"
                                        className="w-full h-10 px-3 rounded-xl bg-[#150a2f] border border-slate-700/70 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-100 mb-1.5 block">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPwd ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter password"
                                            className="w-full h-10 px-3 pr-10 rounded-xl bg-[#150a2f] border border-slate-700/70 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20 transition-all"
                                        />
                                        <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-10 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 size={15} className="animate-spin" />}
                                    Sign In
                                </button>
                            </form>
                            <button onClick={() => { setStep("forgot"); setError(""); setSuccess(""); }} className="mt-4 text-xs text-amber-300 hover:text-amber-200 hover:underline block text-center">
                                Forgot password?
                            </button>
                            <p className="text-center text-sm text-slate-400 mt-5">
                                No account?{" "}
                                <Link to="/register" className="text-amber-300 font-medium hover:underline">Create one</Link>
                            </p>
                        </>
                    )}

                    {/* Forgot Password */}
                    {step === "forgot" && (
                        <>
                            <h2 className="text-xl font-semibold text-slate-100 mb-1">Reset password</h2>
                            <p className="text-sm text-slate-400 mb-5">Enter your email and we'll send a code.</p>
                            {error && <p className="text-destructive text-sm mb-4 p-3 bg-destructive/10 rounded-lg">{error}</p>}
                            <form onSubmit={handleForgotSendOtp} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-100 mb-1.5 block">Email</label>
                                    <input
                                        type="email"
                                        value={fpEmail}
                                        onChange={(e) => setFpEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full h-10 px-3 rounded-xl bg-[#150a2f] border border-slate-700/70 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20 transition-all"
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="w-full h-10 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2">
                                    {loading && <Loader2 size={15} className="animate-spin" />}
                                    Send Reset Code
                                </button>
                            </form>
                            <button onClick={() => { setStep("login"); setError(""); }} className="mt-4 text-xs text-muted-foreground hover:text-foreground block text-center">← Back to login</button>
                        </>
                    )}

                    {/* Enter OTP + new password */}
                    {step === "otp" && (
                        <>
                            <h2 className="text-xl font-semibold text-slate-100 mb-1">Enter reset code</h2>
                            <p className="text-sm text-slate-400 mb-5">Check your email for the 6-digit code.</p>
                            {error && <p className="text-destructive text-sm mb-4 p-3 bg-destructive/10 rounded-lg">{error}</p>}
                            {success && <p className="text-primary text-sm mb-4 p-3 bg-primary/10 rounded-lg">{success}</p>}
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <input
                                    value={fpOtp}
                                    onChange={(e) => setFpOtp(e.target.value)}
                                    placeholder="000000"
                                    maxLength={6}
                                    className="w-full h-10 px-3 rounded-xl bg-[#150a2f] border border-slate-700/70 text-sm text-center text-slate-100 tracking-widest placeholder:text-slate-500 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20 transition-all"
                                />
                                <div className="relative">
                                    <input
                                        type={showNewPwd ? "text" : "password"}
                                        value={newPwd}
                                        onChange={(e) => setNewPwd(e.target.value)}
                                        placeholder="New password"
                                        className="w-full h-10 px-3 pr-10 rounded-xl bg-[#150a2f] border border-slate-700/70 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20 transition-all"
                                    />
                                    <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-100 transition">
                                        {showNewPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                <button type="submit" disabled={loading} className="w-full h-10 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2">
                                    {loading && <Loader2 size={15} className="animate-spin" />}
                                    Reset Password
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
