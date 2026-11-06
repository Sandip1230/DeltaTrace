import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("dt_user") || "null"));

  const register = (name, email, password) =>
    api.post("/auth/register", { name, email, password }).then((r) => r.data);
  const login = (email, password) => api.post("/auth/login", { email, password }).then((r) => r.data);
  const resendOtp = (email) => api.post("/auth/resend-otp", { email }).then((r) => r.data);
  const verifyOtp = (email, otp) => api.post("/auth/verify-otp", { email, otp }).then((r) => r.data);

  // called AFTER the "Verified Successfully" animation finishes
  const completeLogin = ({ token, user }) => {
    localStorage.setItem("dt_token", token);
    localStorage.setItem("dt_user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("dt_token");
    localStorage.removeItem("dt_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, resendOtp, verifyOtp, completeLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}