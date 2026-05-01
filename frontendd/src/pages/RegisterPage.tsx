import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

type Step = "register" | "otp";

const RegisterPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>("register");

    // Register fields
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);

    // OTP
    const [otp, setOtp] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !email.trim() || !password.trim()) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    full_name: fullName || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Registration failed");
            setStep("otp");
            setSuccess("Verification code sent to your email!");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp.trim()) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp_code: otp }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Verification failed");
            setSuccess("Account created! Redirecting to login...");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/resend-verification`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Failed to resend");
            setSuccess("New code sent!");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#090318] bg-gradient-to-b from-[#0b081d] via-[#120b30] to-[#05050c] flex items-center justify-center px-4 py-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(224,180,50,0.15),_transparent_30%),radial-gradient(circle_at_20%_20%,_rgba(125,84,255,0.12),_transparent_25%),radial-gradient(circle_at_80%_10%,_rgba(246,140,0,0.12),_transparent_22%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(129,140,248,0.06),_transparent_20%)]" />
            <div className="absolute top-4 left-4 z-10">
                <button
                    onClick={() => navigate("/home")}
                    className="p-2 rounded-2xl bg-slate-900/70 text-slate-100 hover:bg-slate-800 transition"
                    aria-label="Go back"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
            </div>
            <button
                onClick={() => navigate("/")}
                aria-label="Close sidebar"
                title="Close sidebar"
                className="absolute inset-y-0 left-0 z-20 w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] after:rounded-full after:bg-amber-300/30 hover:after:bg-amber-300/80 bg-transparent"
            />
            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-sm relative z-10">
                <div className="text-center mb-8">
                    <button onClick={() => navigate("/")} className="text-3xl font-bold tracking-tight text-slate-100 hover:opacity-90 transition-opacity">
                        Secular<span className="text-amber-300">AI</span>
                    </button>
                    <p className="text-slate-400 text-sm mt-1">Start your spiritual exploration</p>
                </div>

                <div className="relative overflow-hidden rounded-[32px] border border-amber-400/15 bg-[#100725]/95 p-8 shadow-[0_40px_90px_-45px_rgba(15,23,42,0.9)] ring-1 ring-amber-300/10 backdrop-blur-xl">
                    <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />
                    <div className="absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />

                    <div className="relative space-y-6">
                        {step === "register" && (
                            <>
                                <div>
                                    <h2 className="text-3xl font-semibold text-white mb-2">Create account</h2>
                                    <p className="text-sm text-slate-400 mb-6">Sign up to begin your guided exploration with personalized insights.</p>
                                </div>
                                {error && <p className="text-red-300 text-sm mb-4 p-3 bg-red-500/10 rounded-2xl">{error}</p>}
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-300 mb-2 block">Full Name <span className="text-slate-500 font-normal">(optional)</span></label>
                                        <input
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="First and Last name"
                                            className="w-full h-12 rounded-2xl border border-slate-700/70 bg-[#150a2f] px-4 text-sm text-slate-100 placeholder:text-slate-500 shadow-sm shadow-black/20 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-300 mb-2 block">Username</label>
                                        <input
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="user123"
                                            required
                                            className="w-full h-12 rounded-2xl border border-slate-700/70 bg-[#150a2f] px-4 text-sm text-slate-100 placeholder:text-slate-500 shadow-sm shadow-black/20 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-300 mb-2 block">Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            required
                                            className="w-full h-12 rounded-2xl border border-slate-700/70 bg-[#150a2f] px-4 text-sm text-slate-100 placeholder:text-slate-500 shadow-sm shadow-black/20 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-300 mb-2 block">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPwd ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Min 6 characters"
                                                required
                                                className="w-full h-12 rounded-2xl border border-slate-700/70 bg-[#150a2f] px-4 pr-12 text-sm text-slate-100 placeholder:text-slate-500 shadow-sm shadow-black/20 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
                                            />
                                            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-100 transition">
                                                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
                                    >
                                        {loading && <Loader2 size={16} className="animate-spin" />}
                                        Create Account
                                    </button>
                                </form>
                                <p className="text-center text-sm text-slate-400 mt-5">
                                    Already have an account?{" "}
                                    <Link to="/login" className="text-amber-300 font-medium hover:underline">Sign in</Link>
                                </p>
                            </>
                        )}

                        {step === "otp" && (
                            <>
                                <div className="text-center mb-6">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-300/10">
                                        <CheckCircle2 className="text-amber-300" size={32} />
                                    </div>
                                    <h2 className="text-3xl font-semibold text-white mb-2">Check your email</h2>
                                    <p className="text-sm text-slate-400">
                                        We sent a 6-digit code to<br />
                                        <span className="text-white font-medium">{email}</span>
                                    </p>
                                </div>

                                {error && <p className="text-red-300 text-sm mb-4 p-3 bg-red-500/10 rounded-2xl">{error}</p>}
                                {success && <p className="text-amber-200 text-sm mb-4 p-3 bg-amber-500/10 rounded-2xl">{success}</p>}

                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <input
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        placeholder="000000"
                                        maxLength={6}
                                        className="w-full h-14 rounded-2xl border border-slate-700/70 bg-[#150a2f] px-4 text-lg text-center text-slate-100 font-semibold tracking-[0.3em] placeholder:text-slate-500 outline-none shadow-sm shadow-black/20 transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || otp.length < 6}
                                        className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading && <Loader2 size={16} className="animate-spin" />}
                                        Verify & Continue
                                    </button>
                                </form>

                                <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
                                    <button
                                        onClick={handleResend}
                                        disabled={loading}
                                        className="text-amber-300 hover:text-amber-200 disabled:opacity-50"
                                    >
                                        Resend code
                                    </button>
                                    <button
                                        onClick={() => { setStep("register"); setError(""); setSuccess(""); setOtp(""); }}
                                        className="text-slate-400 hover:text-slate-100"
                                    >
                                        ← Edit email
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
