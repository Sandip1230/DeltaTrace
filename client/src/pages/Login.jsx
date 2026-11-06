import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, verifyOtp, completeLogin } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@deltatrace.com");
  const [password, setPassword] = useState("Admin@123");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [hint, setHint] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (step === 1) {
        const r = await login(email, password);
        setHint(r.devOtp ? `Dev OTP: ${r.devOtp}` : "");
        setStep(2);
      } else {
        completeLogin(await verifyOtp(email, otp));
        nav("/dashboard");
      }
    } catch (err) {
      setHint(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <form onSubmit={submit} className="glass-strong w-full max-w-sm p-8 space-y-4">
        <h1 className="text-2xl font-bold">Delta<span className="text-aqua-400">Trace</span></h1>
        {step === 1 ? (
          <>
            <div className="glow-field"><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" /></div>
            <div className="glow-field"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" /></div>
          </>
        ) : (
          <div className="glow-field"><input value={otp} maxLength={4} onChange={(e) => setOtp(e.target.value)} placeholder="4-digit OTP" /></div>
        )}
        {hint && <p className="text-sm text-aqua-300">{hint}</p>}
        <button className="w-full rounded-xl bg-aqua-500 py-3 font-semibold text-ocean-950">
          {step === 1 ? "Continue" : "Verify"}
        </button>
      </form>
    </div>
  );
}