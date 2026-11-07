import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { LiveProvider, useLive } from "../../context/LiveContext";
import Header from "./Header";
import FloatingNav from "./FloatingNav";

function Shell() {
  const { tick } = useLive();
  const { pathname } = useLocation();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    api.get("/alerts/stats").then((r) => setAlertCount(r.data.total)).catch(() => {});
  }, [tick]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-36 pt-6">
        <motion.div key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Outlet />
        </motion.div>
      </main>
      <FloatingNav alertCount={alertCount} />
    </div>
  );
}

export default function AppShell() {
  return (
    <LiveProvider>
      <Shell />
    </LiveProvider>
  );
}