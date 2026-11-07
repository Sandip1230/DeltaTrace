import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";
import { ArrowRight, KeyRound, Loader2, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GoldBackdrop from "../components/auth/GoldBackdrop";
import OtpStage from "../components/auth/OtpStage";
import "../styles/auth.css";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const mmss = (s) => `00:${String(s).padStart(2, "0")}`;

export default function Login() {
  const { user, register, login, resendOtp, verifyOtp, completeLogin } = useAuth();

  const [mode, setMode] = useState("login"); // login | register
  const [step, setStep] = useState("credentials"); // credentials | otp
  const [phase, setPhase] = useState("input"); // input | merging | verifying | verified
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLeft, setResendLeft] = useState(0);
  const [devOtp, setDevOtp] = useState("");
  const [shake, setShake] = useState(0);

  const progress = useMotionValue(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (step !== "otp" || resendLeft <= 0) return;
    const t = setTimeout(() => setResendLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resendLeft]);

  useEffect(() => {
    if (step === "otp" && phase === "input") {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [step, phase]);

  if (user) return <Navigate to="/dashboard" replace />;

  const onCredentials = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") await register(name, email, password);
      const r = await login(email, password);
      setDevOtp(r.devOtp || "");
      setResendLeft(r.resendIn ?? 40);
      setCode("");
      setPhase("input");
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (resendLeft > 0 || phase !== "input") return;
    try {
      const r = await resendOtp(email);
      setResendLeft(r.resendIn ?? 40);
      setDevOtp(r.devOtp || "");
      setCode("");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend code");
    }
  };

  const run = async (c) => {
    setError("");
    progress.set(0);
    setPhase("merging");
    animate(progress, 1, { duration: 1.4, ease: "linear" });

    const apiCall = verifyOtp(email, c)
      .then((r) => ({ ok: true, r }))
      .catch((e) => ({ ok: false, e }));

    await sleep(1400);
    setPhase("verifying");
    const [out] = await Promise.all([apiCall, sleep(900)]);

    if (out.ok) {
      setPhase("verified");
      await sleep(1800);
      completeLogin(out.r); // user set -> <Navigate> to dashboard
    } else {
      setPhase("input");
      setCode("");
      setShake((s) => s + 1);
      setError(out.e.response?.data?.message || "Verification failed");
    }
  };

  const handleCode = (v) => {
    setCode(v);
    setError("");
    if (v.length === 4) run(v);
  };

  const onOtpButton = () => {
    if (phase !== "input") return;
    if (code.length < 4) {
      setShake((s) => s + 1);
      inputRef.current?.focus();
    } else run(code);
  };

  const verified = phase === "verified";
  const busy = phase === "merging" || phase === "verifying";

  const head =
    step === "credentials"
      ? {
          icon: <Lock size={22} />,
          a: mode === "login" ? "Welcome " : "Create ",
          b: mode === "login" ? "Back" : "Account",
          sub: mode === "login" ? "Sign in to monitor water quality in real time" : "Join DeltaTrace to track water quality",
        }
      : verified
      ? { icon: <ShieldCheck size={22} />, a: "Verified ", b: "Successfully", sub: "Your security verification code has been confirmed." }
      : { icon: <KeyRound size={22} />, a: "Verify ", b: "OTP", sub: "Enter the 4-digit security code sent to your device" };

  return (
    <>
      <GoldBackdrop />
      <div className="auth-page">
        <div className="otp-wrap" data-tone={verified ? "green" : "gold"}>
          <div className="otp-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={head.a + head.b}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="otp-icon">{head.icon}</div>
                <h1 className="otp-title">
                  {head.a}
                  <span>{head.b}</span>
                </h1>
                <p className="otp-sub">{head.sub}</p>
              </motion.div>
            </AnimatePresence>

            {step === "credentials" ? (
              <form onSubmit={onCredentials}>
                <div style={{ display: "grid", gap: "0.9rem", marginTop: "1.6rem" }}>
                  {mode === "register" && (
                    <div className="glow-field has-icon">
                      <User className="field-icon" />
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
                    </div>
                  )}
                  <div className="glow-field has-icon">
                    <Mail className="field-icon" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required />
                  </div>
                  <div className="glow-field has-icon">
                    <Lock className="field-icon" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={6} />
                  </div>
                </div>

                {error && <p className="auth-error">{error}</p>}

                <button className={`gold-btn ${loading ? "busy" : ""}`} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Sending code...
                    </>
                  ) : (
                    <>
                      {mode === "login" ? "Continue" : "Create & Continue"} <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <button type="button" className="auth-link" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
                  {mode === "login" ? (
                    <>New here? <b>Create account</b></>
                  ) : (
                    <>Already have an account? <b>Sign in</b></>
                  )}
                </button>
              </form>
            ) : (
              <>
                <OtpStage value={code} phase={phase} progress={progress} inputRef={inputRef} onChange={handleCode} shakeKey={shake} />

                <p className="otp-resend">
                  Didn't receive the code?{" "}
                  {resendLeft > 0 ? <b>Resend in {mmss(resendLeft)}</b> : <button type="button" onClick={onResend}>Resend code</button>}
                </p>
                {devOtp && phase === "input" && <p className="otp-dev">Dev OTP: <b>{devOtp}</b></p>}
                {error && <p className="auth-error">{error}</p>}

                <button
                  type="button"
                  className={`gold-btn ${busy ? "busy" : ""} ${verified ? "green" : ""}`}
                  disabled={phase !== "input"}
                  onClick={onOtpButton}
                >
                  {verified ? (
                    <>
                      <ShieldCheck size={18} /> Verified &amp; Secured
                    </>
                  ) : busy ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Verifying Code...
                    </>
                  ) : (
                    <>
                      Verify &amp; Proceed <ArrowRight size={18} />
                    </>
                  )}
                </button>

                {phase === "input" && (
                  <button type="button" className="auth-link" onClick={() => { setStep("credentials"); setCode(""); setError(""); }}>
                    ← Use a different account
                  </button>
                )}
              </>
            )}
          </div>

          <div className="otp-ring" />
          <div className="otp-diag tl" />
          <div className="otp-diag br" />
          <div className="otp-corner tl" />
          <div className="otp-corner br" />
        </div>
      </div>
    </>
  );
}
